import { handleIntake, jsonResponse } from "../lib/http.mjs";

export default async function handler(request, response) {
  const origin = request.headers.origin;

  if (request.method === "OPTIONS") {
    const result = jsonResponse(204, {}, origin);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
    return;
  }

  if (request.method !== "POST") {
    const result = jsonResponse(405, { error: "Method not allowed" }, origin);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
    return;
  }

  const result = await handleIntake(request.body ?? {}, origin);
  response.writeHead(result.status, result.headers);
  response.end(result.body);
}
