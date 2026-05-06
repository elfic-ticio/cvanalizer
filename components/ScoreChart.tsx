"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ChartPoint {
  date: string;
  score: number;
  jobTitle: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { value, payload: data } = payload[0];
  return (
    <div className="bg-surface border border-border px-3 py-2">
      <p className="font-mono text-2xs text-accent">{value}/100</p>
      <p className="font-mono text-2xs text-muted truncate max-w-32">
        {data.jobTitle}
      </p>
    </div>
  );
}

export function ScoreChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -24 }}>
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b6b6b", fontSize: 10, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#6b6b6b", fontSize: 10, fontFamily: "DM Mono" }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#2a2a2a" }} />
        <ReferenceLine y={75} stroke="#1f1f1f" strokeDasharray="4 4" />
        <ReferenceLine y={50} stroke="#1f1f1f" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#c8f060"
          strokeWidth={2}
          dot={{ fill: "#c8f060", r: 3, strokeWidth: 0 }}
          activeDot={{ fill: "#c8f060", r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
