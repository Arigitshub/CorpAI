import { WebSocket } from "ws";
import { EventEmitter } from "events";
import * as crypto from "crypto";
import {
  JsonRpcId,
  JsonRpcNotification,
  JsonRpcRequest,
  JsonRpcResponse,
} from "../protocol/types";
import { JsonRpcException } from "../protocol/errors";
import { CriticValidator } from "../dispatch/CriticValidator";
import { CriticReview } from "../dispatch/types";

export interface GatewayClientOptions {
  url: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelayMs?: number;
  timeoutMs?: number;
}

export class GatewayClient extends EventEmitter {
  private readonly url: string;
  private readonly autoReconnect: boolean;
  private readonly maxReconnectAttempts: number;
  private readonly reconnectDelayMs: number;
  private readonly timeoutMs: number;

  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isExplicitlyClosed = false;

  private pendingRequests = new Map<
    string | number,
    {
      resolve: (value: any) => void;
      reject: (reason: any) => void;
      timer: NodeJS.Timeout;
    }
  >();

  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(options: GatewayClientOptions) {
    super();
    this.url = options.url;
    this.autoReconnect = options.autoReconnect ?? true;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.reconnectDelayMs = options.reconnectDelayMs ?? 1000;
    this.timeoutMs = options.timeoutMs ?? 10000;
  }

  /**
   * Connect to the JSON-RPC Gateway socket.
   */
  public async connect(): Promise<void> {
    this.isExplicitlyClosed = false;

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        const onOpen = () => {
          this.reconnectAttempts = 0;
          this.emit("connected");
          cleanup();
          resolve();
        };

        const onError = (err: Error) => {
          this.emit("error", err);
          cleanup();
          reject(err);
        };

        const cleanup = () => {
          this.socket?.removeListener("open", onOpen);
          this.socket?.removeListener("error", onError);
        };

        this.socket.once("open", onOpen);
        this.socket.once("error", onError);

        this.socket.on("message", (data) => this.handleIncomingMessage(data));
        this.socket.on("close", (code, reason) => this.handleSocketClose(code, reason));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Handle incoming socket messages (single or batch response, or notification).
   */
  private handleIncomingMessage(data: unknown): void {
    let parsed: any;
    try {
      const text = typeof data === "string" ? data : (data as Buffer).toString("utf8");
      parsed = JSON.parse(text);
    } catch {
      return;
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        this.processSingleMessage(item);
      }
    } else {
      this.processSingleMessage(parsed);
    }
  }

  private processSingleMessage(msg: any): void {
    if (!msg || typeof msg !== "object") return;

    // Notification or method push from server
    if (msg.method) {
      this.emit(msg.method, msg.params);
      this.emit("notification", msg.method, msg.params);
      if (msg.id === undefined || msg.id === null) {
        return;
      }
    }

    // Response to a pending request
    if (msg.id !== undefined && msg.id !== null) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.id);

        if (msg.error) {
          pending.reject(
            new JsonRpcException(msg.error.code, msg.error.message, msg.error.data)
          );
        } else {
          pending.resolve(msg.result);
        }
      }
    }
  }

  private handleSocketClose(code: number, reason: Buffer): void {
    this.emit("disconnected", code, reason?.toString("utf8"));

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Socket connection closed"));
      this.pendingRequests.delete(id);
    }

    if (this.isExplicitlyClosed || !this.autoReconnect) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts += 1;
      const delay = this.reconnectDelayMs * Math.min(this.reconnectAttempts, 5);
      this.emit("reconnecting", this.reconnectAttempts, delay);

      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(() => {
          // Reconnect attempt failed, next close event will trigger retry
        });
      }, delay);
    } else {
      this.emit("reconnect_failed");
    }
  }

  /**
   * Send a JSON-RPC 2.0 request and await response.
   */
  public async call<TResult = any>(method: string, params?: unknown): Promise<TResult> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not connected");
    }

    const id = `req-${crypto.randomBytes(6).toString("hex")}`;
    const request: JsonRpcRequest = {
      jsonrpc: "2.0",
      id,
      method,
      ...(params !== undefined ? { params } : {}),
    };

    return new Promise<TResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new JsonRpcException(-32011, `Request '${method}' timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this.socket?.send(JSON.stringify(request));
    });
  }

  /**
   * Send a JSON-RPC 2.0 Batch request and await array of responses.
   */
  public async batch(
    requests: Array<{ method: string; params?: unknown }>
  ): Promise<any[]> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not connected");
    }

    if (requests.length === 0) {
      return [];
    }

    const payload: JsonRpcRequest[] = [];
    const promises: Promise<any>[] = [];

    for (const req of requests) {
      const id = `req-${crypto.randomBytes(6).toString("hex")}`;
      payload.push({
        jsonrpc: "2.0",
        id,
        method: req.method,
        ...(req.params !== undefined ? { params: req.params } : {}),
      });

      const p = new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.pendingRequests.delete(id);
          reject(new JsonRpcException(-32011, `Batch item '${req.method}' timed out`));
        }, this.timeoutMs);

        this.pendingRequests.set(id, { resolve, reject, timer });
      });

      promises.push(p);
    }

    this.socket.send(JSON.stringify(payload));
    return Promise.all(promises);
  }

  /**
   * Send a JSON-RPC 2.0 notification (fire and forget).
   */
  public notify(method: string, params?: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not connected");
    }

    const notification: JsonRpcNotification = {
      jsonrpc: "2.0",
      method,
      ...(params !== undefined ? { params } : {}),
    };

    this.socket.send(JSON.stringify(notification));
  }

  /**
   * Helper to sign a critic review.
   */
  public static createSignedCriticReview(
    criticId: string,
    secretKey: string,
    reviewData: {
      taskId: string;
      workerId: string;
      status: "approved" | "rejected" | "changes_requested";
      score: number;
      feedback: string;
      payloadHash: string;
    }
  ): CriticReview {
    return CriticValidator.signReview(secretKey, {
      ...reviewData,
      criticId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start sending automatic heartbeats for an agent.
   */
  public startHeartbeat(agentId: string, intervalMs = 5000, extraParams: Record<string, unknown> = {}): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(async () => {
      try {
        if (this.isConnected) {
          await this.call("corpai.agent.heartbeat", {
            agentId,
            ...extraParams,
          });
        }
      } catch {
        // Ignore heartbeat errors on reconnection
      }
    }, intervalMs);

    if (this.heartbeatTimer.unref) {
      this.heartbeatTimer.unref();
    }
  }

  /**
   * Stop automatic heartbeat loop.
   */
  public stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Disconnect client from socket.
   */
  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public get isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
