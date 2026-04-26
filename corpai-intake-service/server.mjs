import http from "node:http";
import { handleHealth, handleIntake, handleLeads, jsonResponse } from "./lib/http.mjs";

const port = Number(process.env.PORT || 8787);

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (request, response) => {
  const origin = request.headers.origin;

  if (request.method === "OPTIONS") {
    const result = jsonResponse(204, {}, origin);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    const result = await handleHealth(origin);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
    return;
  }

  if (request.method === "GET" && request.url.startsWith("/leads")) {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const limit = Number(url.searchParams.get("limit") || "25");
    const result = await handleLeads(request.headers, process.env, origin, limit);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
    return;
  }

  if (request.method !== "POST" || request.url !== "/intake") {
    const result = jsonResponse(404, { error: "Not found" }, origin);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
    return;
  }

  const payload = await readJson(request);
  const result = await handleIntake(payload, origin);
  response.writeHead(result.status, result.headers);
  response.end(result.body);
});

server.listen(port, () => {
  console.log(`CorpAI intake service listening on http://localhost:${port}`);
});
