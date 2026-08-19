import { AgentRegistry } from "../src/registry/AgentRegistry";
import { TaskDispatcher } from "../src/dispatch/TaskDispatcher";
import { CriticValidator } from "../src/dispatch/CriticValidator";

describe("Paired Critic Validation & Signature Verification Tests", () => {
  let registry: AgentRegistry;
  let dispatcher: TaskDispatcher;
  const criticKey = "critic-super-secret-hmac-key-2026";

  beforeEach(() => {
    registry = new AgentRegistry();
    dispatcher = new TaskDispatcher(registry, { minApprovalScore: 0.75, defaultMaxRetries: 2 });

    registry.register({
      agentId: "worker-ai-01",
      name: "Worker AI",
      role: "Core Developer",
      department: "Engineering",
      capabilities: ["backend"],
      criticPairId: "critic-ai-01",
    });

    registry.register({
      agentId: "critic-ai-01",
      name: "Critic AI",
      role: "QA & Security Critic",
      department: "Engineering",
      capabilities: ["critic_validation"],
      secretKey: criticKey,
    });
  });

  afterEach(() => {
    dispatcher.clear();
    registry.clear();
  });

  describe("Cryptographic Signature Verification", () => {
    it("should sign and verify valid critic review HMAC signature", () => {
      const reviewData = {
        criticId: "critic-ai-01",
        taskId: "task-test-01",
        workerId: "worker-ai-01",
        status: "approved" as const,
        score: 0.95,
        feedback: "Code passed all unit tests and static security scans",
        timestamp: new Date().toISOString(),
        payloadHash: CriticValidator.hashPayload({ output: "success", lines: 140 }),
      };

      const signedReview = CriticValidator.signReview(criticKey, reviewData);
      expect(signedReview.signature).toBeDefined();
      expect(signedReview.signature.length).toBe(64); // SHA256 hex string

      const isValid = CriticValidator.verifySignature(signedReview, criticKey);
      expect(isValid).toBe(true);
    });

    it("should reject tampered review payload hash or score", () => {
      const reviewData = {
        criticId: "critic-ai-01",
        taskId: "task-test-02",
        workerId: "worker-ai-01",
        status: "approved" as const,
        score: 0.90,
        feedback: "LGTM",
        timestamp: new Date().toISOString(),
        payloadHash: CriticValidator.hashPayload({ valid: true }),
      };

      const signedReview = CriticValidator.signReview(criticKey, reviewData);

      // Tamper score
      const tamperedReview = { ...signedReview, score: 0.99 };
      expect(CriticValidator.verifySignature(tamperedReview, criticKey)).toBe(false);

      // Tamper payload hash
      const tamperedHash = { ...signedReview, payloadHash: "bad-hash" };
      expect(CriticValidator.verifySignature(tamperedHash, criticKey)).toBe(false);

      // Wrong key
      expect(CriticValidator.verifySignature(signedReview, "wrong-key-0000000000000000000")).toBe(false);
    });
  });

  describe("End-to-End Critic Approval Lifecycle", () => {
    it("should transition task to completed when critic submits valid signature and score >= 0.75", () => {
      const completedEvents: any[] = [];
      dispatcher.on("task:completed", (t, r, v) => completedEvents.push({ t, r, v }));

      const task = dispatcher.dispatch({
        title: "Build JSON-RPC Gateway",
        department: "Engineering",
        assignedWorkerId: "worker-ai-01",
        assignedCriticId: "critic-ai-01",
      });

      expect(task.status).toBe("assigned");

      const workerResult = { module: "gateway", testsPassing: 12, linesOfCode: 550 };
      const submittedTask = dispatcher.submitResult(task.id, "worker-ai-01", workerResult);

      expect(submittedTask.status).toBe("awaiting_critic");
      expect(submittedTask.resultHash).toBe(CriticValidator.hashPayload(workerResult));

      // Critic reviews and signs
      const signedReview = CriticValidator.signReview(criticKey, {
        criticId: "critic-ai-01",
        taskId: task.id,
        workerId: "worker-ai-01",
        status: "approved",
        score: 0.92,
        feedback: "Excellent architecture, clean separation of concerns",
        timestamp: new Date().toISOString(),
        payloadHash: submittedTask.resultHash!,
      });

      const { task: finalTask, validation } = dispatcher.submitReview(task.id, signedReview);

      expect(validation.approved).toBe(true);
      expect(validation.signatureValid).toBe(true);
      expect(finalTask.status).toBe("completed");
      expect(finalTask.completedAt).toBeDefined();
      expect(completedEvents).toHaveLength(1);

      // Verify agents return to idle
      expect(registry.get("worker-ai-01")?.status).toBe("idle");
      expect(registry.get("critic-ai-01")?.status).toBe("idle");
    });

    it("should request changes on low score and allow resubmission", () => {
      const retryEvents: any[] = [];
      dispatcher.on("task:retry", (t, r) => retryEvents.push({ t, r }));

      const task = dispatcher.dispatch({
        title: "Build Complex Algorithm",
        department: "Engineering",
        assignedWorkerId: "worker-ai-01",
        assignedCriticId: "critic-ai-01",
      });

      const firstAttempt = { code: "incomplete" };
      dispatcher.submitResult(task.id, "worker-ai-01", firstAttempt);

      // Critic requests changes with score 0.40
      const review1 = CriticValidator.signReview(criticKey, {
        criticId: "critic-ai-01",
        taskId: task.id,
        workerId: "worker-ai-01",
        status: "changes_requested",
        score: 0.40,
        feedback: "Missing error handling for edge cases",
        timestamp: new Date().toISOString(),
        payloadHash: task.resultHash!,
      });

      const { task: taskAfterReview1 } = dispatcher.submitReview(task.id, review1);
      expect(taskAfterReview1.status).toBe("changes_requested");
      expect(taskAfterReview1.retryCount).toBe(1);
      expect(retryEvents).toHaveLength(1);

      // Worker fixes and resubmits
      const secondAttempt = { code: "complete with full error handling" };
      dispatcher.submitResult(task.id, "worker-ai-01", secondAttempt);
      expect(task.status).toBe("awaiting_critic");

      // Critic approves
      const review2 = CriticValidator.signReview(criticKey, {
        criticId: "critic-ai-01",
        taskId: task.id,
        workerId: "worker-ai-01",
        status: "approved",
        score: 0.95,
        feedback: "All edge cases covered",
        timestamp: new Date().toISOString(),
        payloadHash: task.resultHash!,
      });

      const { task: finalTask } = dispatcher.submitReview(task.id, review2);
      expect(finalTask.status).toBe("completed");
      expect(finalTask.reviewHistory).toHaveLength(2);
    });

    it("should mark task as failed if max retries is exceeded", () => {
      const failedEvents: any[] = [];
      dispatcher.on("task:failed", (t, r) => failedEvents.push({ t, r }));

      const task = dispatcher.dispatch({
        title: "Task that will fail review",
        department: "Engineering",
        assignedWorkerId: "worker-ai-01",
        assignedCriticId: "critic-ai-01",
        maxRetries: 1, // Fail immediately after 1 rejection
      });

      dispatcher.submitResult(task.id, "worker-ai-01", { broken: true });

      const review = CriticValidator.signReview(criticKey, {
        criticId: "critic-ai-01",
        taskId: task.id,
        workerId: "worker-ai-01",
        status: "rejected",
        score: 0.20,
        feedback: "Completely broken",
        timestamp: new Date().toISOString(),
        payloadHash: task.resultHash!,
      });

      const { task: finalTask } = dispatcher.submitReview(task.id, review);
      expect(finalTask.status).toBe("failed");
      expect(finalTask.error).toContain("Exceeded max retries");
      expect(failedEvents).toHaveLength(1);
    });
  });
});
