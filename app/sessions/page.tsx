"use client";

import { useState, useCallback } from "react";
import SessionInput from "@/components/SessionInput";
import SessionHistory from "@/components/SessionHistory";
import Toast from "@/components/Toast";

export default function SessionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const handleLogged = useCallback(() => {
    setRefreshKey(k => k + 1);
    setToast("Session logged successfully");
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3.5rem 1.5rem 4rem" }}>

        <div className="animate-fade-up" style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "0.75rem" }}>
            <span className="gradient-text">Sessions</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-2)" }}>
            Log a session in plain English — we&apos;ll parse it automatically.
          </p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <SessionInput onLogged={handleLogged} />
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <SessionHistory refreshKey={refreshKey} />
        </div>

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
