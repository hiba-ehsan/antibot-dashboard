"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lookupIp, type OsintResult } from "@/lib/osint";
import { useTelemetry } from "@/lib/telemetry";
import {
  Search,
  Loader2,
  ShieldAlert,
  MapPin,
  Building2,
  Server,
  ShieldCheck,
  Radar,
} from "lucide-react";

export default function ThreatIntelPage() {
  const { rows } = useTelemetry(200);
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<OsintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topTargets = useMemo(() => {
    const byDomain = new Map<string, { reqs: number; maxRisk: number }>();
    for (const r of rows) {
      let domain = r.target_url;
      try {
        domain = new URL(r.target_url).hostname;
      } catch {
        /* keep as-is */
      }
      const cur = byDomain.get(domain) ?? { reqs: 0, maxRisk: 0 };
      cur.reqs += 1;
      cur.maxRisk = Math.max(cur.maxRisk, r.risk_score);
      byDomain.set(domain, cur);
    }
    return [...byDomain.entries()]
      .sort((a, b) => b[1].maxRisk - a[1].maxRisk)
      .slice(0, 8);
  }, [rows]);

  const highRiskPct =
    rows.length > 0
      ? Math.round((rows.filter((r) => r.risk_score >= 0.65).length / rows.length) * 100)
      : 0;

  const handleLookup = async () => {
    const lookupValue = ip.trim() || "8.8.8.8";
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await lookupIp(lookupValue));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) =>
    s >= 0.65 ? "text-rose-400" : s >= 0.35 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-2">
          OSINT INTELLIGENCE
        </p>
        <h1 className="text-2xl font-bold silver-text tracking-tight">
          Threat Intel
        </h1>
        <p className="text-sm text-[#676a79] mt-1">
          AbuseIPDB reputation lookups and high-risk target exposure.
        </p>
      </div>

      {/* IP lookup */}
      <div className="glass-panel p-5 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Radar className="w-5 h-5 text-[#E8E9EE]" />
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="enter an IP address, e.g. 8.8.8.8"
            className="flex-1 min-w-[240px] px-4 py-2.5 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm font-mono"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ceced7] text-black font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-[0_0_24px_rgba(206,206,215,0.25)]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Lookup
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 text-sm text-rose-300"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                {
                  label: "ABUSE SCORE",
                  value: String(result.abuseConfidenceScore),
                  accent:
                    result.abuseConfidenceScore >= 50
                      ? "text-rose-400"
                      : result.abuseConfidenceScore >= 25
                        ? "text-amber-400"
                        : "text-emerald-400",
                  icon: <ShieldAlert className="w-4 h-4" />,
                },
                {
                  label: "COUNTRY",
                  value: result.countryCode || "â€”",
                  accent: "text-white",
                  icon: <MapPin className="w-4 h-4" />,
                },
                {
                  label: "USAGE TYPE",
                  value: result.usageType || "â€”",
                  accent: "text-white",
                  icon: <Server className="w-4 h-4" />,
                },
                {
                  label: "ISP",
                  value: result.isp || "â€”",
                  accent: "text-white",
                  icon: <Building2 className="w-4 h-4" />,
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="rounded-xl bg-[#17191d] border border-[#2a2d33] p-3"
                >
                  <div className="flex items-center gap-2 text-[#676a79] mb-2">
                    {c.icon}
                    <span className="font-mono text-[10px] tracking-[0.2em]">
                      {c.label}
                    </span>
                  </div>
                  <p className={`font-mono text-lg font-bold truncate ${c.accent}`}>
                    {c.value}
                  </p>
                </div>
              ))}
              <div className="rounded-xl bg-[#17191d] border border-[#2a2d33] p-3 flex items-center justify-between col-span-2 md:col-span-4">
                <div className="flex items-center gap-2 text-[#676a79]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-mono text-[10px] tracking-[0.2em]">
                    TOR EXIT NODE
                  </span>
                </div>
                <span
                  className={`font-mono text-sm font-bold ${result.isTor ? "text-rose-400" : "text-emerald-400"
                    }`}
                >
                  {result.isTor ? "TRUE" : "FALSE"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#676a79]">
              HIGHEST RISK TARGETS
            </span>
            <span className="font-mono text-[10px] text-[#676a79]">
              {topTargets.length} DOMAINS
            </span>
          </div>
          <div className="space-y-2">
            {topTargets.length === 0 && (
              <p className="text-sm text-[#676a79]">No telemetry yet.</p>
            )}
            {topTargets.map(([domain, info]) => (
              <div
                key={domain}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#17191d] border border-[#2a2d33]"
              >
                <span className="font-mono text-xs text-white truncate mr-3">
                  {domain}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px] text-[#676a79]">
                    {info.reqs} reqs
                  </span>
                  <span
                    className={`font-mono text-xs font-bold w-12 text-right ${scoreColor(info.maxRisk)}`}
                  >
                    {(info.maxRisk * 100).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#676a79]">
            WINDOW EXPOSURE
          </span>
          <div className="mt-4 flex items-end gap-2">
            <p className="font-mono text-5xl font-bold text-rose-400 text-glow-crimson">
              {highRiskPct}%
            </p>
            <p className="text-sm text-[#676a79] mb-1.5">of requests high-risk</p>
          </div>

          <div className="mt-6">
            <div className="h-2 rounded-full bg-[#1e2126] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                style={{ width: `${highRiskPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 font-mono text-[10px] text-[#676a79]">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <p className="mt-6 text-xs text-[#676a79] leading-relaxed">
            Risk is computed per request by the ML IsolationForest model using
            inter-request timing deltas and AbuseIPDB reputation. Targets above
            the 65% threshold are auto-throttled with an adaptive delay.
          </p>
        </div>
      </div>
    </div>
  );
}
