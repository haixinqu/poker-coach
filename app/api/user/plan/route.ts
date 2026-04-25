import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { getSubscriptionStatus } from "@/lib/db";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ plan: "free" });
  const plan = await getSubscriptionStatus(user.id);
  return NextResponse.json({ plan });
}
