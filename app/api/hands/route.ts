import { NextRequest, NextResponse } from "next/server";
import { getRecentHandReviews } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const rows = await getRecentHandReviews(limit);

  const hands = rows.map((r) => ({
    id: r.id,
    input: r.raw_input,
    response: r.ai_response,
    created_at: r.created_at,
    leakSignals: r.leak_signals ? JSON.parse(r.leak_signals) : [],
  }));

  return NextResponse.json({ hands });
}
