"use client";

import { useMemo, useState } from "react";

interface SessionRow {
  result_amount: number | null;
  created_at: string;
}

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function MonthlyChart({ sessions }: { sessions: SessionRow[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const { months, bars } = useMemo(() => {
    const now = new Date();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const map: Record<string, number> = {};
    sessions.forEach(s => {
      const key = s.created_at.slice(0, 7);
      map[key] = (map[key] ?? 0) + (s.result_amount ?? 0);
    });

    const values = months.map(m => Math.round(map[m] ?? 0));
    const maxAbs = Math.max(...values.map(Math.abs), 1);
    const bars   = values.map(v => ({ value: v, height: Math.abs(v) / maxAbs }));

    return { months, bars };
  }, [sessions]);

  const W = 100; const H = 120; const barW = 6; const gap = (W - 12 * barW) / 11;

  const hasData = bars.some(b => b.value !== 0);

  return (
    <div className="glass" style={{ padding: "1.5rem 2rem", position: "relative", overflow: "hidden" }}>
      <div className="scan-beam" />

      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.25rem" }}>Monthly P&L</p>
        <p style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>Last 12 months</p>
      </div>

      {!hasData ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>No data yet — log some sessions.</p>
        </div>
      ) : (
        <>
          <div style={{ position: "relative", height: 160, overflowX: "auto" }}>
            {/* Hovered tooltip */}
            {hovered !== null && bars[hovered].value !== 0 && (
              <div
                className="animate-fade-in"
                style={{
                  position: "absolute", top: 0,
                  left: "50%", transform: "translateX(-50%)",
                  background: "rgba(5,5,9,0.95)", backdropFilter: "blur(12px)",
                  border: "1px solid var(--border-bright)", borderRadius: 10,
                  padding: "0.35rem 0.75rem", fontSize: "0.8rem",
                  whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none",
                }}
              >
                <span style={{ color: "var(--text-3)" }}>{MONTH_LABELS[parseInt(months[hovered].slice(5)) - 1]} · </span>
                <span style={{ color: bars[hovered].value >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                  {bars[hovered].value >= 0 ? "+" : ""}${bars[hovered].value.toLocaleString()}
                </span>
              </div>
            )}

            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 160, display: "block", overflow: "visible" }}>
              {/* Zero line */}
              <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2 2" />

              {bars.map((bar, i) => {
                const x     = i * (barW + gap);
                const mid   = H / 2;
                const bh    = bar.height * (H / 2 - 8);
                const isPos = bar.value >= 0;
                const color = isPos ? "#16c784" : "#f87171";
                const glow  = hovered === i && bar.value !== 0
                  ? `drop-shadow(0 0 4px ${color})`
                  : undefined;
                const rectY = isPos ? mid - bh : mid;

                return (
                  <g key={i}>
                    <rect
                      x={x} y={0} width={barW + gap} height={H}
                      fill="transparent"
                      style={{ cursor: bar.value !== 0 ? "pointer" : "default" }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {bar.value !== 0 && (
                      <rect
                        x={x + (gap / 2)} y={rectY} width={barW}
                        height={Math.max(bh, 2)}
                        rx={2}
                        fill={color}
                        fillOpacity={hovered === i ? 1 : 0.7}
                        style={{ filter: glow, transition: "fill-opacity 0.15s" }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Month labels */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
            {months.map((m, i) => (
              <span key={m} style={{
                fontSize: "0.6rem",
                color: hovered === i ? "var(--text-2)" : "var(--text-3)",
                flex: 1, textAlign: "center",
                transition: "color 0.15s",
              }}>
                {MONTH_LABELS[parseInt(m.slice(5)) - 1]}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
