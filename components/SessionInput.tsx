"use client";

import { useState, FormEvent } from "react";

interface ParsedSession {
  date?: string; location?: string; stakes?: string; gameType?: string;
  durationMinutes?: number; resultAmount?: number; notes?: string; missingFields: string[];
}

const STAKES_PRESETS = ["1/2", "1/3", "2/5", "5/10", "10/20", "25/50"];
const GAME_TYPES     = ["Cash", "MTT", "SNG", "Sit & Go"];

type Mode = "nlp" | "form";

// ── Natural Language Mode ──────────────────────────────────────────
function NLPMode({ onLogged }: { onLogged?: () => void }) {
  const [input,  setInput]  = useState("");
  const [parsed, setParsed] = useState<ParsedSession | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/session-log", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ raw: text }) });
      const data = await res.json();
      setParsed(data.parsed);
      setInput("");
      onLogged?.();
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <form onSubmit={handleSubmit}>
        <div className="glass" style={{ overflow: "hidden", borderRadius: 16 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`e.g. "Commerce 5/5, 6 hours, won 850, super loose table, one great spot vs fish on my left"`}
            rows={3}
            style={{
              resize: "none", background: "transparent", color: "var(--text)",
              fontSize: "0.9rem", lineHeight: "1.7", padding: "1rem 1.25rem",
              width: "100%", outline: "none", border: "none", display: "block",
            }}
          />
          <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
              Describe in plain English — location, stakes, hours, result
            </span>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "0.5rem 1.25rem", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600,
                background: loading || !input.trim() ? "rgba(255,255,255,0.06)" : "var(--green)",
                color: loading || !input.trim() ? "var(--text-3)" : "#050509",
                border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1,
                boxShadow: !loading && input.trim() ? "0 0 16px rgba(22,199,132,0.25)" : "none",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Parsing…" : "Log Session"}
            </button>
          </div>
        </div>
      </form>

      {parsed && (
        <div className="glass animate-fade-up" style={{ overflow: "hidden" }}>
          <div style={{ padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Session Parsed ✓</span>
            {parsed.resultAmount != null && (
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: parsed.resultAmount >= 0 ? "var(--green)" : "var(--red)", textShadow: parsed.resultAmount >= 0 ? "0 0 16px rgba(22,199,132,0.4)" : "0 0 16px rgba(248,113,113,0.4)" }}>
                {parsed.resultAmount >= 0 ? "+" : ""}${parsed.resultAmount.toLocaleString()}
              </span>
            )}
          </div>
          <div style={{ padding: "1rem 1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem 2rem" }}>
            {([["Location", parsed.location], ["Stakes", parsed.stakes], ["Game", parsed.gameType], ["Duration", parsed.durationMinutes != null ? `${(parsed.durationMinutes / 60).toFixed(1)}h` : undefined]] as [string, string | undefined][]).map(([l, v]) =>
              v ? <div key={l}><p style={{ fontSize: "0.65rem", color: "var(--text-3)", marginBottom: 3 }}>{l}</p><p style={{ fontSize: "0.9rem", color: "var(--text)", fontWeight: 500 }}>{v}</p></div> : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quick Form Mode ────────────────────────────────────────────────
function QuickFormMode({ onLogged }: { onLogged?: () => void }) {
  const [location, setLocation]   = useState("");
  const [stakes, setStakes]       = useState("");
  const [customStakes, setCustomStakes] = useState("");
  const [gameType, setGameType]   = useState("Cash");
  const [buyIn, setBuyIn]         = useState("");
  const [cashOut, setCashOut]     = useState("");
  const [hours, setHours]         = useState("");
  const [mins, setMins]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);

  const net = buyIn !== "" && cashOut !== "" ? parseFloat(cashOut) - parseFloat(buyIn) : null;
  const finalStakes = stakes === "custom" ? customStakes : stakes;
  const durationMinutes = hours || mins ? (parseFloat(hours || "0") * 60 + parseFloat(mins || "0")) : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location:        location || null,
          stakes:          finalStakes || null,
          resultAmount:    net,
          durationMinutes: durationMinutes ?? null,
        }),
      });
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      setLocation(""); setStakes(""); setCustomStakes(""); setBuyIn(""); setCashOut(""); setHours(""); setMins("");
      onLogged?.();
    } finally { setLoading(false); }
  }

  const inputStyle = {
    padding: "0.65rem 0.875rem", borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--text)", fontSize: "0.875rem", outline: "none", width: "100%",
    transition: "border-color 0.2s",
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="glass" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* Location + Game type */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Location</label>
            <input style={inputStyle} placeholder="Commerce, Hustler, online…" value={location} onChange={e => setLocation(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
              onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
          <div>
            <label style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Game</label>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {GAME_TYPES.slice(0, 2).map(g => (
                <button key={g} type="button" onClick={() => setGameType(g)} style={{
                  padding: "0.65rem 0.875rem", borderRadius: 10, fontSize: "0.8rem", fontWeight: gameType === g ? 600 : 400,
                  background: gameType === g ? "rgba(22,199,132,0.15)" : "rgba(255,255,255,0.05)",
                  color: gameType === g ? "var(--green)" : "var(--text-2)",
                  border: `1px solid ${gameType === g ? "rgba(22,199,132,0.3)" : "rgba(255,255,255,0.08)"}`,
                  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}>{g}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Stakes */}
        <div>
          <label style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Stakes</label>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {STAKES_PRESETS.map(s => (
              <button key={s} type="button" onClick={() => setStakes(s)} style={{
                padding: "0.45rem 0.875rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: stakes === s ? 600 : 400,
                background: stakes === s ? "rgba(22,199,132,0.15)" : "rgba(255,255,255,0.05)",
                color: stakes === s ? "var(--green)" : "var(--text-2)",
                border: `1px solid ${stakes === s ? "rgba(22,199,132,0.3)" : "rgba(255,255,255,0.08)"}`,
                cursor: "pointer", transition: "all 0.15s",
              }}>{s}</button>
            ))}
            <button type="button" onClick={() => setStakes("custom")} style={{
              padding: "0.45rem 0.875rem", borderRadius: 8, fontSize: "0.8rem",
              background: stakes === "custom" ? "rgba(240,180,41,0.12)" : "rgba(255,255,255,0.05)",
              color: stakes === "custom" ? "var(--gold)" : "var(--text-3)",
              border: `1px solid ${stakes === "custom" ? "rgba(240,180,41,0.25)" : "rgba(255,255,255,0.08)"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}>Custom</button>
          </div>
          {stakes === "custom" && (
            <input style={{ ...inputStyle, marginTop: "0.5rem" }} placeholder="e.g. 3/5, 1/2/5…" value={customStakes} onChange={e => setCustomStakes(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
              onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          )}
        </div>

        {/* Buy-in / Cash-out */}
        <div>
          <label style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Result</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.625rem", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "0.68rem", color: "var(--text-3)", marginBottom: 4 }}>Buy-in ($)</p>
              <input type="number" style={inputStyle} placeholder="500" value={buyIn} onChange={e => setBuyIn(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
                onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            <div>
              <p style={{ fontSize: "0.68rem", color: "var(--text-3)", marginBottom: 4 }}>Cash-out ($)</p>
              <input type="number" style={inputStyle} placeholder="850" value={cashOut} onChange={e => setCashOut(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
                onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
            {net !== null && (
              <div style={{ paddingTop: 22, textAlign: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: net >= 0 ? "var(--green)" : "var(--red)", textShadow: net >= 0 ? "0 0 12px rgba(22,199,132,0.4)" : "0 0 12px rgba(248,113,113,0.4)" }}>
                  {net >= 0 ? "+" : ""}${Math.round(net).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label style={{ fontSize: "0.65rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Duration</label>
          <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <input type="number" min="0" max="24" style={{ ...inputStyle, width: 72 }} placeholder="6" value={hours} onChange={e => setHours(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
                onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>hr</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <input type="number" min="0" max="59" style={{ ...inputStyle, width: 72 }} placeholder="30" value={mins} onChange={e => setMins(e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(22,199,132,0.5)"}
                onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>min</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || net === null}
          style={{
            padding: "0.875rem", borderRadius: 12, fontSize: "0.9rem", fontWeight: 700,
            background: loading || net === null ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, var(--green), #0faa70)",
            color: loading || net === null ? "var(--text-3)" : "#050509",
            border: "none", cursor: loading || net === null ? "not-allowed" : "pointer",
            boxShadow: !loading && net !== null ? "0 0 20px rgba(22,199,132,0.25)" : "none",
            transition: "all 0.2s",
          }}
        >
          {done ? "✓ Logged!" : loading ? "Saving…" : "Log Session"}
        </button>
      </div>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function SessionInput({ onLogged }: { onLogged?: () => void }) {
  const [mode, setMode] = useState<Mode>("nlp");

  const tabStyle = (m: Mode) => ({
    padding: "0.45rem 1rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: mode === m ? 600 : 400,
    background: mode === m ? "rgba(22,199,132,0.12)" : "transparent",
    color: mode === m ? "var(--green)" : "var(--text-3)",
    border: `1px solid ${mode === m ? "rgba(22,199,132,0.25)" : "transparent"}`,
    cursor: "pointer", transition: "all 0.15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button style={tabStyle("nlp")} onClick={() => setMode("nlp")}>
          💬 Natural Language
        </button>
        <button style={tabStyle("form")} onClick={() => setMode("form")}>
          📋 Quick Entry
        </button>
      </div>

      {mode === "nlp"  ? <NLPMode  onLogged={onLogged} /> : <QuickFormMode onLogged={onLogged} />}
    </div>
  );
}
