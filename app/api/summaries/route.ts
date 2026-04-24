import { NextResponse } from "next/server";
import { getLeakSummaries } from "@/lib/db";
import { leakCategoryLabel } from "@/lib/leak-engine";
import { getUser } from "@/lib/supabase/server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await getLeakSummaries(user.id);
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
