"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface TelemetryRow {
  id: string;
  target_url: string;
  timestamp_epoch_ms: number;
  delta_ms: number;
  proxy_abuse_score: number;
  risk_score: number;
  applied_delay_sec: number;
  is_throttled: boolean;
}

interface TelemetryTableProps {
  rows: TelemetryRow[];
}

function statusPill(row: TelemetryRow) {
  if (row.is_throttled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 backdrop-blur-md border border-rose-500/30 text-rose-400 glow-crimson">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        429
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-400 glow-emerald">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      200
    </span>
  );
}

function hostOnly(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function TelemetryTable({ rows }: TelemetryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left">
            {["TIME", "TARGET", "TIMING", "ABUSE", "RISK", "STATUS"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-400 border-b border-slate-800"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="relative">
          <AnimatePresence initial={false}>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center text-slate-500"
                >
                  <p className="font-mono text-xs tracking-widest mb-1">
                    WAITING FOR DATA
                  </p>
                  <p className="text-xs text-slate-500">
                    Send a request through the proxy to see it here
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => {
                const time = new Date(
                  row.timestamp_epoch_ms,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  fractionalSecondDigits: 1,
                });
                return (
                  <motion.tr
                    key={row.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      layout: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                      x: { type: "spring", stiffness: 400, damping: 32 },
                      delay: idx > 20 ? 0 : idx * 0.015,
                    }}
                    className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {time}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-200 max-w-[180px] truncate">
                      {hostOnly(row.target_url)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white">
                      {row.delta_ms}
                      <span className="text-slate-500 ml-0.5">ms</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {Math.round(row.proxy_abuse_score)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <span
                        className={
                          row.risk_score >= 0.65
                            ? "text-rose-400 text-glow-crimson"
                            : row.risk_score >= 0.35
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }
                      >
                        {row.risk_score.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        {statusPill(row)}
                        {row.is_throttled && (
                          <span className="font-mono text-[10px] text-slate-500">
                            +{row.applied_delay_sec.toFixed(1)}s
                          </span>
                        )}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
