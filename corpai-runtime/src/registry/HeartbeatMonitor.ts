import { EventEmitter } from "events";
import { AgentRegistry } from "./AgentRegistry";
import { AgentRecord, PingResult } from "./types";
import { JsonRpcException } from "../protocol/errors";

export interface HeartbeatMonitorOptions {
  checkIntervalMs?: number;
  expiryTtlSeconds?: number;
  autoStart?: boolean;
}

export class HeartbeatMonitor extends EventEmitter {
  private readonly registry: AgentRegistry;
  private readonly checkIntervalMs: number;
  private readonly expiryTtlSeconds: number;
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  private pendingPings = new Map<
    string,
    { timestamp: number; resolve: (res: PingResult) => void; reject: (err: Error) => void; timer: NodeJS.Timeout }
  >();

  constructor(registry: AgentRegistry, options: HeartbeatMonitorOptions = {}) {
    super();
    this.registry = registry;
    this.checkIntervalMs = options.checkIntervalMs ?? 2000;
    this.expiryTtlSeconds = options.expiryTtlSeconds ?? 15;

    if (options.autoStart) {
      this.start();
    }
  }

  /**
   * Start the periodic heartbeat reaper loop.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => this.reap(), this.checkIntervalMs);
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  /**
   * Stop the heartbeat monitor loop.
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;

    // Clear any pending pings
    for (const [key, pending] of this.pendingPings.entries()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Heartbeat monitor stopped"));
      this.pendingPings.delete(key);
    }
  }

  /**
   * Execute a single pass check on all registered agents.
   * Returns list of agents that expired in this pass.
   */
  public reap(): AgentRecord[] {
    const now = Date.now();
    const expiredAgents: AgentRecord[] = [];
    const allAgents = this.registry.list();

    for (const agent of allAgents) {
      const lastHb = Date.parse(agent.lastHeartbeatAt);
      const ageSec = Number.isNaN(lastHb) ? 9999 : Math.max(0, Math.round((now - lastHb) / 1000));
      agent.telemetry.heartbeatAgeSec = ageSec;

      if (
        ageSec >= this.expiryTtlSeconds &&
        agent.status !== "expired" &&
        agent.status !== "offline"
      ) {
        const expired = this.registry.markExpired(agent.agentId);
        expiredAgents.push(expired);
        this.emit("agent:expired", expired);
      }
    }

    return expiredAgents;
  }

  /**
   * Ping an agent and measure roundtrip response time.
   */
  public async pingAgent(agentId: string, timeoutMs = 3000): Promise<PingResult> {
    const agent = this.registry.get(agentId);
    if (!agent) {
      throw JsonRpcException.agentNotFound(agentId);
    }

    const startTime = Date.now();
    const pingKey = `${agentId}:${startTime}:${Math.random().toString(36).slice(2, 7)}`;

    return new Promise<PingResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingPings.delete(pingKey);
        reject(new Error(`Ping to agent '${agentId}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingPings.set(pingKey, {
        timestamp: startTime,
        resolve,
        reject,
        timer,
      });

      this.emit("ping:sent", {
        agentId,
        pingKey,
        socketId: agent.socketId,
      });

      // If simulated or immediate local test
      process.nextTick(() => {
        // Automatically respond if no external socket is bound
        if (!agent.socketId) {
          this.handlePong(pingKey, agentId);
        }
      });
    });
  }

  /**
   * Handle incoming Pong from an agent
   */
  public handlePong(pingKey: string, agentId: string): boolean {
    const pending = this.pendingPings.get(pingKey);
    if (!pending) {
      // Look up by agentId fallback
      for (const [key, p] of this.pendingPings.entries()) {
        if (key.startsWith(`${agentId}:`)) {
          clearTimeout(p.timer);
          const rttMs = Date.now() - p.timestamp;
          this.pendingPings.delete(key);
          p.resolve({
            agentId,
            pong: true,
            timestamp: new Date().toISOString(),
            rttMs,
          });
          return true;
        }
      }
      return false;
    }

    clearTimeout(pending.timer);
    const rttMs = Date.now() - pending.timestamp;
    this.pendingPings.delete(pingKey);

    pending.resolve({
      agentId,
      pong: true,
      timestamp: new Date().toISOString(),
      rttMs,
    });

    return true;
  }

  public get active(): boolean {
    return this.isRunning;
  }
}
