"use client";

import { useEffect, useState } from "react";

interface SessionPoint {
  label: string;
  cumulative: number;
  result: number;
  stakes: string;
}

export default function ProfitChart() {
  const [data, setData]       = useState<SessionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => setData(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const hasData   = data.length > 0;
  const points    = hasData ? data : [{ label: "S1", cumulative: 0, result: 0, stakes: "" }];
  const latest    = points[points.length - 1].cumulative;
  const isPositive = latest >= 0;
  const max       = Math.max(...points.map((d) => d.cumulative), 0);
  const min       = Math.min(...points.map((d) => d.cumulative), 0);
  const range     = max - min || 1;

  const W = 560; const H = 140; const padX = 8; const padY = 14;

  const toX = (i: number) => padX + (i / Math.max(points.length - 1, 1)) * (W - padX * 2);
  const toY = (v: number) => padY + ((max - v) / range) * (H - padY * 2);

  const fillPath =
    `M${toX(0)},${toY(points[0].cumulative)} ` +
    points.slice(1).map((d, i) => `L${toX(i + 1)},${toY(d.cumulative)}`).join(" ") +
    ` L${toX(points.length - 1)},${H} L${toX(0)},${H} Z`;

  const linePath =
    `M${toX(0)},${toY(points[0].cumulative)}` +
    points.slice(1).map((d, i) => ` L${toX(i + 1)},${toY(d.cumulative)}`).join("");

  const accent = isPositive ? "#16c784" : "#f87171";

  const totalSessions = data.length;
  const wins          = data.filter((d) => d.result > 0).length;
  const best          = hasData ? Math.max(...data.map((d) => d.cumulative)) : 0;
  const hoveredPoint  = hovered !== null ? points[hovered] : null;

  return (
    <div
      className="card rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ fontSize: "0.62rem", color: "var(--text-3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Cumulative Profit
          </p>
          {loading ? (
            <div className="skeleton h-8 w-24 rounded-lg" />
          ) : (
            <p className="text-3xl font-bold tabular-nums" style={{ color: isPositive ? "var(--green)" : "var(--red)" }}>
              {hasData ? `${isPositive ? "+" : ""}$${latest.toLocaleString()}` : "—"}
            </p>
          )}
        </div>
        <div className="flex gap-6 text-right">
          <Stat label="Sessions" value={loading ? "—" : String(totalSessions)} />
          <Stat label="Win rate" value={loading || totalSessions === 0 ? "—" : `${Math.round((wins / totalSessions) * 100)}%`} />
          <Stat label="Best"     value={loading || !hasData ? "—" : `+$${best.toLocaleString()}`} />
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pt-4 pb-2 relative">
        {!loading && !hasData ? (
          <div className="flex items-center justify-center" style={{ height: 140 }}>
            <p style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>
              No sessions logged yet — add one in the Sessions tab.
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: 140, overflow: "visible" }}
              onMouseLeave={() => setHovered(null)}
            >
              <defs>
                <linearGradient id="fill-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={accent} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </linearGradient>
                <filter id="line-glow">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Zero line */}
              {min < 0 && (
                <line x1={padX} y1={toY(0)} x2={W - padX} y2={toY(0)}
                  stroke="var(--border-bright)" strokeWidth="1" strokeDasharray="4 4" />
              )}

              {/* Fill */}
              <path d={fillPath} fill="url(#fill-grad)" />

              {/* Glow line (blurred copy) */}
              <path d={linePath} fill="none" stroke={accent} strokeWidth="3" strokeOpacity="0.3"
                strokeLinejoin="round" strokeLinecap="round"
                style={{ filter: `blur(4px)` }} />

              {/* Main line */}
              <path d={linePath} fill="none" stroke={accent} strokeWidth="1.8"
                strokeLinejoin="round" strokeLinecap="round" />

              {/* Data points */}
              {points.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={toX(i)} cy={toY(d.cumulative)} r="14"
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHovered(i)}
                  />
                  <circle
                    cx={toX(i)} cy={toY(d.cumulative)}
                    r={hovered === i ? 5 : 3}
                    fill={hovered === i ? "#fff" : accent}
                    stroke={hovered === i ? accent : "var(--surface)"}
                    strokeWidth={hovered === i ? 2 : 1.5}
                    style={{ transition: "r 0.15s, fill 0.15s", filter: hovered === i ? `drop-shadow(0 0 6px ${accent})` : "none" }}
                  />
                </g>
              ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute text-xs px-3 py-2 rounded-xl pointer-events-none animate-fade-in"
                style={{
                  background: "var(--surface-3)",
                  border: "1px solid var(--border-bright)",
                  top: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                <span style={{ color: "var(--text-3)" }}>{hoveredPoint.label} · </span>
                <span style={{ color: hoveredPoint.result >= 0 ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                  {hoveredPoint.result >= 0 ? "+" : ""}${hoveredPoint.result.toLocaleString()}
                </span>
                {hoveredPoint.stakes && (
                  <span style={{ color: "var(--text-3)" }}> · {hoveredPoint.stakes}</span>
                )}
              </div>
            )}

            <div className="flex justify-between mt-1.5 px-1">
              {points.map((d) => (
                <span key={d.label} style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>
                  {d.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="px-6 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
          {hasData ? `${totalSessions} session${totalSessions > 1 ? "s" : ""} logged` : "Log sessions to track bankroll"}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.62rem", color: "var(--text-3)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>{value}</p>
    </div>
  );
}
