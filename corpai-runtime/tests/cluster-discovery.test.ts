import { ClusterDiscovery } from "../src/cluster/ClusterDiscovery";
import { ClusterNode } from "../src/cluster/types";

describe("Multi-Node Cluster Discovery & Gossip Sync Suite", () => {
  let nodeA: ClusterDiscovery;
  let nodeB: ClusterDiscovery;
  let nodeC: ClusterDiscovery;

  beforeEach(() => {
    nodeA = new ClusterDiscovery({
      nodeId: "gateway-node-alpha",
      clusterId: "corpai-test-cluster",
      hostname: "127.0.0.1",
      port: 8787,
      role: "gateway",
      capabilities: ["jsonrpc-gateway", "task-dispatcher"],
      enableUdp: false,
      discoveryIntervalMs: 50000,
      gossipIntervalMs: 50000,
      pingTimeoutMs: 500,
      suspectTimeoutMs: 1000,
      offlineTimeoutMs: 2000,
    });

    nodeB = new ClusterDiscovery({
      nodeId: "gateway-node-beta",
      clusterId: "corpai-test-cluster",
      hostname: "127.0.0.1",
      port: 8788,
      role: "worker",
      capabilities: ["worker-engine", "gpu-accelerator"],
      enableUdp: false,
      discoveryIntervalMs: 50000,
      gossipIntervalMs: 50000,
      pingTimeoutMs: 500,
      suspectTimeoutMs: 1000,
      offlineTimeoutMs: 2000,
    });

    nodeC = new ClusterDiscovery({
      nodeId: "gateway-node-gamma",
      clusterId: "corpai-test-cluster",
      hostname: "127.0.0.1",
      port: 8789,
      role: "coordinator",
      capabilities: ["critic-validator", "arbiter"],
      enableUdp: false,
      discoveryIntervalMs: 50000,
      gossipIntervalMs: 50000,
      pingTimeoutMs: 500,
      suspectTimeoutMs: 1000,
      offlineTimeoutMs: 2000,
    });
  });

  afterEach(async () => {
    await nodeA.stop();
    await nodeB.stop();
    await nodeC.stop();
  });

  test("should initialize local node metadata and startup state", async () => {
    const local = await nodeA.start();

    expect(local.nodeId).toBe("gateway-node-alpha");
    expect(local.clusterId).toBe("corpai-test-cluster");
    expect(local.role).toBe("gateway");
    expect(local.status).toBe("online");
    expect(local.capabilities).toContain("jsonrpc-gateway");
    expect(local.load).toBeDefined();
  });

  test("should register peers and compute cluster topology", async () => {
    await nodeA.start();
    await nodeB.start();

    // Direct interconnect registration
    nodeA.registerPeer(nodeB.getLocalNode() as ClusterNode);
    nodeB.registerPeer(nodeA.getLocalNode() as ClusterNode);

    const topologyA = nodeA.getClusterTopology();
    expect(topologyA.totalNodes).toBe(2);
    expect(topologyA.onlineCount).toBe(2);
    expect(topologyA.nodes.map((n) => n.nodeId)).toContain("gateway-node-beta");

    const peers = nodeA.getPeers();
    expect(peers.length).toBe(1);
    expect(peers[0].nodeId).toBe("gateway-node-beta");
    expect(peers[0].role).toBe("worker");
  });

  test("should execute Ping / Pong inter-node latency measurement", async () => {
    await nodeA.start();
    await nodeB.start();

    nodeA.registerPeer(nodeB.getLocalNode() as ClusterNode);
    nodeB.registerPeer(nodeA.getLocalNode() as ClusterNode);

    // Wire simulated transport
    nodeA.on("message:outbound", ({ message }) => {
      nodeB.handleIncomingMessage(message);
    });
    nodeB.on("message:outbound", ({ message }) => {
      nodeA.handleIncomingMessage(message);
    });

    let pingMeasured = false;
    nodeA.on("node:ping", (nodeId, latencyMs) => {
      expect(nodeId).toBe("gateway-node-beta");
      expect(latencyMs).toBeGreaterThanOrEqual(0);
      pingMeasured = true;
    });

    nodeA.sendPing("gateway-node-beta");

    expect(pingMeasured).toBe(true);
    const peerB = nodeA.getNode("gateway-node-beta");
    expect(peerB?.pingLatencyMs).toBeGreaterThanOrEqual(0);
    expect(peerB?.status).toBe("online");
  });

  test("should perform gossip anti-entropy sync across 3 nodes", async () => {
    await nodeA.start();
    await nodeB.start();
    await nodeC.start();

    // Node A knows Node B
    nodeA.registerPeer(nodeB.getLocalNode() as ClusterNode);
    nodeB.registerPeer(nodeA.getLocalNode() as ClusterNode);

    // Node B knows Node C
    nodeB.registerPeer(nodeC.getLocalNode() as ClusterNode);
    nodeC.registerPeer(nodeB.getLocalNode() as ClusterNode);

    // Wire message passing between A <-> B and B <-> C
    nodeA.on("message:outbound", ({ message }) => {
      if (message.recipientId === "gateway-node-beta") nodeB.handleIncomingMessage(message);
    });
    nodeB.on("message:outbound", ({ message }) => {
      if (message.recipientId === "gateway-node-alpha") nodeA.handleIncomingMessage(message);
      if (message.recipientId === "gateway-node-gamma") nodeC.handleIncomingMessage(message);
    });
    nodeC.on("message:outbound", ({ message }) => {
      if (message.recipientId === "gateway-node-beta") nodeB.handleIncomingMessage(message);
    });

    // Node A does not know Node C initially
    expect(nodeA.getNode("gateway-node-gamma")).toBeUndefined();

    // Node B gossips to Node A (transmitting delta containing Node C)
    nodeB.syncGossip("gateway-node-alpha");

    // Node A now discovers Node C via gossip delta!
    const discoveredC = nodeA.getNode("gateway-node-gamma");
    expect(discoveredC).toBeDefined();
    expect(discoveredC?.role).toBe("coordinator");
    expect(discoveredC?.capabilities).toContain("critic-validator");
  });

  test("should detect node failure and emit suspect and offline events", async () => {
    await nodeA.start();
    await nodeB.start();

    nodeA.registerPeer(nodeB.getLocalNode() as ClusterNode);

    // Node B becomes unresponsive (no pong)
    const peerRecord = nodeA.getNode("gateway-node-beta")!;
    // Artificially age the last seen timestamp
    peerRecord.lastSeenAt = new Date(Date.now() - 3000).toISOString();

    let nodeLeftFired = false;
    nodeA.on("node:left", (nodeId) => {
      expect(nodeId).toBe("gateway-node-beta");
      nodeLeftFired = true;
    });

    // Trigger failure check
    (nodeA as any).checkPeerFailures();

    expect(nodeLeftFired).toBe(true);
    const topology = nodeA.getClusterTopology();
    expect(topology.offlineCount).toBe(1);
  });

  test("should handle graceful leave notification", async () => {
    await nodeA.start();
    await nodeB.start();

    nodeA.registerPeer(nodeB.getLocalNode() as ClusterNode);
    nodeB.registerPeer(nodeA.getLocalNode() as ClusterNode);

    nodeB.on("message:outbound", ({ message }) => {
      nodeA.handleIncomingMessage(message);
    });

    let nodeLeftReceived = false;
    nodeA.on("node:left", (nodeId) => {
      expect(nodeId).toBe("gateway-node-beta");
      nodeLeftReceived = true;
    });

    // Node B leaves gracefully
    await nodeB.stop();

    expect(nodeLeftReceived).toBe(true);
    const peerB = nodeA.getNode("gateway-node-beta");
    expect(peerB?.status).toBe("offline");
  });

  test("should update local load telemetry and propagate to topology", async () => {
    await nodeA.start();
    nodeA.updateLocalLoad({
      activeTasks: 12,
      registeredAgents: 5,
      memoryUsageMb: 256,
      cpuPercent: 34.5,
    });

    const local = nodeA.getLocalNode();
    expect(local.load.activeTasks).toBe(12);
    expect(local.load.registeredAgents).toBe(5);
    expect(local.load.cpuPercent).toBe(34.5);
  });
});
