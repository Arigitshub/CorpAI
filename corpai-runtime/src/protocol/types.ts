/**
 * JSON-RPC 2.0 Protocol Types and Specification Constants
 */

export type JsonRpcId = string | number | null;

export interface JsonRpcRequest<T = unknown> {
  jsonrpc: "2.0";
  method: string;
  params?: T;
  id: string | number;
}

export interface JsonRpcNotification<T = unknown> {
  jsonrpc: "2.0";
  method: string;
  params?: T;
}

export interface JsonRpcSuccessResponse<T = unknown> {
  jsonrpc: "2.0";
  result: T;
  id: JsonRpcId;
}

export interface JsonRpcErrorObject<T = unknown> {
  code: number;
  message: string;
  data?: T;
}

export interface JsonRpcErrorResponse<T = unknown> {
  jsonrpc: "2.0";
  error: JsonRpcErrorObject<T>;
  id: JsonRpcId;
}

export type JsonRpcResponse<T = unknown> = JsonRpcSuccessResponse<T> | JsonRpcErrorResponse<T>;

export type JsonRpcMessage =
  | JsonRpcRequest
  | JsonRpcNotification
  | JsonRpcResponse;

// Standard JSON-RPC 2.0 Error Codes
export const JsonRpcErrorCode = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  
  // CorpAI Application Error Codes (-32000 to -32099)
  SERVER_ERROR: -32000,
  AGENT_NOT_FOUND: -32001,
  AGENT_ALREADY_REGISTERED: -32002,
  HEARTBEAT_EXPIRED: -32003,
  TASK_NOT_FOUND: -32004,
  TASK_ALREADY_CLAIMED: -32005,
  CRITIC_VALIDATION_FAILED: -32006,
  CRITIC_SIGNATURE_INVALID: -32007,
  UNAUTHORIZED: -32008,
  INVALID_TASK_STATE: -32009,
  QUEUE_FULL: -32010,
  TIMEOUT: -32011,
} as const;

export type JsonRpcErrorCodeType = typeof JsonRpcErrorCode[keyof typeof JsonRpcErrorCode];

export const JsonRpcErrorMessage: Record<number, string> = {
  [JsonRpcErrorCode.PARSE_ERROR]: "Parse error",
  [JsonRpcErrorCode.INVALID_REQUEST]: "Invalid Request",
  [JsonRpcErrorCode.METHOD_NOT_FOUND]: "Method not found",
  [JsonRpcErrorCode.INVALID_PARAMS]: "Invalid params",
  [JsonRpcErrorCode.INTERNAL_ERROR]: "Internal error",
  [JsonRpcErrorCode.SERVER_ERROR]: "Server error",
  [JsonRpcErrorCode.AGENT_NOT_FOUND]: "Agent not found",
  [JsonRpcErrorCode.AGENT_ALREADY_REGISTERED]: "Agent already registered",
  [JsonRpcErrorCode.HEARTBEAT_EXPIRED]: "Agent heartbeat expired",
  [JsonRpcErrorCode.TASK_NOT_FOUND]: "Task not found",
  [JsonRpcErrorCode.TASK_ALREADY_CLAIMED]: "Task is already claimed",
  [JsonRpcErrorCode.CRITIC_VALIDATION_FAILED]: "Critic validation failed",
  [JsonRpcErrorCode.CRITIC_SIGNATURE_INVALID]: "Critic cryptographic signature invalid",
  [JsonRpcErrorCode.UNAUTHORIZED]: "Unauthorized request",
  [JsonRpcErrorCode.INVALID_TASK_STATE]: "Invalid task state transition",
  [JsonRpcErrorCode.QUEUE_FULL]: "Task queue is full",
  [JsonRpcErrorCode.TIMEOUT]: "Operation timed out",
};
