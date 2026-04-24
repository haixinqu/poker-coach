"use client";

import { useState, useCallback } from "react";
import SessionInput from "@/components/SessionInput";
import SessionHistory from "@/components/SessionHistory";
import Toast from "@/components/Toast";

export default function SessionsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const handleLogged = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setToast("Session logged successfully");
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: "var(--text)" }}
          >
            Sessions
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Log a session in plain English — we&apos;ll parse it automatically.
          </p>
        </div>
        <SessionInput onLogged={handleLogged} />
        <SessionHistory refreshKey={refreshKey} />
      </div>
      {toast && (
        <Toast message={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
