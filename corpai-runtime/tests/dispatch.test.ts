import { AgentRegistry } from "../src/registry/AgentRegistry";
import { TaskDispatcher } from "../src/dispatch/TaskDispatcher";
import { CriticValidator } from "../src/dispatch/CriticValidator";
import { JsonRpcException } from "../src/protocol/errors";

describe("Distributed Task Dispatching and Paired Critic Validation", () => {
  let registry: AgentRegistry;
  let dispatcher: TaskDispatcher;

  beforeEach(() => {
    registry = new AgentRegistry();
    dispatcher = new TaskDispatcher(registry, {
      minApprovalScore: 0.75,
      defaultMaxRetries: 2,
    });
  });

  it("should dispatch a task and auto-pair worker and critic", () => {
    registry.register({
      agentId: "worker-01",
      name: "Worker 1",
      role: "Senior Engineer",
      department: "Engineering",
      capabilities: ["backend", "database"],
    });

    registry.register({
      agentId: "critic-01",
      name: "Critic 1",
      role: "QA Lead",
      department: "Engineering",
      capabilities: ["critic_validation"],
    });

    const task = dispatcher.dispatch({
      title: "Migrate database schema",
      description: "Apply v2 migration scripts to production cluster",
      priority: "P1",
      department: "Engineering",
      requiredCapabilities: ["database"],
      payload: { migrationVersion: "2.0.1" },
    });

    expect(task.id).toMatch(/^task-/);
    expect(task.status).toBe("assigned");
    expect(task.assignedWorkerId).toBe("worker-01");
    expect(task.assignedCriticId).toBe("critic-01");
    expect(task.priority).toBe("P1");

    const worker = registry.get("worker-01");
    expect(worker?.status).toBe("busy");
    expect(worker?.currentTaskId).toBe(task.id);
  });

  it("should claim next eligible task based on priority order", () => {
    registry.register({
      agentId: "worker-free",
      name: "Free Worker",
      role: "Engineer",
      department: "Engineering",
    });

    // Dispatch P4 task first, then P1 task
    const tP4 = dispatcher.dispatch({
      title: "Low priority docs",
      priority: "P4",
      department: "Engineering",
    });

    const tP1 = dispatcher.dispatch({
      title: "Urgent fix",
      priority: "P1",
      department: "Engineering",
    });

    // Free worker claims
    const claimed = dispatcher.claim("worker-free");
    expect(claimed).toBeDefined();
    expect(claimed?.id).toBe(tP1.id); // P1 claimed before P4
    expect(claimed?.status).toBe("running");
  });

  it("should complete task when critic reviews with valid HMAC signature and passing score", () => {
    const worker = registry.register({
      agentId: "worker-alpha",
      name: "Alpha Worker",
      role: "Developer",
      department: "Engineering",
    });

    const critic = registry.register({
      agentId: "critic-alpha",
      name: "Alpha Critic",
      role: "Code Reviewer",
      department: "Engineering",
    });

    const task = dispatcher.dispatch({
      title: "Implement OAuth2 callback",
      department: "Engineering",
      assignedWorkerId: "worker-alpha",
      assignedCriticId: "critic-alpha",
    });

    // Worker completes task and submits result
    const resultPayload = {
      code: "export const handleAuth = () => { return 'token_ok'; };",
      unitTestsPassed: 12,
    };

    dispatcher.submitResult(task.id, "worker-alpha", resultPayload);
    const inReviewTask = dispatcher.get(task.id);
    expect(inReviewTask?.status).toBe("awaiting_critic");
    expect(inReviewTask?.resultHash).toBeDefined();

    // Critic creates signed review using their secretKey
    const reviewData = {
      criticId: "critic-alpha",
      taskId: task.id,
      workerId: "worker-alpha",
      status: "approved" as const,
      score: 0.95,
      feedback: "Implementation conforms to RFC 6749 and all 12 tests pass cleanly.",
      timestamp: new Date().toISOString(),
      payloadHash: inReviewTask!.resultHash!,
    };

    const signedReview = CriticValidator.signReview(critic.secretKey!, reviewData);

    const { task: completedTask, validation } = dispatcher.submitReview(task.id, signedReview);

    expect(validation.valid).toBe(true);
    expect(validation.approved).toBe(true);
    expect(validation.signatureValid).toBe(true);
    expect(completedTask.status).toBe("completed");
    expect(completedTask.completedAt).toBeDefined();

    // Verify worker and critic are returned to idle
    expect(registry.get("worker-alpha")?.status).toBe("idle");
    expect(registry.get("critic-alpha")?.status).toBe("idle");
  });

  it("should REJECT review and prevent completion if HMAC signature is forged or invalid", () => {
    registry.register({
      agentId: "worker-beta",
      name: "Beta Worker",
      role: "Developer",
      department: "Engineering",
    });

    registry.register({
      agentId: "critic-beta",
      name: "Beta Critic",
      role: "Code Reviewer",
      department: "Engineering",
    });

    const task = dispatcher.dispatch({
      title: "Security module patch",
      department: "Engineering",
      assignedWorkerId: "worker-beta",
      assignedCriticId: "critic-beta",
    });

    dispatcher.submitResult(task.id, "worker-beta", { patch: "fix-csrf" });
    const inReview = dispatcher.get(task.id)!;

    // Forged signature with wrong secret key
    const forgedReview = CriticValidator.signReview("wrong-attacker-secret-key-1234567890", {
      criticId: "critic-beta",
      taskId: task.id,
      workerId: "worker-beta",
      status: "approved",
      score: 0.99,
      feedback: "Looks good!",
      timestamp: new Date().toISOString(),
      payloadHash: inReview.resultHash!,
    });

    const { task: retryTask, validation } = dispatcher.submitReview(task.id, forgedReview);

    expect(validation.approved).toBe(false);
    expect(validation.signatureValid).toBe(false);
    expect(validation.reasons).toContain("Cryptographic HMAC signature verification failed");
    expect(retryTask.status).toBe("changes_requested");
    expect(retryTask.retryCount).toBe(1);
  });

  it("should fail task if critic score is below minimum threshold after exhausting retries", () => {
    registry.register({
      agentId: "worker-gamma",
      name: "Gamma Worker",
      role: "Developer",
      department: "Engineering",
    });

    const critic = registry.register({
      agentId: "critic-gamma",
      name: "Gamma Critic",
      role: "Auditor",
      department: "Engineering",
    });

    const task = dispatcher.dispatch({
      title: "Complex ML optimization",
      department: "Engineering",
      assignedWorkerId: "worker-gamma",
      assignedCriticId: "critic-gamma",
      maxRetries: 2,
    });

    // First attempt: rejected by critic
    dispatcher.submitResult(task.id, "worker-gamma", { opt: "attempt 1" });
    let review = CriticValidator.signReview(critic.secretKey!, {
      criticId: "critic-gamma",
      taskId: task.id,
      workerId: "worker-gamma",
      status: "rejected",
      score: 0.40,
      feedback: "Memory leak detected on tensor allocations",
      timestamp: new Date().toISOString(),
      payloadHash: dispatcher.get(task.id)!.resultHash!,
    });
    dispatcher.submitReview(task.id, review);
    expect(dispatcher.get(task.id)!.status).toBe("changes_requested");

    // Second attempt: rejected again -> exhausts maxRetries (2) -> failed
    dispatcher.submitResult(task.id, "worker-gamma", { opt: "attempt 2" });
    review = CriticValidator.signReview(critic.secretKey!, {
      criticId: "critic-gamma",
      taskId: task.id,
      workerId: "worker-gamma",
      status: "rejected",
      score: 0.50,
      feedback: "Latency requirement of <50ms not met",
      timestamp: new Date().toISOString(),
      payloadHash: dispatcher.get(task.id)!.resultHash!,
    });
    const { task: failedTask } = dispatcher.submitReview(task.id, review);

    expect(failedTask.status).toBe("failed");
    expect(failedTask.error).toContain("Exceeded max retries");
  });

  it("should cancel task and return worker to idle", () => {
    registry.register({
      agentId: "worker-cancel",
      name: "Cancel Worker",
      role: "Worker",
      department: "Engineering",
    });

    const task = dispatcher.dispatch({
      title: "Discarded task",
      department: "Engineering",
      assignedWorkerId: "worker-cancel",
    });

    expect(registry.get("worker-cancel")?.status).toBe("busy");

    const cancelled = dispatcher.cancel(task.id, "Spec was deprecated");
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.cancelReason).toBe("Spec was deprecated");
    expect(registry.get("worker-cancel")?.status).toBe("idle");
  });
});
