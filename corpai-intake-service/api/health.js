import { handleHealth } from "../lib/http.mjs";

export default async function handler(request, response) {
  const result = await handleHealth(request.headers.origin);
  response.writeHead(result.status, result.headers);
  response.end(result.body);
}
