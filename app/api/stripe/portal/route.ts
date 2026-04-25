import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ).from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();

  if (!data?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://poker-coach-woad.vercel.app";
  const session = await stripe.billingPortal.sessions.create({
    customer:   data.stripe_customer_id,
    return_url: `${appUrl}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
