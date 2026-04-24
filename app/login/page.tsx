"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup" | "magic";

export default function LoginPage() {
  const [mode, setMode]       = useState<Mode>("signin");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router   = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      setMsg(error
        ? { type: "error",   text: error.message }
        : { type: "success", text: "Check your email for a magic link." });
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) setMsg({ type: "error", text: error.message });
      else        setMsg({ type: "success", text: "Check your email to confirm your account." });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg({ type: "error", text: error.message });
      else { router.push("/chat"); router.refresh(); }
    }
    setLoading(false);
  }

  const title   = mode === "signup" ? "Create account" : mode === "magic" ? "Magic link" : "Welcome back";
  const btnLabel = mode === "signup" ? "Sign up" : mode === "magic" ? "Send magic link" : "Sign in";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", position: "relative" }}>

      {/* Hero text */}
      <div className="animate-fade-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ fontSize: "clamp(3rem,8vw,5.5rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "1rem" }}>
          Your AI<br />
          <span className="gradient-text-bright">Poker Coach</span>
        </div>
        <p style={{ fontSize: "clamp(1rem,2vw,1.2rem)", color: "var(--text-2)", maxWidth: 400, margin: "0 auto" }}>
          Analyze hands. Track leaks. Win more.
        </p>
        {/* Suit row */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1.5rem", fontSize: "1.6rem" }}>
          <span style={{ color: "var(--text-3)" }}>♠</span>
          <span style={{ color: "rgba(248,113,113,0.4)" }}>♥</span>
          <span style={{ color: "rgba(240,180,41,0.4)" }}>♦</span>
          <span style={{ color: "var(--text-3)" }}>♣</span>
        </div>
      </div>

      {/* Form card */}
      <div
        className="glow-border-wrap animate-scale-in"
        style={{ width: "100%", maxWidth: 400, animationDelay: "0.1s", opacity: 0 }}
      >
        <div
          className="glass"
          style={{ padding: "2rem", borderRadius: 20 }}
        >
          <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text)", marginBottom: "1.5rem" }}>
            {title}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%", padding: "0.875rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "var(--text)", fontSize: "0.9rem",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
              onBlur={(e)  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
            {mode !== "magic" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%", padding: "0.875rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, color: "var(--text)", fontSize: "0.9rem",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
                onBlur={(e)  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            )}

            {msg && (
              <div style={{
                padding: "0.75rem 1rem",
                borderRadius: 10,
                fontSize: "0.82rem",
                color:      msg.type === "error" ? "var(--red)"   : "var(--green)",
                background: msg.type === "error" ? "rgba(248,113,113,0.08)" : "rgba(22,199,132,0.08)",
                border: `1px solid ${msg.type === "error" ? "rgba(248,113,113,0.2)" : "rgba(22,199,132,0.2)"}`,
              }}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.9rem",
                borderRadius: 12,
                background: "linear-gradient(135deg, var(--green) 0%, #0faa70 100%)",
                color: "#050509",
                fontSize: "0.9rem",
                fontWeight: 700,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.65 : 1,
                boxShadow: loading ? "none" : "var(--glow-green)",
                transition: "opacity 0.2s, box-shadow 0.2s",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? "Loading…" : btnLabel}
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {mode !== "signin"  && <ModeBtn label="Already have an account? Sign in" onClick={() => { setMode("signin"); setMsg(null); }} />}
            {mode !== "signup"  && <ModeBtn label="No account? Sign up"               onClick={() => { setMode("signup"); setMsg(null); }} />}
            {mode !== "magic"   && <ModeBtn label="Sign in with magic link"            onClick={() => { setMode("magic"); setMsg(null); }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ fontSize: "0.8rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", textAlign: "center", transition: "color 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-2)"}
      onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}
    >
      {label}
    </button>
  );
}
