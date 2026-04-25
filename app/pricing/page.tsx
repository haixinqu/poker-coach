"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const FREE_FEATURES = [
  { text: "3 hand reviews per day",       included: true  },
  { text: "Basic session logging",         included: true  },
  { text: "Bankroll chart",               included: true  },
  { text: "Leak tracking",                included: false },
  { text: "Coaching memory",              included: false },
  { text: "Weekly coaching summaries",    included: false },
  { text: "Advanced analytics",           included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited hand reviews",             included: true },
  { text: "Session logging + analytics",        included: true },
  { text: "Full bankroll & monthly charts",     included: true },
  { text: "Complete AI leak tracking",          included: true },
  { text: "Persistent coaching memory",         included: true },
  { text: "Weekly coaching summaries",          included: true },
  { text: "Calendar heatmap + $/hr stats",      included: true },
];

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--green)" }}>
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "var(--text-3)" }}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PricingPage() {
  const [plan,     setPlan]     = useState<"free" | "pro" | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [managing, setManaging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/plan")
      .then(r => r.json())
      .then(d => setPlan(d.plan))
      .catch(() => setPlan("free"));
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  async function handleManage() {
    setManaging(true);
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setManaging(false);
    }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>

        {/* Hero */}
        <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0.875rem", borderRadius: 99, background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--green)", fontWeight: 600 }}>Simple pricing</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem,6vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1rem" }}>
            Invest in your <span className="gradient-text">poker game</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-2)", maxWidth: 480, margin: "0 auto" }}>
            Start free. Upgrade when you&apos;re ready to go deeper.
          </p>
        </div>

        {/* Cards */}
        <div className="animate-fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", animationDelay: "0.06s" }}>

          {/* Free */}
          <div className="glass" style={{ padding: "2.25rem", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Free</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text)" }}>$0</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>/month</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>Perfect to get started and explore.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1, marginBottom: "2rem" }}>
              {FREE_FEATURES.map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Check ok={f.included} />
                  <span style={{ fontSize: "0.875rem", color: f.included ? "var(--text-2)" : "var(--text-3)" }}>{f.text}</span>
                </div>
              ))}
            </div>

            {plan === "free" ? (
              <div style={{ padding: "0.875rem", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-3)", fontWeight: 500 }}>
                ✓ Current plan
              </div>
            ) : (
              <button
                onClick={() => router.push("/chat")}
                style={{ padding: "0.875rem", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >
                Get started free
              </button>
            )}
          </div>

          {/* Pro */}
          <div
            style={{
              padding: "2.25rem",
              display: "flex", flexDirection: "column",
              background: "rgba(22,199,132,0.04)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(22,199,132,0.25)",
              borderRadius: 20,
              position: "relative",
              boxShadow: "0 0 40px rgba(22,199,132,0.07), 0 0 0 1px rgba(22,199,132,0.08)",
            }}
          >
            {/* Popular badge */}
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", padding: "0.3rem 1rem", borderRadius: 99, background: "linear-gradient(135deg, var(--green), #0faa70)", color: "#050509", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(22,199,132,0.4)" }}>
              Most Popular
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>Pro</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--green)", textShadow: "0 0 30px rgba(22,199,132,0.4)" }}>$9.99</span>
                <span style={{ fontSize: "0.875rem", color: "var(--text-3)" }}>/month</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>For players serious about improving.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1, marginBottom: "2rem" }}>
              {PRO_FEATURES.map(f => (
                <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Check ok={f.included} />
                  <span style={{ fontSize: "0.875rem", color: "var(--text)" }}>{f.text}</span>
                </div>
              ))}
            </div>

            {plan === "pro" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div style={{ padding: "0.875rem", borderRadius: 12, background: "rgba(22,199,132,0.12)", border: "1px solid rgba(22,199,132,0.3)", textAlign: "center", fontSize: "0.875rem", color: "var(--green)", fontWeight: 600 }}>
                  ✓ Active plan
                </div>
                <button
                  onClick={handleManage}
                  disabled={managing}
                  style={{ padding: "0.625rem", borderRadius: 10, background: "transparent", border: "1px solid var(--border)", color: "var(--text-3)", fontSize: "0.8rem", cursor: managing ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-bright)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  {managing ? "Loading…" : "Manage subscription →"}
                </button>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading || plan === null}
                style={{
                  padding: "0.975rem",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, var(--green) 0%, #0faa70 100%)",
                  color: "#050509",
                  fontSize: "0.925rem", fontWeight: 700,
                  border: "none",
                  cursor: loading || plan === null ? "not-allowed" : "pointer",
                  opacity: loading || plan === null ? 0.7 : 1,
                  boxShadow: "0 0 24px rgba(22,199,132,0.3)",
                  transition: "all 0.2s",
                  letterSpacing: "0.01em",
                }}
              >
                {loading ? "Redirecting…" : plan === null ? "Loading…" : "Upgrade to Pro →"}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="animate-fade-up" style={{ marginTop: "5rem", animationDelay: "0.12s" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: "2.5rem", color: "var(--text)" }}>
            Common questions
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem 3rem" }}>
            {[
              ["What counts as a hand review?",     "Any message where you describe a poker hand in the chat. General questions or session logs don't count toward the limit."],
              ["Can I cancel anytime?",              "Yes — cancel from the customer portal anytime. You keep Pro access until the end of your billing period."],
              ["Is my data private?",               "Your hand history, sessions, and leak data are completely private and isolated to your account."],
              ["Do you offer a free trial?",        "The free plan lets you test everything with 3 hands/day. No credit card required to get started."],
            ].map(([q, a]) => (
              <div key={q}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginBottom: "0.5rem" }}>{q}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-3)", lineHeight: 1.65 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
