"use client";

import { ChatMessage } from "@/lib/types";

interface Props {
  message: ChatMessage;
  isStreaming?: boolean;
}

function CoachAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
      style={{ background: "rgba(22,199,132,0.12)", border: "1px solid rgba(22,199,132,0.25)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z"
          fill="var(--green)"
        />
      </svg>
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} style={{ color: "var(--text)", fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function renderContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      elements.push(<div key={`sp-${i}`} className="h-2" />);
      i++; continue;
    }

    // Heading: ### or ##
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      elements.push(
        <p key={i} className="mt-3 mb-1 text-sm font-semibold" style={{ color: "var(--text)" }}>
          <InlineText text={headingMatch[1]} />
        </p>,
      );
      i++; continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2.5 mt-2">
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5"
            style={{ background: "rgba(22,199,132,0.12)", color: "var(--green)" }}
          >
            {numMatch[1]}
          </span>
          <p className="flex-1 leading-relaxed text-sm" style={{ color: "var(--text-2)" }}>
            <InlineText text={numMatch[2]} />
          </p>
        </div>,
      );
      i++; continue;
    }

    // Bullet
    const bulletMatch = line.match(/^[-•*]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-2 mt-1.5">
          <span className="shrink-0 w-1 h-1 rounded-full mt-[8px]" style={{ background: "var(--green)" }} />
          <p className="flex-1 leading-relaxed text-sm" style={{ color: "var(--text-2)" }}>
            <InlineText text={bulletMatch[1]} />
          </p>
        </div>,
      );
      i++; continue;
    }

    elements.push(
      <p key={i} className="leading-relaxed text-sm" style={{ color: "var(--text-2)" }}>
        <InlineText text={line} />
      </p>,
    );
    i++;
  }

  return elements;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-end gap-2.5 justify-end animate-slide-up">
        <div
          className="max-w-[72%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
            color: "#fff",
            boxShadow: "0 2px 16px rgba(99,102,241,0.25)",
          }}
        >
          {message.content}
        </div>
        <div
          className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "#fff" }}
        >
          U
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 animate-slide-up">
      <CoachAvatar />
      <div
        className="max-w-[82%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm relative"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderLeft: "2px solid var(--green)",
          boxShadow: "0 0 0 0 transparent",
        }}
      >
        {renderContent(message.content)}
        {isStreaming && (
          <span
            className="animate-blink inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded"
            style={{ background: "var(--green)" }}
          />
        )}
      </div>
    </div>
  );
}
