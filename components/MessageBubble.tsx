"use client";

import { ChatMessage } from "@/lib/types";

interface Props { message: ChatMessage; isStreaming?: boolean; }

function CoachIcon() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: "rgba(22,199,132,0.12)", border: "1px solid rgba(22,199,132,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 12px rgba(22,199,132,0.2)",
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z" fill="var(--green)" />
      </svg>
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} style={{ color: "var(--text)", fontWeight: 600 }}>{p.slice(2,-2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

function renderContent(text: string) {
  const els: React.ReactNode[] = [];
  let i = 0;
  for (const line of text.split("\n")) {
    if (!line.trim()) { els.push(<div key={i++} style={{ height: 8 }} />); continue; }

    const hMatch = line.match(/^#{1,3}\s+(.+)/);
    if (hMatch) {
      els.push(<p key={i++} style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", margin: "0.75rem 0 0.25rem" }}><InlineText text={hMatch[1]} /></p>);
      continue;
    }
    const nMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (nMatch) {
      els.push(
        <div key={i++} style={{ display: "flex", gap: "0.75rem", marginTop: "0.6rem" }}>
          <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: "rgba(22,199,132,0.15)", color: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, marginTop: 2 }}>
            {nMatch[1]}
          </span>
          <p style={{ flex: 1, lineHeight: 1.7, color: "var(--text-2)", fontSize: "0.9rem" }}><InlineText text={nMatch[2]} /></p>
        </div>
      );
      continue;
    }
    const bMatch = line.match(/^[-•*]\s+(.+)/);
    if (bMatch) {
      els.push(
        <div key={i++} style={{ display: "flex", gap: "0.625rem", marginTop: "0.5rem" }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: "var(--green)", marginTop: 8, boxShadow: "0 0 4px rgba(22,199,132,0.5)" }} />
          <p style={{ flex: 1, lineHeight: 1.7, color: "var(--text-2)", fontSize: "0.9rem" }}><InlineText text={bMatch[1]} /></p>
        </div>
      );
      continue;
    }
    els.push(<p key={i++} style={{ lineHeight: 1.7, color: "var(--text-2)", fontSize: "0.9rem" }}><InlineText text={line} /></p>);
  }
  return els;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="animate-slide-left" style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: "0.75rem" }}>
        <div style={{
          maxWidth: "72%",
          padding: "1rem 1.25rem",
          borderRadius: "22px 22px 4px 22px",
          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          color: "#fff",
          fontSize: "0.95rem",
          lineHeight: 1.65,
          boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
        }}>
          {message.content}
        </div>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700, color: "#fff",
          boxShadow: "0 0 12px rgba(99,102,241,0.35)",
        }}>U</div>
      </div>
    );
  }

  return (
    <div className="animate-slide-right" style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
      <CoachIcon />
      <div style={{
        maxWidth: "82%",
        padding: "1.1rem 1.35rem",
        borderRadius: "22px 22px 22px 4px",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: "3px solid var(--green)",
        boxShadow: "0 0 0 1px rgba(22,199,132,0.06), inset 0 0 30px rgba(22,199,132,0.02)",
        position: "relative", overflow: "hidden",
      }}>
        <div className="scan-beam" />
        {renderContent(message.content)}
        {isStreaming && (
          <span className="animate-blink" style={{ display: "inline-block", width: 2, height: 16, background: "var(--green)", verticalAlign: "middle", marginLeft: 4, borderRadius: 2 }} />
        )}
      </div>
    </div>
  );
}
