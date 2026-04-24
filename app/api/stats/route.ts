import { NextResponse } from "next/server";
import { getStats } from "@/lib/db";
import { getUser } from "@/lib/supabase/server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(await getStats(user.id));
}
