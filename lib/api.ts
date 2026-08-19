import { getAccessToken } from "./auth";

const PROXY_API = (() => {
  const raw = process.env.NEXT_PUBLIC_PROXY_API_URL ?? "http://localhost:3001";
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
})();

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}

export async function proxyFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Waits for the supabase client to restore the session before reading the
  // token, so the request always carries a valid bearer token.
  const token = await getAccessToken();

  if (!token) {
    redirectToLogin();
    throw new Error("Session expired. Redirecting to sign in...");
  }

  const res = await fetch(`${PROXY_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new Error("Session expired. Redirecting to sign in...");
  }

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



