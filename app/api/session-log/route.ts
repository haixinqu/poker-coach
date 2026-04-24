import { NextRequest, NextResponse } from "next/server";
import { parseSession } from "@/lib/session-parser";
import { insertSession } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { raw } = await req.json();

  if (!raw || typeof raw !== "string") {
    return NextResponse.json(
      { error: "raw session text required" },
      { status: 400 },
    );
  }

  const parsed = parseSession(raw);

  await insertSession({
    rawInput: raw,
    parsedSession: parsed,
    resultAmount: parsed.resultAmount,
    stakes: parsed.stakes,
    location: parsed.location,
    durationMinutes: parsed.durationMinutes,
  });

  return NextResponse.json({ parsed });
}
