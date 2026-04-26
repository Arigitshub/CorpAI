import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const port = Number(process.env.PORT || "8788");
const bridgeToken = process.env.BRIDGE_TOKEN || "replace-me";
const codexBin = process.env.CODEX_BIN || "codex";
const codexWorkdir = process.env.CODEX_WORKDIR || "D:\\CorpAI";
const mockCodex = process.env.MOCK_CODEX === "1";

const dataDir = join(process.cwd(), "data");
const runsFile = join(dataDir, "missions.json");
mkdirSync(dataDir, { recursive: true });

function loadRuns() {
  if (!existsSync(runsFile)) {
    return [];
  }

  try {
    return JSON.parse(readFileSync(runsFile, "utf8"));
  } catch {
    return [];
  }
}

let missions = loadRuns();

function persistRuns() {
  writeFileSync(runsFile, JSON.stringify(missions, null, 2));
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(body));
}

function authorize(req) {
  const header = req.headers.authorization || "";
  return header === `Bearer ${bridgeToken}`;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function founderPrompt(mode) {
  if (mode === "acquire") {
    return [
      "You are helping the CorpAI founder evaluate taking over an existing company.",
      "Produce a concise operator brief with these sections:",
      "1. Core risk",
      "2. First 3 audits",
      "3. First 3 Codex-backed missions",
      "4. Transition hazards",
      "5. 30-day execution sequence",
      "Stay concrete and operational.",
    ].join("\n");
  }

  return [
    "You are helping the CorpAI founder launch a new company from zero.",
    "Produce a concise operator brief with these sections:",
    "1. Category wedge",
    "2. First 3 proof assets",
    "3. First 3 Codex-backed missions",
    "4. Revenue risk",
    "5. 30-day execution sequence",
    "Stay concrete and operational.",
  ].join("\n");
}

function summarizeMission(mode) {
  return mode === "acquire"
    ? "Acquisition brief queued. Focus on inherited-system audit, trust-loop rewrite, and customer transition risk."
    : "Launch brief queued. Focus on wedge definition, proof assets, and Codex-backed mission sequencing.";
}

function createMission(mode) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const mission = {
    id,
    mode,
    status: "queued",
    createdAt: now,
    updatedAt: now,
    prompt: founderPrompt(mode),
    summary: null,
    finalMessage: null,
    logs: [],
    lastMessagePath: join(dataDir, `${id}.final.txt`),
  };

  missions = [mission, ...missions];
  persistRuns();
  return mission;
}

function updateMission(id, updater) {
  missions = missions.map((mission) => {
    if (mission.id !== id) {
      return mission;
    }

    const updated = updater(mission);
    updated.updatedAt = new Date().toISOString();
    return updated;
  });
  persistRuns();
}

function appendLog(id, line) {
  updateMission(id, (mission) => ({
    ...mission,
    logs: [...mission.logs, line].slice(-120),
  }));
}

function runMission(mission) {
  updateMission(mission.id, (current) => ({
    ...current,
    status: "running",
    summary: summarizeMission(current.mode),
  }));

  if (mockCodex) {
    setTimeout(() => {
      appendLog(mission.id, "mock: bridge accepted mission");
      appendLog(mission.id, "mock: simulated Codex execution completed");
      updateMission(mission.id, (current) => ({
        ...current,
        status: "completed",
        finalMessage:
          current.mode === "acquire"
            ? "Acquire path: start with system audit, customer risk map, and governed replacement of fragile processes."
            : "Launch path: lock the wedge, generate proof, and use governed Codex missions to compress the first 30 days.",
      }));
    }, 800);
    return;
  }

  const args = [
    "exec",
    "--skip-git-repo-check",
    "--sandbox",
    "workspace-write",
    "--cd",
    codexWorkdir,
    "--output-last-message",
    mission.lastMessagePath,
    "-",
  ];

  const child = spawn(codexBin, args, {
    cwd: codexWorkdir,
    windowsHide: true,
    shell: process.platform === "win32",
  });

  child.stdin.end(mission.prompt);

  child.on("error", (error) => {
    updateMission(mission.id, (current) => ({
      ...current,
      status: "failed",
      finalMessage: error instanceof Error ? error.message : "Failed to start Codex",
      logs: [...current.logs, `spawn-error: ${error instanceof Error ? error.message : String(error)}`].slice(-120),
    }));
  });

  child.stdout.on("data", (chunk) => {
    const text = String(chunk).trim();
    if (text) {
      appendLog(mission.id, text);
    }
  });

  child.stderr.on("data", (chunk) => {
    const text = String(chunk).trim();
    if (text) {
      appendLog(mission.id, `stderr: ${text}`);
    }
  });

  child.on("close", (code) => {
    let finalMessage = null;
    if (existsSync(mission.lastMessagePath)) {
      finalMessage = readFileSync(mission.lastMessagePath, "utf8").trim();
    }

    updateMission(mission.id, (current) => ({
      ...current,
      status: code === 0 ? "completed" : "failed",
      finalMessage: finalMessage || current.finalMessage || `Codex exited with code ${code}`,
    }));
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    json(res, 204, {});
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, {
      ok: true,
      service: "corpai-founder-bridge",
      codexBin,
      codexWorkdir,
      mockCodex,
    });
    return;
  }

  if (!authorize(req)) {
    json(res, 401, { error: "Unauthorized" });
    return;
  }

  if (req.method === "GET" && url.pathname === "/missions") {
    json(res, 200, { ok: true, missions });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/missions/")) {
    const id = url.pathname.split("/")[2];
    const mission = missions.find((item) => item.id === id);
    if (!mission) {
      json(res, 404, { error: "Mission not found" });
      return;
    }
    json(res, 200, { ok: true, mission });
    return;
  }

  if (req.method === "POST" && url.pathname === "/missions") {
    try {
      const payload = await readJson(req);
      const mode = payload.mode === "acquire" ? "acquire" : "launch";
      const mission = createMission(mode);
      runMission(mission);
      json(res, 202, { ok: true, missionId: mission.id });
      return;
    } catch (error) {
      json(res, 500, {
        error: error instanceof Error ? error.message : "Unexpected server error",
      });
      return;
    }
  }

  json(res, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`CorpAI Founder Bridge listening on http://0.0.0.0:${port}`);
});
