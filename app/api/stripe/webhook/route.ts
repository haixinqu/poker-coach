import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function upsertSubscription(userId: string, patch: Record<string, unknown>) {
  await db().from("subscriptions").upsert(
    { user_id: userId, updated_at: new Date().toISOString(), ...patch },
    { onConflict: "user_id" },
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.user_id;
      if (!userId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      await upsertSubscription(userId, {
        stripe_customer_id:      session.customer,
        stripe_subscription_id:  sub.id,
        status:                  "pro",
        current_period_end:      new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = (sub.metadata as Record<string, string>)?.user_id;
      if (!userId) break;

      const isActive = sub.status === "active";
      await upsertSubscription(userId, {
        stripe_subscription_id: sub.id,
        status:                 isActive ? "pro" : "free",
        current_period_end:     new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
