import { proxyFetch } from "./api";

export interface ScraperSession {
  id: string;
  name: string | null;
  target_domain: string;
  status: string;
  created_at: string;
  request_count: number;
}

export async function listSessions(): Promise<ScraperSession[]> {
  return proxyFetch<ScraperSession[]>("/api/v1/sessions");
}

export async function startSession(
  targetDomain: string,
  name?: string,
): Promise<ScraperSession> {
  return proxyFetch<ScraperSession>("/api/v1/sessions/start", {
    method: "POST",
    body: JSON.stringify({ targetDomain, name }),
  });
}

export async function updateSession(
  sessionId: string,
  patch: { name?: string | null; target_domain?: string; status?: string },
): Promise<ScraperSession> {
  return proxyFetch<ScraperSession>(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(patch),
    },
  );
}
export async function deleteSession(sessionId: string): Promise<void> {
  await proxyFetch<void>(`/api/v1/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  });
}
export interface ProxyCallResult {
  target_url: string;
  risk_score: number;
  recommended_delay_sec: number;
  is_throttled: boolean;
  proxy_abuse_score: number;
  delta_ms: number;
  upstream_status: number | null;
}

export async function callProxy(
  url: string,
  sessionId: string,
): Promise<ProxyCallResult> {
  const res = await proxyFetch<ProxyCallResult>(
    `/api/v1/proxy?url=${encodeURIComponent(url)}&sessionId=${encodeURIComponent(sessionId)}`,
  );
  return res;
}
