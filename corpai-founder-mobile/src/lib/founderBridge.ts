import type { BridgeMission, PathMode } from '../types';

export const DEFAULT_BRIDGE_URL = 'http://192.168.1.101:8790';

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function checkBridgeHealth(baseUrl: string) {
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Bridge health check failed with ${response.status}`);
  }
  return response.json();
}

export async function createBridgeMission(baseUrl: string, token: string, mode: PathMode) {
  const response = await fetch(`${baseUrl}/missions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ mode }),
  });

  if (!response.ok) {
    throw new Error(`Mission creation failed with ${response.status}`);
  }

  return response.json() as Promise<{ ok: boolean; missionId: string }>;
}

export async function getBridgeMission(baseUrl: string, token: string, missionId: string) {
  const response = await fetch(`${baseUrl}/missions/${missionId}`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Mission fetch failed with ${response.status}`);
  }

  const payload = (await response.json()) as { ok: boolean; mission: BridgeMission };
  return payload.mission;
}
