"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PricingSuccessPage() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div className="animate-scale-in" style={{ textAlign: "center", maxWidth: 480 }}>

        {/* Icon */}
        <div style={{ marginBottom: "2rem" }}>
          <div
            className="animate-glow-logo"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(22,199,132,0.12)",
              border: "1px solid rgba(22,199,132,0.3)",
              fontSize: "2.25rem",
              boxShadow: "0 0 40px rgba(22,199,132,0.2)",
            }}
          >
            ♠
          </div>
        </div>

        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1rem" }}>
          Welcome to <span className="gradient-text">Pro</span>
        </h1>

        <p style={{ fontSize: "1rem", color: "var(--text-2)", lineHeight: 1.65, marginBottom: "0.75rem" }}>
          Your subscription is active. Unlimited hand reviews, full leak tracking, and coaching memory are now unlocked.
        </p>

        <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: "2.5rem" }}>
          Syncing your account{dots}
        </p>

        <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/chat"
            style={{
              padding: "0.875rem 2rem", borderRadius: 12,
              background: "linear-gradient(135deg, var(--green), #0faa70)",
              color: "#050509", fontSize: "0.9rem", fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 24px rgba(22,199,132,0.3)",
            }}
          >
            Start coaching →
          </Link>
          <Link
            href="/dashboard"
            style={{
              padding: "0.875rem 2rem", borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border)",
              color: "var(--text-2)", fontSize: "0.9rem", fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
