const PROXY = (() => {
  const raw = process.env.NEXT_PUBLIC_PROXY_API_URL ?? "http://localhost:3001";
  try {
    const u = new URL(raw);
    return u.origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
})();

export function proxyUrl(sessionId: string): string {
  return `${PROXY}/api/v1/proxy?sessionId=${sessionId}`;
}

export function pythonSnippet(sessionId: string): string {
  return `import requests

proxy_url = "${PROXY}/api/v1/proxy"
target_url = "https://example.com/data"
session_id = "${sessionId}"

response = requests.get(
    proxy_url,
    params={"url": target_url, "sessionId": session_id},
)

data = response.json()
print(data["risk_score"], data["is_throttled"], data["upstream_status"])`;
}

export function nodeSnippet(sessionId: string): string {
  return `import axios from "axios";

const proxy_url = "${PROXY}/api/v1/proxy";
const target_url = "https://example.com/data";
const session_id = "${sessionId}";

const { data } = await axios.get(proxy_url, {
  params: { url: target_url, sessionId: session_id },
});

console.log(data.risk_score, data.is_throttled, data.upstream_status);`;
}

export function curlSnippet(sessionId: string): string {
  return `curl "${PROXY}/api/v1/proxy?url=https://example.com/data&sessionId=${sessionId}"`;
}

export function playwrightSnippet(sessionId: string): string {
  return `from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        proxy={"server": "${PROXY}"},
        extra_http_headers={"x-session-id": "${sessionId}"},
    )
    page = browser.new_page()
    page.goto("https://example.com")
    print(page.title())`;
}

export const SNIPPET_OPTIONS = [
  { id: "python", label: "Python", lang: "python", render: pythonSnippet },
  { id: "node", label: "Node.js", lang: "javascript", render: nodeSnippet },
  { id: "curl", label: "cURL", lang: "bash", render: curlSnippet },
  { id: "playwright", label: "Playwright", lang: "python", render: playwrightSnippet },
];
