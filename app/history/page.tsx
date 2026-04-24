import type { Metadata } from "next";
import HandHistory from "@/components/HandHistory";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: "var(--text)" }}
          >
            Hand History
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            All hands reviewed by your coach — tap to expand.
          </p>
        </div>
        <HandHistory />
      </div>
    </div>
  );
}
