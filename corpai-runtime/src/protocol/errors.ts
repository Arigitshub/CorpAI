import { JsonRpcErrorCode, JsonRpcErrorMessage, JsonRpcErrorCodeType, JsonRpcErrorObject } from "./types";

export { JsonRpcErrorCode, JsonRpcErrorMessage, JsonRpcErrorCodeType, JsonRpcErrorObject };

export class JsonRpcException extends Error {
  public readonly code: number;
  public readonly data?: unknown;

  constructor(code: number, message?: string, data?: unknown) {
    const defaultMsg = JsonRpcErrorMessage[code] ?? "Unknown JSON-RPC error";
    super(message || defaultMsg);
    this.name = "JsonRpcException";
    this.code = code;
    this.data = data;
    Object.setPrototypeOf(this, JsonRpcException.prototype);
  }

  public toErrorObject(): JsonRpcErrorObject {
    return {
      code: this.code,
      message: this.message,
      ...(this.data !== undefined ? { data: this.data } : {}),
    };
  }

  public static parseError(data?: unknown): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.PARSE_ERROR, "Parse error", data);
  }

  public static invalidRequest(message?: string, data?: unknown): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.INVALID_REQUEST, message ?? "Invalid Request", data);
  }

  public static methodNotFound(method?: string): JsonRpcException {
    const msg = method ? `Method '${method}' not found` : "Method not found";
    return new JsonRpcException(JsonRpcErrorCode.METHOD_NOT_FOUND, msg);
  }

  public static invalidParams(message?: string, data?: unknown): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.INVALID_PARAMS, message ?? "Invalid params", data);
  }

  public static internalError(message?: string, data?: unknown): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.INTERNAL_ERROR, message ?? "Internal error", data);
  }

  public static agentNotFound(agentId: string): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.AGENT_NOT_FOUND, `Agent '${agentId}' not found`);
  }

  public static heartbeatExpired(agentId: string): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.HEARTBEAT_EXPIRED, `Heartbeat expired for agent '${agentId}'`);
  }

  public static taskNotFound(taskId: string): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.TASK_NOT_FOUND, `Task '${taskId}' not found`);
  }

  public static unauthorized(message?: string, data?: unknown): JsonRpcException {
    return new JsonRpcException(JsonRpcErrorCode.UNAUTHORIZED, message ?? "Unauthorized request", data);
  }

  public static criticSignatureInvalid(details?: string): JsonRpcException {
    return new JsonRpcException(
      JsonRpcErrorCode.CRITIC_SIGNATURE_INVALID,
      details ? `Critic signature invalid: ${details}` : "Critic signature verification failed"
    );
  }

  public static criticValidationFailed(details?: string): JsonRpcException {
    return new JsonRpcException(
      JsonRpcErrorCode.CRITIC_VALIDATION_FAILED,
      details ? `Critic validation failed: ${details}` : "Task rejected by critic review"
    );
  }
}
