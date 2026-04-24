import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { loadConversation, saveConversation, clearConversation } from "@/lib/db";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const messages = await loadConversation(user.id);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { messages } = await req.json();
  await saveConversation(user.id, messages);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await clearConversation(user.id);
  return NextResponse.json({ ok: true });
}
