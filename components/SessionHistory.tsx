"use client";

import { useEffect, useState } from "react";

interface SessionRow {
  id: number;
  raw_input: string;
  result_amount: number | null;
  stakes: string | null;
  location: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export default function SessionHistory({ refreshKey }: { refreshKey: number }) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/sessions?view=list")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return (
    <div className="space-y-2 mt-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-16 rounded-xl" />
      ))}
    </div>
  );

  if (sessions.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
        Past Sessions
      </p>
      <div className="space-y-2">
        {sessions.map((s, i) => {
          const result = s.result_amount;
          const isPos  = result !== null && result >= 0;
          const accentColor = result === null ? "var(--border-bright)" : isPos ? "var(--green)" : "var(--red)";
          const dateStr = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const hrs = s.duration_minutes != null ? `${(s.duration_minutes / 60).toFixed(1)}h` : null;

          return (
            <div
              key={s.id}
              className="card rounded-xl px-4 py-3 flex items-center justify-between animate-slide-up"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1 self-stretch rounded-full"
                  style={{ background: accentColor, minHeight: 32, boxShadow: result !== null ? `0 0 6px ${accentColor}66` : "none" }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    {s.location && (
                      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text)" }}>
                        {s.location}
                      </span>
                    )}
                    {s.stakes && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}
                      >
                        {s.stakes}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>{dateStr}</span>
                    {hrs && <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>· {hrs}</span>}
                  </div>
                </div>
              </div>

              {result !== null && (
                <span className="text-sm font-bold tabular-nums" style={{ color: accentColor }}>
                  {isPos ? "+" : ""}${result.toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
