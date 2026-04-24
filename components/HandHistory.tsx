"use client";

import { useEffect, useState } from "react";
import { leakCategoryLabel } from "@/lib/leak-engine";
import { LeakCategory } from "@/lib/types";

interface HandRow {
  id: number;
  input: string;
  response: string | null;
  created_at: string;
  leakSignals: { category: LeakCategory; confidence: number }[];
}

function renderResponse(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong key={i} style={{ color: "var(--text)", fontWeight: 600 }}>
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return seg.split("\n").map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function HandCard({ hand, index }: { hand: HandRow; index: number }) {
  const [open, setOpen] = useState(false);
  const date = new Date(hand.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const snippet = hand.input.slice(0, 100).replace(/\n/g, " ");
  const notable = hand.leakSignals.filter(
    (s) => s.category !== "unknown" && s.confidence > 0.4,
  );

  return (
    <div
      className="rounded-2xl overflow-hidden animate-slide-up"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        animationDelay: `${index * 40}ms`,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
        style={{ cursor: "pointer" }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span style={{ fontSize: "0.7rem", color: "var(--text-3)" }}>
              {date}
            </span>
            {notable.map((s) => (
              <span
                key={s.category}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(240,180,41,0.1)",
                  color: "var(--gold)",
                  border: "1px solid rgba(240,180,41,0.2)",
                }}
              >
                {leakCategoryLabel(s.category)}
              </span>
            ))}
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-2)" }}
          >
            {snippet}
            {hand.input.length > 100 && "…"}
          </p>
        </div>
        <span
          className="shrink-0 text-xs transition-transform duration-200"
          style={{
            color: "var(--text-3)",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {hand.input.length > 100 && (
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--text-3)" }}
              >
                Your hand
              </p>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--text-2)" }}
              >
                {hand.input}
              </p>
            </div>
          )}
          {hand.response && (
            <div className="px-5 py-4">
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--text-3)" }}
              >
                Coach
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "var(--text-2)",
                  borderLeft: "2px solid var(--green)",
                  paddingLeft: "12px",
                }}
              >
                {renderResponse(hand.response)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HandHistory() {
  const [hands, setHands] = useState<HandRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hands?limit=30")
      .then((r) => r.json())
      .then((d) => setHands(d.hands ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl animate-pulse"
            style={{ background: "var(--surface)" }}
          />
        ))}
      </div>
    );
  }

  if (hands.length === 0) {
    return (
      <div
        className="rounded-2xl px-6 py-12 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
          No hands reviewed yet.
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4 }}>
          Go to the Coach tab and describe a hand to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hands.map((h, i) => (
        <HandCard key={h.id} hand={h} index={i} />
      ))}
    </div>
  );
}
