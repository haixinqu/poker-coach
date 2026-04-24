import { NextRequest, NextResponse } from "next/server";
import { getRecentHandReviews } from "@/lib/db";
import { getUser } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const rows = await getRecentHandReviews(user.id, limit);

  const hands = rows.map((r) => ({
    id: r.id,
    input: r.raw_input,
    response: r.ai_response,
    created_at: r.created_at,
    leakSignals: r.leak_signals ? JSON.parse(r.leak_signals) : [],
  }));

  return NextResponse.json({ hands });
}
