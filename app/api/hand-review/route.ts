import { NextRequest, NextResponse } from "next/server";
import { parseHand } from "@/lib/hand-parser";

export async function POST(req: NextRequest) {
  const { raw } = await req.json();

  if (!raw || typeof raw !== "string") {
    return NextResponse.json({ error: "raw hand text required" }, { status: 400 });
  }

  const parsed = parseHand(raw);
  return NextResponse.json({ parsed });
}
