"use client";

import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = type === "success" ? "var(--green)" : "#f87171";
  const bg =
    type === "success"
      ? "rgba(22,199,132,0.08)"
      : "rgba(248,113,113,0.08)";
  const border =
    type === "success"
      ? "rgba(22,199,132,0.25)"
      : "rgba(248,113,113,0.25)";

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg"
        style={{
          background: bg,
          border: `1px solid ${border}`,
          backdropFilter: "blur(16px)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span style={{ fontSize: "0.875rem", color, fontWeight: 500 }}>
          {message}
        </span>
      </div>
    </div>
  );
}
