const PROXY_API = process.env.NEXT_PUBLIC_PROXY_API_URL ?? "http://localhost:3001";

export async function proxyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${PROXY_API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.message ?? body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
