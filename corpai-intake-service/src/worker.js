import { createClient } from "@libsql/client/web";

function getAllowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildHeaders(origin, env) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && getAllowedOrigins(env).includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function json(body, status = 200, origin, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildHeaders(origin, env),
  });
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getClient(env) {
  if (!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  }

  return createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}

async function insertIntakeSubmission(client, payload) {
  const name = normalizeString(payload.name);
  const email = normalizeString(payload.email);

  if (!name || !email) {
    return { ok: false, status: 400, error: "Name and email are required" };
  }

  await client.execute({
    sql: `
      insert into intake_submissions (
        name,
        email,
        company,
        team_size,
        current_tools,
        target_workflow,
        monthly_volume,
        biggest_pain,
        timeline,
        source,
        status
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      name,
      email,
      normalizeString(payload.company),
      normalizeString(payload.teamSize),
      normalizeString(payload.currentTools),
      normalizeString(payload.targetWorkflow) || "PR Review AgentOps",
      normalizeString(payload.monthlyVolume),
      normalizeString(payload.biggestPain),
      normalizeString(payload.timeline),
      normalizeString(payload.source) || "corpai-portal",
      "new",
    ],
  });

  return { ok: true, status: 200 };
}

async function listRecentIntakeSubmissions(client, limit = 25) {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 25;

  const result = await client.execute({
    sql: `
      select
        id,
        created_at,
        name,
        email,
        company,
        team_size,
        current_tools,
        target_workflow,
        monthly_volume,
        biggest_pain,
        timeline,
        source,
        status
      from intake_submissions
      order by datetime(created_at) desc, id desc
      limit ?
    `,
    args: [safeLimit],
  });

  return result.rows;
}

function isAuthorized(request, env) {
  if (!env.ADMIN_READ_TOKEN) {
    return false;
  }

  return request.headers.get("Authorization") === `Bearer ${env.ADMIN_READ_TOKEN}`;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json({}, 204, origin, env);
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true }, 200, origin, env);
    }

    if (request.method === "GET" && url.pathname === "/leads") {
      if (!isAuthorized(request, env)) {
        return json({ error: "Unauthorized" }, 401, origin, env);
      }

      try {
        const limit = Number(url.searchParams.get("limit") || "25");
        const client = getClient(env);
        const leads = await listRecentIntakeSubmissions(client, limit);
        return json({ ok: true, leads }, 200, origin, env);
      } catch (error) {
        return json(
          { error: error instanceof Error ? error.message : "Unexpected server error" },
          500,
          origin,
          env,
        );
      }
    }

    if (request.method !== "POST" || url.pathname !== "/intake") {
      return json({ error: "Not found" }, 404, origin, env);
    }

    try {
      const payload = await request.json();
      const client = getClient(env);
      const result = await insertIntakeSubmission(client, payload);

      if (!result.ok) {
        return json({ error: result.error }, result.status, origin, env);
      }

      return json({ ok: true }, 200, origin, env);
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : "Unexpected server error" },
        500,
        origin,
        env,
      );
    }
  },
};
