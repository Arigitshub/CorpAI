import { EventEmitter } from "events";
import * as crypto from "crypto";
import { AgentRegistry } from "../registry/AgentRegistry";
import {
  CriticReview,
  TaskDispatchParams,
  TaskFilter,
  TaskPriority,
  TaskPriorityWeight,
  TaskRecord,
  TaskStatus,
} from "./types";
import { CriticValidator } from "./CriticValidator";
import { JsonRpcException } from "../protocol/errors";

export interface TaskDispatcherOptions {
  minApprovalScore?: number;
  defaultMaxRetries?: number;
}

export class TaskDispatcher extends EventEmitter {
  private readonly registry: AgentRegistry;
  private readonly tasks = new Map<string, TaskRecord>();
  private readonly minApprovalScore: number;
  private readonly defaultMaxRetries: number;

  constructor(registry: AgentRegistry, options: TaskDispatcherOptions = {}) {
    super();
    this.registry = registry;
    this.minApprovalScore = options.minApprovalScore ?? 0.70;
    this.defaultMaxRetries = options.defaultMaxRetries ?? 3;
  }

  /**
   * Dispatch a new task into the queue and attempt immediate worker/critic pairing.
   */
  public dispatch(params: TaskDispatchParams): TaskRecord {
    if (!params.title || typeof params.title !== "string") {
      throw JsonRpcException.invalidParams("Parameter 'title' must be a non-empty string");
    }

    const taskId = `task-${crypto.randomBytes(6).toString("hex")}`;
    const now = new Date().toISOString();
    const priority: TaskPriority = params.priority || "P3";
    const department = params.department || "Engineering";
    const requiredCaps = params.requiredCapabilities || [];
    const maxRetries = params.maxRetries ?? this.defaultMaxRetries;

    const task: TaskRecord = {
      id: taskId,
      title: params.title,
      description: params.description || "",
      priority,
      department,
      requiredCapabilities: requiredCaps,
      status: "queued",
      assignedWorkerId: params.assignedWorkerId,
      assignedCriticId: params.assignedCriticId,
      payload: params.payload ?? {},
      reviewHistory: [],
      retryCount: 0,
      maxRetries,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(taskId, task);
    this.emit("task:dispatched", task);

    // Attempt auto-pairing if worker not explicitly set
    if (!task.assignedWorkerId) {
      const worker = this.registry.findAvailableWorker(department, requiredCaps);
      if (worker) {
        task.assignedWorkerId = worker.agentId;
        const critic = params.assignedCriticId
          ? this.registry.get(params.assignedCriticId)
          : this.registry.findCriticForWorker(worker);

        if (critic) {
          task.assignedCriticId = critic.agentId;
        }

        task.status = "assigned";
        task.updatedAt = new Date().toISOString();
        this.registry.updateStatus(worker.agentId, "busy", task.id);

        this.emit("task:assigned", task, worker, critic);
      }
    } else {
      // Explicit worker provided
      const worker = this.registry.get(task.assignedWorkerId);
      if (worker) {
        if (!task.assignedCriticId) {
          const critic = this.registry.findCriticForWorker(worker);
          if (critic) {
            task.assignedCriticId = critic.agentId;
          }
        }
        task.status = "assigned";
        task.updatedAt = new Date().toISOString();
        this.registry.updateStatus(worker.agentId, "busy", task.id);
        this.emit("task:assigned", task, worker);
      }
    }

    return task;
  }

  /**
   * Claim an eligible task for a worker.
   */
  public claim(agentId: string, specificTaskId?: string): TaskRecord | null {
    const worker = this.registry.get(agentId);
    if (!worker) {
      throw JsonRpcException.agentNotFound(agentId);
    }

    let task: TaskRecord | undefined;

    if (specificTaskId) {
      task = this.tasks.get(specificTaskId);
      if (!task) {
        throw JsonRpcException.taskNotFound(specificTaskId);
      }
      if (
        task.status !== "queued" &&
        !(task.status === "assigned" && task.assignedWorkerId === agentId) &&
        task.status !== "changes_requested"
      ) {
        throw new JsonRpcException(-32005, `Task '${specificTaskId}' is not claimable in status '${task.status}'`);
      }
    } else {
      // Pick highest priority queued task matching worker capabilities & department
      const eligible = this.list({ status: ["queued", "changes_requested"] })
        .filter((t) => {
          if (t.department && t.department.toLowerCase() !== worker.department.toLowerCase()) {
            return false;
          }
          if (t.requiredCapabilities.length > 0) {
            return t.requiredCapabilities.every((cap) => worker.capabilities.includes(cap));
          }
          return true;
        })
        .sort((a, b) => {
          const wA = TaskPriorityWeight[a.priority] ?? 3;
          const wB = TaskPriorityWeight[b.priority] ?? 3;
          if (wA !== wB) return wA - wB; // Lower weight = higher priority
          return Date.parse(a.createdAt) - Date.parse(b.createdAt);
        });

      task = eligible[0];
    }

    if (!task) {
      return null;
    }

    task.assignedWorkerId = worker.agentId;
    if (!task.assignedCriticId) {
      const critic = this.registry.findCriticForWorker(worker);
      if (critic) {
        task.assignedCriticId = critic.agentId;
      }
    }

    task.status = "running";
    task.updatedAt = new Date().toISOString();
    this.registry.updateStatus(worker.agentId, "busy", task.id);

    this.emit("task:claimed", task, worker);
    return task;
  }

  /**
   * Worker submits task output/result; transitions task to awaiting critic evaluation.
   */
  public submitResult(taskId: string, workerId: string, result: unknown): TaskRecord {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw JsonRpcException.taskNotFound(taskId);
    }

    if (task.assignedWorkerId && task.assignedWorkerId !== workerId) {
      throw JsonRpcException.unauthorized(
        `Agent '${workerId}' is not the assigned worker for task '${taskId}'`
      );
    }

    if (task.status !== "running" && task.status !== "assigned" && task.status !== "changes_requested") {
      throw new JsonRpcException(
        -32009,
        `Cannot submit result for task in status '${task.status}'`
      );
    }

    const resultHash = CriticValidator.hashPayload(result);
    task.result = result;
    task.resultHash = resultHash;
    task.status = "awaiting_critic";
    task.updatedAt = new Date().toISOString();

    // If no critic is assigned yet, attempt to pair one now
    if (!task.assignedCriticId) {
      const worker = this.registry.get(workerId);
      if (worker) {
        const critic = this.registry.findCriticForWorker(worker);
        if (critic) {
          task.assignedCriticId = critic.agentId;
        }
      }
    }

    this.emit("task:awaiting_critic", task);
    return task;
  }

  /**
   * Paired critic submits review with cryptographic signature validation.
   */
  public submitReview(taskId: string, review: CriticReview): { task: TaskRecord; validation: ReturnType<typeof CriticValidator.validateReview> } {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw JsonRpcException.taskNotFound(taskId);
    }

    if (task.status !== "awaiting_critic" && task.status !== "critic_reviewing") {
      throw new JsonRpcException(
        -32009,
        `Cannot review task '${taskId}' in status '${task.status}' (must be awaiting_critic)`
      );
    }

    const critic = this.registry.get(review.criticId);
    if (!critic) {
      throw JsonRpcException.agentNotFound(review.criticId);
    }

    const validation = CriticValidator.validateReview(
      task,
      review,
      critic.secretKey,
      this.minApprovalScore
    );

    task.review = review;
    task.reviewHistory.push(review);
    task.updatedAt = new Date().toISOString();

    if (validation.approved) {
      // Approved by critic with valid signature
      task.status = "completed";
      task.completedAt = new Date().toISOString();

      if (task.assignedWorkerId) {
        this.registry.updateStatus(task.assignedWorkerId, "idle");
      }
      this.registry.updateStatus(critic.agentId, "idle");

      this.emit("task:completed", task, review, validation);
    } else {
      // Validation failed or changes requested or signature invalid
      task.retryCount += 1;

      if (!validation.signatureValid) {
        this.emit("critic:signature_failed", task, review, validation);
      }

      if (task.retryCount < task.maxRetries) {
        task.status = "changes_requested";
        if (task.assignedWorkerId) {
          this.registry.updateStatus(task.assignedWorkerId, "idle");
        }
        this.emit("task:retry", task, review, validation);
      } else {
        task.status = "failed";
        task.error = `Exceeded max retries (${task.maxRetries}). Critic feedback: ${review.feedback}. Validation reasons: ${validation.reasons.join("; ")}`;
        if (task.assignedWorkerId) {
          this.registry.updateStatus(task.assignedWorkerId, "idle");
        }
        this.emit("task:failed", task, review, validation);
      }
    }

    return { task, validation };
  }

  /**
   * Cancel a task in progress or in queue.
   */
  public cancel(taskId: string, reason = "Cancelled by operator"): TaskRecord {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw JsonRpcException.taskNotFound(taskId);
    }

    if (task.status === "completed" || task.status === "failed" || task.status === "cancelled") {
      throw new JsonRpcException(
        -32009,
        `Cannot cancel task in terminal state '${task.status}'`
      );
    }

    task.status = "cancelled";
    task.cancelledAt = new Date().toISOString();
    task.cancelReason = reason;
    task.updatedAt = new Date().toISOString();

    if (task.assignedWorkerId) {
      this.registry.updateStatus(task.assignedWorkerId, "idle");
    }
    if (task.assignedCriticId) {
      this.registry.updateStatus(task.assignedCriticId, "idle");
    }

    this.emit("task:cancelled", task);
    return task;
  }

  /**
   * Get task by ID.
   */
  public get(taskId: string): TaskRecord | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * List tasks matching filters.
   */
  public list(filter?: TaskFilter): TaskRecord[] {
    let result = Array.from(this.tasks.values());

    if (!filter) {
      return result;
    }

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      result = result.filter((t) => statuses.includes(t.status));
    }

    if (filter.department) {
      const dept = filter.department.toLowerCase();
      result = result.filter((t) => t.department.toLowerCase() === dept);
    }

    if (filter.assignedWorkerId) {
      result = result.filter((t) => t.assignedWorkerId === filter.assignedWorkerId);
    }

    if (filter.assignedCriticId) {
      result = result.filter((t) => t.assignedCriticId === filter.assignedCriticId);
    }

    if (filter.priority) {
      result = result.filter((t) => t.priority === filter.priority);
    }

    return result;
  }

  /**
   * Count of tasks
   */
  public get size(): number {
    return this.tasks.size;
  }

  /**
   * Clear all tasks (useful for testing)
   */
  public clear(): void {
    this.tasks.clear();
  }
}
