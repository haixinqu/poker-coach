"use client";

import { useState, FormEvent } from "react";

interface ParsedSession {
  date?: string;
  location?: string;
  stakes?: string;
  gameType?: string;
  durationMinutes?: number;
  resultAmount?: number;
  notes?: string;
  missingFields: string[];
}

export default function SessionInput({ onLogged }: { onLogged?: () => void }) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedSession | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/session-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: text }),
      });
      const data = await res.json();
      setParsed(data.parsed);
      setInput("");
      onLogged?.();
    } finally {
      setLoading(false);
    }
  }

  const result = parsed?.resultAmount;
  const isPositive = result !== undefined && result >= 0;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div
          className="rounded-2xl overflow-hidden transition-all duration-150"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'e.g. "Commerce 5/5, 6 hours, won 850, loose table, one good spot vs fish"'}
            rows={4}
            style={{
              resize: "none",
              background: "transparent",
              color: "var(--text)",
              fontSize: "0.875rem",
              lineHeight: "1.7",
              padding: "16px",
              width: "100%",
              outline: "none",
              border: "none",
            }}
          />
          <div
            className="px-4 pb-3 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
              Describe your session naturally — location, stakes, hours, result
            </span>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="text-sm px-4 py-1.5 rounded-lg font-medium transition-all duration-150"
              style={{
                background: loading || !input.trim() ? "var(--surface-2)" : "var(--green)",
                color: loading || !input.trim() ? "var(--text-3)" : "#08080a",
                border: `1px solid ${loading || !input.trim() ? "var(--border)" : "transparent"}`,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
              }}
            >
              {loading ? "Parsing…" : "Log Session"}
            </button>
          </div>
        </div>
      </form>

      {parsed && (
        <div
          className="rounded-2xl overflow-hidden animate-slide-up"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              Session Parsed
            </span>
            {result !== undefined && (
              <span
                className="text-lg font-bold tabular-nums"
                style={{ color: isPositive ? "var(--green)" : "#f87171" }}
              >
                {isPositive ? "+" : ""}${result}
              </span>
            )}
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Location" value={parsed.location} />
            <Field label="Stakes" value={parsed.stakes} />
            <Field label="Game" value={parsed.gameType} />
            <Field label="Duration" value={parsed.durationMinutes ? `${Math.round(parsed.durationMinutes / 60 * 10) / 10}h` : undefined} />
          </div>
          {parsed.missingFields.length > 0 && (
            <div
              className="px-5 py-3 flex items-center gap-2"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                Couldn't detect: {parsed.missingFields.join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
