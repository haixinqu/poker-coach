"use client";

import { useEffect, useRef, useState } from "react";

interface Stats { totalHands: number; totalSessions: number; totalProfit: number; winSessions: number; }

function useCountUp(target: number | null, duration = 1200) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (target === null) return;
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

function StatCard({ label, icon, value, sub, glow }: { label: string; icon: string; value: string; sub?: string; glow?: string }) {
  return (
    <div className="glass card-3d" style={{ flex: 1, padding: "1.75rem 1.5rem", minWidth: 0, position: "relative", overflow: "hidden" }}>
      <div className="scan-beam" />
      <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem", filter: glow ? `drop-shadow(0 0 6px ${glow})` : undefined }}>{icon}</div>
      <p style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.4rem" }}>{label}</p>
      <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "0.4rem" }}>{sub}</p>}
    </div>
  );
}

export default function StatsRow() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setStats); }, []);

  const profit   = stats?.totalProfit ?? 0;
  const sessions = useCountUp(stats?.totalSessions ?? null);
  const hands    = useCountUp(stats?.totalHands ?? null);
  const winRate  = stats && stats.totalSessions > 0 ? Math.round(stats.winSessions / stats.totalSessions * 100) : null;
  const countedWinRate = useCountUp(winRate);
  const countedProfit  = useCountUp(stats != null ? Math.abs(profit) : null);

  const profitStr = stats == null ? "—"
    : `${profit >= 0 ? "+" : "-"}$${countedProfit.toLocaleString()}`;

  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <StatCard
        label="Total Profit"
        icon="💰"
        value={profitStr}
        sub={stats ? `${sessions} sessions` : undefined}
        glow={stats && profit >= 0 ? "rgba(22,199,132,0.6)" : undefined}
      />
      <StatCard
        label="Win Rate"
        icon="🎯"
        value={winRate != null ? `${countedWinRate}%` : "—"}
        sub={stats ? `${stats.winSessions} winning sessions` : undefined}
        glow="rgba(240,180,41,0.6)"
      />
      <StatCard
        label="Hands Reviewed"
        icon="♠"
        value={stats == null ? "—" : String(hands)}
        sub="with AI coach feedback"
        glow="rgba(129,140,248,0.6)"
      />
    </div>
  );
}
