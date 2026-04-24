"use client";

import { useEffect, useState } from "react";

interface Pt { label: string; cumulative: number; result: number; stakes: string; }

export default function ProfitChart() {
  const [data, setData]       = useState<Pt[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/sessions").then(r => r.json()).then(d => setData(d.sessions ?? [])).finally(() => setLoading(false));
  }, []);

  const hasData = data.length > 0;
  const pts     = hasData ? data : [{ label: "S1", cumulative: 0, result: 0, stakes: "" }];
  const latest  = pts[pts.length - 1].cumulative;
  const isPos   = latest >= 0;
  const max     = Math.max(...pts.map(p => p.cumulative), 0);
  const min     = Math.min(...pts.map(p => p.cumulative), 0);
  const range   = max - min || 1;
  const W = 800; const H = 180; const px = 12; const py = 16;

  const tx = (i: number) => px + (i / Math.max(pts.length - 1, 1)) * (W - px * 2);
  const ty = (v: number) => py + ((max - v) / range) * (H - py * 2);

  const linePath  = `M${tx(0)},${ty(pts[0].cumulative)}` + pts.slice(1).map((p, i) => ` L${tx(i+1)},${ty(p.cumulative)}`).join("");
  const fillPath  = linePath + ` L${tx(pts.length-1)},${H} L${tx(0)},${H} Z`;
  const accent    = isPos ? "#16c784" : "#f87171";
  const wins      = data.filter(d => d.result > 0).length;
  const best      = hasData ? Math.max(...data.map(d => d.cumulative)) : 0;
  const hovPt     = hovered !== null ? pts[hovered] : null;

  return (
    <div className="glass" style={{ overflow: "hidden", position: "relative" }}>
      <div className="scan-beam" />

      {/* Header */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.4rem" }}>Cumulative Profit</p>
          {loading
            ? <div className="skeleton" style={{ height: 36, width: 120 }} />
            : <p style={{ fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.04em", color: isPos ? "var(--green)" : "var(--red)", textShadow: isPos ? "0 0 30px rgba(22,199,132,0.35)" : "0 0 30px rgba(248,113,113,0.35)" }}>
                {hasData ? `${isPos ? "+" : ""}$${latest.toLocaleString()}` : "—"}
              </p>
          }
        </div>
        <div style={{ display: "flex", gap: "2.5rem" }}>
          {[
            ["Sessions", loading ? "—" : String(data.length)],
            ["Win rate", loading || data.length === 0 ? "—" : `${Math.round(wins/data.length*100)}%`],
            ["Best",     loading || !hasData ? "—" : `+$${best.toLocaleString()}`],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{l}</p>
              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: "0.5rem 1rem 0.25rem", position: "relative" }}>
        {!loading && !hasData ? (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--text-3)", fontSize: "0.875rem" }}>No sessions yet — add one in the Sessions tab.</p>
          </div>
        ) : (
          <>
            {hovPt && (
              <div style={{
                position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                background: "rgba(5,5,9,0.9)", backdropFilter: "blur(12px)",
                border: "1px solid var(--border-bright)", borderRadius: 10,
                padding: "0.4rem 0.85rem", fontSize: "0.8rem", whiteSpace: "nowrap", zIndex: 10,
              }} className="animate-fade-in">
                <span style={{ color: "var(--text-3)" }}>{hovPt.label} · </span>
                <span style={{ color: hovPt.result >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>
                  {hovPt.result >= 0 ? "+" : ""}${hovPt.result.toLocaleString()}
                </span>
                {hovPt.stakes && <span style={{ color: "var(--text-3)" }}> · {hovPt.stakes}</span>}
              </div>
            )}
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 180, overflow: "visible", display: "block" }} onMouseLeave={() => setHovered(null)}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={accent} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </linearGradient>
                <filter id="lg" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {min < 0 && <line x1={px} y1={ty(0)} x2={W-px} y2={ty(0)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="5 5" />}
              <path d={fillPath} fill="url(#cg)" />
              {/* glow line */}
              <path d={linePath} fill="none" stroke={accent} strokeWidth="4" strokeOpacity="0.25" strokeLinejoin="round" strokeLinecap="round" style={{ filter: "blur(6px)" }} />
              {/* main line */}
              <path d={linePath} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={tx(i)} cy={ty(p.cumulative)} r={16} fill="transparent" style={{ cursor: "pointer" }} onMouseEnter={() => setHovered(i)} />
                  <circle cx={tx(i)} cy={ty(p.cumulative)} r={hovered === i ? 6 : 3.5} fill={hovered === i ? "#fff" : accent} stroke={hovered === i ? accent : "rgba(5,5,9,0.8)"} strokeWidth={2}
                    style={{ transition: "r 0.15s", filter: hovered === i ? `drop-shadow(0 0 8px ${accent})` : `drop-shadow(0 0 3px ${accent}88)` }} />
                </g>
              ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 12px 8px" }}>
              {pts.map(p => <span key={p.label} style={{ fontSize: "0.62rem", color: "var(--text-3)" }}>{p.label}</span>)}
            </div>
          </>
        )}
      </div>

      <div style={{ padding: "0.875rem 2rem", borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
          {hasData ? `${data.length} session${data.length>1?"s":""} logged` : "Log sessions to track bankroll"}
        </p>
      </div>
    </div>
  );
}
