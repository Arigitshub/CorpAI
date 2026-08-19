import { GatewayServer } from "../src/gateway/GatewayServer";
import { GatewayClient } from "../src/client/GatewayClient";

describe("Socket Server & Gateway Client Integration Tests", () => {
  const TEST_PORT = 9898;
  const WS_URL = `ws://localhost:${TEST_PORT}/corpai-gateway`;
  let server: GatewayServer;
  let client: GatewayClient;

  beforeAll(async () => {
    server = new GatewayServer({
      port: TEST_PORT,
      heartbeatIntervalMs: 500,
      expiryTtlSeconds: 3,
    });
    await server.listen(TEST_PORT, "localhost");
  });

  afterAll(async () => {
    if (client && client.isConnected) {
      client.disconnect();
    }
    await server.close();
  });

  beforeEach(async () => {
    client = new GatewayClient({
      url: WS_URL,
      autoReconnect: false,
    });
    await client.connect();
  });

  afterEach(() => {
    client.disconnect();
  });

  it("should ping server and receive pong with timestamp", async () => {
    const res = await client.call("rpc.ping");
    expect(res).toBeDefined();
    expect(res.pong).toBe(true);
    expect(res.timestamp).toBeDefined();
  });

  it("should register agent, send heartbeat, and query list over WebSocket", async () => {
    const registered = await client.call("corpai.agent.register", {
      agentId: "ws-agent-01",
      name: "Socket Worker",
      role: "Backend",
      department: "Engineering",
      capabilities: ["ws", "socket"],
    });

    expect(registered.agentId).toBe("ws-agent-01");
    expect(registered.status).toBe("idle");

    const hb = await client.call("corpai.agent.heartbeat", {
      agentId: "ws-agent-01",
      confidence: 0.99,
      apiLatencyMs: 45,
      latestAction: "Processing live stream",
    });

    expect(hb.telemetry.confidence).toBe(0.99);

    const list = await client.call<any[]>("corpai.agent.list", { department: "Engineering" });
    expect(list.some((a) => a.agentId === "ws-agent-01")).toBe(true);
  });

  it("should execute batch requests over WebSocket and return all results in order", async () => {
    const batchResults = await client.batch([
      { method: "rpc.ping" },
      { method: "corpai.agent.list", params: {} },
      { method: "corpai.task.list", params: {} },
    ]);

    expect(batchResults).toHaveLength(3);
    expect(batchResults[0].pong).toBe(true);
    expect(Array.isArray(batchResults[1])).toBe(true);
    expect(Array.isArray(batchResults[2])).toBe(true);
  });

  it("should receive real-time pub/sub event notifications over WebSocket", async () => {
    const receivedEvents: any[] = [];
    client.on("corpai.event.taskDispatched", (event) => {
      receivedEvents.push(event);
    });

    await client.call("corpai.task.dispatch", {
      title: "Realtime Notification Test",
      department: "Engineering",
      priority: "P2",
    });

    // Wait short delay for async notification propagation
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
    expect(receivedEvents[0].title).toBe("Realtime Notification Test");
  });
});
