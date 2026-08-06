"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";

export interface JitterPoint {
  time: string;
  deltaMs: number;
  risk: number;
}

interface JitterChartProps {
  data: JitterPoint[];
}

function GlassTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A]/95 border border-[#1E293B] rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
      <p className="font-mono text-xs text-[#94A3B8] mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: p.color ?? "#6366F1",
              boxShadow: `0 0 6px ${p.color ?? "#6366F1"}`,
            }}
          />
          <span className="text-[#F8FAFC]">{p.name}:</span>
          <span className="font-mono text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function JitterChart({ data }: JitterChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="deltaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="rgba(148,163,184,0.15)"
          strokeDasharray="4 6"
          vertical={false}
        />
        <XAxis
          dataKey="time"
          stroke="rgba(148,163,184,0.5)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(148,163,184,0.5)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}`}
          width={48}
        />
        <Tooltip content={<GlassTooltip />} cursor={{ stroke: "rgba(99,102,241,0.3)" }} />
        <ReferenceLine
          y={1500}
          stroke="#94A3B8"
          strokeOpacity={0.4}
          strokeDasharray="6 4"
          label={{
            value: "HUMAN FLOOR 1500ms",
            fill: "#94A3B8",
            fontSize: 9,
            position: "insideTopRight",
            fontFamily: "monospace",
          }}
        />
        <Area
          type="monotone"
          dataKey="deltaMs"
          name="Delay"
          stroke="#6366F1"
          strokeWidth={2}
          fill="url(#deltaFill)"
          dot={false}
          activeDot={{
            r: 4,
            fill: "#F8FAFC",
            stroke: "#F8FAFC",
            strokeWidth: 1,
          }}
        />
        <Line
          type="monotone"
          dataKey="risk"
          name="Risk x100"
          stroke="#F59E0B"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={{ r: 3, fill: "#F59E0B" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
