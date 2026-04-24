"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import MessageBubble from "./MessageBubble";
import { ChatMessage } from "@/lib/types";

const STORAGE_KEY = "poker-coach-messages-cache";
const MAX_STORED  = 40;

const QUICK_ACTIONS = [
  { icon: "♠", label: "Review a hand",    prompt: "I opened AQo UTG at 1/3, BTN called, flop K72r…" },
  { icon: "📈", label: "Log a session",    prompt: "Tonight at Commerce 5/5, 6 hours, won $850." },
  { icon: "🎯", label: "Find my leaks",    prompt: "What's my biggest leak based on my recent hands?" },
  { icon: "💡", label: "Strategy question", prompt: "How should I approach 3-bet pots out of position?" },
];

const EMPTY_CARDS = [
  {
    icon: "♠", color: "var(--green)", glow: "rgba(22,199,132,0.3)",
    title: "Review a Hand",
    desc: "Describe any hand in natural language. I'll analyze every street.",
    prompt: "I opened AQo UTG at 1/3, BTN called, flop K72r…",
  },
  {
    icon: "♦", color: "var(--gold)", glow: "rgba(240,180,41,0.3)",
    title: "Track a Session",
    desc: "Tell me about tonight's session and I'll log it for you.",
    prompt: "Tonight at Commerce 5/5, 6 hours, won $850, loose table.",
  },
  {
    icon: "♣", color: "var(--indigo)", glow: "rgba(129,140,248,0.3)",
    title: "Analyze My Game",
    desc: "Ask me to review your patterns and biggest recurring leaks.",
    prompt: "What are my biggest leaks based on recent hands?",
  },
];

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveMessages(msgs: ChatMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED))); }
  catch { /* quota */ }
}

/* ── Mini Stats in sidebar ── */
function SidebarStats() {
  const [stats, setStats] = useState<{ totalHands: number; totalSessions: number; totalProfit: number } | null>(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setStats).catch(() => {}); }, []);

  if (!stats) return null;
  const profit = stats.totalProfit;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <StatLine label="Hands reviewed" value={String(stats.totalHands)} />
      <StatLine label="Sessions logged" value={String(stats.totalSessions)} />
      <StatLine
        label="Total profit"
        value={`${profit >= 0 ? "+" : ""}$${profit.toLocaleString()}`}
        valueColor={profit >= 0 ? "var(--green)" : "var(--red)"}
      />
    </div>
  );
}

function StatLine({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: valueColor ?? "var(--text-2)" }}>{value}</span>
    </div>
  );
}

/* ── Thinking indicator ── */
function ThinkingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }} className="animate-fade-in">
      <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "rgba(22,199,132,0.12)", border: "1px solid rgba(22,199,132,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(22,199,132,0.2)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z" fill="var(--green)" />
        </svg>
      </div>
      <div style={{ padding: "0.875rem 1.25rem", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid var(--border)", borderRadius: "20px 20px 20px 4px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {[0,1,2].map(i => <span key={i} className="dot-bounce" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--text-3)" }} />)}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated]   = useState(false);
  const [input, setInput]         = useState("");
  const [streaming, setStreaming]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [limitHit, setLimitHit]   = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from server on mount, fall back to localStorage cache
  useEffect(() => {
    fetch("/api/chat/history")
      .then(r => r.json())
      .then(d => {
        const serverMsgs: ChatMessage[] = d.messages ?? [];
        if (serverMsgs.length > 0) {
          setMessages(serverMsgs);
        } else {
          setMessages(loadMessages());
        }
      })
      .catch(() => setMessages(loadMessages()))
      .finally(() => setHydrated(true));
  }, []);

  // Debounced save to server + localStorage cache
  useEffect(() => {
    if (!hydrated) return;
    saveMessages(messages);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (messages.length > 0) {
        fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
        }).catch(() => {});
      }
    }, 800);
  }, [messages, hydrated]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }

  const clearHistory = useCallback(() => {
    setMessages([]);
    setLimitHit(false);
    localStorage.removeItem(STORAGE_KEY);
    setSidebarOpen(false);
    fetch("/api/chat/history", { method: "DELETE" }).catch(() => {});
  }, []);

  function fillPrompt(p: string) {
    setInput(p);
    setSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 402) {
        setLimitHit(true);
        setStreaming(false);
        setMessages(next);
        return;
      }
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let content  = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += dec.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setStreaming(false);
    }
  }

  const showDots = streaming && !(messages.length > 0 && messages[messages.length-1].role === "assistant");

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "100%" }}>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: 268,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
        background: "rgba(5,5,9,0.6)",
        backdropFilter: "blur(20px)",
        // Mobile: fixed overlay
        position: sidebarOpen ? "fixed" : undefined,
        left: sidebarOpen ? 0 : undefined,
        top: sidebarOpen ? 60 : undefined,
        bottom: sidebarOpen ? 0 : undefined,
        zIndex: sidebarOpen ? 45 : undefined,
        // Desktop: always visible
        ...(typeof window !== "undefined" && window.innerWidth < 768 && !sidebarOpen ? { display: "none" } : {}),
      }}
      className="hidden md:flex md:flex-col"
      >

        {/* Coach identity */}
        <div style={{ padding: "1.75rem 1.5rem 1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                className="animate-glow-logo"
                style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(22,199,132,0.12)", border: "1px solid rgba(22,199,132,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z" fill="var(--green)" />
                </svg>
              </div>
              {/* Online dot */}
              <span style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--bg)", boxShadow: "0 0 6px rgba(22,199,132,0.8)" }} className="animate-neon-pulse" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", letterSpacing: "-0.01em" }}>Poker Coach</p>
              <p style={{ fontSize: "0.72rem", color: "var(--green)" }}>● Online</p>
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", lineHeight: 1.55 }}>
            AI-powered analysis for Texas Hold&apos;em. Describe a hand, log a session, or ask anything.
          </p>
        </div>

        <div style={{ height: 1, background: "var(--border)", margin: "0 1.5rem" }} />

        {/* Quick actions */}
        <div style={{ padding: "1.25rem 1rem" }}>
          <p style={{ fontSize: "0.62rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.625rem", paddingLeft: "0.5rem" }}>
            Quick Start
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                onClick={() => fillPrompt(a.prompt)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.625rem 0.75rem", borderRadius: 10, width: "100%",
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--text-2)", fontSize: "0.82rem", textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
              >
                <span style={{ fontSize: "0.95rem", flexShrink: 0, width: 20, textAlign: "center" }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border)", margin: "0 1.5rem" }} />

        {/* Mini stats */}
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <p style={{ fontSize: "0.62rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.875rem" }}>
            Your Stats
          </p>
          <SidebarStats />
        </div>

        {/* New conversation button */}
        <div style={{ marginTop: "auto", padding: "1.25rem 1rem 1.5rem" }}>
          <button
            onClick={clearHistory}
            style={{
              width: "100%", padding: "0.625rem", borderRadius: 10,
              background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
              color: "var(--text-3)", fontSize: "0.8rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = "var(--border-bright)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New conversation
          </button>
        </div>
      </aside>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Mobile top bar */}
        <div
          className="flex md:hidden items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)", flexShrink: 0 }}
        >
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{ padding: "0.375rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Poker Coach</span>
          <span className="animate-neon-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 5px rgba(22,199,132,0.8)", marginLeft: 2 }} />
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {!hydrated ? null : messages.length === 0 ? (

            /* Empty state */
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "2.5rem", maxWidth: 680, margin: "0 auto", width: "100%", textAlign: "center", padding: "2rem 0" }}>
              <div>
                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
                  What would you like to work on?
                </p>
                <p style={{ fontSize: "0.9rem", color: "var(--text-3)" }}>
                  Choose a topic below or type anything in the box.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.875rem", width: "100%" }}>
                {EMPTY_CARDS.map(card => (
                  <button
                    key={card.title}
                    onClick={() => fillPrompt(card.prompt)}
                    className="glass card-3d"
                    style={{
                      padding: "1.5rem 1.25rem", textAlign: "left",
                      border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "1.75rem", color: card.color, filter: `drop-shadow(0 0 8px ${card.glow})`, lineHeight: 1 }}>
                      {card.icon}
                    </span>
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem" }}>
                        {card.title}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-3)", lineHeight: 1.5 }}>
                        {card.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          ) : (
            <>
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  message={m}
                  isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
                />
              ))}
            </>
          )}
          {showDots && <ThinkingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Free tier limit banner */}
        {limitHit && (
          <div className="animate-fade-up" style={{ padding: "0.875rem 1.5rem", borderTop: "1px solid rgba(240,180,41,0.2)", background: "rgba(240,180,41,0.06)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--gold)" }}>Daily limit reached</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 2 }}>Free plan includes 3 hand reviews per day. Upgrade for unlimited access.</p>
            </div>
            <a href="/pricing" style={{ padding: "0.5rem 1.1rem", borderRadius: 10, background: "var(--gold)", color: "#050509", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", flexShrink: 0, boxShadow: "0 0 16px rgba(240,180,41,0.3)" }}>
              Upgrade →
            </a>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "1rem 1.5rem 1.5rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <form onSubmit={send} style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", maxWidth: 780, margin: "0 auto" }}>
            <div
              style={{
                flex: 1, background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(22,199,132,0.45)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(22,199,132,0.07)"; }}
              onBlurCapture={e  => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as FormEvent); } }}
                placeholder="Describe a hand, log a session, or ask anything…"
                rows={1}
                style={{ resize: "none", background: "transparent", color: "var(--text)", fontSize: "0.925rem", lineHeight: "1.65", padding: "13px 18px", width: "100%", outline: "none", border: "none", display: "block" }}
              />
              <div style={{ padding: "0 18px 10px", fontSize: "0.67rem", color: "var(--text-3)", textAlign: "right" }}>
                ↵ send · shift+↵ newline
              </div>
            </div>

            <button
              type="submit"
              disabled={streaming || !input.trim()}
              style={{
                width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: streaming || !input.trim() ? "rgba(255,255,255,0.05)" : "var(--green)",
                border: `1px solid ${streaming || !input.trim() ? "var(--border)" : "transparent"}`,
                cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
                opacity: streaming || !input.trim() ? 0.4 : 1,
                boxShadow: !streaming && input.trim() ? "var(--glow-green)" : "none",
                transition: "all 0.2s",
              }}
            >
              {streaming
                ? <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--text-3)", display: "block" }} />
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke={input.trim() ? "#050509" : "var(--text-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() ? "#050509" : "var(--text-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
