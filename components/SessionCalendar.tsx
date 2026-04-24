"use client";

import { useMemo, useState } from "react";

interface SessionRow {
  result_amount: number | null;
  created_at: string;
}

const DAYS  = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getColor(result: number, maxAbs: number): string {
  if (maxAbs === 0) return "rgba(255,255,255,0.06)";
  const intensity = Math.min(Math.abs(result) / maxAbs, 1);
  if (result > 0) {
    const op = 0.2 + intensity * 0.75;
    return `rgba(22,199,132,${op.toFixed(2)})`;
  }
  const op = 0.2 + intensity * 0.65;
  return `rgba(248,113,113,${op.toFixed(2)})`;
}

function getGlow(result: number, maxAbs: number): string | undefined {
  if (maxAbs === 0 || Math.abs(result) < maxAbs * 0.5) return undefined;
  return result > 0
    ? "0 0 6px rgba(22,199,132,0.6)"
    : "0 0 6px rgba(248,113,113,0.6)";
}

export default function SessionCalendar({ sessions }: { sessions: SessionRow[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; result: number; count: number } | null>(null);

  const { weeks, monthLabels, dayMap, maxAbs } = useMemo(() => {
    // Build date → aggregate map
    const dayMap: Record<string, { total: number; count: number }> = {};
    sessions.forEach(s => {
      const d = s.created_at.slice(0, 10);
      if (!dayMap[d]) dayMap[d] = { total: 0, count: 0 };
      dayMap[d].total += s.result_amount ?? 0;
      dayMap[d].count++;
    });
    const maxAbs = Math.max(...Object.values(dayMap).map(v => Math.abs(v.total)), 1);

    // Build 52-week grid (Mon–Sun columns)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find the most recent Sunday
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()) % 7);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 52 * 7 + 1);

    const weeks: Date[][] = [];
    const cur = new Date(startDate);
    while (cur <= endDate) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }

    // Month labels: first week of each month
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const month = week[0].getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], col: i });
        lastMonth = month;
      }
    });

    return { weeks, monthLabels, dayMap, maxAbs };
  }, [sessions]);

  const CELL = 13;
  const GAP  = 3;
  const totalW = weeks.length * (CELL + GAP);

  return (
    <div className="glass" style={{ padding: "1.5rem 2rem", position: "relative", overflow: "hidden" }}>
      <div className="scan-beam" />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.25rem" }}>Session Calendar</p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>Last 52 weeks</p>
        </div>
        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "var(--text-3)" }}>
          <span>Loss</span>
          {[0.25, 0.5, 0.8].map(op => <div key={op} style={{ width: CELL, height: CELL, borderRadius: 3, background: `rgba(248,113,113,${op})` }} />)}
          <div style={{ width: CELL, height: CELL, borderRadius: 3, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
          {[0.25, 0.5, 0.8].map(op => <div key={op} style={{ width: CELL, height: CELL, borderRadius: 3, background: `rgba(22,199,132,${op})` }} />)}
          <span>Win</span>
        </div>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
        <div style={{ position: "relative" }}>
          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: 24, marginBottom: 4, height: 16, position: "relative", width: totalW }}>
            {monthLabels.map(({ label, col }) => (
              <span key={`${label}-${col}`} style={{
                position: "absolute",
                left: col * (CELL + GAP),
                fontSize: "0.65rem",
                color: "var(--text-3)",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 0 }}>
            {/* Day labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 4, justifyContent: "flex-start" }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ width: 16, height: CELL, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  {(i % 2 === 0) && <span style={{ fontSize: "0.6rem", color: "var(--text-3)" }}>{d}</span>}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div style={{ display: "flex", gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {week.map((day, di) => {
                    const dateStr = day.toISOString().slice(0, 10);
                    const entry   = dayMap[dateStr];
                    const isFuture = day > new Date();
                    const color   = entry ? getColor(entry.total, maxAbs) : "rgba(255,255,255,0.04)";
                    const glow    = entry ? getGlow(entry.total, maxAbs) : undefined;

                    return (
                      <div
                        key={di}
                        onMouseEnter={() => entry && setTooltip({ date: dateStr, result: entry.total, count: entry.count })}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: CELL, height: CELL,
                          borderRadius: 3,
                          background: isFuture ? "transparent" : color,
                          border: entry ? "none" : "1px solid rgba(255,255,255,0.05)",
                          boxShadow: glow,
                          cursor: entry ? "pointer" : "default",
                          transition: "box-shadow 0.15s, transform 0.15s",
                          transform: tooltip?.date === dateStr ? "scale(1.4)" : "none",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute", bottom: "1rem", right: "1.5rem",
            background: "rgba(5,5,9,0.95)", backdropFilter: "blur(12px)",
            border: "1px solid var(--border-bright)", borderRadius: 10,
            padding: "0.5rem 0.875rem", fontSize: "0.8rem", pointerEvents: "none",
          }}
        >
          <span style={{ color: "var(--text-3)" }}>{tooltip.date}  </span>
          <span style={{ color: tooltip.result >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
            {tooltip.result >= 0 ? "+" : ""}${Math.round(tooltip.result).toLocaleString()}
          </span>
          {tooltip.count > 1 && <span style={{ color: "var(--text-3)" }}> ({tooltip.count} sessions)</span>}
        </div>
      )}
    </div>
  );
}
