"use client";

import { useEffect, useState } from "react";

interface SessionPoint {
  label: string;
  cumulative: number;
  result: number;
  stakes: string;
}

const PLACEHOLDER: SessionPoint[] = [
  { label: "S1", cumulative: 0, result: 0, stakes: "" },
];

export default function ProfitChart() {
  const [data, setData] = useState<SessionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => setData(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const points = data.length > 0 ? data : PLACEHOLDER;
  const hasData = data.length > 0;
  const latest = points[points.length - 1].cumulative;
  const isPositive = latest >= 0;
  const max = Math.max(...points.map((d) => d.cumulative), 0);
  const min = Math.min(...points.map((d) => d.cumulative), 0);
  const range = max - min || 1;

  const W = 560;
  const H = 140;
  const padX = 0;
  const padY = 12;

  const toX = (i: number) =>
    padX + (i / Math.max(points.length - 1, 1)) * (W - padX * 2);
  const toY = (v: number) => padY + ((max - v) / range) * (H - padY * 2);

  const polyPoints = points
    .map((d, i) => `${toX(i)},${toY(d.cumulative)}`)
    .join(" ");
  const fillPath =
    `M${toX(0)},${toY(points[0].cumulative)} ` +
    points
      .slice(1)
      .map((d, i) => `L${toX(i + 1)},${toY(d.cumulative)}`)
      .join(" ") +
    ` L${toX(points.length - 1)},${H} L${toX(0)},${H} Z`;

  const accent = isPositive ? "#16c784" : "#f87171";

  const totalSessions = data.length;
  const wins = data.filter((d) => d.result > 0).length;
  const best = data.length > 0 ? Math.max(...data.map((d) => d.cumulative)) : 0;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="px-6 py-5 flex items-start justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p
            style={{
              fontSize: "0.7rem",
              color: "var(--text-3)",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Cumulative Profit
          </p>
          {loading ? (
            <div
              className="h-8 w-24 rounded animate-pulse"
              style={{ background: "var(--surface-2)" }}
            />
          ) : (
            <p
              className="text-3xl font-bold tabular-nums"
              style={{ color: isPositive ? "var(--green)" : "#f87171" }}
            >
              {hasData
                ? `${isPositive ? "+" : ""}$${latest.toLocaleString()}`
                : "—"}
            </p>
          )}
        </div>
        <div className="flex gap-6 text-right">
          <Stat label="Sessions" value={loading ? "—" : String(totalSessions)} />
          <Stat
            label="Win rate"
            value={
              loading || totalSessions === 0
                ? "—"
                : `${Math.round((wins / totalSessions) * 100)}%`
            }
          />
          <Stat
            label="Best"
            value={
              loading || !hasData ? "—" : `+$${best.toLocaleString()}`
            }
          />
        </div>
      </div>

      <div className="px-6 pt-4 pb-2">
        {!loading && !hasData ? (
          <div
            className="flex items-center justify-center"
            style={{ height: 140 }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
              No sessions logged yet — add one in the Sessions tab.
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: 140 }}
            >
              <defs>
                <linearGradient id="fill-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </linearGradient>
              </defs>

              {min < 0 && (
                <line
                  x1={padX}
                  y1={toY(0)}
                  x2={W - padX}
                  y2={toY(0)}
                  stroke="var(--border-bright)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )}

              <path d={fillPath} fill="url(#fill-grad)" />

              <polyline
                points={polyPoints}
                fill="none"
                stroke={accent}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {points.map((d, i) => (
                <circle
                  key={i}
                  cx={toX(i)}
                  cy={toY(d.cumulative)}
                  r="3"
                  fill={accent}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />
              ))}
            </svg>

            <div className="flex justify-between mt-1">
              {points.map((d) => (
                <span
                  key={d.label}
                  style={{ fontSize: "0.65rem", color: "var(--text-3)" }}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div
        className="px-6 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
          {hasData
            ? `${totalSessions} session${totalSessions > 1 ? "s" : ""} logged`
            : "Log sessions to track bankroll"}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.65rem", color: "var(--text-3)", marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
        {value}
      </p>
    </div>
  );
}
