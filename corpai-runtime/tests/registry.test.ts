import { AgentRegistry } from "../src/registry/AgentRegistry";
import { HeartbeatMonitor } from "../src/registry/HeartbeatMonitor";

describe("Agent Registry & Heartbeat Engine Tests", () => {
  let registry: AgentRegistry;
  let monitor: HeartbeatMonitor;

  beforeEach(() => {
    registry = new AgentRegistry();
    monitor = new HeartbeatMonitor(registry, {
      checkIntervalMs: 100,
      expiryTtlSeconds: 2, // 2 seconds TTL for tests
    });
  });

  afterEach(() => {
    monitor.stop();
    registry.clear();
  });

  describe("Agent Registration", () => {
    it("should register an agent with default telemetry and generate a secret key", () => {
      const agent = registry.register({
        agentId: "agent-eng-01",
        name: "Dev Worker 1",
        role: "Senior Backend Engineer",
        department: "Engineering",
        capabilities: ["typescript", "nodejs", "database"],
      });

      expect(agent.agentId).toBe("agent-eng-01");
      expect(agent.status).toBe("idle");
      expect(agent.department).toBe("Engineering");
      expect(agent.secretKey).toBeDefined();
      expect(agent.secretKey!.length).toBeGreaterThan(16);
      expect(registry.get("agent-eng-01")).toBeDefined();
    });

    it("should preserve custom secret key and metadata if provided", () => {
      const customKey = "my-secret-key-1234567890abcdef";
      const agent = registry.register({
        agentId: "critic-sec-01",
        name: "Security Critic",
        role: "Security Reviewer",
        department: "Governance",
        secretKey: customKey,
        metadata: { clearance: "L5" },
      });

      expect(agent.secretKey).toBe(customKey);
      expect(agent.metadata.clearance).toBe("L5");
    });

    it("should unregister an agent and set status to offline", () => {
      registry.register({
        agentId: "agent-to-remove",
        name: "Temp Agent",
        role: "Worker",
        department: "Operations",
      });

      expect(registry.get("agent-to-remove")).toBeDefined();
      const removed = registry.unregister("agent-to-remove");
      expect(removed.status).toBe("offline");
      expect(registry.get("agent-to-remove")).toBeUndefined();
    });
  });

  describe("Heartbeat Updates & Tracking", () => {
    it("should record heartbeat and update telemetry fields", () => {
      registry.register({
        agentId: "agent-hb-01",
        name: "Worker HB",
        role: "Worker",
        department: "Engineering",
      });

      const updated = registry.recordHeartbeat({
        agentId: "agent-hb-01",
        confidence: 0.95,
        apiLatencyMs: 85,
        runState: "running_step_3",
        latestAction: "Executing test suite",
      });

      expect(updated.telemetry.confidence).toBe(0.95);
      expect(updated.telemetry.apiLatencyMs).toBe(85);
      expect(updated.telemetry.runState).toBe("running_step_3");
      expect(updated.latestAction).toBe("Executing test suite");
    });
  });

  describe("Heartbeat Expiry Detection", () => {
    it("should detect expired heartbeats and transition status to expired", () => {
      const expiredCallback = jest.fn();
      monitor.on("agent:expired", expiredCallback);

      const agent = registry.register({
        agentId: "agent-stale",
        name: "Stale Agent",
        role: "Worker",
        department: "Engineering",
      });

      // Simulate old heartbeat timestamp (5 seconds ago with 2s TTL)
      agent.lastHeartbeatAt = new Date(Date.now() - 5000).toISOString();

      const expired = monitor.reap();
      expect(expired).toHaveLength(1);
      expect(expired[0].agentId).toBe("agent-stale");
      expect(expired[0].status).toBe("expired");
      expect(expiredCallback).toHaveBeenCalledWith(
        expect.objectContaining({ agentId: "agent-stale", status: "expired" })
      );
    });

    it("should recover status to idle when expired agent sends a new heartbeat", () => {
      const agent = registry.register({
        agentId: "agent-recovering",
        name: "Recovering Agent",
        role: "Worker",
        department: "Engineering",
      });

      agent.lastHeartbeatAt = new Date(Date.now() - 5000).toISOString();
      monitor.reap();
      expect(agent.status).toBe("expired");

      registry.recordHeartbeat({
        agentId: "agent-recovering",
        latestAction: "Reconnected and ready",
      });

      expect(agent.status).toBe("idle");
    });
  });

  describe("Agent Query Filtering & Critic Finding", () => {
    beforeEach(() => {
      registry.register({
        agentId: "dev-1",
        name: "Dev 1",
        role: "Developer",
        department: "Engineering",
        capabilities: ["code", "typescript"],
        criticPairId: "critic-1",
      });
      registry.register({
        agentId: "critic-1",
        name: "Critic 1",
        role: "QA Critic",
        department: "Engineering",
        capabilities: ["critic_validation", "code_review"],
      });
      registry.register({
        agentId: "sec-1",
        name: "Sec 1",
        role: "Security Officer",
        department: "Governance",
        capabilities: ["critic_validation", "security"],
      });
    });

    it("should filter agents by department", () => {
      const eng = registry.list({ department: "Engineering" });
      expect(eng).toHaveLength(2);
      const gov = registry.list({ department: "Governance" });
      expect(gov).toHaveLength(1);
    });

    it("should find available idle worker matching capabilities", () => {
      const worker = registry.findAvailableWorker("Engineering", ["typescript"]);
      expect(worker).toBeDefined();
      expect(worker?.agentId).toBe("dev-1");
    });

    it("should resolve paired critic via explicit pairing or capability matching", () => {
      const dev = registry.get("dev-1")!;
      const critic = registry.findCriticForWorker(dev);
      expect(critic).toBeDefined();
      expect(critic?.agentId).toBe("critic-1");
    });
  });

  describe("Ping / Pong Health Checks", () => {
    it("should measure ping roundtrip latency successfully", async () => {
      registry.register({
        agentId: "ping-agent",
        name: "Ping Agent",
        role: "Worker",
        department: "Operations",
      });

      const res = await monitor.pingAgent("ping-agent");
      expect(res.pong).toBe(true);
      expect(res.agentId).toBe("ping-agent");
      expect(res.rttMs).toBeGreaterThanOrEqual(0);
    });
  });
});
