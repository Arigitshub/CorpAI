import { AgentRegistry } from "../src/registry/AgentRegistry";
import { TaskDispatcher } from "../src/dispatch/TaskDispatcher";

describe("Task Dispatcher & Priority Queue Tests", () => {
  let registry: AgentRegistry;
  let dispatcher: TaskDispatcher;

  beforeEach(() => {
    registry = new AgentRegistry();
    dispatcher = new TaskDispatcher(registry, { minApprovalScore: 0.70 });

    // Register test worker and critic
    registry.register({
      agentId: "worker-01",
      name: "Worker 01",
      role: "Software Engineer",
      department: "Engineering",
      capabilities: ["backend", "api"],
      criticPairId: "critic-01",
    });

    registry.register({
      agentId: "critic-01",
      name: "Critic 01",
      role: "QA Critic",
      department: "Engineering",
      capabilities: ["critic_validation"],
      secretKey: "critic-secret-key-123",
    });
  });

  afterEach(() => {
    dispatcher.clear();
    registry.clear();
  });

  describe("Task Dispatch & Auto-Pairing", () => {
    it("should dispatch a task and automatically pair available worker and critic", () => {
      const task = dispatcher.dispatch({
        title: "Implement Auth Middleware",
        department: "Engineering",
        priority: "P1",
        requiredCapabilities: ["backend"],
      });

      expect(task.id).toBeDefined();
      expect(task.priority).toBe("P1");
      expect(task.assignedWorkerId).toBe("worker-01");
      expect(task.assignedCriticId).toBe("critic-01");
      expect(task.status).toBe("assigned");

      const worker = registry.get("worker-01");
      expect(worker?.status).toBe("busy");
      expect(worker?.currentTaskId).toBe(task.id);
    });

    it("should enqueue as 'queued' if no worker is available", () => {
      // Mark worker busy
      registry.updateStatus("worker-01", "busy");

      const task = dispatcher.dispatch({
        title: "Background Data Sync",
        department: "Engineering",
        priority: "P3",
      });

      expect(task.status).toBe("queued");
      expect(task.assignedWorkerId).toBeUndefined();
    });
  });

  describe("Priority Queue Ordering & Claiming", () => {
    beforeEach(() => {
      registry.updateStatus("worker-01", "busy"); // Prevent immediate auto-assign

      dispatcher.dispatch({ title: "Low Priority Task", priority: "P5", department: "Engineering" });
      dispatcher.dispatch({ title: "Critical Bugfix", priority: "P1", department: "Engineering" });
      dispatcher.dispatch({ title: "Medium Feature", priority: "P3", department: "Engineering" });
      dispatcher.dispatch({ title: "Urgent Hotfix", priority: "P1", department: "Engineering" });

      registry.updateStatus("worker-01", "idle"); // Now worker is free to claim
    });

    it("should claim the highest priority task first (P1 > P3 > P5) in FIFO order for same priority", () => {
      const claimed1 = dispatcher.claim("worker-01");
      expect(claimed1?.title).toBe("Critical Bugfix");
      expect(claimed1?.priority).toBe("P1");
      expect(claimed1?.status).toBe("running");

      // Free worker to claim next
      registry.updateStatus("worker-01", "idle");
      const claimed2 = dispatcher.claim("worker-01");
      expect(claimed2?.title).toBe("Urgent Hotfix");
      expect(claimed2?.priority).toBe("P1");

      registry.updateStatus("worker-01", "idle");
      const claimed3 = dispatcher.claim("worker-01");
      expect(claimed3?.title).toBe("Medium Feature");
      expect(claimed3?.priority).toBe("P3");

      registry.updateStatus("worker-01", "idle");
      const claimed4 = dispatcher.claim("worker-01");
      expect(claimed4?.title).toBe("Low Priority Task");
      expect(claimed4?.priority).toBe("P5");
    });
  });

  describe("Task Cancellation", () => {
    it("should cancel a task and release assigned agent to idle", () => {
      const task = dispatcher.dispatch({
        title: "Task to cancel",
        department: "Engineering",
      });

      expect(task.status).toBe("assigned");
      expect(registry.get("worker-01")?.status).toBe("busy");

      const cancelled = dispatcher.cancel(task.id, "User requested cancellation");
      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.cancelReason).toBe("User requested cancellation");
      expect(registry.get("worker-01")?.status).toBe("idle");
    });
  });
});
