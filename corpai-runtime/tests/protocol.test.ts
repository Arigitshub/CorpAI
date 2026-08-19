import { JsonRpcParser } from "../src/protocol/parser";
import { JsonRpcErrorCode, JsonRpcException } from "../src/protocol/errors";

describe("JSON-RPC 2.0 Protocol Parser", () => {
  it("should parse valid single JSON-RPC 2.0 request", () => {
    const raw = JSON.stringify({
      jsonrpc: "2.0",
      method: "corpai.agent.get",
      params: { agentId: "agent-001" },
      id: "req-1",
    });

    const parsed = JsonRpcParser.parsePayload(raw);
    expect(parsed.isBatch).toBe(false);
    expect(parsed.requests).toHaveLength(1);
    expect(parsed.requests[0].valid).toBe(true);
    expect(parsed.requests[0].message).toEqual({
      jsonrpc: "2.0",
      method: "corpai.agent.get",
      params: { agentId: "agent-001" },
      id: "req-1",
    });
  });

  it("should parse valid notification without id", () => {
    const raw = JSON.stringify({
      jsonrpc: "2.0",
      method: "corpai.telemetry.notify",
      params: { metric: "latency", value: 45 },
    });

    const parsed = JsonRpcParser.parsePayload(raw);
    expect(parsed.isBatch).toBe(false);
    expect(parsed.requests[0].valid).toBe(true);
    expect(parsed.requests[0].message?.method).toBe("corpai.telemetry.notify");
    expect((parsed.requests[0].message as any).id).toBeUndefined();
  });

  it("should parse batch JSON-RPC requests", () => {
    const raw = JSON.stringify([
      { jsonrpc: "2.0", method: "m1", id: 1 },
      { jsonrpc: "2.0", method: "m2", id: 2 },
    ]);

    const parsed = JsonRpcParser.parsePayload(raw);
    expect(parsed.isBatch).toBe(true);
    expect(parsed.requests).toHaveLength(2);
    expect(parsed.requests[0].valid).toBe(true);
    expect(parsed.requests[1].valid).toBe(true);
  });

  it("should throw parse error for malformed JSON text", () => {
    const malformed = "{ jsonrpc: 2.0, invalid }";
    expect(() => JsonRpcParser.parsePayload(malformed)).toThrow(JsonRpcException);
    try {
      JsonRpcParser.parsePayload(malformed);
    } catch (err) {
      expect(err).toBeInstanceOf(JsonRpcException);
      expect((err as JsonRpcException).code).toBe(JsonRpcErrorCode.PARSE_ERROR);
    }
  });

  it("should reject empty batch array", () => {
    expect(() => JsonRpcParser.parsePayload("[]")).toThrow(JsonRpcException);
  });

  it("should invalidate request missing jsonrpc 2.0 version", () => {
    const raw = JSON.stringify({
      method: "test",
      id: 123,
    });

    const parsed = JsonRpcParser.parsePayload(raw);
    expect(parsed.requests[0].valid).toBe(false);
    expect(parsed.requests[0].error?.code).toBe(JsonRpcErrorCode.INVALID_REQUEST);
  });

  it("should invalidate request with invalid method type", () => {
    const raw = JSON.stringify({
      jsonrpc: "2.0",
      method: 12345,
      id: 1,
    });

    const parsed = JsonRpcParser.parsePayload(raw);
    expect(parsed.requests[0].valid).toBe(false);
    expect(parsed.requests[0].error?.code).toBe(JsonRpcErrorCode.INVALID_REQUEST);
  });

  it("should format success and error responses correctly", () => {
    const successRes = JsonRpcParser.success("test-id", { status: "ok" });
    expect(successRes).toEqual({
      jsonrpc: "2.0",
      result: { status: "ok" },
      id: "test-id",
    });

    const errRes = JsonRpcParser.error("test-id", JsonRpcException.agentNotFound("a1"));
    expect(errRes).toEqual({
      jsonrpc: "2.0",
      error: {
        code: JsonRpcErrorCode.AGENT_NOT_FOUND,
        message: "Agent 'a1' not found",
      },
      id: "test-id",
    });
  });
});
