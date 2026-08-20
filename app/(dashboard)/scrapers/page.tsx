"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { runGoogleMaps, type GoogleMapsResult } from "@/lib/scrapers-api";
import { listSessions, deleteSession, type ScraperSession } from "@/lib/scrapers";
import { useScraperSocket, type ScraperProgress } from "@/lib/use-scraper-socket";
import {
  MapPin,
  Loader2,
  Play,
  Star,
  Phone,
  Clock,
  Search,
  Zap,
  RotateCcw,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";

export default function ScrapersPage() {
  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-2">
          PRE-BUILT SCRAPERS
        </p>
        <h1 className="text-2xl font-bold silver-text tracking-tight">Scrapers</h1>
        <p className="text-sm text-[#676a79] mt-1">
          Pick a scraper, enter your search, click Run. Every request is tracked through the anti-bot pipeline.
        </p>
      </div>

      <GoogleMapsScraper />
    </div>
  );
}

function GoogleMapsScraper() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<GoogleMapsResult[]>([]);
  const [progress, setProgress] = useState<ScraperProgress | null>(null);
  const [complete, setComplete] = useState<{ total: number; duration: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [sessions, setSessions] = useState<ScraperSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { connected, joinSession, onProgress, onResult, onComplete, onError } = useScraperSocket();

  useEffect(() => {
    const cleanups = [
      onProgress((data) => setProgress(data)),
      onResult((data) => setResults((prev) => [...prev, data])),
      onComplete((data) => {
        setComplete(data);
        setRunning(false);
        loadSessions();
      }),
      onError((data) => {
        setError(data.message);
        setRunning(false);
      }),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, [onProgress, onResult, onComplete, onError]);

  const loadSessions = () => {
    listSessions()
      .then((s) => setSessions(s.filter((x) => x.target_domain === "google.com/maps")))
      .catch(() => {});
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRun = async () => {
    if (!query.trim() || !location.trim()) return;

    setRunning(true);
    setResults([]);
    setProgress(null);
    setComplete(null);
    setError(null);
    setTelemetry(null);

    try {
      const response = await runGoogleMaps(query.trim(), location.trim(), maxResults);
      joinSession(response.sessionId);
      setResults(response.results);
      setTelemetry(response.telemetry);
      setComplete({ total: response.resultCount, duration: response.telemetry.delta_ms });
      setRunning(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scraper failed");
      setRunning(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      {/* Scraper Card */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold silver-text">Google Maps</h2>
            <p className="text-xs text-[#676a79]">
              Extract business listings with ratings, reviews, and contact info
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-[#676a79]"}`}
            />
            <span className="font-mono text-[10px] text-[#676a79]">
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono tracking-wider text-[#676a79]">SEARCH</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#676a79]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="restaurants, dentist, plumber..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79]/60 focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono tracking-wider text-[#676a79]">LOCATION</span>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#676a79]" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRun()}
                placeholder="New York, London, Tokyo..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79]/60 focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono tracking-wider text-[#676a79]">MAX RESULTS</span>
            <input
              type="number"
              min={1}
              max={50}
              value={maxResults}
              onChange={(e) => setMaxResults(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-full px-3 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRun}
            disabled={running || !query.trim() || !location.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ceced7] text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-[0_0_24px_rgba(206,206,215,0.25)]"
          >
            {running ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>

          {results.length > 0 && (
            <button
              onClick={() => { setResults([]); setComplete(null); setProgress(null); setTelemetry(null); }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#2a2d33] text-[#676a79] hover:text-white text-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <AnimatePresence>
            {progress && running && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 ml-2"
              >
                <span className="font-mono text-xs text-[#676a79]">
                  {progress.found > 0 && (
                    <span className="text-emerald-400 font-semibold">{progress.found} found</span>
                  )}
                  {progress.found > 0 && " · "}
                  {progress.status}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion bar */}
      <AnimatePresence>
        {complete && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel p-4 flex items-center gap-4 flex-wrap"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-sm">
                <span className="text-white font-semibold">{complete.total}</span>
                <span className="text-[#676a79]"> results in </span>
                <span className="text-white font-semibold">{(complete.duration / 1000).toFixed(1)}s</span>
              </span>
            </div>
            {telemetry && (
              <div className="flex items-center gap-3 ml-auto font-mono text-[10px] text-[#676a79]">
                <span>
                  Risk: <span className="text-emerald-400">{(telemetry.risk_score * 100).toFixed(0)}%</span>
                </span>
                <span>
                  Delta: <span className="text-white">{telemetry.delta_ms}ms</span>
                </span>
                <span>
                  Throttled:{" "}
                  <span className={telemetry.is_throttled ? "text-rose-400" : "text-emerald-400"}>
                    {telemetry.is_throttled ? "YES" : "NO"}
                  </span>
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results table */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-[#2a2d33] flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#676a79]">RESULTS</span>
            <span className="text-[11px] font-mono text-[#676a79]">{results.length} rows</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left">
                  {["NAME", "RATING", "REVIEWS", "ADDRESS", "PHONE", "HOURS"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#676a79] border-b border-[#2a2d33]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {results.map((r, idx) => (
                    <motion.tr
                      key={`${r.name}-${idx}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-[#2a2d33]/60 hover:bg-[#17191d]/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-white max-w-[200px] truncate">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.rating ? (
                          <span className="inline-flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {r.rating}
                          </span>
                        ) : (
                          <span className="text-[#676a79]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#676a79]">
                        {r.reviews || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#676a79] max-w-[250px] truncate">
                        {r.address || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.phone ? (
                          <span className="inline-flex items-center gap-1 text-[#ceced7]">
                            <Phone className="w-3 h-3" />
                            {r.phone}
                          </span>
                        ) : (
                          <span className="text-[#676a79]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#676a79] max-w-[180px] truncate">
                        {r.hours ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            {r.hours}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Session History */}
      <div className="glass-panel">
        <button
          onClick={() => setHistoryOpen(!historyOpen)}
          className="w-full px-5 py-3 flex items-center gap-2 text-left hover:bg-[#17191d]/50 transition-colors rounded-xl"
        >
          <History className="w-4 h-4 text-[#676a79]" />
          <span className="font-mono text-[10px] tracking-[0.25em] text-[#676a79]">PAST RUNS</span>
          <span className="font-mono text-[10px] text-[#676a79] ml-1">({sessions.length})</span>
          <span className="ml-auto">
            {historyOpen ? (
              <ChevronUp className="w-4 h-4 text-[#676a79]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#676a79]" />
            )}
          </span>
        </button>

        <AnimatePresence>
          {historyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {sessions.length === 0 ? (
                <div className="px-5 py-4 text-xs text-[#676a79]">No past runs yet.</div>
              ) : (
                <div className="border-t border-[#2a2d33]">
                  {sessions.map((s) => (
                    <div
                      key={s.id}
                      className="px-5 py-3 flex items-center gap-3 border-b border-[#2a2d33]/60 last:border-0 hover:bg-[#17191d]/30 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#676a79] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-white truncate">{s.name}</div>
                        <div className="font-mono text-[10px] text-[#676a79]">
                          {new Date(s.created_at).toLocaleString()} · {s.request_count ?? 0} telemetry · {s.status}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[#676a79] hover:text-rose-400 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
