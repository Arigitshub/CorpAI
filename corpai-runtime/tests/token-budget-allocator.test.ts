import { TokenBudgetAllocator } from "../src/budget/TokenBudgetAllocator";

describe("Agent Token Budget Allocator Suite", () => {
  let allocator: TokenBudgetAllocator;

  beforeEach(() => {
    allocator = new TokenBudgetAllocator({
      defaultQuotas: {
        Engineering: {
          department: "Engineering",
          tokenQuota: 1000,
          refillRatePerSec: 100,
          maxCapacity: 2000,
          maxBurstMultiplier: 2.0,
        },
      },
      refillIntervalMs: 50,
      enablePriorityQueue: true,
    });
  });

  afterEach(() => {
    allocator.destroy();
  });

  test("should allocate tokens immediately when bucket has capacity", async () => {
    const result = await allocator.allocate({
      agentId: "agent-alice",
      department: "Engineering",
      tokens: 250,
      priority: "P2",
      reason: "Unit test task execution",
    });

    expect(result.allocated).toBe(true);
    expect(result.tokensAllocated).toBe(250);
    expect(result.department).toBe("Engineering");
    expect(result.agentId).toBe("agent-alice");
    expect(result.burstActive).toBe(false);

    const usage = allocator.getDepartmentUsage("Engineering");
    expect(usage.totalConsumed).toBe(250);
    expect(usage.availableTokens).toBe(750); // 1000 - 250
  });

  test("should tryAllocate non-blockingly", () => {
    const try1 = allocator.tryAllocate({
      agentId: "agent-bob",
      department: "Engineering",
      tokens: 400,
    });

    expect(try1).not.toBeNull();
    expect(try1?.tokensAllocated).toBe(400);

    const try2 = allocator.tryAllocate({
      agentId: "agent-bob",
      department: "Engineering",
      tokens: 800, // Exceeds remaining 600
    });

    expect(try2).toBeNull();
  });

  test("should enforce priority queue order (P1 > P3 > P5)", async () => {
    // Drain bucket to 0 tokens
    allocator.tryAllocate({
      agentId: "drain-agent",
      department: "Engineering",
      tokens: 1000,
    });

    const completionOrder: string[] = [];

    // Queue P5 (low priority) first
    const p5Promise = allocator
      .allocate({
        agentId: "agent-p5",
        department: "Engineering",
        tokens: 100,
        priority: "P5",
      })
      .then(() => completionOrder.push("P5"));

    // Queue P3 (medium priority) second
    const p3Promise = allocator
      .allocate({
        agentId: "agent-p3",
        department: "Engineering",
        tokens: 100,
        priority: "P3",
      })
      .then(() => completionOrder.push("P3"));

    // Queue P1 (highest priority) last
    const p1Promise = allocator
      .allocate({
        agentId: "agent-p1",
        department: "Engineering",
        tokens: 100,
        priority: "P1",
      })
      .then(() => completionOrder.push("P1"));

    // Verify queue depth
    const metricsBefore = allocator.getMetrics();
    expect(metricsBefore.activeQueuedRequestsCount).toBe(3);

    // Release tokens to fulfill requests
    allocator.release({ department: "Engineering", tokens: 300 });

    await Promise.all([p5Promise, p3Promise, p1Promise]);

    // Priority P1 must be processed before P3, and P3 before P5
    expect(completionOrder).toEqual(["P1", "P3", "P5"]);
  });

  test("should handle allocation timeout when tokens unavailable", async () => {
    // Drain bucket
    allocator.tryAllocate({
      agentId: "drain-agent",
      department: "Engineering",
      tokens: 1000,
    });

    await expect(
      allocator.allocate({
        agentId: "agent-timeout",
        department: "Engineering",
        tokens: 500,
        timeoutMs: 100,
      })
    ).rejects.toThrow("Token allocation request timed out after 100ms");
  });

  test("should grant emergency burst token allowance with quota expansion", async () => {
    const burst = allocator.grantEmergencyBurst({
      department: "Engineering",
      agentId: "agent-lead",
      burstTokens: 500,
      reason: "P0 Production Outage mitigation",
      authorizedBy: "VP of Engineering",
      durationMs: 5000,
    });

    expect(burst.department).toBe("Engineering");
    expect(burst.burstTokens).toBe(500);
    expect(burst.active).toBe(true);
    expect(burst.authorizedBy).toBe("VP of Engineering");

    const deptUsage = allocator.getDepartmentUsage("Engineering");
    expect(deptUsage.availableTokens).toBe(1500); // 1000 + 500
    expect(deptUsage.activeBurstTokens).toBe(500);

    // Allocate from burst
    const alloc = await allocator.allocate({
      agentId: "agent-lead",
      department: "Engineering",
      tokens: 1200,
    });

    expect(alloc.allocated).toBe(true);
    expect(alloc.burstActive).toBe(true);
  });

  test("should reject emergency burst exceeding max burst multiplier", () => {
    // Max capacity 2000, current 1000 -> max burst allowed is 1000
    expect(() => {
      allocator.grantEmergencyBurst({
        department: "Engineering",
        burstTokens: 5000,
        reason: "Excessive burst",
        authorizedBy: "admin",
      });
    }).toThrow(/exceeds maximum allowed burst capacity/);
  });

  test("should release/refund unused tokens back to bucket", () => {
    allocator.tryAllocate({
      agentId: "agent-refund",
      department: "Engineering",
      tokens: 600,
    });

    expect(allocator.getDepartmentUsage("Engineering").availableTokens).toBe(400);

    allocator.release({
      agentId: "agent-refund",
      department: "Engineering",
      tokens: 300,
    });

    expect(allocator.getDepartmentUsage("Engineering").availableTokens).toBe(700);
  });

  test("should track per-agent token metrics and aggregate throughput", async () => {
    await allocator.allocate({
      agentId: "agent-alpha",
      department: "Engineering",
      tokens: 100,
    });

    await allocator.allocate({
      agentId: "agent-beta",
      department: "Operations",
      tokens: 200,
    });

    const alphaUsage = allocator.getAgentUsage("agent-alpha");
    expect(alphaUsage?.totalConsumed).toBe(100);
    expect(alphaUsage?.allocationCount).toBe(1);

    const metrics = allocator.getMetrics();
    expect(metrics.totalTokensConsumedGlobal).toBe(300);
    expect(metrics.totalAllocationsCount).toBe(2);
    expect(metrics.departments["Engineering"]).toBeDefined();
    expect(metrics.departments["Operations"]).toBeDefined();
  });
});
