import { EventEmitter } from "events";
import * as crypto from "crypto";
import {
  AgentFilter,
  AgentHeartbeatParams,
  AgentRecord,
  AgentRegistrationParams,
  AgentState,
  AgentTelemetry,
} from "./types";
import { JsonRpcException } from "../protocol/errors";

export interface AgentRegistryEvents {
  "agent:registered": (agent: AgentRecord) => void;
  "agent:unregistered": (agentId: string, agent: AgentRecord) => void;
  "agent:heartbeat": (agent: AgentRecord) => void;
  "agent:statusChanged": (agent: AgentRecord, prevStatus: AgentState) => void;
  "agent:expired": (agent: AgentRecord) => void;
}

export class AgentRegistry extends EventEmitter {
  private readonly agents = new Map<string, AgentRecord>();

  constructor() {
    super();
  }

  /**
   * Register a new agent or re-activate an existing agent.
   */
  public register(params: AgentRegistrationParams, socketId?: string): AgentRecord {
    if (!params.agentId || typeof params.agentId !== "string") {
      throw JsonRpcException.invalidParams("Parameter 'agentId' must be a non-empty string");
    }

    const now = new Date().toISOString();
    const existing = this.agents.get(params.agentId);

    const defaultTelemetry: AgentTelemetry = {
      confidence: 0.85,
      apiLatencyMs: 120,
      runState: "idle",
      provider: "corpai-runtime",
      model: "default",
      ...(params.telemetry || {}),
    };

    const secretKey =
      params.secretKey ||
      existing?.secretKey ||
      crypto.randomBytes(24).toString("hex");

    const record: AgentRecord = {
      agentId: params.agentId,
      name: params.name || params.agentId,
      role: params.role || "Generalist",
      department: params.department || "Engineering",
      capabilities: Array.isArray(params.capabilities) ? params.capabilities : [],
      status: "idle",
      criticPairId: params.criticPairId || existing?.criticPairId,
      secretKey,
      registeredAt: existing?.registeredAt || now,
      lastHeartbeatAt: now,
      latestAction: existing?.latestAction || "Agent registered with gateway",
      metadata: { ...(existing?.metadata || {}), ...(params.metadata || {}) },
      telemetry: defaultTelemetry,
      socketId: socketId || existing?.socketId,
    };

    this.agents.set(params.agentId, record);
    this.emit("agent:registered", record);
    return record;
  }

  /**
   * Unregister an agent by ID.
   */
  public unregister(agentId: string): AgentRecord {
    const record = this.agents.get(agentId);
    if (!record) {
      throw JsonRpcException.agentNotFound(agentId);
    }

    const prevStatus = record.status;
    record.status = "offline";
    this.agents.delete(agentId);
    this.emit("agent:unregistered", agentId, record);
    if (prevStatus !== "offline") {
      this.emit("agent:statusChanged", record, prevStatus);
    }
    return record;
  }

  /**
   * Record a heartbeat from an agent.
   */
  public recordHeartbeat(params: AgentHeartbeatParams): AgentRecord {
    const record = this.agents.get(params.agentId);
    if (!record) {
      throw JsonRpcException.agentNotFound(params.agentId);
    }

    const prevStatus = record.status;
    const now = new Date().toISOString();

    record.lastHeartbeatAt = now;

    if (params.status && params.status !== record.status) {
      record.status = params.status;
      this.emit("agent:statusChanged", record, prevStatus);
    } else if (record.status === "offline" || record.status === "expired") {
      record.status = "idle";
      this.emit("agent:statusChanged", record, prevStatus);
    }

    if (params.currentTaskId !== undefined) {
      record.currentTaskId = params.currentTaskId;
    }

    if (params.latestAction) {
      record.latestAction = params.latestAction;
    }

    if (params.confidence !== undefined) {
      record.telemetry.confidence = Math.max(0, Math.min(1, params.confidence));
    }
    if (params.apiLatencyMs !== undefined) {
      record.telemetry.apiLatencyMs = Math.max(0, params.apiLatencyMs);
    }
    if (params.runState !== undefined) {
      record.telemetry.runState = params.runState;
    }
    if (params.provider !== undefined) {
      record.telemetry.provider = params.provider;
    }
    if (params.model !== undefined) {
      record.telemetry.model = params.model;
    }

    if (params.metadata) {
      record.metadata = { ...record.metadata, ...params.metadata };
    }

    this.emit("agent:heartbeat", record);
    return record;
  }

  /**
   * Update agent status explicitly.
   */
  public updateStatus(agentId: string, status: AgentState, currentTaskId?: string): AgentRecord {
    const record = this.agents.get(agentId);
    if (!record) {
      throw JsonRpcException.agentNotFound(agentId);
    }

    const prevStatus = record.status;
    record.status = status;
    if (currentTaskId !== undefined) {
      record.currentTaskId = currentTaskId;
    }

    if (prevStatus !== status) {
      this.emit("agent:statusChanged", record, prevStatus);
    }

    return record;
  }

  /**
   * Mark an agent as expired.
   */
  public markExpired(agentId: string): AgentRecord {
    const record = this.agents.get(agentId);
    if (!record) {
      throw JsonRpcException.agentNotFound(agentId);
    }

    const prevStatus = record.status;
    record.status = "expired";
    record.telemetry.runState = "expired";
    this.emit("agent:expired", record);
    if (prevStatus !== "expired") {
      this.emit("agent:statusChanged", record, prevStatus);
    }
    return record;
  }

  /**
   * Associate socketId with agent record.
   */
  public bindSocket(agentId: string, socketId: string): void {
    const record = this.agents.get(agentId);
    if (record) {
      record.socketId = socketId;
    }
  }

  /**
   * Get agent by ID.
   */
  public get(agentId: string): AgentRecord | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List agents matching filters.
   */
  public list(filter?: AgentFilter): AgentRecord[] {
    let result = Array.from(this.agents.values());

    if (!filter) {
      return result;
    }

    if (filter.department) {
      const dept = filter.department.toLowerCase();
      result = result.filter((a) => a.department.toLowerCase() === dept);
    }

    if (filter.role) {
      const role = filter.role.toLowerCase();
      result = result.filter((a) => a.role.toLowerCase().includes(role));
    }

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      result = result.filter((a) => statuses.includes(a.status));
    }

    if (filter.capability) {
      const cap = filter.capability.toLowerCase();
      result = result.filter((a) =>
        a.capabilities.some((c) => c.toLowerCase() === cap)
      );
    }

    return result;
  }

  /**
   * Find available idle worker matching department or capabilities.
   */
  public findAvailableWorker(department?: string, requiredCapabilities: string[] = []): AgentRecord | undefined {
    const candidates = this.list({ status: ["idle", "online"] });

    return candidates.find((agent) => {
      // Exclude dedicated critics from being auto-assigned as task workers
      const isCritic =
        agent.role.toLowerCase().includes("critic") ||
        (agent.capabilities.includes("critic_validation") && agent.capabilities.length === 1);
      if (isCritic) {
        return false;
      }

      if (department && agent.department.toLowerCase() !== department.toLowerCase()) {
        return false;
      }
      if (requiredCapabilities.length > 0) {
        const hasAllCaps = requiredCapabilities.every((req) =>
          agent.capabilities.includes(req)
        );
        if (!hasAllCaps) return false;
      }
      return true;
    });
  }

  /**
   * Find suitable critic subagent for a given worker.
   */
  public findCriticForWorker(worker: AgentRecord): AgentRecord | undefined {
    // 1. Explicit pairing
    if (worker.criticPairId) {
      const explicit = this.get(worker.criticPairId);
      if (explicit && explicit.status !== "offline" && explicit.status !== "expired") {
        return explicit;
      }
    }

    // 2. Pair with dedicated critic/QA in the same or governance department
    const critics = this.list().filter(
      (a) =>
        a.agentId !== worker.agentId &&
        a.status !== "offline" &&
        a.status !== "expired" &&
        (a.role.toLowerCase().includes("critic") ||
          a.role.toLowerCase().includes("review") ||
          a.role.toLowerCase().includes("qa") ||
          a.role.toLowerCase().includes("security") ||
          a.capabilities.includes("critic_validation") ||
          a.department.toLowerCase() === "governance" ||
          a.department.toLowerCase() === "risk" ||
          a.department.toLowerCase() === "executive")
    );

    if (critics.length > 0) {
      // Prioritize same department critic first, then general
      const sameDept = critics.find((c) => c.department.toLowerCase() === worker.department.toLowerCase());
      return sameDept || critics[0];
    }

    // 3. Fallback: Any other active agent not equal to the worker
    const otherAgents = this.list().filter(
      (a) => a.agentId !== worker.agentId && a.status !== "offline" && a.status !== "expired"
    );
    return otherAgents[0];
  }

  /**
   * Get size of registry.
   */
  public get size(): number {
    return this.agents.size;
  }

  /**
   * Clear all agents (useful for testing).
   */
  public clear(): void {
    this.agents.clear();
  }
}
