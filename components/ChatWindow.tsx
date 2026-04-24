"use client";

import { useState, useRef, useEffect, useCallback, FormEvent } from "react";
import MessageBubble from "./MessageBubble";
import { ChatMessage } from "@/lib/types";

const STORAGE_KEY = "poker-coach-messages";
const MAX_STORED = 40;

const HINTS = [
  { icon: "🃏", text: "I opened AQo UTG at 1/3, BTN called, flop K72r…" },
  { icon: "📊", text: "Tonight at Commerce 5/5, 6 hours, won 850." },
  { icon: "🔍", text: "What's my biggest leak based on recent hands?" },
];

function ThinkingDots() {
  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
        style={{
          background: "rgba(22,199,132,0.15)",
          border: "1px solid rgba(22,199,132,0.3)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z"
            fill="var(--green)"
          />
        </svg>
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <span
          className="dot-bounce w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: "var(--text-3)" }}
        />
        <span
          className="dot-bounce w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: "var(--text-3)" }}
        />
        <span
          className="dot-bounce w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: "var(--text-3)" }}
        />
      </div>
    </div>
  );
}

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(msgs.slice(-MAX_STORED)),
    );
  } catch {
    // ignore quota errors
  }
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveMessages(messages);
  }, [messages, hydrated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = "";
      setMessages([...next, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content }]);
      }
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  const lastIsAssistantStreaming =
    streaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant";
  const showDots = streaming && !lastIsAssistantStreaming;

  return (
    <div className="flex flex-col flex-1 overflow-hidden max-w-2xl mx-auto w-full px-3 md:px-4">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {!hydrated ? null : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
            <div className="text-center space-y-1">
              <p
                className="text-base font-semibold"
                style={{ color: "var(--text)" }}
              >
                Your coach is ready.
              </p>
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                Describe a hand, log a session, or ask about your leaks.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {HINTS.map((h) => (
                <button
                  key={h.text}
                  onClick={() => {
                    setInput(h.text);
                    textareaRef.current?.focus();
                  }}
                  className="flex items-center gap-3 text-left text-sm px-4 py-3 rounded-xl transition-all duration-150"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-2)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-bright)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border)")
                  }
                >
                  <span className="text-base shrink-0">{h.icon}</span>
                  <span
                    className="truncate"
                    style={{ color: "var(--text-3)" }}
                  >
                    {h.text}
                  </span>
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
                isStreaming={
                  streaming &&
                  i === messages.length - 1 &&
                  m.role === "assistant"
                }
              />
            ))}
          </>
        )}
        {showDots && <ThinkingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="pb-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Clear history button */}
        {messages.length > 0 && !streaming && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearHistory}
              className="text-xs transition-colors duration-150"
              style={{ color: "var(--text-3)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-3)")
              }
            >
              Clear conversation
            </button>
          </div>
        )}
        <form onSubmit={send} className="relative flex items-end gap-3">
          <div
            className="flex-1 relative rounded-2xl overflow-hidden transition-all duration-150"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-bright)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border)")
            }
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e as unknown as FormEvent);
                }
              }}
              placeholder="Describe a hand, log a session, or ask anything…"
              rows={1}
              style={{
                resize: "none",
                background: "transparent",
                color: "var(--text)",
                fontSize: "0.875rem",
                lineHeight: "1.6",
                padding: "12px 16px",
                width: "100%",
                outline: "none",
                border: "none",
              }}
            />
            <div
              className="px-3 pb-2 flex items-center justify-end"
              style={{ color: "var(--text-3)", fontSize: "0.7rem" }}
            >
              ↵ send · shift+↵ newline
            </div>
          </div>

          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
            style={{
              background:
                streaming || !input.trim() ? "var(--surface)" : "var(--green)",
              border: `1px solid ${streaming || !input.trim() ? "var(--border)" : "transparent"}`,
              cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
              opacity: streaming || !input.trim() ? 0.5 : 1,
            }}
          >
            {streaming ? (
              <span
                className="w-3 h-3 rounded-sm"
                style={{ background: "var(--text-3)" }}
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13"
                  stroke={input.trim() ? "#08080a" : "var(--text-3)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke={input.trim() ? "#08080a" : "var(--text-3)"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
