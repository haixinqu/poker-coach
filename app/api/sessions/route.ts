import { NextRequest, NextResponse } from "next/server";
import { getSessionLogs, getAllSessions } from "@/lib/db";

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("view") === "list") {
    const rows = await getAllSessions();
    return NextResponse.json({ sessions: rows });
  }

  // Chart data: cumulative profit per session
  const rows = await getSessionLogs();
  let cumulative = 0;
  const sessions = rows.map((r, i) => {
    cumulative += r.result_amount ?? 0;
    return {
      label: `S${i + 1}`,
      cumulative: Math.round(cumulative),
      result: r.result_amount ?? 0,
      stakes: r.stakes ?? "",
      location: r.location ?? "",
      date: r.created_at,
    };
  });

  return NextResponse.json({ sessions });
}
