import { NextRequest, NextResponse } from "next/server";
import { parseSession } from "@/lib/session-parser";
import { insertSession } from "@/lib/db";
import { getUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { raw } = await req.json();
  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "raw session text required" }, { status: 400 });
  }

  const parsed = parseSession(raw);
  await insertSession(user.id, {
    rawInput: raw,
    parsedSession: parsed,
    resultAmount: parsed.resultAmount,
    stakes: parsed.stakes,
    location: parsed.location,
    durationMinutes: parsed.durationMinutes,
  });

  return NextResponse.json({ parsed });
}
