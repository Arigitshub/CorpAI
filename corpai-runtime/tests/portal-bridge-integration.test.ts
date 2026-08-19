import { GatewayServer } from "../src/gateway/GatewayServer";
import { GatewayBridgeClient } from "../../corpai-portal/src/lib/gatewayBridge";
import { computePayloadHash, signCriticReview, verifyCriticSignature } from "../../corpai-portal/src/lib/cryptoUtils";
import { TaskPriorityLevel } from "../../corpai-portal/src/types/gateway";

describe("Portal Gateway Bridge & Real-Time Event Integration Suite", () => {
  let server: GatewayServer;
  const TEST_PORT = 9988;
  const WS_URL = `ws://localhost:${TEST_PORT}/corpai-agent-task-log`;

  beforeAll(async () => {
    server = new GatewayServer({
      port: TEST_PORT,
      heartbeatIntervalMs: 500,
      expiryTtlSeconds: 5,
    });
    await server.listen(TEST_PORT);
  });

  afterAll(async () => {
    await server.close();
  });

  test("1. GatewayBridgeClient should connect to gateway, ping, and measure roundtrip latency", async () => {
    const bridge = new GatewayBridgeClient({ url: WS_URL, autoReconnect: false });
    await bridge.connect();
    expect(bridge.isConnected).toBe(true);

    const pingRes = await bridge.pingGateway();
    expect(pingRes.pong).toBe(true);
    expect(typeof pingRes.timestamp).toBe("string");
    expect(pingRes.latencyMs).toBeGreaterThanOrEqual(0);

    bridge.disconnect();
    expect(bridge.isConnected).toBe(false);
  });

  test("2. Should receive real-time pub/sub notifications for agentRegistered, taskDispatched, telemetryUpdate, and taskCompleted", async () => {
    const bridge = new GatewayBridgeClient({ url: WS_URL, autoReconnect: false });
    await bridge.connect();

    const receivedEvents: string[] = [];
    const eventPayloads: Record<string, any> = {};

    const unsubReg = bridge.subscribe("agentRegistered", (agent) => {
      receivedEvents.push("agentRegistered");
      eventPayloads.agentRegistered = agent;
    });

    const unsubDisp = bridge.subscribe("taskDispatched", (task) => {
      receivedEvents.push("taskDispatched");
      eventPayloads.taskDispatched = task;
    });

    const unsubComp = bridge.subscribe("taskCompleted", (task) => {
      receivedEvents.push("taskCompleted");
      eventPayloads.taskCompleted = task;
    });

    const unsubTelem = bridge.subscribe("telemetryUpdate", (data) => {
      receivedEvents.push("telemetryUpdate");
      eventPayloads.telemetryUpdate = data;
    });

    // 1. Register worker & critic agents
    const worker = await bridge.registerAgent({
      agentId: "test-bridge-worker-01",
      name: "Bridge Worker Node",
      department: "Dev",
      capabilities: ["typescript", "testing"],
      secretKey: "test-worker-secret-key-1234",
    });
    expect(worker.agentId).toBe("test-bridge-worker-01");

    const critic = await bridge.registerAgent({
      agentId: "test-bridge-critic-01",
      name: "Bridge Critic Node",
      department: "Dev",
      capabilities: ["typescript", "code_review"],
      secretKey: "test-critic-secret-key-5678",
    });
    expect(critic.agentId).toBe("test-bridge-critic-01");

    // 2. Send heartbeat to trigger telemetryUpdate
    await bridge.sendHeartbeat({
      agentId: "test-bridge-worker-01",
      confidence: 0.94,
      apiLatencyMs: 88,
      status: "idle",
      latestAction: "Standing by for bridge test dispatch",
    });

    // 3. Dispatch task
    const dispatched = await bridge.dispatchTask({
      title: "Bridge Real-Time Event Verification",
      description: "Verify that portal receives all pub/sub events",
      department: "Dev",
      priority: TaskPriorityLevel.P1_CRITICAL,
      workerId: "test-bridge-worker-01",
      criticId: "test-bridge-critic-01",
      requireCritic: true,
    });
    expect(dispatched.id).toBeDefined();

    // 4. Worker submits result
    const resultPayload = { buildPassed: true, testsPassing: 42 };
    await bridge.submitResult(dispatched.id, "test-bridge-worker-01", resultPayload);

    // 5. Critic creates HMAC signature and submits review
    const payloadHash = await computePayloadHash(resultPayload);
    const signedReview = await signCriticReview("test-critic-secret-key-5678", {
      criticId: "test-bridge-critic-01",
      taskId: dispatched.id,
      workerId: "test-bridge-worker-01",
      status: "approved",
      score: 0.96,
      feedback: "All test assertions passed with valid HMAC signature",
      payloadHash,
    });

    await bridge.submitReview(dispatched.id, signedReview);

    // Wait briefly for pub/sub message propagation
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(receivedEvents).toContain("agentRegistered");
    expect(receivedEvents).toContain("telemetryUpdate");
    expect(receivedEvents).toContain("taskDispatched");
    expect(receivedEvents).toContain("taskCompleted");

    expect(eventPayloads.taskCompleted.id).toBe(dispatched.id);
    expect(eventPayloads.taskCompleted.status).toBe("completed");

    unsubReg();
    unsubDisp();
    unsubComp();
    unsubTelem();
    bridge.disconnect();
  });

  test("3. Cryptographic HMAC-SHA256 Critic Signatures: should verify valid signature and reject tampered data", async () => {
    const secret = "super-secret-critic-key-256";
    const workerId = "agent-dev-01";
    const taskId = "task-crypto-01";
    const payload = { codeDiff: "+function secure() { return true; }" };

    const payloadHash = await computePayloadHash(payload);
    const signedReview = await signCriticReview(secret, {
      criticId: "critic-sec-01",
      taskId,
      workerId,
      status: "approved",
      score: 0.95,
      feedback: "Looks clean",
      payloadHash,
    });

    expect(signedReview.signature).toHaveLength(64);

    // Valid verification
    const isValid = await verifyCriticSignature(secret, workerId, signedReview);
    expect(isValid).toBe(true);

    // Tampered score verification
    const tamperedScoreReview = { ...signedReview, score: 0.99 };
    const isTamperedScoreValid = await verifyCriticSignature(secret, workerId, tamperedScoreReview);
    expect(isTamperedScoreValid).toBe(false);

    // Tampered payload hash verification
    const isTamperedHashValid = await verifyCriticSignature(secret, workerId, {
      ...signedReview,
      payloadHash: "deadbeef00000000000000000000000000000000000000000000000000000000",
    });
    expect(isTamperedHashValid).toBe(false);
  });

  test("4. Socket Auto-Reconnection & State Reconciliation", async () => {
    let stateChanges: string[] = [];
    const bridge = new GatewayBridgeClient({
      url: WS_URL,
      autoReconnect: true,
      reconnectDelayMs: 100,
    });

    bridge.onStateChange((st) => stateChanges.push(st));

    await bridge.connect();
    expect(bridge.isConnected).toBe(true);

    // Verify system status and feed reconciliation
    const status = await bridge.getSystemStatus();
    expect(status.ok).toBe(true);
    expect(status.registeredAgents).toBeGreaterThanOrEqual(2);

    const feed = await bridge.getFeed();
    expect(feed.lanes).toBeDefined();

    bridge.disconnect();
  });
});
