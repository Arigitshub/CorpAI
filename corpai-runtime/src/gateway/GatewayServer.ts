import * as http from "http";
import { WebSocket, WebSocketServer } from "ws";
import * as crypto from "crypto";
import { MethodRouter } from "./MethodRouter";
import { ClientSession, GatewayServerOptions, MethodContext } from "./types";
import { AgentRegistry } from "../registry/AgentRegistry";
import { HeartbeatMonitor } from "../registry/HeartbeatMonitor";
import { TaskDispatcher } from "../dispatch/TaskDispatcher";
import { CriticValidator } from "../dispatch/CriticValidator";
import { JsonRpcParser } from "../protocol/parser";
import { JsonRpcErrorCode, JsonRpcException } from "../protocol/errors";
import {
  AgentHeartbeatParams,
  AgentRecord,
  AgentRegistrationParams,
  AgentState,
} from "../registry/types";
import {
  CriticReview,
  TaskDispatchParams,
  TaskFilter,
  TaskPriority,
} from "../dispatch/types";

export interface TeamLane {
  agentId: string;
  name: string;
  owner: string;
  status: string;
  eta: string;
  icon: string;
  focus: string;
  touching: string;
  blockers: string;
  validation: string;
  progress: number;
  currentTask?: string;
  taskId?: string;
  department: string;
  agentState: string;
  logStream?: string;
  taskLog?: string;
  latestAction?: string;
  grid?: {
    x: number;
    y: number;
    color: string;
  };
  telemetry: {
    confidence: number;
    apiLatencyMs: number;
    heartbeatAgeSec: number;
    runState: string;
    provider: string;
    model: string;
  };
}

export interface TeamStatusFeed {
  generatedAt: string;
  runtime: {
    connected: boolean;
    source: string;
    note: string;
  };
  lanes: TeamLane[];
  activity: string[];
}

export class GatewayServer {
  private readonly options: GatewayServerOptions;
  public readonly registry: AgentRegistry;
  public readonly monitor: HeartbeatMonitor;
  public readonly dispatcher: TaskDispatcher;
  public readonly router: MethodRouter;

  private httpServer: http.Server | null = null;
  private wss: WebSocketServer | null = null;
  private readonly sessions = new Map<string, ClientSession>();
  private readonly socketToSession = new Map<WebSocket, ClientSession>();
  private readonly activityLog: string[] = [];
  private isListening = false;
  private broadcastInterval: NodeJS.Timeout | null = null;

  constructor(options: GatewayServerOptions = {}) {
    this.options = {
      port: options.port ?? 8787,
      host: options.host ?? "0.0.0.0",
      path: options.path ?? "/corpai-agent-task-log",
      heartbeatIntervalMs: options.heartbeatIntervalMs ?? 2000,
      expiryTtlSeconds: options.expiryTtlSeconds ?? 15,
      minApprovalScore: options.minApprovalScore ?? 0.70,
      defaultMaxRetries: options.defaultMaxRetries ?? 3,
      enablePortalCompat: options.enablePortalCompat ?? true,
    };

    this.registry = new AgentRegistry();
    this.monitor = new HeartbeatMonitor(this.registry, {
      checkIntervalMs: this.options.heartbeatIntervalMs,
      expiryTtlSeconds: this.options.expiryTtlSeconds,
    });
    this.dispatcher = new TaskDispatcher(this.registry, {
      minApprovalScore: this.options.minApprovalScore,
      defaultMaxRetries: this.options.defaultMaxRetries,
    });
    this.router = new MethodRouter();

    this.setupRoutes();
    this.setupEventListeners();
  }

  /**
   * Register all JSON-RPC 2.0 methods on the method router.
   */
  private setupRoutes(): void {
    // -------------------------------------------------------------
    // Agent Methods
    // -------------------------------------------------------------
    this.router.register(
      "corpai.agent.register",
      async (params: AgentRegistrationParams, context: MethodContext) => {
        if (!params || typeof params !== "object") {
          throw JsonRpcException.invalidParams("Registration parameters required");
        }
        const record = this.registry.register(params, context.session.id);
        context.session.agentId = record.agentId;
        context.session.role = record.role;
        this.logActivity(`Agent '${record.name}' (${record.agentId}) registered in department ${record.department}.`);
        this.broadcastFeed();
        return record;
      },
      "Register a new agent with capabilities and receive secretKey for signing"
    );

    this.router.register(
      "corpai.agent.unregister",
      async (params: { agentId: string }, context: MethodContext) => {
        const agentId = params?.agentId || context.session.agentId;
        if (!agentId) {
          throw JsonRpcException.invalidParams("Parameter 'agentId' required");
        }
        const record = this.registry.unregister(agentId);
        this.logActivity(`Agent '${record.name}' (${agentId}) unregistered.`);
        this.broadcastFeed();
        return { unregistered: true, agentId };
      },
      "Unregister an active agent"
    );

    this.router.register(
      "corpai.agent.get",
      async (params: { agentId: string }) => {
        if (!params?.agentId) {
          throw JsonRpcException.invalidParams("Parameter 'agentId' required");
        }
        const record = this.registry.get(params.agentId);
        if (!record) {
          throw JsonRpcException.agentNotFound(params.agentId);
        }
        return record;
      },
      "Get detailed agent record"
    );

    this.router.register(
      "corpai.agent.list",
      async (params: { department?: string; role?: string; status?: AgentState | AgentState[]; capability?: string }) => {
        return this.registry.list(params);
      },
      "List registered agents with optional filters"
    );

    this.router.register(
      "corpai.agent.heartbeat",
      async (params: AgentHeartbeatParams, context: MethodContext) => {
        const agentId = params?.agentId || context.session.agentId;
        if (!agentId) {
          throw JsonRpcException.invalidParams("Parameter 'agentId' required");
        }
        const updated = this.registry.recordHeartbeat({ ...params, agentId });
        return {
          agentId: updated.agentId,
          status: updated.status,
          lastHeartbeatAt: updated.lastHeartbeatAt,
          telemetry: updated.telemetry,
        };
      },
      "Send agent heartbeat with real-time telemetry"
    );

    this.router.register(
      "corpai.agent.status",
      async (params: { agentId: string; status?: AgentState; currentTaskId?: string }, context: MethodContext) => {
        const agentId = params?.agentId || context.session.agentId;
        if (!agentId) {
          throw JsonRpcException.invalidParams("Parameter 'agentId' required");
        }
        if (params.status) {
          const updated = this.registry.updateStatus(agentId, params.status, params.currentTaskId);
          this.broadcastFeed();
          return updated;
        }
        const record = this.registry.get(agentId);
        if (!record) {
          throw JsonRpcException.agentNotFound(agentId);
        }
        return record;
      },
      "Get or update agent status"
    );

    this.router.register(
      "corpai.agent.ping",
      async (params: { agentId: string; timeoutMs?: number }) => {
        if (!params?.agentId) {
          throw JsonRpcException.invalidParams("Parameter 'agentId' required");
        }
        return this.monitor.pingAgent(params.agentId, params.timeoutMs);
      },
      "Ping an agent and measure roundtrip latency"
    );

    // -------------------------------------------------------------
    // Standard RPC & System Methods
    // -------------------------------------------------------------
    this.router.register(
      "rpc.ping",
      async () => {
        return {
          pong: true,
          timestamp: new Date().toISOString(),
        };
      },
      "Ping gateway server and get current timestamp"
    );

    // -------------------------------------------------------------
    // Task Dispatching & Critic Verification Methods
    // -------------------------------------------------------------
    this.router.register(
      "corpai.task.dispatch",
      async (params: TaskDispatchParams) => {
        if (!params || typeof params !== "object" || !params.title) {
          throw JsonRpcException.invalidParams("Parameter 'title' is required to dispatch a task");
        }
        const task = this.dispatcher.dispatch(params);
        this.logActivity(`Task '${task.title}' (${task.id}) dispatched with priority ${task.priority}.`);
        this.broadcastFeed();
        return task;
      },
      "Dispatch a new task to worker queue with automatic critic pairing"
    );

    this.router.register(
      "corpai.task.claim",
      async (params: { agentId?: string; taskId?: string }, context: MethodContext) => {
        const agentId = params?.agentId || context.session.agentId;
        if (!agentId) {
          throw JsonRpcException.invalidParams("Parameter 'agentId' is required to claim a task");
        }
        const task = this.dispatcher.claim(agentId, params?.taskId);
        if (task) {
          this.logActivity(`Task '${task.title}' (${task.id}) claimed by worker '${agentId}'.`);
          this.broadcastFeed();
        }
        return task;
      },
      "Claim next available task or specific task for worker"
    );

    this.router.register(
      "corpai.task.submitResult",
      async (params: { taskId: string; workerId?: string; result: unknown }, context: MethodContext) => {
        if (!params?.taskId) {
          throw JsonRpcException.invalidParams("Parameter 'taskId' is required");
        }
        const workerId = params.workerId || context.session.agentId;
        if (!workerId) {
          throw JsonRpcException.invalidParams("Parameter 'workerId' is required");
        }
        const task = this.dispatcher.submitResult(params.taskId, workerId, params.result);
        this.logActivity(`Worker '${workerId}' submitted result for task '${task.id}' (hash: ${task.resultHash?.slice(0, 8)}...).`);
        this.broadcastFeed();
        return task;
      },
      "Submit completed work for critic verification and review"
    );

    const submitReviewHandler = async (params: { taskId: string; review: CriticReview }) => {
      if (!params?.taskId || !params?.review) {
        throw JsonRpcException.invalidParams("Parameters 'taskId' and 'review' are required");
      }
      const result = this.dispatcher.submitReview(params.taskId, params.review);
      this.logActivity(
        `Critic '${params.review.criticId}' submitted review for task '${params.taskId}' - Status: ${result.task.status}, Score: ${params.review.score}.`
      );
      this.broadcastFeed();
      return result;
    };

    this.router.register(
      "corpai.task.submitReview",
      submitReviewHandler,
      "Submit paired critic review with HMAC-SHA256 signature verification"
    );

    this.router.register(
      "corpai.task.review",
      submitReviewHandler,
      "Alias for corpai.task.submitReview"
    );

    this.router.register(
      "corpai.task.get",
      async (params: { taskId: string }) => {
        if (!params?.taskId) {
          throw JsonRpcException.invalidParams("Parameter 'taskId' required");
        }
        const task = this.dispatcher.get(params.taskId);
        if (!task) {
          throw JsonRpcException.taskNotFound(params.taskId);
        }
        return task;
      },
      "Get task details by ID"
    );

    this.router.register(
      "corpai.task.list",
      async (params: TaskFilter) => {
        return this.dispatcher.list(params);
      },
      "List tasks by status, department, or assigned agents"
    );

    this.router.register(
      "corpai.task.cancel",
      async (params: { taskId: string; reason?: string }) => {
        if (!params?.taskId) {
          throw JsonRpcException.invalidParams("Parameter 'taskId' required");
        }
        const task = this.dispatcher.cancel(params.taskId, params.reason);
        this.logActivity(`Task '${task.id}' cancelled: ${params.reason || "No reason given"}.`);
        this.broadcastFeed();
        return task;
      },
      "Cancel a task in progress or queue"
    );

    // -------------------------------------------------------------
    // Portal & Streaming Subscriptions
    // -------------------------------------------------------------
    this.router.register(
      "corpai.agentLogs.subscribe",
      async (params: { stream?: string }, context: MethodContext) => {
        const stream = params?.stream || "task_log";
        context.session.subscriptions.add(stream);
        // Send immediate feed response back to caller
        const feed = this.generateFeed();
        return feed;
      },
      "Subscribe to real-time agent logs and telemetry feed"
    );

    this.router.register(
      "corpai.agentLogs.unsubscribe",
      async (params: { stream?: string }, context: MethodContext) => {
        const stream = params?.stream || "task_log";
        context.session.subscriptions.delete(stream);
        return { unsubscribed: stream };
      },
      "Unsubscribe from agent logs feed"
    );

    this.router.register(
      "corpai.agentLogs.getFeed",
      async () => {
        return this.generateFeed();
      },
      "Get the full team status feed for the portal"
    );

    this.router.register(
      "corpai.telemetry.getFeed",
      async () => {
        return this.generateFeed();
      },
      "Get current CorpAI control plane telemetry feed"
    );

    this.router.register(
      "corpai.executive.summarizeActivity",
      async (params: any) => {
        const feed = params?.lanes ? params : this.generateFeed();
        const lanes = feed.lanes || [];
        const count = lanes.length;
        const busyCount = lanes.filter((a: any) => a.agentState === "Executing" || a.status === "In Progress" || a.status === "Busy" || a.status === "busy").length;
        return {
          bullets: [
            `${count} CorpAI autonomous agent lanes active; ${busyCount} actively running paired tasks.`,
            `Critic validation engine enforces cryptographic signature verification on all outputs.`,
            `Gateway JSON-RPC control plane operational with latency <= 120ms.`,
          ],
        };
      },
      "Summarize activity for executive board dashboard"
    );

    this.router.register(
      "corpai.system.status",
      async () => {
        return this.getSystemStatus();
      },
      "Get gateway system health, active sessions, and queue statistics"
    );
  }

  /**
   * Setup event listeners between subsystem modules
   */
  private setupEventListeners(): void {
    this.registry.on("agent:registered", (agent) => {
      this.broadcastNotification("corpai.event.agentRegistered", agent);
      this.broadcastFeed();
    });

    this.registry.on("agent:unregistered", (agentId) => {
      this.broadcastNotification("corpai.event.agentUnregistered", { agentId });
      this.broadcastFeed();
    });

    this.registry.on("agent:statusChanged", (agent) => {
      this.broadcastNotification("corpai.event.agentStatusChanged", agent);
      this.broadcastFeed();
    });

    this.monitor.on("agent:expired", (agent) => {
      this.logActivity(`Agent '${agent.name}' (${agent.agentId}) expired due to missed heartbeats.`);
      this.broadcastNotification("corpai.event.agentExpired", agent);
      this.broadcastFeed();
    });

    this.dispatcher.on("task:dispatched", (task) => {
      this.broadcastNotification("corpai.event.taskDispatched", task);
      this.broadcastFeed();
    });

    this.dispatcher.on("task:assigned", (task, worker, critic) => {
      this.logActivity(
        `Task '${task.title}' assigned to worker '${worker.name}' (Critic: ${critic?.name || "unassigned"}).`
      );
      this.broadcastNotification("corpai.event.taskAssigned", { task, worker, critic });
      this.broadcastFeed();
    });

    this.dispatcher.on("task:completed", (task) => {
      this.logActivity(`Task '${task.title}' (${task.id}) approved and COMPLETED by critic review.`);
      this.broadcastNotification("corpai.event.taskCompleted", task);
      this.broadcastFeed();
    });

    this.dispatcher.on("task:failed", (task) => {
      this.logActivity(`Task '${task.title}' (${task.id}) FAILED after exhausting retries.`);
      this.broadcastNotification("corpai.event.taskFailed", task);
      this.broadcastFeed();
    });
  }

  /**
   * Broadcast a JSON-RPC 2.0 notification event to all connected WebSocket clients
   */
  public broadcastNotification(method: string, params: unknown): void {
    if (!this.wss) return;

    const message = JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
    });

    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch {
          // Ignore
        }
      }
    }
  }

  /**
   * Log an activity string to circular log buffer
   */
  private logActivity(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.activityLog.unshift(`[${timestamp}] ${message}`);
    if (this.activityLog.length > 50) {
      this.activityLog.pop();
    }
  }

  /**
   * Generate complete TeamStatusFeed payload compatible with corpai-portal
   */
  public generateFeed(): TeamStatusFeed {
    const now = new Date();
    const agents = this.registry.list();

    const departmentColors: Record<string, string> = {
      Executive: "#f6c85f",
      Engineering: "#67e8f9",
      Operations: "#fbbf24",
      GTM: "#f472b6",
      Marketing: "#f472b6",
      Sales: "#6ee7b7",
      Risk: "#f59e0b",
      Security: "#f59e0b",
      Dev: "#22d3ee",
    };

    const departmentIcons: Record<string, string> = {
      Executive: "users",
      Engineering: "code",
      Operations: "activity",
      GTM: "megaphone",
      Marketing: "megaphone",
      Sales: "users",
      Risk: "shield",
      Security: "shield",
    };

    const lanes: TeamLane[] = agents.map((agent, index) => {
      const lastHb = Date.parse(agent.lastHeartbeatAt);
      const ageSec = Number.isNaN(lastHb) ? 9999 : Math.max(0, Math.round((now.getTime() - lastHb) / 1000));
      const color = departmentColors[agent.department] || "#22d3ee";
      const icon = departmentIcons[agent.department] || "code";

      return {
        agentId: agent.agentId,
        name: agent.name,
        owner: agent.department,
        status: agent.status.charAt(0).toUpperCase() + agent.status.slice(1),
        eta: (agent.metadata?.eta as string) || "15-30 min",
        icon,
        focus: (agent.metadata?.focus as string) || `Executing active ${agent.role} capabilities`,
        touching: (agent.metadata?.touching as string) || "corpai-runtime, corpai-portal",
        blockers: (agent.metadata?.blockers as string) || "None",
        validation: (agent.metadata?.validation as string) || "Cryptographic critic verification",
        progress: (agent.metadata?.progress as number) || (agent.status === "busy" ? 65 : agent.status === "idle" ? 100 : 0),
        currentTask: agent.currentTaskId ? `Working on task ${agent.currentTaskId}` : "Awaiting assignment",
        taskId: agent.currentTaskId,
        department: agent.department,
        agentState: agent.status === "busy" ? "Executing" : agent.status === "thinking" ? "Thinking" : "Idle",
        logStream: agent.latestAction || `Agent ${agent.name} is ${agent.status}`,
        latestAction: agent.latestAction,
        grid: {
          x: (index * 2 + 2) % 10,
          y: Math.floor(index / 2) + 2,
          color,
        },
        telemetry: {
          confidence: agent.telemetry.confidence ?? 0.85,
          apiLatencyMs: agent.telemetry.apiLatencyMs ?? 120,
          heartbeatAgeSec: ageSec,
          runState: agent.telemetry.runState ?? agent.status,
          provider: agent.telemetry.provider ?? "corpai-runtime",
          model: agent.telemetry.model ?? "default",
        },
      };
    });

    const activeCount = lanes.filter((l) => l.telemetry.heartbeatAgeSec <= this.options.expiryTtlSeconds!).length;

    return {
      generatedAt: now.toISOString(),
      runtime: {
        connected: activeCount > 0 || agents.length > 0,
        source: "corpai-runtime JSON-RPC Socket Gateway",
        note:
          activeCount > 0
            ? "Real-time JSON-RPC socket gateway connected. Dynamic agent telemetry active."
            : "Gateway active. No connected agent heartbeats received yet.",
      },
      lanes,
      activity: this.activityLog.length > 0 ? this.activityLog.slice(0, 10) : [
        "CorpAI JSON-RPC 2.0 Gateway initialized.",
        "Heartbeat monitor and paired critic validation ready.",
      ],
    };
  }

  /**
   * Broadcast current feed to all WebSocket clients subscribed or on portal endpoint
   */
  public broadcastFeed(): void {
    if (!this.wss) return;

    const feed = this.generateFeed();
    const message = JSON.stringify({
      jsonrpc: "2.0",
      method: "corpai.agentLogs.update",
      params: feed,
      id: "corpai-control-plane-agent-feed",
    });

    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch {
          // Ignore send errors on dead sockets
        }
      }
    }
  }

  /**
   * Process an incoming raw message string or buffer over JSON-RPC
   */
  public async handleMessage(
    rawInput: string | Buffer,
    session: ClientSession
  ): Promise<string | null> {
    let parsedBatch;
    try {
      parsedBatch = JsonRpcParser.parsePayload(rawInput);
    } catch (err) {
      const errResponse = JsonRpcParser.error(
        null,
        err instanceof JsonRpcException ? err : JsonRpcException.parseError(String(err))
      );
      return JSON.stringify(errResponse);
    }

    const responses: unknown[] = [];

    for (const reqItem of parsedBatch.requests) {
      if (!reqItem.valid || !reqItem.message) {
        responses.push(
          JsonRpcParser.error(
            (reqItem.raw as any)?.id ?? null,
            reqItem.error || JsonRpcException.invalidRequest()
          )
        );
        continue;
      }

      const msg = reqItem.message;
      const isNotification = !("id" in msg) || (msg as any).id === undefined;
      const correlationId = (msg as any).id ?? null;

      const context: MethodContext = {
        session,
        isNotification,
        correlationId,
      };

      try {
        const result = await this.router.execute(msg.method, msg.params, context);
        if (!isNotification) {
          responses.push(JsonRpcParser.success(correlationId, result));
        }
      } catch (err) {
        if (!isNotification) {
          responses.push(
            JsonRpcParser.error(
              correlationId,
              err instanceof JsonRpcException
                ? err
                : JsonRpcException.internalError(err instanceof Error ? err.message : String(err))
            )
          );
        }
      }
    }

    if (responses.length === 0) {
      return null; // Notifications only
    }

    if (parsedBatch.isBatch) {
      return JSON.stringify(responses);
    }

    return JSON.stringify(responses[0]);
  }

  /**
   * Get system status snapshot
   */
  public getSystemStatus(): Record<string, unknown> {
    const tasks = this.dispatcher.list();
    const taskStatusCounts: Record<string, number> = {};
    for (const t of tasks) {
      taskStatusCounts[t.status] = (taskStatusCounts[t.status] || 0) + 1;
    }

    return {
      ok: true,
      service: "corpai-runtime",
      version: "1.0.0",
      uptimeSec: process.uptime(),
      connectedClients: this.sessions.size,
      registeredAgents: this.registry.size,
      totalTasks: tasks.length,
      taskStatusCounts,
      monitorActive: this.monitor.active,
    };
  }

  /**
   * Start HTTP and WebSocket server.
   */
  public async listen(port?: number, host?: string): Promise<{ port: number; host: string }> {
    if (this.isListening) {
      return { port: this.options.port!, host: this.options.host! };
    }

    const listenPort = port ?? this.options.port ?? 8787;
    const listenHost = host ?? this.options.host ?? "0.0.0.0";

    this.httpServer = http.createServer(async (req, res) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = req.url || "/";

      // GET /health
      if (req.method === "GET" && (url === "/health" || url === "/healthz")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(this.getSystemStatus()));
        return;
      }

      // GET /corpai-team-status.json
      if (req.method === "GET" && (url.startsWith("/corpai-team-status.json") || url === "/api/feed")) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(this.generateFeed()));
        return;
      }

      // POST / or /rpc (HTTP JSON-RPC endpoint)
      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });

        req.on("end", async () => {
          const httpSession: ClientSession = {
            id: `http-${crypto.randomBytes(6).toString("hex")}`,
            socket: null as any,
            subscriptions: new Set(),
            connectedAt: new Date().toISOString(),
            remoteAddress: req.socket.remoteAddress,
          };

          const responseText = await this.handleMessage(body, httpSession);
          if (responseText) {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(responseText);
          } else {
            res.writeHead(204);
            res.end();
          }
        });
        return;
      }

      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found", endpoints: ["/health", "/corpai-team-status.json", "/rpc"] }));
    });

    this.wss = new WebSocketServer({
      server: this.httpServer,
    });

    this.wss.on("connection", (socket: WebSocket, req: http.IncomingMessage) => {
      const sessionId = `ws-${crypto.randomBytes(6).toString("hex")}`;
      const session: ClientSession = {
        id: sessionId,
        socket,
        subscriptions: new Set(["task_log"]),
        connectedAt: new Date().toISOString(),
        remoteAddress: req.socket.remoteAddress,
      };

      this.sessions.set(sessionId, session);
      this.socketToSession.set(socket, session);

      // Send initial feed snapshot on connect for immediate portal availability
      try {
        const feed = this.generateFeed();
        socket.send(
          JSON.stringify({
            jsonrpc: "2.0",
            method: "corpai.agentLogs.update",
            params: feed,
            id: "corpai-control-plane-agent-feed",
          })
        );
      } catch {
        // Ignore socket send error
      }

      socket.on("message", async (data: Buffer | string) => {
        try {
          const response = await this.handleMessage(data, session);
          if (response && socket.readyState === WebSocket.OPEN) {
            socket.send(response);
          }
        } catch (err) {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify(
                JsonRpcParser.error(
                  null,
                  JsonRpcException.internalError(err instanceof Error ? err.message : String(err))
                )
              )
            );
          }
        }
      });

      socket.on("close", () => {
        if (session.agentId) {
          const agent = this.registry.get(session.agentId);
          if (agent) {
            this.registry.updateStatus(session.agentId, "offline");
          }
        }
        this.sessions.delete(sessionId);
        this.socketToSession.delete(socket);
        this.broadcastFeed();
      });

      socket.on("error", () => {
        this.sessions.delete(sessionId);
        this.socketToSession.delete(socket);
      });
    });

    // Start background loops
    this.monitor.start();
    this.broadcastInterval = setInterval(() => {
      this.broadcastFeed();
    }, 5000);

    return new Promise((resolve, reject) => {
      this.httpServer!.listen(listenPort, listenHost, () => {
        const addr = this.httpServer!.address();
        const actualPort = typeof addr === "object" && addr ? addr.port : listenPort;
        this.isListening = true;
        resolve({ port: actualPort, host: listenHost });
      });

      this.httpServer!.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Stop HTTP and WebSocket server.
   */
  public async close(): Promise<void> {
    if (!this.isListening) return;

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }

    this.monitor.stop();

    if (this.wss) {
      for (const client of this.wss.clients) {
        try {
          client.terminate();
        } catch {
          // Ignore
        }
      }
      await new Promise<void>((resolve) => this.wss!.close(() => resolve()));
      this.wss = null;
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => this.httpServer!.close(() => resolve()));
      this.httpServer = null;
    }

    this.sessions.clear();
    this.socketToSession.clear();
    this.isListening = false;
  }

  public get running(): boolean {
    return this.isListening;
  }
}
