import type { Metadata } from "next";
import HandHistory from "@/components/HandHistory";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "3.5rem 1.5rem 4rem" }}>

        <div className="animate-fade-up" style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "0.75rem" }}>
            Hand <span className="gradient-text">History</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-2)" }}>
            All hands reviewed by your coach — tap to expand.
          </p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
          <HandHistory />
        </div>

      </div>
    </div>
  );
}
