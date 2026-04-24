"use client";

import { useEffect, useState } from "react";
import { LeakSummary } from "@/lib/types";
import { leakCategoryLabel } from "@/lib/leak-engine";

export default function LeakSummaryCard() {
  const [leaks, setLeaks] = useState<LeakSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/summaries")
      .then((r) => r.json())
      .then((d) => setLeaks(d.summaries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Detected Leaks
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
            Based on your reviewed hands
          </p>
        </div>
        {!loading && leaks.length > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: "rgba(240,180,41,0.12)", color: "var(--gold)", border: "1px solid rgba(240,180,41,0.25)" }}
          >
            {leaks.length} found
          </span>
        )}
      </div>

      <div className="px-6 py-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "var(--surface-2)" }} />
            ))}
          </div>
        ) : leaks.length === 0 ? (
          <div className="py-6 text-center">
            <p style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>
              No leaks detected yet.
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4 }}>
              Review some hands in the Coach tab to start tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaks.map((leak, i) => (
              <div key={leak.category} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: confidenceColor(leak.confidence) }}
                    />
                    <p style={{ fontSize: "0.875rem", color: "var(--text)", fontWeight: 500 }}>
                      {leakCategoryLabel(leak.category)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                      {leak.count}× spotted
                    </span>
                    <span
                      className="text-xs font-medium tabular-nums"
                      style={{ color: confidenceColor(leak.confidence) }}
                    >
                      {Math.round(leak.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div
                    className="h-1 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.round(leak.confidence * 100)}%`,
                      background: confidenceColor(leak.confidence),
                    }}
                  />
                </div>
                {leak.example && (
                  <p
                    className="mt-1.5 text-xs leading-relaxed"
                    style={{ color: "var(--text-3)", paddingLeft: "0.75rem", borderLeft: "1px solid var(--border)" }}
                  >
                    e.g. {leak.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function confidenceColor(v: number): string {
  if (v >= 0.75) return "#f87171"; // red — high confidence
  if (v >= 0.5)  return "#f0b429"; // gold — medium
  return "#16c784";                 // green — low
}
