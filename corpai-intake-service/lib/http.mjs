import { getAllowedOrigins, getClient, insertIntakeSubmission, listRecentIntakeSubmissions } from "./intake.js";

function buildHeaders(origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && getAllowedOrigins().includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function jsonResponse(status, body, origin) {
  return {
    status,
    headers: buildHeaders(origin),
    body: JSON.stringify(body),
  };
}

export async function handleHealth(origin) {
  return jsonResponse(200, { ok: true }, origin);
}

export async function handleIntake(payload, origin) {
  try {
    const client = getClient();
    const result = await insertIntakeSubmission(client, payload);
    return jsonResponse(200, result, origin);
  } catch (error) {
    const status = typeof error?.statusCode === "number" ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return jsonResponse(status, { error: message }, origin);
  }
}

function isAuthorized(requestOrHeaders, env) {
  const token = env.ADMIN_READ_TOKEN;
  if (!token) {
    return false;
  }

  const headerValue =
    typeof requestOrHeaders?.get === "function"
      ? requestOrHeaders.get("Authorization")
      : requestOrHeaders?.authorization || requestOrHeaders?.Authorization;

  return headerValue === `Bearer ${token}`;
}

export async function handleLeads(requestLike, env, origin, limit = 25) {
  if (!isAuthorized(requestLike, env)) {
    return jsonResponse(401, { error: "Unauthorized" }, origin);
  }

  try {
    const client = getClient(env);
    const leads = await listRecentIntakeSubmissions(client, limit);
    return jsonResponse(200, { ok: true, leads }, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return jsonResponse(500, { error: message }, origin);
  }
}
