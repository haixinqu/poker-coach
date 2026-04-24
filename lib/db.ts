import { createClient } from "@supabase/supabase-js";
import { LeakCategory } from "./types";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export interface LeakSummaryRow {
  id: number;
  category: LeakCategory;
  confidence: number;
  count: number;
  example?: string;
}

export interface SessionLogRow {
  id: number;
  result_amount: number | null;
  stakes: string | null;
  location: string | null;
  created_at: string;
}

export interface HandReviewRow {
  id: number;
  raw_input: string;
  ai_response: string | null;
  leak_signals: string | null;
  created_at: string;
}

export interface FullSessionRow {
  id: number;
  raw_input: string;
  result_amount: number | null;
  stakes: string | null;
  location: string | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface Stats {
  totalHands: number;
  totalSessions: number;
  totalProfit: number;
  winSessions: number;
}

export async function insertHandReview(data: {
  rawInput: string;
  parsedHand?: object;
  aiResponse?: string;
  leakSignals?: object[];
}) {
  await getClient().from("hand_reviews").insert({
    user_id: "default",
    raw_input: data.rawInput,
    parsed_hand: data.parsedHand ? JSON.stringify(data.parsedHand) : null,
    ai_response: data.aiResponse ?? null,
    leak_signals: data.leakSignals ? JSON.stringify(data.leakSignals) : null,
  });
}

export async function insertSession(data: {
  rawInput: string;
  parsedSession?: object;
  resultAmount?: number;
  stakes?: string;
  location?: string;
  durationMinutes?: number;
}) {
  await getClient().from("session_logs").insert({
    user_id: "default",
    raw_input: data.rawInput,
    parsed_session: data.parsedSession ? JSON.stringify(data.parsedSession) : null,
    result_amount: data.resultAmount ?? null,
    stakes: data.stakes ?? null,
    location: data.location ?? null,
    duration_minutes: data.durationMinutes ?? null,
  });
}

export async function upsertLeakSummary(
  category: string,
  confidence: number,
  example?: string,
) {
  const db = getClient();
  const { data: existing } = await db
    .from("leak_summaries")
    .select("count, confidence")
    .eq("user_id", "default")
    .eq("category", category)
    .maybeSingle();

  if (existing) {
    const newCount = (existing as { count: number; confidence: number }).count + 1;
    const newConf =
      ((existing as { count: number; confidence: number }).confidence *
        (existing as { count: number; confidence: number }).count +
        confidence) /
      newCount;
    await db
      .from("leak_summaries")
      .update({
        count: newCount,
        confidence: newConf,
        ...(example ? { example } : {}),
        last_updated_at: new Date().toISOString(),
      })
      .eq("user_id", "default")
      .eq("category", category);
  } else {
    await db.from("leak_summaries").insert({
      user_id: "default",
      category,
      confidence,
      count: 1,
      example: example ?? null,
    });
  }
}

export async function getLeakSummaries(): Promise<LeakSummaryRow[]> {
  const { data } = await getClient()
    .from("leak_summaries")
    .select("id, category, confidence, count, example")
    .eq("user_id", "default")
    .order("confidence", { ascending: false });
  return (data ?? []) as LeakSummaryRow[];
}

export async function getSessionLogs(): Promise<SessionLogRow[]> {
  const { data } = await getClient()
    .from("session_logs")
    .select("id, result_amount, stakes, location, created_at")
    .eq("user_id", "default")
    .order("created_at", { ascending: true });
  return (data ?? []) as SessionLogRow[];
}

export async function getRecentHandReviews(limit = 5): Promise<HandReviewRow[]> {
  const { data } = await getClient()
    .from("hand_reviews")
    .select("id, raw_input, ai_response, leak_signals, created_at")
    .eq("user_id", "default")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as HandReviewRow[];
}

export async function getAllSessions(): Promise<FullSessionRow[]> {
  const { data } = await getClient()
    .from("session_logs")
    .select("id, raw_input, result_amount, stakes, location, duration_minutes, created_at")
    .eq("user_id", "default")
    .order("created_at", { ascending: false });
  return (data ?? []) as FullSessionRow[];
}

export async function getStats(): Promise<Stats> {
  const db = getClient();
  const [handsRes, sessionsRes, profitRes, winsRes] = await Promise.all([
    db
      .from("hand_reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", "default"),
    db
      .from("session_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", "default"),
    db.from("session_logs").select("result_amount").eq("user_id", "default"),
    db
      .from("session_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", "default")
      .gt("result_amount", 0),
  ]);

  const totalProfit = (profitRes.data ?? []).reduce(
    (sum: number, r: { result_amount: number | null }) =>
      sum + (r.result_amount ?? 0),
    0,
  );

  return {
    totalHands: handsRes.count ?? 0,
    totalSessions: sessionsRes.count ?? 0,
    totalProfit: Math.round(totalProfit),
    winSessions: winsRes.count ?? 0,
  };
}
