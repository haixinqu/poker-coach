"use client";

import { useState } from "react";

interface SessionRow {
  id: number;
  raw_input: string;
  result_amount: number | null;
  stakes: string | null;
  location: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export default function SessionHistory({
  sessions,
  loading,
  onDelete,
}: {
  sessions: SessionRow[];
  loading: boolean;
  onDelete: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState<number | null>(null);
  const [confirm,  setConfirm]  = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      onDelete(id);
    } finally {
      setDeleting(null);
      setConfirm(null);
    }
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginTop: "1.5rem" }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 14 }} />)}
    </div>
  );

  if (sessions.length === 0) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.875rem" }}>
        Past Sessions · {sessions.length} total
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
        {sessions.map((s, i) => {
          const res     = s.result_amount;
          const isPos   = res !== null && res >= 0;
          const accent  = res === null ? "rgba(255,255,255,0.12)" : isPos ? "var(--green)" : "var(--red)";
          const dateStr = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          const hrs     = s.duration_minutes != null ? (s.duration_minutes / 60).toFixed(1) : null;
          const hrRate  = res != null && s.duration_minutes != null && s.duration_minutes > 0
            ? Math.round(res / (s.duration_minutes / 60))
            : null;

          return (
            <div
              key={s.id}
              className="glass animate-fade-up"
              style={{
                padding: "1rem 1.25rem",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                animationDelay: `${i * 35}ms`,
                borderLeft: `3px solid ${accent}`,
                boxShadow: res !== null ? `inset 0 0 20px ${isPos ? "rgba(22,199,132,0.03)" : "rgba(248,113,113,0.03)"}` : undefined,
              }}
            >
              {/* Left: info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                  {s.location && (
                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
                      {s.location}
                    </span>
                  )}
                  {s.stakes && (
                    <span style={{ fontSize: "0.72rem", padding: "0.15rem 0.5rem", borderRadius: 6, background: "rgba(255,255,255,0.07)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                      {s.stakes}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>{dateStr}</span>
                  {hrs && <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>· {hrs}h</span>}
                  {hrRate !== null && (
                    <span style={{ fontSize: "0.72rem", color: hrRate >= 0 ? "rgba(22,199,132,0.7)" : "rgba(248,113,113,0.7)" }}>
                      · {hrRate >= 0 ? "+" : ""}${hrRate}/hr
                    </span>
                  )}
                </div>
              </div>

              {/* Right: result + delete */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                {res !== null && (
                  <span style={{
                    fontSize: "1.05rem", fontWeight: 800, color: accent,
                    textShadow: `0 0 12px ${isPos ? "rgba(22,199,132,0.35)" : "rgba(248,113,113,0.35)"}`,
                  }}>
                    {isPos ? "+" : ""}${Math.round(res).toLocaleString()}
                  </span>
                )}

                {confirm === s.id ? (
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deleting === s.id}
                      style={{ padding: "0.3rem 0.65rem", borderRadius: 7, fontSize: "0.75rem", fontWeight: 600, background: "rgba(248,113,113,0.15)", color: "var(--red)", border: "1px solid rgba(248,113,113,0.25)", cursor: "pointer" }}
                    >
                      {deleting === s.id ? "…" : "Yes"}
                    </button>
                    <button
                      onClick={() => setConfirm(null)}
                      style={{ padding: "0.3rem 0.65rem", borderRadius: 7, fontSize: "0.75rem", background: "rgba(255,255,255,0.06)", color: "var(--text-3)", border: "1px solid var(--border)", cursor: "pointer" }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirm(s.id)}
                    style={{
                      width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "transparent", border: "1px solid transparent", cursor: "pointer",
                      color: "var(--text-3)", fontSize: "0.8rem", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)"; e.currentTarget.style.color = "var(--red)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
                    title="Delete session"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
