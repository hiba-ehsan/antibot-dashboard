"use client";

import { useMemo, useState } from "react";
import { useTelemetry } from "@/lib/telemetry";
import TelemetryTable, { type TelemetryRow } from "@/components/TelemetryTable";
import { Filter, Search } from "lucide-react";

export default function TelemetryPage() {
  const { rows } = useTelemetry(200);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "med" | "high">(
    "all",
  );
  const [throttleOnly, setThrottleOnly] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (throttleOnly && !r.is_throttled) return false;
      if (riskFilter === "low" && r.risk_score >= 0.35) return false;
      if (riskFilter === "med" && (r.risk_score < 0.35 || r.risk_score >= 0.65))
        return false;
      if (riskFilter === "high" && r.risk_score < 0.65) return false;
      if (
        query &&
        !r.target_url.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rows, query, riskFilter, throttleOnly]);

  const counts = useMemo(() => {
    const low = rows.filter((r) => r.risk_score < 0.35).length;
    const med = rows.filter((r) => r.risk_score >= 0.35 && r.risk_score < 0.65).length;
    const high = rows.filter((r) => r.risk_score >= 0.65).length;
    const throttled = rows.filter((r) => r.is_throttled).length;
    return { low, med, high, throttled };
  }, [rows]);

  return (
    <div className="max-w-[1200px]">
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-[#676a79] mb-2">
          REQUEST HISTORY
        </p>
        <h1 className="text-2xl font-bold silver-text tracking-tight">
          Telemetry
        </h1>
        <p className="text-sm text-[#676a79] mt-1">
          Full request log with risk classification and throttle state.
        </p>
      </div>

      {/* Filter bar */}
      <div className="glass-panel p-4 mb-4 flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-[#676a79]" />
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#17191d] border border-[#2a2d33]">
          {(["all", "low", "med", "high"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors ${
                riskFilter === f
                  ? "bg-[#ceced7] text-black"
                  : "text-[#676a79] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setThrottleOnly((v) => !v)}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors ${
            throttleOnly
              ? "bg-rose-500/10 border-rose-500/40 text-rose-300 glow-crimson"
              : "border-[#2a2d33] text-[#676a79] hover:text-white hover:border-[#2a2d33]"
          }`}
        >
          429 ONLY
        </button>

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#676a79]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter by target url..."
            className="pl-9 pr-4 py-2 rounded-xl bg-[#17191d] border border-[#2a2d33] text-white placeholder:text-[#676a79] focus:outline-none focus:border-[#E8E9EE] transition-colors text-sm w-64"
          />
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "LOW", value: counts.low, color: "text-emerald-400" },
          { label: "MED", value: counts.med, color: "text-amber-400" },
          { label: "HIGH", value: counts.high, color: "text-rose-400" },
          { label: "THROTTLED", value: counts.throttled, color: "text-rose-300" },
        ].map((c) => (
          <div key={c.label} className="glass-panel p-4">
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#676a79] mb-1">
              {c.label}
            </p>
            <p className={`font-mono text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#676a79]">
            REQUEST LOG
          </span>
          <span className="text-[11px] font-mono text-[#676a79]">
            {filtered.length} / {rows.length} ROWS
          </span>
        </div>
        <TelemetryTable rows={filtered} />
      </div>
    </div>
  );
}
