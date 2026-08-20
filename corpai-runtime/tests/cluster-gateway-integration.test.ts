import * as http from "http";
import { WebSocket } from "ws";
import { GatewayServer } from "../src/gateway/GatewayServer";
import { CriticValidator } from "../src/dispatch/CriticValidator";

function httpJsonRpc(
  port: number,
  method: string,
  params: unknown,
  id: string | number = 1
): Promise<any> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    });

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/rpc",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${data}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

describe("Cluster Gateway Integrated End-to-End Test Suite", () => {
  let gateway: GatewayServer;
  let port: number;

  beforeAll(async () => {
    gateway = new GatewayServer({
      port: 0, // OS assigned
      host: "127.0.0.1",
      heartbeatIntervalMs: 500,
      expiryTtlSeconds: 2,
      minApprovalScore: 0.75,
      enableCluster: false,
    });

    const info = await gateway.listen();
    port = info.port;
  });

  afterAll(async () => {
    await gateway.close();
  });

  test("should get system health including cluster, budget, and journal stats", async () => {
    const res = await httpJsonRpc(port, "corpai.system.status", {});
    expect(res.error).toBeUndefined();
    expect(res.result.ok).toBe(true);
    expect(res.result.cluster).toBeDefined();
    expect(res.result.budgetMetrics).toBeDefined();
    expect(res.result.journalStats).toBeDefined();
  });

  test("should query cluster topology and peer information over JSON-RPC", async () => {
    const res = await httpJsonRpc(port, "corpai.cluster.getTopology", {});
    expect(res.error).toBeUndefined();
    expect(res.result.clusterId).toBe("corpai-cluster-main");
    expect(res.result.totalNodes).toBeGreaterThanOrEqual(1);
  });

  test("should allocate token budget, dispatch task, review with critic signature, and verify journal audit trail", async () => {
    // 1. Register Worker Agent
    const regWorker = await httpJsonRpc(port, "corpai.agent.register", {
      agentId: "agent-coder-x",
      name: "Autonomous Software Architect",
      department: "Engineering",
      role: "worker",
      capabilities: ["typescript", "kubernetes", "sqlite"],
    });
    expect(regWorker.result.agentId).toBe("agent-coder-x");

    // 2. Register Critic Agent
    const regCritic = await httpJsonRpc(port, "corpai.agent.register", {
      agentId: "critic-architect-x",
      name: "Security & Architecture Critic",
      department: "Engineering",
      role: "critic",
      capabilities: ["typescript", "architecture-review"],
    });
    const criticSecret = regCritic.result.secretKey;
    expect(criticSecret).toBeDefined();

    // 3. Allocate token budget for the task
    const budgetRes = await httpJsonRpc(port, "corpai.budget.allocate", {
      agentId: "agent-coder-x",
      department: "Engineering",
      tokens: 450,
      priority: "P1",
      reason: "Deploy Multi-Node Cluster Gateway",
    });
    expect(budgetRes.result.allocated).toBe(true);
    expect(budgetRes.result.tokensAllocated).toBe(450);

    // 4. Dispatch task
    const dispatchRes = await httpJsonRpc(port, "corpai.task.dispatch", {
      title: "Deploy Multi-Node Cluster Gateway",
      description: "Implement UDP beaconing and persistent event journal",
      department: "Engineering",
      priority: "P1",
      requiredCapabilities: ["typescript"],
      assignedWorkerId: "agent-coder-x",
      assignedCriticId: "critic-architect-x",
    });
    const task = dispatchRes.result;
    expect(task.id).toBeDefined();
    expect(task.status).toBe("assigned");

    // 5. Worker claims task
    const claimRes = await httpJsonRpc(port, "corpai.task.claim", {
      agentId: "agent-coder-x",
      taskId: task.id,
    });
    expect(claimRes.result.status).toBe("running");

    // 6. Worker submits result
    const workerResult = {
      clusterGatewayImplemented: true,
      tokenBudgetAllocatorReady: true,
      journalDurable: true,
    };
    const submitRes = await httpJsonRpc(port, "corpai.task.submitResult", {
      taskId: task.id,
      workerId: "agent-coder-x",
      result: workerResult,
    });
    expect(submitRes.result.status).toBe("awaiting_critic");
    const resultHash = submitRes.result.resultHash;

    // 7. Critic signs and submits review
    const reviewData = {
      criticId: "critic-architect-x",
      taskId: task.id,
      workerId: "agent-coder-x",
      status: "approved" as const,
      score: 0.98,
      feedback: "All architectural components implemented cleanly with full test coverage",
      timestamp: new Date().toISOString(),
      payloadHash: resultHash,
    };
    const signedReview = CriticValidator.signReview(criticSecret, reviewData);

    const reviewRes = await httpJsonRpc(port, "corpai.task.submitReview", {
      taskId: task.id,
      review: signedReview,
    });
    expect(reviewRes.result.validation.approved).toBe(true);
    expect(reviewRes.result.task.status).toBe("completed");

    // 8. Query task event journal history over JSON-RPC
    const historyRes = await httpJsonRpc(port, "corpai.journal.getTaskHistory", {
      taskId: task.id,
    });
    expect(historyRes.result.length).toBeGreaterThanOrEqual(4);

    // 9. Verify cryptographic integrity of journal over JSON-RPC
    const integrityRes = await httpJsonRpc(port, "corpai.journal.verifyIntegrity", {});
    expect(integrityRes.result.valid).toBe(true);
    expect(integrityRes.result.signatureFailures.length).toBe(0);

    // 10. Replay task state from journal over JSON-RPC
    const replayRes = await httpJsonRpc(port, "corpai.journal.replayTask", {
      taskId: task.id,
    });
    expect(replayRes.result.id).toBe(task.id);
    expect(replayRes.result.status).toBe("completed");
    expect(replayRes.result.result).toEqual(workerResult);

    // 11. Export SQLite schema and inserts
    const sqliteExportRes = await httpJsonRpc(port, "corpai.journal.exportSqlite", {});
    expect(sqliteExportRes.result.schema).toContain("CREATE TABLE IF NOT EXISTS task_events");
    expect(sqliteExportRes.result.inserts.length).toBeGreaterThanOrEqual(4);
  });
});
