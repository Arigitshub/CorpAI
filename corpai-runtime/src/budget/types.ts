import { TaskPriority } from "../dispatch/types";

export interface DepartmentQuota {
  department: string;
  tokenQuota: number; // Tokens allocated per period
  refillRatePerSec: number; // Tokens refilled per second
  windowMs: number; // Period window in milliseconds
  maxCapacity: number; // Maximum burst bucket size
  currentTokens: number; // Currently available tokens
  totalConsumed: number; // Lifetime tokens consumed
  lastRefillTime: number; // Timestamp of last refill calculation
  maxBurstMultiplier: number; // Max emergency burst multiplier (e.g. 2.0x)
}

export interface EmergencyBurst {
  burstId: string;
  department: string;
  agentId?: string;
  burstTokens: number;
  remainingTokens: number;
  reason: string;
  authorizedBy: string;
  grantedAt: string;
  expiresAt: string;
  active: boolean;
}

export interface TokenAllocationParams {
  agentId: string;
  department?: string;
  tokens: number;
  priority?: TaskPriority;
  timeoutMs?: number;
  reason?: string;
}

export interface TokenAllocationResult {
  allocated: boolean;
  allocationId: string;
  agentId: string;
  department: string;
  tokensAllocated: number;
  remainingDepartmentTokens: number;
  priority: TaskPriority;
  burstActive: boolean;
  burstTokensUsed?: number;
  waitedMs: number;
  timestamp: string;
  reason?: string;
}

export interface QueuedAllocationRequest {
  requestId: string;
  agentId: string;
  department: string;
  tokens: number;
  priority: TaskPriority;
  reason?: string;
  requestedAt: number;
  timeoutMs: number;
  resolve: (res: TokenAllocationResult) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

export interface DepartmentUsageSummary {
  department: string;
  availableTokens: number;
  tokenQuota: number;
  maxCapacity: number;
  totalConsumed: number;
  queueDepth: number;
  activeBurstsCount: number;
  activeBurstTokens: number;
}

export interface AgentUsageSummary {
  agentId: string;
  department: string;
  totalConsumed: number;
  allocationCount: number;
  lastAllocatedAt?: string;
}

export interface TokenBudgetMetrics {
  totalTokensConsumedGlobal: number;
  totalAllocationsCount: number;
  totalRejectionsCount: number;
  totalEmergencyBurstsCount: number;
  activeQueuedRequestsCount: number;
  departments: Record<string, DepartmentUsageSummary>;
  generatedAt: string;
}

export interface TokenBudgetAllocatorOptions {
  defaultQuotas?: Record<string, Partial<DepartmentQuota>>;
  refillIntervalMs?: number;
  defaultTimeoutMs?: number;
  defaultBurstMultiplier?: number;
  enablePriorityQueue?: boolean;
}
