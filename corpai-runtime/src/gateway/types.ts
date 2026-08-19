import { WebSocket } from "ws";
import { JsonRpcId } from "../protocol/types";

export interface ClientSession {
  id: string;
  socket: WebSocket;
  agentId?: string;
  role?: string;
  subscriptions: Set<string>;
  connectedAt: string;
  remoteAddress?: string;
}

export interface MethodContext {
  session: ClientSession;
  isNotification: boolean;
  correlationId: JsonRpcId;
}

export type RpcMethodHandler<TParams = any, TResult = any> = (
  params: TParams,
  context: MethodContext
) => Promise<TResult> | TResult;

export type MiddlewareFn = (
  method: string,
  params: unknown,
  context: MethodContext,
  next: () => Promise<unknown>
) => Promise<unknown>;

export interface MethodRegistration {
  name: string;
  handler: RpcMethodHandler;
  description?: string;
  paramSchema?: unknown;
}

export interface GatewayServerOptions {
  port?: number;
  host?: string;
  path?: string;
  heartbeatIntervalMs?: number;
  expiryTtlSeconds?: number;
  minApprovalScore?: number;
  defaultMaxRetries?: number;
  enablePortalCompat?: boolean;
}
