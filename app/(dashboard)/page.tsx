"use client";

import { motion } from "framer-motion";
import RiskGauge from "@/components/RiskGauge";
import JitterChart, { type JitterPoint } from "@/components/JitterChart";
import TelemetryTable, { type TelemetryRow } from "@/components/TelemetryTable";
import TiltCard from "@/components/TiltCard";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { useTelemetry } from "@/lib/telemetry";
import { Activity, ShieldAlert, Crosshair, Wifi } from "lucide-react";

function toChartPoint(row: TelemetryRow): JitterPoint {
  return {
    time: new Date(row.timestamp_epoch_ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    deltaMs: row.delta_ms,
    risk: Math.round(row.risk_score * 100),
  };
}

const stagger = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 * i, duration: 0.5, ease: "easeOut" as const },
  }),
};

interface MetricTileProps {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  index: number;
}

function MetricTile({ label, value, unit, sub, icon, accent, index }: MetricTileProps) {
  return (
    <motion.div
      custom={index}
      variants={stagger}
      initial="hidden"
      animate="show"
      className="glass-panel hover:border-[#ceced7]/40 hover:shadow-[0_0_15px_rgba(206,206,215,0.15)] transition-all duration-500 p-4 relative overflow-hidden"
    >
      {accent && (
        <div
          aria-hidden
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.15 }}
        />
      )}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-slate-400">
          {label}
        </span>
        <span className="text-slate-500">{icon}</span>
      </div>
      <div className="font-mono text-3xl font-bold text-slate-100 leading-none drop-shadow-sm">
        {value}
        {unit && <span className="text-base text-slate-500 font-normal ml-1">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
    </motion.div>
  );
}

export default function OverviewPage() {
  const { rows } = useTelemetry(50);

  const latestRisk = rows.length > 0 ? rows[0].risk_score : 0;
  const throttled = rows.filter((r) => r.is_throttled).length;
  const avgDelay =
    rows.length > 0
      ? Math.round(rows.reduce((sum, r) => sum + (r.delta_ms || 0), 0) / rows.length)
      : 0;
  const avgOsint =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, r) => sum + (r.proxy_abuse_score || 0), 0) / rows.length,
        )
      : 0;

  return (
    <div className="max-w-[1200px]">
      <div className="relative mb-12 overflow-hidden rounded-[30px] border border-[#2a2d33]">
        <AnimatedGradient
          config={{
            preset: "custom",
            color1: "#050d05",
            color2: "#0a2419",
            color3: "#03c567",
            rotation: -45,
            proportion: 55,
            scale: 0.6,
            speed: 20,
            distortion: 45,
            swirl: 90,
            swirlIterations: 12,
            softness: 100,
            offset: 200,
            shape: "Edge",
            shapeSize: 50,
          }}
          radius="30px"
          noise={{ opacity: 0.05 }}
        />
        <div className="relative z-10 border-b border-[rgba(255,255,255,0.05)] px-6 sm:px-10 py-10 sm:py-14">
          <p className="font-mono text-[10px] tracking-[0.4em] text-[#E8E9EE] mb-3 drop-shadow-[0_0_10px_rgba(206,206,215,0.5)]">
            [ 01 ] SYSTEM OVERVIEW
          </p>
          <h1 className="font-[var(--font-pixel)] silver-text text-xl sm:text-3xl lg:text-4xl tracking-normal leading-relaxed">
            LIVE ANTI-BOT OPERATIONS
          </h1>
          <p className="text-sm font-mono text-[#9BA0B0] mt-4 max-w-lg leading-relaxed">
            ML ISOLATIONFOREST // ABUSEIPDB OSINT // ADAPTIVE THROTTLING
          </p>
        </div>
      </div>

      {/* HUD: gauge + metric tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <motion.div
          custom={0}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="lg:col-span-5"
        >
          <TiltCard maxTilt={5}>
            <div className="glass-panel p-5 h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-semibold tracking-[0.4em] text-[#888888] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#888888]" />
                  CURRENT RISK LEVEL
                </span>
              </div>
              <RiskGauge score={latestRisk} />
            </div>
          </TiltCard>
        </motion.div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricTile
            index={1}
            label="RECENT REQUESTS"
            value={String(rows.length)}
            sub="last 50 requests"
            icon={<Wifi className="w-4 h-4" />}
          />
          <MetricTile
            index={2}
            label="THROTTLED"
            value={String(throttled)}
            sub="requests with delays"
            accent="rgba(244,63,94,0.6)"
            icon={<ShieldAlert className="w-4 h-4" />}
          />
          <MetricTile
            index={3}
            label="AVG TIMING"
            value={String(avgDelay)}
            unit="ms"
            sub="average gap between requests"
            accent="rgba(245,158,11,0.5)"
            icon={<Activity className="w-4 h-4" />}
          />
          <MetricTile
            index={4}
            label="ABUSE REPORTS"
            value={String(avgOsint)}
            unit="/100"
            sub="avg abuse score from AbuseIPDB"
            accent="rgba(16,185,129,0.5)"
            icon={<Crosshair className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Chart */}
      <motion.div
        custom={5}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="glass-panel p-5 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-semibold tracking-[0.4em] text-[#888888]">
            TIMING JITTER & RISK TREND
          </span>
          <span className="inline-flex items-center gap-2 text-[11px] font-mono text-[#888888]">
            <span className="w-4 h-[2px] bg-white inline-block drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" /> DELTA MS
            <span className="w-4 h-[2px] bg-[#FEE440] inline-block drop-shadow-[0_0_5px_rgba(254,228,64,0.8)]" /> RISK
          </span>
        </div>
        <JitterChart data={[...rows].reverse().map(toChartPoint)} />
      </motion.div>

      {/* Table */}
      <motion.div
        custom={6}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="glass-panel p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-slate-400">
            LIVE REQUEST LOG
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {rows.length > 0 ? `${rows.length} ROWS` : "0 ROWS"}
          </span>
        </div>
        <TelemetryTable rows={rows} />
      </motion.div>
    </div>
  );
}
