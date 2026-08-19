#!/usr/bin/env node

import { GatewayServer } from "./gateway/GatewayServer";

async function main() {
  const portArgIndex = process.argv.indexOf("--port");
  const port = portArgIndex !== -1 && process.argv[portArgIndex + 1]
    ? parseInt(process.argv[portArgIndex + 1], 10)
    : parseInt(process.env.CORPAI_PORT || process.env.CORPAI_AGENT_WS_PORT || "8787", 10);

  const hostArgIndex = process.argv.indexOf("--host");
  const host = hostArgIndex !== -1 && process.argv[hostArgIndex + 1]
    ? process.argv[hostArgIndex + 1]
    : process.env.CORPAI_HOST || "0.0.0.0";

  console.log(`[CorpAI Gateway] Initializing Distributed JSON-RPC 2.0 Gateway on ${host}:${port}...`);

  const gateway = new GatewayServer({ port, host });
  const serverInfo = await gateway.listen();

  console.log(`[CorpAI Gateway] Listening on ws://${serverInfo.host}:${serverInfo.port}/corpai-agent-task-log`);
  console.log(`[CorpAI Gateway] HTTP JSON-RPC endpoint: http://${serverInfo.host}:${serverInfo.port}/rpc`);
  console.log(`[CorpAI Gateway] Health check: http://${serverInfo.host}:${serverInfo.port}/health`);
  console.log(`[CorpAI Gateway] Telemetry feed: http://${serverInfo.host}:${serverInfo.port}/corpai-team-status.json`);

  const cleanup = async () => {
    console.log("\n[CorpAI Gateway] Shutting down gateway gracefully...");
    await gateway.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[CorpAI Gateway] Startup Error:", err);
    process.exit(1);
  });
}
