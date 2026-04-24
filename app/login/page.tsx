"use client";

import { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Mode = "signin" | "signup" | "magic";

const FLOAT_SUITS = [
  { suit: "♠", style: { top: "8%",  left: "6%",  fontSize: "4rem", animationDelay: "0s",    animationDuration: "7s"  } },
  { suit: "♥", style: { top: "15%", right: "8%", fontSize: "3rem", animationDelay: "1.2s",  animationDuration: "9s",  color: "#f87171" } },
  { suit: "♦", style: { bottom: "18%", left: "10%", fontSize: "3.5rem", animationDelay: "2.4s", animationDuration: "8s", color: "#f0b429" } },
  { suit: "♣", style: { bottom: "10%", right: "7%", fontSize: "4.5rem", animationDelay: "0.8s", animationDuration: "10s" } },
  { suit: "♠", style: { top: "50%", left: "2%",  fontSize: "2rem", animationDelay: "3s",    animationDuration: "11s"  } },
  { suit: "♥", style: { top: "60%", right: "3%", fontSize: "2.5rem", animationDelay: "1.8s", animationDuration: "8.5s", color: "#f87171" } },
];

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router = useRouter();
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
      setMsg(
        error
          ? { type: "error", text: error.message }
          : { type: "success", text: "Check your email for a magic link." },
      );
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setMsg({ type: "error", text: error.message });
      } else {
        setMsg({ type: "success", text: "Check your email to confirm your account." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg({ type: "error", text: error.message });
      } else {
        router.push("/chat");
        router.refresh();
      }
    }

    setLoading(false);
  }

  const title   = mode === "signup" ? "Create account" : mode === "magic" ? "Magic link" : "Sign in";
  const btnLabel = mode === "signup" ? "Sign up"        : mode === "magic" ? "Send magic link" : "Sign in";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%",
        width: "50vw", height: "50vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(22,199,132,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: "45vw", height: "45vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(240,180,41,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Floating suit icons */}
      {FLOAT_SUITS.map((f, i) => (
        <div
          key={i}
          className="animate-float pointer-events-none select-none fixed"
          style={{
            ...f.style,
            color: f.style.color ?? "var(--text)",
            opacity: 0.06,
            lineHeight: 1,
          } as React.CSSProperties}
        >
          {f.suit}
        </div>
      ))}

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="animate-glow-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z"
                fill="url(#spade-login-g)"
              />
              <defs>
                <linearGradient id="spade-login-g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#16c784" />
                  <stop offset="1" stopColor="#f0b429" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Poker<span className="gradient-text">Coach</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
              Your personal AI poker coach
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="glow-border rounded-2xl p-6 animate-scale-in"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-sm font-semibold mb-5" style={{ color: "var(--text)" }}>
            {title}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            />

            {mode !== "magic" && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)")}
                onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            )}

            {msg && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{
                  color:      msg.type === "error" ? "var(--red)"   : "var(--green)",
                  background: msg.type === "error" ? "rgba(248,113,113,0.08)" : "rgba(22,199,132,0.08)",
                  border: `1px solid ${msg.type === "error" ? "rgba(248,113,113,0.2)" : "rgba(22,199,132,0.2)"}`,
                }}
              >
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: loading ? "var(--green-dim)" : "var(--green)",
                color: "#07070a",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 0 20px rgba(22,199,132,0.25)",
              }}
            >
              {loading ? "Loading…" : btnLabel}
            </button>
          </form>

          <div className="flex flex-col gap-2 mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            {mode !== "signin" && (
              <button onClick={() => { setMode("signin"); setMsg(null); }}
                className="text-xs text-center transition-colors"
                style={{ color: "var(--text-3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                Already have an account? Sign in
              </button>
            )}
            {mode !== "signup" && (
              <button onClick={() => { setMode("signup"); setMsg(null); }}
                className="text-xs text-center transition-colors"
                style={{ color: "var(--text-3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                No account? Sign up
              </button>
            )}
            {mode !== "magic" && (
              <button onClick={() => { setMode("magic"); setMsg(null); }}
                className="text-xs text-center transition-colors"
                style={{ color: "var(--text-3)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
              >
                Sign in with magic link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
