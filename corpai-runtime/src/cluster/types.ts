/**
 * Multi-Node Cluster Discovery and Gossip Sync Types
 */

export type NodeRole = "gateway" | "worker" | "coordinator" | "evaluator" | "peer";

export type NodeStatus = "online" | "suspect" | "offline";

export interface NodeLoadTelemetry {
  activeTasks?: number;
  registeredAgents?: number;
  memoryUsageMb?: number;
  cpuPercent?: number;
  tokenThroughput?: number;
}

export interface ClusterNode {
  nodeId: string;
  clusterId: string;
  hostname: string;
  port: number;
  rpcEndpoint: string;
  role: NodeRole;
  capabilities: string[];
  department?: string;
  status: NodeStatus;
  generation: number; // Monotonic state generation counter
  lastSeenAt: string;
  pingLatencyMs?: number;
  load: NodeLoadTelemetry;
  metadata: Record<string, unknown>;
}

export type ClusterMessageType =
  | "PING"
  | "PONG"
  | "DISCOVERY_BROADCAST"
  | "DISCOVERY_RESPONSE"
  | "GOSSIP_DIGEST"
  | "GOSSIP_DELTA"
  | "JOIN_REQUEST"
  | "JOIN_ACK"
  | "LEAVE_NOTIFICATION";

export interface ClusterMessage<T = unknown> {
  id: string;
  type: ClusterMessageType;
  clusterId: string;
  senderId: string;
  senderNode: ClusterNode;
  recipientId?: string;
  timestamp: string;
  payload: T;
}

export interface GossipDigestEntry {
  nodeId: string;
  generation: number;
  status: NodeStatus;
  lastSeenAt: string;
}

export interface GossipDigestPayload {
  digest: GossipDigestEntry[];
}

export interface GossipDeltaPayload {
  nodes: ClusterNode[];
}

export interface PingPayload {
  sentAt: number;
  sequence: number;
}

export interface PongPayload {
  sentAt: number;
  receivedAt: number;
  sequence: number;
  load: NodeLoadTelemetry;
}

export interface ClusterTopology {
  clusterId: string;
  localNodeId: string;
  totalNodes: number;
  onlineCount: number;
  suspectCount: number;
  offlineCount: number;
  nodes: ClusterNode[];
  generatedAt: string;
}

export interface ClusterDiscoveryOptions {
  nodeId?: string;
  clusterId?: string;
  hostname?: string;
  port?: number;
  rpcEndpoint?: string;
  role?: NodeRole;
  capabilities?: string[];
  department?: string;
  udpPort?: number;
  multicastAddress?: string;
  enableUdp?: boolean;
  staticPeers?: string[];
  discoveryIntervalMs?: number;
  gossipIntervalMs?: number;
  pingIntervalMs?: number;
  pingTimeoutMs?: number;
  suspectTimeoutMs?: number;
  offlineTimeoutMs?: number;
  gossipFanout?: number;
  metadata?: Record<string, unknown>;
}
