import { GatewayServer } from "../src/gateway/GatewayServer";
import { GatewayClient } from "../src/client/GatewayClient";
import { JsonRpcErrorCode } from "../src/protocol/types";
import { JsonRpcException } from "../src/protocol/errors";

describe("CorpAI Runtime End-to-End Integration Suite", () => {
  const PORT = 9899;
  let server: GatewayServer;
  let client: GatewayClient;
  const criticKey = "integration-secret-key-critic-99";

  beforeAll(async () => {
    server = new GatewayServer({
      port: PORT,
      heartbeatIntervalMs: 500,
      expiryTtlSeconds: 5,
      enablePortalCompat: true,
    });
    await server.listen(PORT, "localhost");
  });

  afterAll(async () => {
    if (client && client.isConnected) {
      client.disconnect();
    }
    await server.close();
  });

  beforeEach(async () => {
    client = new GatewayClient({
      url: `ws://localhost:${PORT}/corpai-gateway`,
    });
    await client.connect();
  });

  afterEach(() => {
    client.disconnect();
  });

  it("should discover available JSON-RPC 2.0 gateway methods via rpc.discover", async () => {
    const discovery = await client.call<any[]>("rpc.discover");
    expect(Array.isArray(discovery)).toBe(true);
    const methodNames = discovery.map((d) => d.name);

    expect(methodNames).toContain("rpc.discover");
    expect(methodNames).toContain("rpc.ping");
    expect(methodNames).toContain("corpai.agent.register");
    expect(methodNames).toContain("corpai.agent.heartbeat");
    expect(methodNames).toContain("corpai.agent.list");
    expect(methodNames).toContain("corpai.task.dispatch");
    expect(methodNames).toContain("corpai.task.claim");
    expect(methodNames).toContain("corpai.task.submitResult");
    expect(methodNames).toContain("corpai.task.review");
    expect(methodNames).toContain("corpai.agentLogs.subscribe");
    expect(methodNames).toContain("corpai.executive.summarizeActivity");
  });

  it("should handle JSON-RPC standard error responses correctly", async () => {
    // 1. Unknown method (-32601)
    await expect(client.call("nonexistent.method")).rejects.toMatchObject({
      code: JsonRpcErrorCode.METHOD_NOT_FOUND,
    });

    // 2. Invalid params (-32602)
    await expect(client.call("corpai.agent.get", {})).rejects.toMatchObject({
      code: JsonRpcErrorCode.INVALID_PARAMS,
    });
  });

  it("should execute full multi-agent paired critic lifecycle and sync with portal feed", async () => {
    // 1. Register worker subagent
    const worker = await client.call("corpai.agent.register", {
      agentId: "int-worker-01",
      name: "Integration Worker",
      role: "Backend Architect",
      department: "Engineering",
      capabilities: ["cloud", "architecture"],
      criticPairId: "int-critic-01",
    });
    expect(worker.agentId).toBe("int-worker-01");

    // 2. Register paired critic subagent
    const critic = await client.call("corpai.agent.register", {
      agentId: "int-critic-01",
      name: "Integration Critic",
      role: "Security & QA Critic",
      department: "Governance",
      capabilities: ["critic_validation"],
      secretKey: criticKey,
    });
    expect(critic.agentId).toBe("int-critic-01");

    // 3. Dispatch high-priority task
    const task = await client.call("corpai.task.dispatch", {
      title: "Deploy Gateway to Staging",
      description: "Setup socket routing and telemetry endpoints",
      priority: "P1",
      department: "Engineering",
    });

    expect(task.status).toBe("assigned");
    expect(task.assignedWorkerId).toBe("int-worker-01");
    expect(task.assignedCriticId).toBe("int-critic-01");

    // 4. Worker submits task result
    const resultPayload = {
      cluster: "us-east-prod",
      status: "deployed",
      endpoints: ["/health", "/corpai-gateway", "/corpai-team-status.json"],
      latencyMs: 14,
    };

    const submitted = await client.call("corpai.task.submitResult", {
      taskId: task.id,
      workerId: "int-worker-01",
      result: resultPayload,
    });

    expect(submitted.status).toBe("awaiting_critic");
    expect(submitted.resultHash).toBeDefined();

    // 5. Critic creates cryptographic review and submits to gateway
    const review = GatewayClient.createSignedCriticReview("int-critic-01", criticKey, {
      taskId: task.id,
      workerId: "int-worker-01",
      status: "approved",
      score: 0.96,
      feedback: "Architecture verified, security checks green, zero vulnerabilities",
      payloadHash: submitted.resultHash,
    });

    const reviewResult = await client.call("corpai.task.review", {
      taskId: task.id,
      review,
    });

    expect(reviewResult.validation.approved).toBe(true);
    expect(reviewResult.validation.signatureValid).toBe(true);
    expect(reviewResult.task.status).toBe("completed");

    // 6. Verify Portal Feed & Executive Summary reflect updated state
    const feed = await client.call<any>("corpai.agentLogs.getFeed");
    expect(feed.runtime.connected).toBe(true);
    expect(Array.isArray(feed.lanes)).toBe(true);

    const workerLane = feed.lanes.find((l: any) => l.agentId === "int-worker-01");
    expect(workerLane).toBeDefined();
    expect(workerLane.progress).toBe(100);

    const summary = await client.call<any>("corpai.executive.summarizeActivity", feed);
    expect(summary.bullets).toHaveLength(3);
    expect(summary.bullets[0]).toContain("CorpAI autonomous agent lanes active");
  });
});
