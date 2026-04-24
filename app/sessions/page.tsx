"use client";

import { useState, useEffect, useCallback } from "react";
import SessionInput from "@/components/SessionInput";
import SessionHistory from "@/components/SessionHistory";
import SessionCalendar from "@/components/SessionCalendar";
import SessionStatsPanel from "@/components/SessionStatsPanel";
import MonthlyChart from "@/components/MonthlyChart";
import Toast from "@/components/Toast";

interface SessionRow {
  id: number;
  raw_input: string;
  result_amount: number | null;
  stakes: string | null;
  location: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/sessions?view=list");
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleLogged = useCallback(() => {
    fetchSessions();
    setToast("Session logged ✓");
  }, [fetchSessions]);

  const handleDelete = useCallback((id: number) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setToast("Session deleted");
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>

        {/* Hero heading */}
        <div className="animate-fade-up" style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "0.75rem" }}>
            <span className="gradient-text">Sessions</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-2)" }}>
            Track every session. Know your edge.
          </p>
        </div>

        {/* Session input */}
        <div className="animate-fade-up" style={{ marginBottom: "2.5rem", animationDelay: "0.04s" }}>
          <SessionInput onLogged={handleLogged} />
        </div>

        {/* Stats panel - only show if there's data */}
        {sessions.length > 0 && (
          <div className="animate-fade-up" style={{ marginBottom: "1.5rem", animationDelay: "0.08s" }}>
            <SessionStatsPanel sessions={sessions} />
          </div>
        )}

        {/* Calendar heatmap */}
        {sessions.length > 0 && (
          <div className="animate-fade-up" style={{ marginBottom: "1.5rem", animationDelay: "0.12s" }}>
            <SessionCalendar sessions={sessions} />
          </div>
        )}

        {/* Monthly P&L chart */}
        {sessions.length > 0 && (
          <div className="animate-fade-up" style={{ marginBottom: "1.5rem", animationDelay: "0.16s" }}>
            <MonthlyChart sessions={sessions} />
          </div>
        )}

        {/* Session history list */}
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <SessionHistory
            sessions={sessions}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
