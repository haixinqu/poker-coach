"use client";

import { useEffect, useRef, useState } from "react";
import { LeakSummary } from "@/lib/types";
import { leakCategoryLabel } from "@/lib/leak-engine";

function cColor(v: number) {
  if (v >= 0.75) return { c: "#f87171", bg: "rgba(248,113,113,0.1)",  b: "rgba(248,113,113,0.25)" };
  if (v >= 0.5)  return { c: "#f0b429", bg: "rgba(240,180,41,0.1)",   b: "rgba(240,180,41,0.25)"  };
  return               { c: "#16c784", bg: "rgba(22,199,132,0.1)",  b: "rgba(22,199,132,0.25)"  };
}

function Bar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div ref={ref} style={{
        height: "100%", borderRadius: 99,
        width: go ? `${pct}%` : "0%",
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        boxShadow: go ? `0 0 8px ${color}66` : "none",
        transition: go ? "width 1s cubic-bezier(0.16,1,0.3,1), box-shadow 0.5s" : "none",
        transformOrigin: "left",
      }} />
    </div>
  );
}

export default function LeakSummaryCard() {
  const [leaks, setLeaks]     = useState<LeakSummary[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/summaries").then(r => r.json()).then(d => setLeaks(d.summaries ?? [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass" style={{ overflow: "hidden", position: "relative" }}>
      <div className="scan-beam" />
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.3rem" }}>Detected Leaks</p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-2)" }}>Based on your reviewed hands</p>
        </div>
        {!loading && leaks.length > 0 && (
          <span style={{ fontSize: "0.78rem", padding: "0.3rem 0.85rem", borderRadius: 99, fontWeight: 700, background: "rgba(240,180,41,0.1)", color: "var(--gold)", border: "1px solid rgba(240,180,41,0.25)", boxShadow: "0 0 12px rgba(240,180,41,0.15)" }}>
            {leaks.length} found
          </span>
        )}
      </div>

      <div style={{ padding: "1.75rem 2rem" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[1,2].map(i => <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}><div className="skeleton" style={{ height: 18, width: "45%" }} /><div className="skeleton" style={{ height: 6, width: "100%" }} /></div>)}
          </div>
        ) : leaks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{ fontSize: "3rem", opacity: 0.15, marginBottom: "1rem" }}>♣</div>
            <p style={{ color: "var(--text-3)", fontSize: "0.9rem" }}>No leaks detected yet.</p>
            <p style={{ color: "var(--text-3)", fontSize: "0.78rem", marginTop: "0.4rem" }}>Review hands in the Coach tab to start tracking.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {leaks.map((leak, i) => {
              const { c, bg, b } = cColor(leak.confidence);
              const pct = Math.round(leak.confidence * 100);
              return (
                <div key={leak.category} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>{leakCategoryLabel(leak.category)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{leak.count}× spotted</span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 6, color: c, background: bg, border: `1px solid ${b}` }}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <Bar pct={pct} color={c} delay={i * 100 + 300} />
                  {leak.example && (
                    <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-3)", paddingLeft: "1rem", borderLeft: `2px solid ${c}44`, fontStyle: "italic", lineHeight: 1.6 }}>
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
