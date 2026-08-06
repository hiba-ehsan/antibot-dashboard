"use client";

import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number; // 0.0 - 1.0
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const clamped = Math.min(Math.max(score, 0), 1);
  const pct = clamped * 100;

  const color =
    clamped < 0.35 ? "#10B981" : clamped < 0.65 ? "#F59E0B" : "#F43F5E";

  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const label = clamped < 0.35 ? "LOW" : clamped < 0.65 ? "MEDIUM" : "HIGH";

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="relative w-[220px] h-[220px]">
        {/* Ambient radial glow that scales with risk */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          animate={{
            opacity: 0.18 + clamped * 0.5,
            boxShadow: `0 0 ${60 + pct * 4}px ${color}`,
          }}
          transition={{ duration: 0.8 }}
          style={{ background: color }}
        />

        <svg viewBox="0 0 220 220" className="relative w-full h-full -rotate-90">
          {/* Track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="14"
          />
          {/* Arc */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
          {/* Tick marks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = 110 + Math.cos(a) * (radius + 12);
            const y1 = 110 + Math.sin(a) * (radius + 12);
            const x2 = 110 + Math.cos(a) * (radius + 18);
            const y2 = 110 + Math.sin(a) * (radius + 18);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(pct)}
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-5xl font-bold text-white"
            style={{ textShadow: `0 0 20px ${color}66` }}
          >
            {Math.round(pct)}
          </motion.span>
          <span className="text-[10px] font-semibold tracking-[0.3em] text-slate-500 mt-1">
            / 100
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span
          className="font-mono text-xs font-semibold tracking-[0.25em]"
          style={{ color, textShadow: `0 0 10px ${color}66` }}
        >
          {label} RISK
        </span>
      </div>
    </div>
  );
}
