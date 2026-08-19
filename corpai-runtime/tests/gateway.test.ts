import { GatewayServer } from "../src/gateway/GatewayServer";
import { GatewayClient } from "../src/client/GatewayClient";
import { CriticValidator } from "../src/dispatch/CriticValidator";
import { JsonRpcErrorCode } from "../src/protocol/types";

describe("GatewayServer Distributed JSON-RPC 2.0 Integration Tests", () => {
  let gateway: GatewayServer;
  let client: GatewayClient;
  let port: number;
  let wsUrl: string;
  let httpUrl: string;

  beforeAll(async () => {
    gateway = new GatewayServer({
      port: 0,
      host: "127.0.0.1",
      heartbeatIntervalMs: 200,
      expiryTtlSeconds: 2,
    });
    const info = await gateway.listen(0, "127.0.0.1");
    port = info.port;
    wsUrl = `ws://127.0.0.1:${port}/corpai-agent-task-log`;
    httpUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    if (client && client.isConnected) {
      client.disconnect();
    }
    await gateway.close();
  });

  it("should respond to HTTP GET /health with system status", async () => {
    const res = await fetch(`${httpUrl}/health`);
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.ok).toBe(true);
    expect(data.service).toBe("corpai-runtime");
    expect(data.version).toBe("1.0.0");
    expect(typeof data.registeredAgents).toBe("number");
  });

  it("should respond to HTTP GET /corpai-team-status.json with TeamStatusFeed", async () => {
    const res = await fetch(`${httpUrl}/corpai-team-status.json`);
    expect(res.status).toBe(200);
    const feed: any = await res.json();
    expect(feed.generatedAt).toBeDefined();
    expect(feed.runtime).toBeDefined();
    expect(Array.isArray(feed.lanes)).toBe(true);
    expect(Array.isArray(feed.activity)).toBe(true);
  });

  it("should process JSON-RPC 2.0 requests over HTTP POST /rpc", async () => {
    const payload = {
      jsonrpc: "2.0",
      method: "rpc.discover",
      params: {},
      id: "http-test-1",
    };

    const res = await fetch(`${httpUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const json: any = await res.json();
    expect(json.jsonrpc).toBe("2.0");
    expect(json.id).toBe("http-test-1");
    expect(Array.isArray(json.result)).toBe(true);
    const methodNames = json.result.map((m: any) => m.name);
    expect(methodNames).toContain("corpai.agent.register");
    expect(methodNames).toContain("corpai.task.dispatch");
  });

  it("should connect over WebSocket, receive initial telemetry feed, and execute full agent/task lifecycle", async () => {
    client = new GatewayClient({
      url: wsUrl,
      autoReconnect: false,
    });
    await client.connect();

    // 1. Register Worker Agent
    const worker = await client.call("corpai.agent.register", {
      agentId: "ws-worker-01",
      name: "WS Worker 01",
      role: "Backend Engineer",
      department: "Engineering",
      capabilities: ["api_design", "node"],
      telemetry: { confidence: 0.91, apiLatencyMs: 65 },
    });

    expect(worker.agentId).toBe("ws-worker-01");
    expect(worker.secretKey).toBeDefined();

    // 2. Register Critic Agent
    const critic = await client.call("corpai.agent.register", {
      agentId: "ws-critic-01",
      name: "WS Critic 01",
      role: "Security Auditor",
      department: "Engineering",
      capabilities: ["critic_validation"],
      telemetry: { confidence: 0.98, apiLatencyMs: 40 },
    });

    expect(critic.agentId).toBe("ws-critic-01");
    const criticSecretKey = critic.secretKey;

    // 3. Send Heartbeat with Telemetry
    const hb = await client.call("corpai.agent.heartbeat", {
      agentId: "ws-worker-01",
      status: "idle",
      confidence: 0.95,
      apiLatencyMs: 50,
      runState: "ready",
      latestAction: "Ready for tasks",
    });

    expect(hb.status).toBe("idle");
    expect(hb.telemetry.confidence).toBe(0.95);

    // 4. Dispatch a Task
    const task = await client.call("corpai.task.dispatch", {
      title: "Build Distributed Gateway Integration",
      description: "Implement JSON-RPC 2.0 over socket",
      priority: "P1",
      department: "Engineering",
      assignedWorkerId: "ws-worker-01",
      assignedCriticId: "ws-critic-01",
      payload: { target: "socket-gateway" },
    });

    expect(task.id).toMatch(/^task-/);
    expect(task.status).toBe("assigned");

    // 5. Worker Claims Task
    const claimed = await client.call("corpai.task.claim", {
      agentId: "ws-worker-01",
      taskId: task.id,
    });

    expect(claimed.status).toBe("running");

    // 6. Worker Submits Result
    const submitted = await client.call("corpai.task.submitResult", {
      taskId: task.id,
      workerId: "ws-worker-01",
      result: {
        success: true,
        endpointsTested: ["/health", "/corpai-team-status.json", "ws://..."],
      },
    });

    expect(submitted.status).toBe("awaiting_critic");
    const resultHash = submitted.resultHash;
    expect(resultHash).toBeDefined();

    // 7. Critic Submits Review with Valid Cryptographic HMAC Signature
    const signedReview = CriticValidator.signReview(criticSecretKey, {
      criticId: "ws-critic-01",
      taskId: task.id,
      workerId: "ws-worker-01",
      status: "approved",
      score: 0.96,
      feedback: "All gateway integration checks pass with zero discrepancies.",
      timestamp: new Date().toISOString(),
      payloadHash: resultHash,
    });

    const reviewRes = await client.call("corpai.task.submitReview", {
      taskId: task.id,
      review: signedReview,
    });

    expect(reviewRes.task.status).toBe("completed");
    expect(reviewRes.validation.approved).toBe(true);
    expect(reviewRes.validation.signatureValid).toBe(true);

    // 8. Query Task Details
    const taskRecord = await client.call("corpai.task.get", { taskId: task.id });
    expect(taskRecord.status).toBe("completed");
    expect(taskRecord.reviewHistory).toHaveLength(1);

    // 9. Query Method Not Found
    await expect(client.call("non.existent.method")).rejects.toMatchObject({
      code: JsonRpcErrorCode.METHOD_NOT_FOUND,
    });

    // 10. Query Invalid Params
    await expect(client.call("corpai.agent.get", {})).rejects.toMatchObject({
      code: JsonRpcErrorCode.INVALID_PARAMS,
    });
  });
});
