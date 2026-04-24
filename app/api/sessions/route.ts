import { NextRequest, NextResponse } from "next/server";
import { getSessionLogs, getAllSessions, insertSession } from "@/lib/db";
import { getUser } from "@/lib/supabase/server";

export async function GET(req: NextRequest): Promise<Response> {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  if (searchParams.get("view") === "list") {
    const rows = await getAllSessions(user.id);
    return NextResponse.json({ sessions: rows });
  }

  const rows = await getSessionLogs(user.id);
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

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await insertSession(user.id, {
    rawInput: [body.location, body.stakes, body.resultAmount != null ? `${body.resultAmount >= 0 ? "+" : ""}$${body.resultAmount}` : "", body.durationMinutes ? `${(body.durationMinutes / 60).toFixed(1)}h` : ""].filter(Boolean).join(", "),
    resultAmount: body.resultAmount,
    stakes: body.stakes ?? null,
    location: body.location ?? null,
    durationMinutes: body.durationMinutes ?? null,
  });

  return NextResponse.json({ ok: true });
}
