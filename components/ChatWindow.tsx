"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import MessageBubble from "./MessageBubble";
import { ChatMessage } from "@/lib/types";

const STORAGE_KEY = "poker-coach-messages";
const MAX_STORED  = 40;

const HINTS = [
  { suit: "♠", color: "var(--green)", text: "I opened AQo UTG at 1/3, BTN called, flop K72r, I cbet…" },
  { suit: "♦", color: "var(--gold)",  text: "Commerce 5/5, 6 hours, won $850. Loose aggressive table." },
  { suit: "♣", color: "var(--indigo)",text: "What's my biggest leak based on my recent hands?" },
];

function ThinkingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }} className="animate-fade-in">
      <CoachIcon />
      <div style={{
        padding: "1rem 1.25rem",
        background: "var(--surface)",
        backdropFilter: "blur(16px)",
        border: "1px solid var(--border)",
        borderRadius: "20px 20px 20px 4px",
        display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        {[0,1,2].map(i => (
          <span key={i} className="dot-bounce" style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "var(--text-3)" }} />
        ))}
      </div>
    </div>
  );
}

function CoachIcon() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: "rgba(22,199,132,0.12)",
      border: "1px solid rgba(22,199,132,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 12px rgba(22,199,132,0.2)",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z" fill="var(--green)" />
      </svg>
    </div>
  );
}

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
function saveMessages(msgs: ChatMessage[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED))); }
  catch { /* quota */ }
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput]       = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setMessages(loadMessages()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveMessages(messages); }, [messages, hydrated]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let content   = "";
      setMessages([...next, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
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
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", maxWidth: 800, margin: "0 auto", width: "100%", padding: "0 1rem" }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2.5rem 0", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {!hydrated ? null : messages.length === 0 ? (
          <div className="animate-fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "3rem", textAlign: "center" }}>

            {/* Hero */}
            <div>
              <div className="animate-glow-logo" style={{ fontSize: "5rem", lineHeight: 1, marginBottom: "1.25rem" }}>
                <span className="gradient-text-bright">♠</span>
              </div>
              <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "0.75rem" }}>
                Your coach is <span className="gradient-text">ready.</span>
              </h1>
              <p style={{ fontSize: "1.05rem", color: "var(--text-2)", maxWidth: 380, margin: "0 auto" }}>
                Describe a hand, log a session, or ask about your leaks.
              </p>
            </div>

            {/* Hint cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: 480 }}>
              {HINTS.map((h) => (
                <button
                  key={h.text}
                  onClick={() => { setInput(h.text); textareaRef.current?.focus(); }}
                  className="glass card-3d"
                  style={{
                    display: "flex", alignItems: "center", gap: "1rem",
                    textAlign: "left", padding: "1rem 1.25rem",
                    border: "none", cursor: "pointer", width: "100%",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", color: h.color, flexShrink: 0, filter: `drop-shadow(0 0 6px ${h.color}88)` }}>
                    {h.suit}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "var(--text-2)", lineHeight: 1.5 }}>{h.text}</span>
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

      {/* Input */}
      <div style={{ paddingBottom: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        {messages.length > 0 && !streaming && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
            <button
              onClick={clearHistory}
              style={{ fontSize: "0.75rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-2)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-3)"}
            >
              Clear conversation
            </button>
          </div>
        )}
        <form onSubmit={send} style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
          <div
            style={{
              flex: 1,
              background: "var(--surface)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              overflow: "hidden",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(22,199,132,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(22,199,132,0.06)"; }}
            onBlurCapture={(e)  => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e as unknown as FormEvent); } }}
              placeholder="Describe a hand, log a session, or ask anything…"
              rows={1}
              style={{
                resize: "none", background: "transparent", color: "var(--text)",
                fontSize: "0.95rem", lineHeight: "1.65", padding: "14px 18px",
                width: "100%", outline: "none", border: "none", display: "block",
              }}
            />
            <div style={{ padding: "0 18px 10px", fontSize: "0.68rem", color: "var(--text-3)", textAlign: "right" }}>
              ↵ send · shift+↵ newline
            </div>
          </div>

          <button
            type="submit"
            disabled={streaming || !input.trim()}
            style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: (streaming || !input.trim()) ? "var(--surface)" : "var(--green)",
              border: `1px solid ${(streaming || !input.trim()) ? "var(--border)" : "transparent"}`,
              cursor: (streaming || !input.trim()) ? "not-allowed" : "pointer",
              opacity: (streaming || !input.trim()) ? 0.4 : 1,
              boxShadow: (!streaming && input.trim()) ? "var(--glow-green)" : "none",
              transition: "all 0.2s",
            }}
          >
            {streaming ? (
              <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--text-3)", display: "block" }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke={input.trim() ? "#050509" : "var(--text-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={input.trim() ? "#050509" : "var(--text-3)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
