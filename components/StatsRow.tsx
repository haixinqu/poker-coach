"use client";

import { useEffect, useState, useRef } from "react";

interface Stats {
  totalHands: number;
  totalSessions: number;
  totalProfit: number;
  winSessions: number;
}

function useCountUp(target: number | null, duration = 1100) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) return;
    if (target === 0) { setValue(0); return; }

    const start = performance.now();
    const from  = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

function StatCard({
  label,
  value,
  rawValue,
  sub,
  color,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: string;
  rawValue: number | null;
  sub?: string;
  color?: string;
  prefix?: string;
  suffix?: string;
}) {
  const counted = useCountUp(rawValue);
  const display = rawValue === null ? "—" : `${prefix}${counted.toLocaleString()}${suffix}`;

  return (
    <div
      className="card rounded-2xl px-5 py-4 flex-1 cursor-default"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p
        style={{
          fontSize: "0.62rem",
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: color ?? "var(--text)" }}>
        {rawValue !== null ? display : value}
      </p>
      {sub && (
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: 4 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function StatsRow() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, []);

  const profit  = stats?.totalProfit ?? 0;
  const winRate = stats && stats.totalSessions > 0
    ? Math.round((stats.winSessions / stats.totalSessions) * 100)
    : null;

  return (
    <div className="flex gap-3 flex-wrap">
      <StatCard
        label="Total Profit"
        value={stats == null ? "—" : `${profit >= 0 ? "+" : "-"}$${Math.abs(profit).toLocaleString()}`}
        rawValue={stats == null ? null : Math.abs(profit)}
        prefix={stats != null ? (profit >= 0 ? "+$" : "-$") : ""}
        color={stats == null ? "var(--text)" : profit >= 0 ? "var(--green)" : "var(--red)"}
        sub={stats ? `${stats.totalSessions} session${stats.totalSessions !== 1 ? "s" : ""}` : undefined}
      />
      <StatCard
        label="Win Rate"
        value={winRate != null ? `${winRate}%` : "—"}
        rawValue={winRate}
        suffix="%"
        sub={stats ? `${stats.winSessions} winning sessions` : undefined}
      />
      <StatCard
        label="Hands Reviewed"
        value={stats == null ? "—" : String(stats.totalHands)}
        rawValue={stats?.totalHands ?? null}
        sub="with AI coach feedback"
      />
    </div>
  );
}
