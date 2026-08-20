import { EventEmitter } from "events";
import * as dgram from "dgram";
import * as crypto from "crypto";
import * as os from "os";
import {
  ClusterDiscoveryOptions,
  ClusterMessage,
  ClusterMessageType,
  ClusterNode,
  ClusterTopology,
  GossipDeltaPayload,
  GossipDigestEntry,
  GossipDigestPayload,
  NodeRole,
  NodeStatus,
  PingPayload,
  PongPayload,
} from "./types";

export class ClusterDiscovery extends EventEmitter {
  private readonly options: Required<Omit<ClusterDiscoveryOptions, "department">> & {
    department?: string;
  };
  private readonly localNode: ClusterNode;
  private readonly peers = new Map<string, ClusterNode>();
  private readonly pingTimers = new Map<string, { sentAt: number; timer: NodeJS.Timeout }>();

  private socket: dgram.Socket | null = null;
  private isRunning = false;
  private pingSequence = 0;

  private discoveryTimer: NodeJS.Timeout | null = null;
  private gossipTimer: NodeJS.Timeout | null = null;
  private failureDetectionTimer: NodeJS.Timeout | null = null;

  constructor(options: ClusterDiscoveryOptions = {}) {
    super();

    const nodeId = options.nodeId || `node-${crypto.randomBytes(4).toString("hex")}`;
    const clusterId = options.clusterId || "corpai-cluster-main";
    const hostname = options.hostname || os.hostname() || "127.0.0.1";
    const port = options.port || 8787;
    const rpcEndpoint = options.rpcEndpoint || `ws://${hostname}:${port}/corpai-agent-task-log`;
    const role: NodeRole = options.role || "gateway";
    const capabilities = options.capabilities || ["jsonrpc-gateway", "task-dispatcher", "critic-validator"];

    this.options = {
      nodeId,
      clusterId,
      hostname,
      port,
      rpcEndpoint,
      role,
      capabilities,
      department: options.department,
      udpPort: options.udpPort ?? 9876,
      multicastAddress: options.multicastAddress ?? "239.255.255.250",
      enableUdp: options.enableUdp ?? true,
      staticPeers: options.staticPeers ?? [],
      discoveryIntervalMs: options.discoveryIntervalMs ?? 5000,
      gossipIntervalMs: options.gossipIntervalMs ?? 3000,
      pingIntervalMs: options.pingIntervalMs ?? 2000,
      pingTimeoutMs: options.pingTimeoutMs ?? 2000,
      suspectTimeoutMs: options.suspectTimeoutMs ?? 6000,
      offlineTimeoutMs: options.offlineTimeoutMs ?? 15000,
      gossipFanout: options.gossipFanout ?? 3,
      metadata: options.metadata ?? {},
    };

    const now = new Date().toISOString();
    this.localNode = {
      nodeId: this.options.nodeId,
      clusterId: this.options.clusterId,
      hostname: this.options.hostname,
      port: this.options.port,
      rpcEndpoint: this.options.rpcEndpoint,
      role: this.options.role,
      capabilities: [...this.options.capabilities],
      department: this.options.department,
      status: "online",
      generation: 1,
      lastSeenAt: now,
      pingLatencyMs: 0,
      load: {
        activeTasks: 0,
        registeredAgents: 0,
        memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        cpuPercent: 0,
        tokenThroughput: 0,
      },
      metadata: { ...this.options.metadata },
    };
  }

  /**
   * Get local cluster node record.
   */
  public getLocalNode(): Readonly<ClusterNode> {
    return { ...this.localNode, load: { ...this.localNode.load }, metadata: { ...this.localNode.metadata } };
  }

  /**
   * Start cluster discovery, UDP sockets, and gossip loops.
   */
  public async start(): Promise<ClusterNode> {
    if (this.isRunning) {
      return this.getLocalNode();
    }

    this.localNode.status = "online";
    this.localNode.lastSeenAt = new Date().toISOString();
    this.localNode.generation += 1;
    this.isRunning = true;

    if (this.options.enableUdp) {
      await this.initUdpSocket();
    }

    // Connect to static peers if specified
    for (const peerAddr of this.options.staticPeers) {
      this.addStaticPeer(peerAddr);
    }

    this.startIntervals();

    // Broadcast discovery beacon
    this.broadcastDiscovery();

    this.emit("started", this.getLocalNode());
    return this.getLocalNode();
  }

  /**
   * Stop cluster discovery and broadcast leave message.
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.localNode.status = "offline";
    this.localNode.lastSeenAt = new Date().toISOString();
    this.localNode.generation += 1;

    // Send graceful leave notification to peers
    this.broadcastLeave();

    this.clearIntervals();

    for (const [, timerInfo] of this.pingTimers) {
      clearTimeout(timerInfo.timer);
    }
    this.pingTimers.clear();

    if (this.socket) {
      try {
        await new Promise<void>((resolve) => {
          this.socket?.close(() => resolve());
        });
      } catch {
        // Ignore socket close error
      }
      this.socket = null;
    }

    this.emit("stopped", this.getLocalNode());
  }

  /**
   * Update local node load telemetry metrics.
   */
  public updateLocalLoad(load: Partial<ClusterNode["load"]>): void {
    this.localNode.load = {
      ...this.localNode.load,
      ...load,
    };
    this.localNode.lastSeenAt = new Date().toISOString();
    this.localNode.generation += 1;
  }

  /**
   * Update local node metadata.
   */
  public updateLocalMetadata(metadata: Record<string, unknown>): void {
    this.localNode.metadata = {
      ...this.localNode.metadata,
      ...metadata,
    };
    this.localNode.lastSeenAt = new Date().toISOString();
    this.localNode.generation += 1;
  }

  /**
   * Add a static peer address (e.g., "127.0.0.1:9877" or "ws://127.0.0.1:8787")
   */
  public addStaticPeer(peerAddress: string): void {
    let hostname = peerAddress;
    let port = this.options.udpPort;

    if (peerAddress.includes("://")) {
      try {
        const parsed = new URL(peerAddress);
        hostname = parsed.hostname;
        port = parsed.port ? parseInt(parsed.port, 10) : this.options.port;
      } catch {
        // fallback
      }
    } else if (peerAddress.includes(":")) {
      const parts = peerAddress.split(":");
      hostname = parts[0];
      port = parseInt(parts[1], 10) || this.options.udpPort;
    }

    const syntheticId = `static-peer-${hostname}-${port}`;
    if (!this.peers.has(syntheticId)) {
      const peerNode: ClusterNode = {
        nodeId: syntheticId,
        clusterId: this.options.clusterId,
        hostname,
        port,
        rpcEndpoint: `ws://${hostname}:${port}/corpai-agent-task-log`,
        role: "peer",
        capabilities: [],
        status: "suspect",
        generation: 0,
        lastSeenAt: new Date().toISOString(),
        load: {},
        metadata: { isStatic: true },
      };
      this.peers.set(syntheticId, peerNode);
    }

    this.sendPing(syntheticId);
  }

  /**
   * Direct node-to-node message routing (used for in-memory direct transport or UDP unicast)
   */
  public handleIncomingMessage(
    rawMessage: Buffer | string | ClusterMessage,
    rinfo?: { address: string; port: number }
  ): void {
    let message: ClusterMessage;
    if (typeof rawMessage === "string" || Buffer.isBuffer(rawMessage)) {
      try {
        message = JSON.parse(rawMessage.toString("utf8")) as ClusterMessage;
      } catch {
        return; // Ignore malformed UDP packet
      }
    } else {
      message = rawMessage;
    }

    if (!message || typeof message !== "object") return;
    if (message.clusterId !== this.options.clusterId) return; // Ignore different clusters
    if (message.senderId === this.localNode.nodeId) return; // Ignore own echoes

    const sender = message.senderNode;
    if (rinfo && sender) {
      sender.hostname = rinfo.address || sender.hostname;
    }

    switch (message.type) {
      case "DISCOVERY_BROADCAST":
        this.processDiscoveryBroadcast(message);
        break;

      case "DISCOVERY_RESPONSE":
        this.processDiscoveryResponse(message);
        break;

      case "PING":
        this.processPing(message);
        break;

      case "PONG":
        this.processPong(message);
        break;

      case "GOSSIP_DIGEST":
        this.processGossipDigest(message);
        break;

      case "GOSSIP_DELTA":
        this.processGossipDelta(message);
        break;

      case "JOIN_REQUEST":
        this.processJoinRequest(message);
        break;

      case "JOIN_ACK":
        this.processJoinAck(message);
        break;

      case "LEAVE_NOTIFICATION":
        this.processLeaveNotification(message);
        break;
    }
  }

  /**
   * Send a direct ping to measure roundtrip inter-node latency
   */
  public sendPing(targetNodeId: string): void {
    const peer = this.peers.get(targetNodeId);
    if (!peer) return;

    this.pingSequence += 1;
    const sentAt = Date.now();
    const payload: PingPayload = {
      sentAt,
      sequence: this.pingSequence,
    };

    const msg = this.createMessage("PING", payload, targetNodeId);

    const pingTimerKey = `${targetNodeId}-${this.pingSequence}`;
    const timeoutHandle = setTimeout(() => {
      this.pingTimers.delete(pingTimerKey);
      if (peer.status === "online") {
        peer.status = "suspect";
        this.emit("node:suspect", { ...peer });
      }
    }, this.options.pingTimeoutMs);

    this.pingTimers.set(pingTimerKey, { sentAt, timer: timeoutHandle });
    this.sendDirectMessage(peer, msg);
  }

  /**
   * Broadcast ping to all known peers
   */
  public broadcastPing(): void {
    for (const [nodeId] of this.peers) {
      this.sendPing(nodeId);
    }
  }

  /**
   * Exchange gossip digest with randomly sampled peers
   */
  public syncGossip(targetNodeId?: string): void {
    const digest = this.generateGossipDigest();
    const payload: GossipDigestPayload = { digest };

    if (targetNodeId) {
      const peer = this.peers.get(targetNodeId);
      if (peer) {
        const msg = this.createMessage("GOSSIP_DIGEST", payload, targetNodeId);
        this.sendDirectMessage(peer, msg);
      }
      return;
    }

    const eligiblePeers = Array.from(this.peers.values()).filter((p) => p.status !== "offline");
    if (eligiblePeers.length === 0) return;

    // Sample random subset based on fanout
    const shuffled = [...eligiblePeers].sort(() => 0.5 - Math.random());
    const targets = shuffled.slice(0, this.options.gossipFanout);

    for (const target of targets) {
      const msg = this.createMessage("GOSSIP_DIGEST", payload, target.nodeId);
      this.sendDirectMessage(target, msg);
    }
  }

  /**
   * Manually register or update a peer node (useful for testing or direct interconnects)
   */
  public registerPeer(peer: ClusterNode): void {
    if (peer.nodeId === this.localNode.nodeId) return;

    const existing = this.peers.get(peer.nodeId);
    const isNew = !existing;

    this.peers.set(peer.nodeId, {
      ...peer,
      lastSeenAt: peer.lastSeenAt || new Date().toISOString(),
    });

    if (isNew) {
      this.emit("node:joined", { ...this.peers.get(peer.nodeId)! });
    } else {
      this.emit("node:updated", { ...this.peers.get(peer.nodeId)! });
    }
  }

  /**
   * Get all registered peer nodes
   */
  public getPeers(): ClusterNode[] {
    return Array.from(this.peers.values()).map((p) => ({ ...p, load: { ...p.load }, metadata: { ...p.metadata } }));
  }

  /**
   * Get healthy online nodes
   */
  public getHealthyNodes(): ClusterNode[] {
    return this.getPeers().filter((p) => p.status === "online");
  }

  /**
   * Get single node by ID
   */
  public getNode(nodeId: string): ClusterNode | undefined {
    if (nodeId === this.localNode.nodeId) {
      return this.localNode;
    }
    return this.peers.get(nodeId);
  }

  /**
   * Get full cluster topology view
   */
  public getClusterTopology(): ClusterTopology {
    const peers = this.getPeers();
    const allNodes = [this.getLocalNode() as ClusterNode, ...peers];

    const onlineCount = allNodes.filter((n) => n.status === "online").length;
    const suspectCount = allNodes.filter((n) => n.status === "suspect").length;
    const offlineCount = allNodes.filter((n) => n.status === "offline").length;

    return {
      clusterId: this.options.clusterId,
      localNodeId: this.localNode.nodeId,
      totalNodes: allNodes.length,
      onlineCount,
      suspectCount,
      offlineCount,
      nodes: allNodes,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Join a cluster through a seed peer address
   */
  public async joinCluster(seedPeerAddress?: string): Promise<ClusterTopology> {
    if (seedPeerAddress) {
      this.addStaticPeer(seedPeerAddress);
    }
    this.broadcastDiscovery();
    this.syncGossip();
    return this.getClusterTopology();
  }

  /**
   * Leave cluster gracefully
   */
  public async leaveCluster(): Promise<void> {
    await this.stop();
  }

  // -------------------------------------------------------------
  // Internal Protocol Logic & Message Handlers
  // -------------------------------------------------------------

  private createMessage<T>(
    type: ClusterMessageType,
    payload: T,
    recipientId?: string
  ): ClusterMessage<T> {
    return {
      id: `cmsg-${crypto.randomBytes(6).toString("hex")}`,
      type,
      clusterId: this.options.clusterId,
      senderId: this.localNode.nodeId,
      senderNode: this.getLocalNode() as ClusterNode,
      recipientId,
      timestamp: new Date().toISOString(),
      payload,
    };
  }

  private processDiscoveryBroadcast(message: ClusterMessage): void {
    const sender = message.senderNode;
    this.upsertPeer(sender);

    // Reply with discovery response unicast
    const reply = this.createMessage("DISCOVERY_RESPONSE", {
      acknowledged: true,
      topology: this.getClusterTopology(),
    }, sender.nodeId);

    this.sendDirectMessage(sender, reply);
  }

  private processDiscoveryResponse(message: ClusterMessage): void {
    const sender = message.senderNode;
    this.upsertPeer(sender);

    const payload = message.payload as { topology?: ClusterTopology };
    if (payload?.topology?.nodes) {
      for (const node of payload.topology.nodes) {
        if (node.nodeId !== this.localNode.nodeId) {
          this.upsertPeer(node);
        }
      }
    }
  }

  private processPing(message: ClusterMessage): void {
    const sender = message.senderNode;
    this.upsertPeer(sender);

    const pingPayload = message.payload as PingPayload;
    const pongPayload: PongPayload = {
      sentAt: pingPayload.sentAt,
      receivedAt: Date.now(),
      sequence: pingPayload.sequence,
      load: { ...this.localNode.load },
    };

    const response = this.createMessage("PONG", pongPayload, sender.nodeId);
    this.sendDirectMessage(sender, response);
  }

  private processPong(message: ClusterMessage): void {
    const sender = message.senderNode;
    const pongPayload = message.payload as PongPayload;

    const timerKey = `${sender.nodeId}-${pongPayload.sequence}`;
    const timerInfo = this.pingTimers.get(timerKey);
    if (timerInfo) {
      clearTimeout(timerInfo.timer);
      this.pingTimers.delete(timerKey);
    }

    const now = Date.now();
    const rtt = Math.max(1, now - pongPayload.sentAt);

    const peer = this.peers.get(sender.nodeId) || sender;
    peer.pingLatencyMs = rtt;
    peer.status = "online";
    peer.lastSeenAt = new Date().toISOString();
    if (pongPayload.load) {
      peer.load = { ...peer.load, ...pongPayload.load };
    }

    this.peers.set(sender.nodeId, peer);
    this.emit("node:ping", sender.nodeId, rtt);
    this.emit("node:updated", { ...peer });
  }

  private processGossipDigest(message: ClusterMessage): void {
    const sender = message.senderNode;
    this.upsertPeer(sender);

    const digestPayload = message.payload as GossipDigestPayload;
    const requestedNodes: ClusterNode[] = [];
    const localDigest = this.generateGossipDigest();
    const remoteDigestMap = new Map(digestPayload.digest.map((d) => [d.nodeId, d]));

    // Check which nodes we have newer state for to send delta
    for (const localEntry of localDigest) {
      const remote = remoteDigestMap.get(localEntry.nodeId);
      if (!remote || localEntry.generation > remote.generation) {
        const node = localEntry.nodeId === this.localNode.nodeId
          ? (this.getLocalNode() as ClusterNode)
          : this.peers.get(localEntry.nodeId);
        if (node) requestedNodes.push(node);
      }
    }

    if (requestedNodes.length > 0) {
      const deltaMsg = this.createMessage<GossipDeltaPayload>("GOSSIP_DELTA", {
        nodes: requestedNodes,
      }, sender.nodeId);
      this.sendDirectMessage(sender, deltaMsg);
    }

    // Check if remote has nodes that local is missing or has older generation for
    let remoteHasNewer = false;
    for (const remoteEntry of digestPayload.digest) {
      if (remoteEntry.nodeId === this.localNode.nodeId) continue;
      const localPeer = this.peers.get(remoteEntry.nodeId);
      if (!localPeer || remoteEntry.generation > localPeer.generation) {
        remoteHasNewer = true;
        break;
      }
    }

    if (remoteHasNewer) {
      const replyDigest = this.createMessage<GossipDigestPayload>("GOSSIP_DIGEST", {
        digest: this.generateGossipDigest(),
      }, sender.nodeId);
      this.sendDirectMessage(sender, replyDigest);
    }
  }

  private processGossipDelta(message: ClusterMessage): void {
    const deltaPayload = message.payload as GossipDeltaPayload;
    if (!deltaPayload?.nodes) return;

    for (const node of deltaPayload.nodes) {
      if (node.nodeId === this.localNode.nodeId) continue;
      this.upsertPeer(node);
    }

    this.emit("gossip:synced", this.peers.size);
  }

  private processJoinRequest(message: ClusterMessage): void {
    const sender = message.senderNode;
    this.upsertPeer(sender);

    const ack = this.createMessage("JOIN_ACK", {
      joined: true,
      topology: this.getClusterTopology(),
    }, sender.nodeId);

    this.sendDirectMessage(sender, ack);
  }

  private processJoinAck(message: ClusterMessage): void {
    const sender = message.senderNode;
    this.upsertPeer(sender);

    const payload = message.payload as { topology?: ClusterTopology };
    if (payload?.topology?.nodes) {
      for (const node of payload.topology.nodes) {
        if (node.nodeId !== this.localNode.nodeId) {
          this.upsertPeer(node);
        }
      }
    }
  }

  private processLeaveNotification(message: ClusterMessage): void {
    const sender = message.senderNode;
    const peer = this.peers.get(sender.nodeId);
    if (peer) {
      peer.status = "offline";
      peer.lastSeenAt = new Date().toISOString();
      this.emit("node:left", sender.nodeId, { ...peer });
    }
  }

  private upsertPeer(node: ClusterNode): void {
    if (node.nodeId === this.localNode.nodeId) return;

    const existing = this.peers.get(node.nodeId);
    if (!existing) {
      this.peers.set(node.nodeId, { ...node, lastSeenAt: new Date().toISOString() });
      this.emit("node:joined", { ...this.peers.get(node.nodeId)! });
    } else {
      if (node.generation >= existing.generation) {
        const wasOfflineOrSuspect = existing.status !== "online";
        existing.generation = node.generation;
        existing.status = node.status;
        existing.rpcEndpoint = node.rpcEndpoint || existing.rpcEndpoint;
        existing.role = node.role || existing.role;
        existing.capabilities = node.capabilities || existing.capabilities;
        existing.department = node.department || existing.department;
        existing.load = { ...existing.load, ...node.load };
        existing.metadata = { ...existing.metadata, ...node.metadata };
        existing.lastSeenAt = new Date().toISOString();

        if (wasOfflineOrSuspect && node.status === "online") {
          this.emit("node:joined", { ...existing });
        } else {
          this.emit("node:updated", { ...existing });
        }
      }
    }
  }

  private generateGossipDigest(): GossipDigestEntry[] {
    const entries: GossipDigestEntry[] = [
      {
        nodeId: this.localNode.nodeId,
        generation: this.localNode.generation,
        status: this.localNode.status,
        lastSeenAt: this.localNode.lastSeenAt,
      },
    ];

    for (const [nodeId, peer] of this.peers) {
      entries.push({
        nodeId,
        generation: peer.generation,
        status: peer.status,
        lastSeenAt: peer.lastSeenAt,
      });
    }

    return entries;
  }

  // -------------------------------------------------------------
  // Socket & Interval Management
  // -------------------------------------------------------------

  private async initUdpSocket(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

        socket.on("error", (err) => {
          // UDP error (e.g. port taken or unprivileged bind); fallback gracefully to in-memory mode
          this.emit("warning", `UDP Socket warning: ${err.message}`);
        });

        socket.on("message", (msg, rinfo) => {
          this.handleIncomingMessage(msg, rinfo);
        });

        socket.bind(this.options.udpPort, () => {
          try {
            socket.setBroadcast(true);
            if (this.options.multicastAddress) {
              socket.addMembership(this.options.multicastAddress);
              socket.setMulticastTTL(4);
            }
          } catch {
            // Ignore multicast config error in test/sandboxed env
          }
          this.socket = socket;
          resolve();
        });
      } catch {
        resolve(); // Continue gracefully without UDP
      }
    });
  }

  private broadcastDiscovery(): void {
    const msg = this.createMessage("DISCOVERY_BROADCAST", {
      clusterId: this.options.clusterId,
      capabilities: this.localNode.capabilities,
      role: this.localNode.role,
    });

    this.sendBroadcastMessage(msg);
  }

  private broadcastLeave(): void {
    const msg = this.createMessage("LEAVE_NOTIFICATION", {
      reason: "graceful_shutdown",
    });

    this.sendBroadcastMessage(msg);
  }

  private sendBroadcastMessage(msg: ClusterMessage): void {
    if (!this.socket) {
      // In-memory or peer broadcast fallback
      for (const [, peer] of this.peers) {
        this.sendDirectMessage(peer, msg);
      }
      return;
    }

    const payload = Buffer.from(JSON.stringify(msg), "utf8");

    // Broadcast to UDP broadcast address
    try {
      this.socket.send(payload, 0, payload.length, this.options.udpPort, "255.255.255.255");
    } catch {
      // Ignore
    }

    // Also broadcast to multicast group if configured
    if (this.options.multicastAddress) {
      try {
        this.socket.send(payload, 0, payload.length, this.options.udpPort, this.options.multicastAddress);
      } catch {
        // Ignore
      }
    }
  }

  private sendDirectMessage(peer: ClusterNode, msg: ClusterMessage): void {
    if (this.socket && peer.hostname && peer.port) {
      const payload = Buffer.from(JSON.stringify(msg), "utf8");
      try {
        this.socket.send(payload, 0, payload.length, this.options.udpPort, peer.hostname);
      } catch {
        // Ignore send errors
      }
    }
    this.emit("message:outbound", { peer, message: msg });
  }

  private startIntervals(): void {
    this.discoveryTimer = setInterval(() => {
      if (this.isRunning) {
        this.broadcastDiscovery();
      }
    }, this.options.discoveryIntervalMs);

    this.gossipTimer = setInterval(() => {
      if (this.isRunning) {
        this.syncGossip();
      }
    }, this.options.gossipIntervalMs);

    this.failureDetectionTimer = setInterval(() => {
      if (this.isRunning) {
        this.checkPeerFailures();
      }
    }, this.options.pingIntervalMs);
  }

  private checkPeerFailures(): void {
    const now = Date.now();

    for (const [nodeId, peer] of this.peers) {
      const lastSeen = Date.parse(peer.lastSeenAt);
      const ageMs = Number.isNaN(lastSeen) ? 999999 : Math.max(0, now - lastSeen);

      if (ageMs > this.options.offlineTimeoutMs) {
        if (peer.status !== "offline") {
          peer.status = "offline";
          this.emit("node:left", nodeId, { ...peer });
        }
      } else if (ageMs > this.options.suspectTimeoutMs) {
        if (peer.status === "online") {
          peer.status = "suspect";
          this.emit("node:suspect", { ...peer });
        }
        this.sendPing(nodeId);
      } else {
        // Periodic ping
        this.sendPing(nodeId);
      }
    }
  }

  private clearIntervals(): void {
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }
    if (this.gossipTimer) {
      clearInterval(this.gossipTimer);
      this.gossipTimer = null;
    }
    if (this.failureDetectionTimer) {
      clearInterval(this.failureDetectionTimer);
      this.failureDetectionTimer = null;
    }
  }
}
