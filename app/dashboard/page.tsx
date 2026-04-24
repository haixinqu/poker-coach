import type { Metadata } from "next";
import ProfitChart from "@/components/ProfitChart";
import LeakSummaryCard from "@/components/LeakSummaryCard";
import StatsRow from "@/components/StatsRow";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "3.5rem 1.5rem 4rem" }}>

        {/* Hero heading */}
        <div className="animate-fade-up" style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: "0.75rem" }}>
            Your <span className="gradient-text">Performance</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-2)" }}>
            Track your bankroll, analyze leaks, and dominate the table.
          </p>
        </div>

        {/* Stats */}
        <div className="animate-fade-up" style={{ animationDelay: "0.05s", marginBottom: "1.5rem" }}>
          <StatsRow />
        </div>

        {/* Chart */}
        <div className="animate-fade-up" style={{ animationDelay: "0.1s", marginBottom: "1.5rem" }}>
          <ProfitChart />
        </div>

        {/* Leaks */}
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <LeakSummaryCard />
        </div>

      </div>
    </div>
  );
}
