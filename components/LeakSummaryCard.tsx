"use client";

import { useEffect, useRef, useState } from "react";
import { LeakSummary } from "@/lib/types";
import { leakCategoryLabel } from "@/lib/leak-engine";

function confidenceColor(v: number) {
  if (v >= 0.75) return { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" };
  if (v >= 0.5)  return { color: "#f0b429", bg: "rgba(240,180,41,0.08)",  border: "rgba(240,180,41,0.2)" };
  return                 { color: "#16c784", bg: "rgba(22,199,132,0.08)", border: "rgba(22,199,132,0.2)" };
}

function LeakBar({ confidence, delay }: { confidence: number; delay: number }) {
  const barRef  = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGo(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const pct = Math.round(confidence * 100);
  const { color } = confidenceColor(confidence);

  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-3)" }}>
      <div
        ref={barRef}
        className="h-1 rounded-full"
        style={{
          width: go ? `${pct}%` : "0%",
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          transition: go ? "width 0.9s cubic-bezier(0.16,1,0.3,1)" : "none",
          boxShadow: go ? `0 0 6px ${color}55` : "none",
        }}
      />
    </div>
  );
}

export default function LeakSummaryCard() {
  const [leaks, setLeaks]     = useState<LeakSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/summaries")
      .then((r) => r.json())
      .then((d) => setLeaks(d.summaries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="card rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <p style={{ fontSize: "0.62rem", color: "var(--text-3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Detected Leaks
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>Based on your reviewed hands</p>
        </div>
        {!loading && leaks.length > 0 && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: "rgba(240,180,41,0.1)", color: "var(--gold)", border: "1px solid rgba(240,180,41,0.22)" }}
          >
            {leaks.length} found
          </span>
        )}
      </div>

      <div className="px-6 py-5">
        {loading ? (
          <div className="space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-1 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : leaks.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-3xl" style={{ opacity: 0.2 }}>♣</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>No leaks detected yet.</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
              Review hands in the Coach tab to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {leaks.map((leak, i) => {
              const c = confidenceColor(leak.confidence);
              const pct = Math.round(leak.confidence * 100);
              return (
                <div key={leak.category} className="animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: c.color, boxShadow: `0 0 6px ${c.color}88` }}
                      />
                      <p style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 500 }}>
                        {leakCategoryLabel(leak.category)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                        {leak.count}× spotted
                      </span>
                      <span
                        className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-md"
                        style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <LeakBar confidence={leak.confidence} delay={i * 100 + 200} />
                  {leak.example && (
                    <p
                      className="mt-2 text-xs leading-relaxed"
                      style={{
                        color: "var(--text-3)",
                        paddingLeft: "0.875rem",
                        borderLeft: `2px solid ${c.color}44`,
                        fontStyle: "italic",
                      }}
                    >
                      {leak.example}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
