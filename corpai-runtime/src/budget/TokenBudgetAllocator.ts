import { EventEmitter } from "events";
import * as crypto from "crypto";
import { TaskPriority, TaskPriorityWeight } from "../dispatch/types";
import {
  AgentUsageSummary,
  DepartmentQuota,
  DepartmentUsageSummary,
  EmergencyBurst,
  QueuedAllocationRequest,
  TokenAllocationParams,
  TokenAllocationResult,
  TokenBudgetAllocatorOptions,
  TokenBudgetMetrics,
} from "./types";

export class TokenBudgetAllocator extends EventEmitter {
  private readonly options: Required<TokenBudgetAllocatorOptions>;
  private readonly quotas = new Map<string, DepartmentQuota>();
  private readonly agentUsage = new Map<string, AgentUsageSummary>();
  private readonly activeBursts = new Map<string, EmergencyBurst>();
  private readonly queue: QueuedAllocationRequest[] = [];

  private refillTimer: NodeJS.Timeout | null = null;
  private totalConsumedGlobal = 0;
  private totalAllocationsCount = 0;
  private totalRejectionsCount = 0;
  private totalEmergencyBurstsCount = 0;

  // Default departmental quotas
  private static readonly DEFAULT_DEPARTMENT_CONFIGS: Record<string, Partial<DepartmentQuota>> = {
    Executive: {
      tokenQuota: 200000,
      refillRatePerSec: 4000,
      windowMs: 60000,
      maxCapacity: 400000,
      maxBurstMultiplier: 3.0,
    },
    Engineering: {
      tokenQuota: 500000,
      refillRatePerSec: 10000,
      windowMs: 60000,
      maxCapacity: 1000000,
      maxBurstMultiplier: 2.5,
    },
    Operations: {
      tokenQuota: 250000,
      refillRatePerSec: 5000,
      windowMs: 60000,
      maxCapacity: 500000,
      maxBurstMultiplier: 2.0,
    },
    GTM: {
      tokenQuota: 200000,
      refillRatePerSec: 4000,
      windowMs: 60000,
      maxCapacity: 400000,
      maxBurstMultiplier: 2.0,
    },
    Marketing: {
      tokenQuota: 200000,
      refillRatePerSec: 4000,
      windowMs: 60000,
      maxCapacity: 400000,
      maxBurstMultiplier: 2.0,
    },
    Sales: {
      tokenQuota: 150000,
      refillRatePerSec: 3000,
      windowMs: 60000,
      maxCapacity: 300000,
      maxBurstMultiplier: 2.0,
    },
    Security: {
      tokenQuota: 300000,
      refillRatePerSec: 6000,
      windowMs: 60000,
      maxCapacity: 600000,
      maxBurstMultiplier: 3.0,
    },
    Risk: {
      tokenQuota: 200000,
      refillRatePerSec: 4000,
      windowMs: 60000,
      maxCapacity: 400000,
      maxBurstMultiplier: 2.5,
    },
    Dev: {
      tokenQuota: 350000,
      refillRatePerSec: 7000,
      windowMs: 60000,
      maxCapacity: 700000,
      maxBurstMultiplier: 2.0,
    },
  };

  constructor(options: TokenBudgetAllocatorOptions = {}) {
    super();

    this.options = {
      defaultQuotas: options.defaultQuotas ?? {},
      refillIntervalMs: options.refillIntervalMs ?? 500,
      defaultTimeoutMs: options.defaultTimeoutMs ?? 10000,
      defaultBurstMultiplier: options.defaultBurstMultiplier ?? 2.0,
      enablePriorityQueue: options.enablePriorityQueue ?? true,
    };

    this.initializeQuotas();
    this.startRefillLoop();
  }

  /**
   * Set up default and customized department quotas
   */
  private initializeQuotas(): void {
    const allConfigs = {
      ...TokenBudgetAllocator.DEFAULT_DEPARTMENT_CONFIGS,
      ...this.options.defaultQuotas,
    };

    const now = Date.now();
    for (const [dept, config] of Object.entries(allConfigs)) {
      const quota = config.tokenQuota ?? 250000;
      const refill = config.refillRatePerSec ?? Math.round(quota / 60);
      const maxCap = config.maxCapacity ?? quota * 2;
      const initialTokens = config.currentTokens ?? config.tokenQuota ?? quota;

      this.quotas.set(dept.toLowerCase(), {
        department: dept,
        tokenQuota: quota,
        refillRatePerSec: refill,
        windowMs: config.windowMs ?? 60000,
        maxCapacity: maxCap,
        currentTokens: initialTokens,
        totalConsumed: 0,
        lastRefillTime: now,
        maxBurstMultiplier: config.maxBurstMultiplier ?? this.options.defaultBurstMultiplier,
      });
    }
  }

  /**
   * Start periodic refill timer
   */
  private startRefillLoop(): void {
    this.refillTimer = setInterval(() => {
      this.refillBuckets();
      this.processQueue();
      this.checkExpiredBursts();
    }, this.options.refillIntervalMs);
  }

  /**
   * Asynchronously allocate tokens for an agent/department task.
   * If tokens are insufficient and priority queuing is enabled, enqueues request
   * sorted by priority (P1 > P2 > P3 > P4 > P5).
   */
  public allocate(params: TokenAllocationParams): Promise<TokenAllocationResult> {
    if (!params.agentId || typeof params.tokens !== "number" || params.tokens <= 0) {
      return Promise.reject(new Error("Invalid token allocation parameters: agentId and positive tokens required"));
    }

    const dept = (params.department || "Engineering").toLowerCase();
    const quota = this.getOrCreateQuota(dept);
    const priority: TaskPriority = params.priority || "P3";
    const timeoutMs = params.timeoutMs ?? this.options.defaultTimeoutMs;

    this.refillDepartment(quota);

    // Try immediate allocation
    const immediateResult = this.tryDeductTokens(quota, params.agentId, params.tokens, priority, params.reason);
    if (immediateResult) {
      this.recordAgentUsage(params.agentId, quota.department, params.tokens);
      this.emit("token:allocated", immediateResult);
      return Promise.resolve(immediateResult);
    }

    // If priority queue is disabled, fail immediately
    if (!this.options.enablePriorityQueue) {
      this.totalRejectionsCount += 1;
      throw new Error(`Token allocation rejected: insufficient tokens in department '${quota.department}'`);
    }

    // Enqueue request
    const requestId = `req-${crypto.randomBytes(6).toString("hex")}`;
    const requestedAt = Date.now();

    return new Promise<TokenAllocationResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        // Find and remove from queue
        const idx = this.queue.findIndex((r) => r.requestId === requestId);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          this.totalRejectionsCount += 1;
          this.emit("token:timeout", requestId);
          reject(new Error(`Token allocation request timed out after ${timeoutMs}ms for agent '${params.agentId}' (${params.tokens} tokens)`));
        }
      }, timeoutMs);

      const request: QueuedAllocationRequest = {
        requestId,
        agentId: params.agentId,
        department: quota.department,
        tokens: params.tokens,
        priority,
        reason: params.reason,
        requestedAt,
        timeoutMs,
        resolve,
        reject,
        timer,
      };

      this.enqueueRequest(request);
      this.emit("token:queued", request);
    });
  }

  /**
   * Synchronously and non-blockingly attempt to allocate tokens. Returns null if insufficient.
   */
  public tryAllocate(params: TokenAllocationParams): TokenAllocationResult | null {
    if (!params.agentId || typeof params.tokens !== "number" || params.tokens <= 0) {
      return null;
    }

    const dept = (params.department || "Engineering").toLowerCase();
    const quota = this.getOrCreateQuota(dept);
    const priority: TaskPriority = params.priority || "P3";

    this.refillDepartment(quota);

    const result = this.tryDeductTokens(quota, params.agentId, params.tokens, priority, params.reason);
    if (result) {
      this.recordAgentUsage(params.agentId, quota.department, params.tokens);
      this.emit("token:allocated", result);
    }
    return result;
  }

  /**
   * Release or refund unused tokens back to department bucket.
   */
  public release(params: { agentId?: string; department?: string; tokens: number }): void {
    if (!params || typeof params.tokens !== "number" || params.tokens <= 0) return;

    const dept = (params.department || "Engineering").toLowerCase();
    const quota = this.getOrCreateQuota(dept);

    quota.currentTokens = Math.min(quota.maxCapacity, quota.currentTokens + params.tokens);

    this.emit("token:released", {
      department: quota.department,
      agentId: params.agentId || "unknown",
      tokens: params.tokens,
    });

    this.processQueue();
  }

  /**
   * Grant an emergency burst token allowance to a department or specific agent.
   */
  public grantEmergencyBurst(params: {
    department: string;
    agentId?: string;
    burstTokens: number;
    reason: string;
    authorizedBy: string;
    durationMs?: number;
  }): EmergencyBurst {
    if (!params.department || typeof params.burstTokens !== "number" || params.burstTokens <= 0) {
      throw new Error("Invalid emergency burst parameters: department and positive burstTokens required");
    }

    const dept = params.department.toLowerCase();
    const quota = this.getOrCreateQuota(dept);
    const maxAllowedBurst = Math.round(quota.maxCapacity * quota.maxBurstMultiplier);

    if (params.burstTokens > maxAllowedBurst) {
      throw new Error(
        `Emergency burst of ${params.burstTokens} exceeds maximum allowed burst capacity (${maxAllowedBurst} tokens)`
      );
    }

    const burstId = `burst-${crypto.randomBytes(6).toString("hex")}`;
    const durationMs = params.durationMs ?? 300000; // 5 minutes default
    const now = Date.now();

    const burst: EmergencyBurst = {
      burstId,
      department: quota.department,
      agentId: params.agentId,
      burstTokens: params.burstTokens,
      remainingTokens: params.burstTokens,
      reason: params.reason || "Emergency production load spike",
      authorizedBy: params.authorizedBy || "SYSTEM_ADMIN",
      grantedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + durationMs).toISOString(),
      active: true,
    };

    this.activeBursts.set(burstId, burst);
    this.totalEmergencyBurstsCount += 1;

    // Immediately process any queued requests with the new emergency allowance
    this.processQueue();

    this.emit("burst:granted", burst);
    return burst;
  }

  /**
   * Revoke an active emergency burst
   */
  public revokeEmergencyBurst(burstId: string): boolean {
    const burst = this.activeBursts.get(burstId);
    if (!burst || !burst.active) return false;

    burst.active = false;
    burst.remainingTokens = 0;
    this.emit("burst:expired", burst);
    return true;
  }

  /**
   * Set or update department quota parameters
   */
  public setDepartmentQuota(department: string, config: Partial<DepartmentQuota>): DepartmentQuota {
    const dept = department.toLowerCase();
    const existing = this.getOrCreateQuota(dept);

    if (config.tokenQuota !== undefined) existing.tokenQuota = config.tokenQuota;
    if (config.refillRatePerSec !== undefined) existing.refillRatePerSec = config.refillRatePerSec;
    if (config.windowMs !== undefined) existing.windowMs = config.windowMs;
    if (config.maxCapacity !== undefined) existing.maxCapacity = config.maxCapacity;
    if (config.maxBurstMultiplier !== undefined) existing.maxBurstMultiplier = config.maxBurstMultiplier;

    existing.currentTokens = Math.min(existing.maxCapacity, existing.currentTokens);
    return { ...existing };
  }

  /**
   * Get usage metrics for a department
   */
  public getDepartmentUsage(department: string): DepartmentUsageSummary {
    const dept = department.toLowerCase();
    const quota = this.getOrCreateQuota(dept);
    this.refillDepartment(quota);

    const queued = this.queue.filter((r) => r.department.toLowerCase() === dept);
    const bursts = Array.from(this.activeBursts.values()).filter(
      (b) => b.active && b.department.toLowerCase() === dept
    );
    const burstTokens = bursts.reduce((acc, b) => acc + b.remainingTokens, 0);

    return {
      department: quota.department,
      availableTokens: quota.currentTokens + burstTokens,
      tokenQuota: quota.tokenQuota,
      maxCapacity: quota.maxCapacity,
      totalConsumed: quota.totalConsumed,
      queueDepth: queued.length,
      activeBurstsCount: bursts.length,
      activeBurstTokens: burstTokens,
    };
  }

  /**
   * Get agent usage statistics
   */
  public getAgentUsage(agentId: string): AgentUsageSummary | undefined {
    const usage = this.agentUsage.get(agentId);
    return usage ? { ...usage } : undefined;
  }

  /**
   * Get global token budget system metrics
   */
  public getMetrics(): TokenBudgetMetrics {
    const departments: Record<string, DepartmentUsageSummary> = {};
    for (const [dept, quota] of this.quotas) {
      const usage = this.getDepartmentUsage(dept);
      departments[quota.department] = usage;
      departments[dept] = usage;
    }

    return {
      totalTokensConsumedGlobal: this.totalConsumedGlobal,
      totalAllocationsCount: this.totalAllocationsCount,
      totalRejectionsCount: this.totalRejectionsCount,
      totalEmergencyBurstsCount: this.totalEmergencyBurstsCount,
      activeQueuedRequestsCount: this.queue.length,
      departments,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Reset all counters and drain queue (useful for tests)
   */
  public reset(): void {
    for (const req of this.queue) {
      clearTimeout(req.timer);
      req.reject(new Error("Token budget allocator was reset"));
    }
    this.queue.length = 0;
    this.activeBursts.clear();
    this.agentUsage.clear();
    this.totalConsumedGlobal = 0;
    this.totalAllocationsCount = 0;
    this.totalRejectionsCount = 0;
    this.initializeQuotas();
  }

  /**
   * Stop background timers
   */
  public destroy(): void {
    if (this.refillTimer) {
      clearInterval(this.refillTimer);
      this.refillTimer = null;
    }
    this.reset();
  }

  // -------------------------------------------------------------
  // Internal Helper Methods
  // -------------------------------------------------------------

  private getOrCreateQuota(departmentKey: string): DepartmentQuota {
    let quota = this.quotas.get(departmentKey);
    if (!quota) {
      const properName = departmentKey.charAt(0).toUpperCase() + departmentKey.slice(1);
      const defaultQuota = 250000;
      const maxCap = 500000;
      quota = {
        department: properName,
        tokenQuota: defaultQuota,
        refillRatePerSec: 5000,
        windowMs: 60000,
        maxCapacity: maxCap,
        currentTokens: defaultQuota,
        totalConsumed: 0,
        lastRefillTime: Date.now(),
        maxBurstMultiplier: this.options.defaultBurstMultiplier,
      };
      this.quotas.set(departmentKey, quota);
    }
    return quota;
  }

  private refillDepartment(quota: DepartmentQuota): void {
    const now = Date.now();
    const elapsedSec = (now - quota.lastRefillTime) / 1000;
    if (elapsedSec <= 0) return;

    const refillTokens = Math.floor(elapsedSec * quota.refillRatePerSec);
    if (refillTokens > 0) {
      quota.currentTokens = Math.min(quota.maxCapacity, quota.currentTokens + refillTokens);
      quota.lastRefillTime = now;
    }
  }

  private refillBuckets(): void {
    for (const [, quota] of this.quotas) {
      this.refillDepartment(quota);
    }
  }

  private tryDeductTokens(
    quota: DepartmentQuota,
    agentId: string,
    tokens: number,
    priority: TaskPriority,
    reason?: string,
    waitedMs = 0
  ): TokenAllocationResult | null {
    // 1. Try standard department bucket
    if (quota.currentTokens >= tokens) {
      quota.currentTokens -= tokens;
      quota.lastRefillTime = Date.now();
      quota.totalConsumed += tokens;
      this.totalConsumedGlobal += tokens;
      this.totalAllocationsCount += 1;

      return {
        allocated: true,
        allocationId: `alloc-${crypto.randomBytes(6).toString("hex")}`,
        agentId,
        department: quota.department,
        tokensAllocated: tokens,
        remainingDepartmentTokens: quota.currentTokens,
        priority,
        burstActive: false,
        waitedMs,
        timestamp: new Date().toISOString(),
        reason,
      };
    }

    // 2. Check for active emergency burst allowances
    const deptKey = quota.department.toLowerCase();
    const activeDeptBursts = Array.from(this.activeBursts.values()).filter(
      (b) => b.active && b.department.toLowerCase() === deptKey && (!b.agentId || b.agentId === agentId)
    );

    let burstTokensAvailable = 0;
    for (const burst of activeDeptBursts) {
      burstTokensAvailable += burst.remainingTokens;
    }

    const totalAvailable = quota.currentTokens + burstTokensAvailable;
    if (totalAvailable >= tokens) {
      let neededFromBurst = tokens - quota.currentTokens;
      const fromBucket = quota.currentTokens;
      quota.currentTokens = 0;
      quota.totalConsumed += tokens;
      this.totalConsumedGlobal += tokens;
      this.totalAllocationsCount += 1;

      let burstTokensUsed = 0;
      for (const burst of activeDeptBursts) {
        if (neededFromBurst <= 0) break;
        const take = Math.min(burst.remainingTokens, neededFromBurst);
        burst.remainingTokens -= take;
        neededFromBurst -= take;
        burstTokensUsed += take;
        if (burst.remainingTokens <= 0) {
          burst.active = false;
        }
      }

      return {
        allocated: true,
        allocationId: `alloc-${crypto.randomBytes(6).toString("hex")}`,
        agentId,
        department: quota.department,
        tokensAllocated: tokens,
        remainingDepartmentTokens: quota.currentTokens,
        priority,
        burstActive: true,
        burstTokensUsed,
        waitedMs,
        timestamp: new Date().toISOString(),
        reason,
      };
    }

    return null;
  }

  private enqueueRequest(request: QueuedAllocationRequest): void {
    // Insert into sorted priority queue
    // Higher priority (lower weight e.g. P1=1 vs P5=5) first
    // Same priority ordered by requestedAt timestamp FIFO
    const reqWeight = TaskPriorityWeight[request.priority] ?? 3;

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const existingWeight = TaskPriorityWeight[this.queue[i].priority] ?? 3;
      if (reqWeight < existingWeight) {
        insertIndex = i;
        break;
      } else if (reqWeight === existingWeight && request.requestedAt < this.queue[i].requestedAt) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, request);
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const now = Date.now();
    const remainingQueue: QueuedAllocationRequest[] = [];

    for (const req of this.queue) {
      const quota = this.getOrCreateQuota(req.department.toLowerCase());
      this.refillDepartment(quota);

      const waitedMs = now - req.requestedAt;
      const result = this.tryDeductTokens(quota, req.agentId, req.tokens, req.priority, req.reason, waitedMs);

      if (result) {
        clearTimeout(req.timer);
        this.recordAgentUsage(req.agentId, quota.department, req.tokens);
        this.emit("token:allocated", result);
        req.resolve(result);
      } else {
        remainingQueue.push(req);
      }
    }

    this.queue.length = 0;
    this.queue.push(...remainingQueue);
  }

  private checkExpiredBursts(): void {
    const now = Date.now();
    for (const [burstId, burst] of this.activeBursts) {
      if (burst.active && Date.parse(burst.expiresAt) <= now) {
        burst.active = false;
        this.emit("burst:expired", burst);
      }
    }
  }

  private recordAgentUsage(agentId: string, department: string, tokens: number): void {
    const existing = this.agentUsage.get(agentId) || {
      agentId,
      department,
      totalConsumed: 0,
      allocationCount: 0,
    };

    existing.totalConsumed += tokens;
    existing.allocationCount += 1;
    existing.lastAllocatedAt = new Date().toISOString();
    this.agentUsage.set(agentId, existing);
  }
}
