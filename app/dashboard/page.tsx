import type { Metadata } from "next";
import ProfitChart from "@/components/ProfitChart";

export const metadata: Metadata = { title: "Dashboard" };
import LeakSummaryCard from "@/components/LeakSummaryCard";
import StatsRow from "@/components/StatsRow";

export default function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 space-y-4">
        <div className="mb-2">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ color: "var(--text)" }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-3)" }}>
            Your results and leak patterns over time.
          </p>
        </div>
        <StatsRow />
        <ProfitChart />
        <LeakSummaryCard />
      </div>
    </div>
  );
}
