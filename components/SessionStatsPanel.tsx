"use client";

import { useEffect, useRef, useState } from "react";

interface SessionRow {
  id: number;
  result_amount: number | null;
  duration_minutes: number | null;
  created_at: string;
}

function useCountUp(target: number | null, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (target === null) return;
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

function computeStats(sessions: SessionRow[]) {
  if (sessions.length === 0) return null;

  const results = sessions.map(s => s.result_amount ?? 0);
  const totalProfit = results.reduce((a, b) => a + b, 0);

  const withDuration = sessions.filter(s => s.duration_minutes != null);
  const totalMinutes = withDuration.reduce((a, s) => a + (s.duration_minutes ?? 0), 0);
  const totalHours = totalMinutes / 60;
  const profitWithDuration = withDuration.reduce((a, s) => a + (s.result_amount ?? 0), 0);
  const hourlyRate = totalHours > 0 ? profitWithDuration / totalHours : null;

  const best  = Math.max(...results);
  const worst = Math.min(...results);
  const avg   = totalProfit / sessions.length;

  // Current streak
  const sorted = [...sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  let streak = 0;
  let streakType: "W" | "L" | null = null;
  for (const s of sorted) {
    const r = s.result_amount ?? 0;
    const type = r >= 0 ? "W" : "L";
    if (streakType === null) { streakType = type; streak = 1; }
    else if (type === streakType) streak++;
    else break;
  }

  return { totalProfit, totalHours, hourlyRate, best, worst, avg, streak, streakType };
}

function StatTile({
  label, value, sub, color, glow,
}: { label: string; value: string; sub?: string; color?: string; glow?: string }) {
  return (
    <div
      className="glass card-3d"
      style={{ padding: "1.5rem", position: "relative", overflow: "hidden", flex: 1, minWidth: 0 }}
    >
      <div className="scan-beam" />
      <p style={{ fontSize: "0.62rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>
        {label}
      </p>
      <p style={{
        fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.03em",
        color: color ?? "var(--text)",
        textShadow: glow ? `0 0 20px ${glow}` : undefined,
      }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "0.3rem" }}>{sub}</p>}
    </div>
  );
}

export default function SessionStatsPanel({ sessions }: { sessions: SessionRow[] }) {
  const stats = computeStats(sessions);

  const hourlyTarget  = stats?.hourlyRate != null ? Math.round(Math.abs(stats.hourlyRate)) : null;
  const hoursTarget   = stats ? Math.round(stats.totalHours * 10) / 10 : null;
  const avgTarget     = stats ? Math.round(Math.abs(stats.avg)) : null;
  const bestTarget    = stats ? Math.round(stats.best) : null;

  const hourlyCount   = useCountUp(hourlyTarget);
  const avgCount      = useCountUp(avgTarget);
  const bestCount     = useCountUp(bestTarget);

  if (!stats) return null;

  const hrSign  = (stats.hourlyRate ?? 0) >= 0 ? "+" : "-";
  const avgSign = stats.avg >= 0 ? "+" : "-";
  const streakLabel = stats.streakType === "W" ? `${stats.streak} Win` : `${stats.streak} Loss`;
  const streakColor = stats.streakType === "W" ? "var(--green)" : "var(--red)";
  const streakGlow  = stats.streakType === "W" ? "rgba(22,199,132,0.5)" : "rgba(248,113,113,0.5)";

  return (
    <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
      <StatTile
        label="Hourly Rate"
        value={stats.hourlyRate != null ? `${hrSign}$${hourlyCount}/hr` : "—"}
        sub={hoursTarget != null ? `${hoursTarget}h total played` : undefined}
        color={stats.hourlyRate != null && stats.hourlyRate >= 0 ? "var(--green)" : "var(--red)"}
        glow={stats.hourlyRate != null && stats.hourlyRate >= 0 ? "rgba(22,199,132,0.5)" : "rgba(248,113,113,0.5)"}
      />
      <StatTile
        label="Avg Session"
        value={`${avgSign}$${avgCount}`}
        sub={`over ${sessions.length} sessions`}
        color={stats.avg >= 0 ? "var(--green)" : "var(--red)"}
      />
      <StatTile
        label="Best Session"
        value={`+$${bestCount}`}
        color="var(--green)"
        glow="rgba(22,199,132,0.4)"
      />
      <StatTile
        label="Current Streak"
        value={streakLabel}
        sub={stats.streakType === "W" ? "keep it up 🔥" : "time to analyze"}
        color={streakColor}
        glow={streakGlow}
      />
    </div>
  );
}
