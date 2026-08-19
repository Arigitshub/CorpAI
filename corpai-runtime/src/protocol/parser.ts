import {
  JsonRpcErrorCode,
  JsonRpcErrorResponse,
  JsonRpcId,
  JsonRpcMessage,
  JsonRpcNotification,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccessResponse,
} from "./types";
import { JsonRpcException } from "./errors";

export interface ParsedBatch {
  isBatch: boolean;
  requests: Array<{
    raw: unknown;
    valid: boolean;
    error?: JsonRpcException;
    message?: JsonRpcRequest | JsonRpcNotification;
  }>;
}

export class JsonRpcParser {
  /**
   * Parse a raw input string or buffer into JSON, handling JSON-RPC parsing rules.
   */
  public static parseRaw(input: string | Buffer): unknown {
    const text = typeof input === "string" ? input : input.toString("utf8");
    try {
      return JSON.parse(text);
    } catch (err) {
      throw JsonRpcException.parseError(err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * Determine if an object is a valid JSON-RPC 2.0 Request
   */
  public static isRequest(obj: unknown): obj is JsonRpcRequest {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    const r = obj as Record<string, unknown>;
    return (
      r.jsonrpc === "2.0" &&
      typeof r.method === "string" &&
      (typeof r.id === "string" || typeof r.id === "number")
    );
  }

  /**
   * Determine if an object is a valid JSON-RPC 2.0 Notification
   */
  public static isNotification(obj: unknown): obj is JsonRpcNotification {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    const r = obj as Record<string, unknown>;
    return (
      r.jsonrpc === "2.0" &&
      typeof r.method === "string" &&
      r.id === undefined
    );
  }

  /**
   * Determine if an object is a valid JSON-RPC 2.0 Response (Success or Error)
   */
  public static isResponse(obj: unknown): obj is JsonRpcResponse {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    const r = obj as Record<string, unknown>;
    if (r.jsonrpc !== "2.0") return false;
    const hasValidId = r.id === null || typeof r.id === "string" || typeof r.id === "number";
    if (!hasValidId) return false;
    return "result" in r || "error" in r;
  }

  /**
   * Validate a single JSON-RPC payload item.
   */
  public static validateItem(raw: unknown): {
    valid: boolean;
    error?: JsonRpcException;
    message?: JsonRpcRequest | JsonRpcNotification;
  } {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {
        valid: false,
        error: JsonRpcException.invalidRequest("Payload must be a JSON object"),
      };
    }

    const rec = raw as Record<string, unknown>;
    if (rec.jsonrpc !== "2.0") {
      return {
        valid: false,
        error: JsonRpcException.invalidRequest("Missing or invalid 'jsonrpc' field (must be '2.0')"),
      };
    }

    if (typeof rec.method !== "string" || rec.method.trim() === "") {
      return {
        valid: false,
        error: JsonRpcException.invalidRequest("Field 'method' must be a non-empty string"),
      };
    }

    if (rec.params !== undefined && (typeof rec.params !== "object" || rec.params === null)) {
      return {
        valid: false,
        error: JsonRpcException.invalidParams("Field 'params' must be an object or array if provided"),
      };
    }

    if ("id" in rec) {
      if (rec.id !== null && typeof rec.id !== "string" && typeof rec.id !== "number") {
        return {
          valid: false,
          error: JsonRpcException.invalidRequest("Field 'id' must be a string, number, or null"),
        };
      }
      return {
        valid: true,
        message: {
          jsonrpc: "2.0",
          method: rec.method,
          params: rec.params,
          id: rec.id as string | number,
        },
      };
    }

    return {
      valid: true,
      message: {
        jsonrpc: "2.0",
        method: rec.method,
        params: rec.params,
      },
    };
  }

  /**
   * Parse and validate an incoming JSON-RPC payload which may be single or batch.
   */
  public static parsePayload(input: string | Buffer | unknown): ParsedBatch {
    const raw = typeof input === "string" || Buffer.isBuffer(input)
      ? this.parseRaw(input)
      : input;

    if (Array.isArray(raw)) {
      if (raw.length === 0) {
        throw JsonRpcException.invalidRequest("Batch request array cannot be empty");
      }
      const requests = raw.map((item) => ({
        raw: item,
        ...this.validateItem(item),
      }));
      return { isBatch: true, requests };
    }

    const validated = this.validateItem(raw);
    return {
      isBatch: false,
      requests: [{ raw, ...validated }],
    };
  }

  /**
   * Helper to format a Success Response
   */
  public static success<T = unknown>(id: JsonRpcId, result: T): JsonRpcSuccessResponse<T> {
    return {
      jsonrpc: "2.0",
      result,
      id,
    };
  }

  /**
   * Helper to format an Error Response
   */
  public static error<T = unknown>(
    id: JsonRpcId,
    codeOrException: number | JsonRpcException | Error,
    message?: string,
    data?: T
  ): JsonRpcErrorResponse<T> {
    if (codeOrException instanceof JsonRpcException) {
      return {
        jsonrpc: "2.0",
        error: codeOrException.toErrorObject() as { code: number; message: string; data?: T },
        id,
      };
    }

    if (codeOrException instanceof Error) {
      return {
        jsonrpc: "2.0",
        error: {
          code: JsonRpcErrorCode.INTERNAL_ERROR,
          message: codeOrException.message,
          ...(data !== undefined ? { data } : {}),
        },
        id,
      };
    }

    const code = codeOrException;
    return {
      jsonrpc: "2.0",
      error: {
        code,
        message: message || "Internal error",
        ...(data !== undefined ? { data } : {}),
      },
      id,
    };
  }

  /**
   * Helper to format a Notification
   */
  public static notification<T = unknown>(method: string, params?: T): JsonRpcNotification<T> {
    return {
      jsonrpc: "2.0",
      method,
      ...(params !== undefined ? { params } : {}),
    };
  }

  /**
   * Helper to format a Request
   */
  public static request<T = unknown>(id: string | number, method: string, params?: T): JsonRpcRequest<T> {
    return {
      jsonrpc: "2.0",
      id,
      method,
      ...(params !== undefined ? { params } : {}),
    };
  }
}
