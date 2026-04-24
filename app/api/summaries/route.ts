import { NextResponse } from "next/server";
import { getLeakSummaries } from "@/lib/db";
import { leakCategoryLabel } from "@/lib/leak-engine";

export async function GET() {
  const rows = await getLeakSummaries();
  const summaries = rows.map((r) => ({
    id: String(r.id),
    category: r.category,
    label: leakCategoryLabel(r.category),
    confidence: r.confidence,
    count: r.count,
    example: r.example,
  }));
  return NextResponse.json({ summaries });
}
