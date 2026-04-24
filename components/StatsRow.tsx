"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalHands: number;
  totalSessions: number;
  totalProfit: number;
  winSessions: number;
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex-1"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: color ?? "var(--text)" }}
      >
        {value}
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
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const profit = stats?.totalProfit ?? 0;
  const winRate =
    stats && stats.totalSessions > 0
      ? Math.round((stats.winSessions / stats.totalSessions) * 100)
      : null;

  return (
    <div className="flex gap-3 flex-wrap">
      <StatCard
        label="Total Profit"
        value={
          stats == null
            ? "—"
            : `${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}`
        }
        color={
          stats == null
            ? "var(--text)"
            : profit >= 0
              ? "var(--green)"
              : "#f87171"
        }
        sub={
          stats
            ? `${stats.totalSessions} session${stats.totalSessions !== 1 ? "s" : ""}`
            : undefined
        }
      />
      <StatCard
        label="Win Rate"
        value={winRate != null ? `${winRate}%` : "—"}
        sub={
          stats
            ? `${stats.winSessions} winning sessions`
            : undefined
        }
      />
      <StatCard
        label="Hands Reviewed"
        value={stats == null ? "—" : String(stats.totalHands)}
        sub="with AI coach feedback"
      />
    </div>
  );
}
