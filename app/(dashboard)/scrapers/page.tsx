"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteSession, listSessions, startSession, updateSession, type ScraperSession } from "@/lib/scrapers";
import {
  proxyUrl,
  pythonSnippet,
  nodeSnippet,
  curlSnippet,
  playwrightSnippet,
} from "@/lib/snippets";
import { Plus, Copy, Check, X, Network, Loader2, ExternalLink, Trash2, Pencil, ChevronDown, Key } from "lucide-react";

const SNIPPETS = [
  { id: "python", label: "Python", render: pythonSnippet },
  { id: "node", label: "Node.js", render: nodeSnippet },
  { id: "curl", label: "cURL", render: curlSnippet },
  { id: "playwright", label: "Playwright", render: playwrightSnippet },
];

const SDK_SNIPPETS = [
  {
    id: "setup",
    label: "Setup",
    code: `npm install @hiba-ehsan/antibot-scraper-sdk`,
  },
  {
    id: "env",
    label: "Env var",
    code: `export ANTIBOT_AGENT_KEY="your-key-here"`,
  },
  {
    id: "usage",
    label: "Usage",
    code: `import { AntiBotClient } from "@hiba-ehsan/antibot-scraper-sdk";

const client = new AntiBotClient({
  targetDomain: "example.com",
  name: "my-scraper",
});

const session = await client.initializeSession();
const proxy = client.getPlaywrightProxy();

// Pass \`proxy\` to Chromium.launch() and you're good to go.`,
  },
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ConnectModal({
  session,
  onClose,
}: {
  session: ScraperSession | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [mode, setMode] = useState<"quick" | "sdk">("quick");
  const [snippetTab, setSnippetTab] = useState("python");
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [sdkTab, setSdkTab] = useState("setup");

  if (!session) return null;
  const active = SNIPPETS.find((s) => s.id === snippetTab)!;

  const copy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const url = proxyUrl(session.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-2xl p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-1">
              CONNECT TO SCRAPER
            </p>
            <h2 className="text-lg font-bold silver-text">{session.name || session.target_domain}</h2>
            <p className="text-sm text-[#676a79] mt-0.5">
              Pick how you want to connect.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode switcher */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl bg-[#17191d] border border-[#2a2d33]">
          <button
            onClick={() => setMode("quick")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono transition-colors ${mode === "quick"
                ? "bg-[#ceced7] text-black font-semibold"
                : "text-[#676a79] hover:text-white"
              }`}
          >
            <Network className="w-3.5 h-3.5" />
            Quick Connect
          </button>
          <button
            onClick={() => setMode("sdk")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono transition-colors ${mode === "sdk"
                ? "bg-[#ceced7] text-black font-semibold"
                : "text-[#676a79] hover:text-white"
              }`}
          >
            <Key className="w-3.5 h-3.5" />
            Agent Key
          </button>
        </div>

        {mode === "quick" ? (
          <>
            {/* Proxy URL */}
            <p className="text-xs text-[#676a79] mb-2">
              Copy this URL and use it as your proxy.
            </p>
            <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-[#17191d] border border-[#2a2d33]">
              <code className="flex-1 font-mono text-xs text-white truncate">
                {url}
              </code>
              <button
                onClick={() => copy(url, "proxy-url")}
                className="p-1.5 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors shrink-0"
              >
                {copied === "proxy-url" ? (
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Collapsible code examples */}
            <button
              onClick={() => setExamplesOpen(!examplesOpen)}
              className="flex items-center gap-2 text-xs text-[#676a79] hover:text-white transition-colors mb-3"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${examplesOpen ? "rotate-180" : ""}`} />
              See code examples
            </button>

            <AnimatePresence>
              {examplesOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-1 mb-3 p-1 rounded-xl bg-[#17191d] border border-[#2a2d33] w-fit">
                    {SNIPPETS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSnippetTab(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${snippetTab === s.id
                            ? "bg-[#ceced7] text-black"
                            : "text-[#676a79] hover:text-white"
                          }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <pre className="rounded-xl bg-[#0a0a0b] border border-[#2a2d33] p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-[#ceced7] max-h-64 overflow-y-auto">
                      {active.render(session.id)}
                    </pre>
                    <button
                      onClick={() => copy(active.render(session.id), active.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg border border-[#2a2d33] bg-[#0a0a0b] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors"
                    >
                      {copied === active.id ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-[#676a79] leading-relaxed">
                    Using Playwright or Puppeteer? Pass{" "}
                    <code className="text-white">x-session-id</code> as a header
                    instead.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* Agent Key approach */}
            <p className="text-xs text-[#676a79] mb-4">
              Set this once and the SDK handles sessions for you automatically.
            </p>

            <div className="flex gap-1 mb-3 p-1 rounded-xl bg-[#17191d] border border-[#2a2d33] w-fit">
              {SDK_SNIPPETS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSdkTab(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${sdkTab === s.id
                      ? "bg-[#ceced7] text-black"
                      : "text-[#676a79] hover:text-white"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="rounded-xl bg-[#0a0a0b] border border-[#2a2d33] p-4 overflow-x-auto font-mono text-[11px] leading-relaxed text-[#ceced7] max-h-64 overflow-y-auto">
                {SDK_SNIPPETS.find((s) => s.id === sdkTab)?.code}
              </pre>
              <button
                onClick={() => {
                  const code = SDK_SNIPPETS.find((s) => s.id === sdkTab)?.code ?? "";
                  copy(code, `sdk-${sdkTab}`);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg border border-[#2a2d33] bg-[#0a0a0b] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors"
              >
                {copied === `sdk-${sdkTab}` ? (
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <p className="mt-3 text-xs text-[#676a79] leading-relaxed">
              The SDK creates a new session each time you call{" "}
              <code className="text-white">initializeSession()</code> — no need to
              manage session IDs by hand.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function EditModal({
  session,
  onClose,
  onSaved,
}: {
  session: ScraperSession | null;
  onClose: () => void;
  onSaved: (updated: ScraperSession) => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setName(session.name ?? "");
      setDomain(session.target_domain);
      setStatus(session.status);
      setError(null);
    }
  }, [session]);

  if (!session) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateSession(session.id, {
        name: name.trim() || null,
        target_domain: domain.trim() || session.target_domain,
        status,
      });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel w-full max-w-md p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-1">
              EDIT SCRAPER
            </p>
            <h2 className="text-lg font-bold silver-text">
              {name.trim() || "Unnamed scraper"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#676a79] font-mono tracking-wider">
              NAME
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product prices scraper"
              className="px-3.5 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#676a79] font-mono tracking-wider">
              TARGET DOMAIN
            </span>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="px-3.5 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-[#676a79] font-mono tracking-wider">
              STATUS
            </span>
            <div className="grid grid-cols-2 gap-2">
              {["ACTIVE", "PAUSED"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2.5 rounded-xl border text-sm transition-colors ${status === s
                      ? "bg-[#ceced7] border-[#ceced7] text-black font-semibold"
                      : "bg-[#17191d] border-[#2a2d33] text-[#676a79] hover:text-white"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </label>

          {error && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#2a2d33] text-[#676a79] hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ceced7] text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-[0_0_24px_rgba(206,206,215,0.25)]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScrapersPage() {
  const [sessions, setSessions] = useState<ScraperSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<ScraperSession | null>(null);
  const [editing, setEditing] = useState<ScraperSession | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSessions(await listSessions());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    const targetDomain = domain.trim() || "example.com";
    setCreating(true);
    setError(null);
    try {
      const s = await startSession(targetDomain, name.trim() || undefined);
      setConnected(s);
      setName("");
      setDomain("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const handleEditSaved = (updated: ScraperSession) => {
    setSessions((current) =>
      current.map((session) => (session.id === updated.id ? updated : session)),
    );
    setEditing(null);
  };

  const copy = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this scraper session?");
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);
    try {
      await deleteSession(id);
      setSessions((current) => current.filter((session) => session.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-2">
            SCRAPERS
          </p>
          <h1 className="text-2xl font-bold silver-text tracking-tight">
            Scrapers
          </h1>
          <p className="text-sm text-[#676a79] mt-1">
            Start a scraper and route it through the proxy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="scraper name (optional)"
            className="px-4 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors w-48 text-sm"
          />
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="target domain, e.g. example.com"
            className="px-4 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors w-64 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ceced7] text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-[0_0_24px_rgba(206,206,215,0.25)]"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Scraper
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Session cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-panel p-5 h-40 animate-pulse">
              <div className="h-3 w-1/3 bg-[#1e2126] rounded mb-3" />
              <div className="h-6 w-2/3 bg-[#1e2126] rounded mb-4" />
              <div className="h-3 w-1/2 bg-[#1e2126] rounded" />
            </div>
          ))}

        {!loading && sessions.length === 0 && (
          <div className="glass-panel p-8 text-center col-span-full">
            <Network className="w-8 h-8 text-[#676a79] mx-auto mb-3" />
            <p className="font-mono text-xs tracking-widest text-[#676a79] mb-1">
              NO SCRAPERS YET
            </p>
            <p className="text-sm text-[#676a79]">
              Enter a target domain above and click{" "}
              <span className="text-white">New Scraper</span> to get started.
            </p>
          </div>
        )}

        <AnimatePresence>
          {!loading &&
            sessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${s.status === "ACTIVE"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 glow-emerald"
                        : "bg-[#17191d] border border-[#2a2d33] text-[#676a79]"
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${s.status === "ACTIVE" ? "bg-emerald-400" : "bg-[#676a79]"
                        }`}
                    />
                    {s.status}
                  </span>
                  <span className="font-mono text-[10px] text-[#676a79]">
                    {timeAgo(s.created_at)}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white truncate">
                    {s.name || s.target_domain || "untitled"}
                  </p>
                  <code className="font-mono text-[10px] text-[#676a79] block truncate mt-0.5">
                    {s.name ? `${s.target_domain} · ${s.id}` : s.id}
                  </code>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#2a2d33]">
                  <span className="font-mono text-xs text-[#676a79]">
                    {s.request_count} <span className="text-[#676a79]/70">reqs</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copy(s.id)}
                      className="p-2 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors"
                      title="Copy session token"
                    >
                      {copied === s.id ? (
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditing(s)}
                      className="p-2 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33] transition-colors"
                      title="Edit scraper"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="p-2 rounded-lg border border-[#2a2d33] text-[#676a79] hover:text-rose-300 hover:border-rose-500/40 transition-colors disabled:opacity-50"
                      title="Delete session"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setConnected(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1e2126] border border-[#2a2d33] text-white text-xs hover:border-[#ceced7]/60 hover:text-[#E8E9EE] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {connected && <ConnectModal session={connected} onClose={() => setConnected(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editing && (
          <EditModal
            session={editing}
            onClose={() => setEditing(null)}
            onSaved={handleEditSaved}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
