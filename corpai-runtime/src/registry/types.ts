/**
 * Agent Registry Types and State Definitions
 */

export type AgentState =
  | "online"
  | "idle"
  | "busy"
  | "thinking"
  | "degraded"
  | "offline"
  | "expired";

export interface AgentTelemetry {
  confidence: number;
  apiLatencyMs: number;
  runState: string;
  provider: string;
  model: string;
  heartbeatAgeSec?: number;
}

export interface AgentRegistrationParams {
  agentId: string;
  name: string;
  role: string;
  department: string;
  capabilities?: string[];
  criticPairId?: string;
  secretKey?: string;
  metadata?: Record<string, unknown>;
  telemetry?: Partial<AgentTelemetry>;
}

export interface AgentHeartbeatParams {
  agentId: string;
  status?: AgentState;
  currentTaskId?: string;
  confidence?: number;
  apiLatencyMs?: number;
  runState?: string;
  provider?: string;
  model?: string;
  latestAction?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentRecord {
  agentId: string;
  name: string;
  role: string;
  department: string;
  capabilities: string[];
  status: AgentState;
  currentTaskId?: string;
  criticPairId?: string;
  secretKey?: string;
  registeredAt: string;
  lastHeartbeatAt: string;
  latestAction?: string;
  metadata: Record<string, unknown>;
  telemetry: AgentTelemetry;
  socketId?: string;
}

export interface AgentFilter {
  department?: string;
  role?: string;
  status?: AgentState | AgentState[];
  capability?: string;
}

export interface PingResult {
  agentId: string;
  pong: boolean;
  timestamp: string;
  rttMs: number;
}
