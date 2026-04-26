import { createClient } from "@libsql/client";

export function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  }

  return createClient({ url, authToken });
}

export function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function normalizeString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function insertIntakeSubmission(client, payload) {
  const name = normalizeString(payload.name);
  const email = normalizeString(payload.email);

  if (!name || !email) {
    const error = new Error("Name and email are required");
    error.statusCode = 400;
    throw error;
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

  return { ok: true };
}

export async function listRecentIntakeSubmissions(client, limit = 25) {
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
