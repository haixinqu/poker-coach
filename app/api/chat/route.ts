import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildConversationMessages } from "@/lib/prompts";
import { ChatMessage } from "@/lib/types";
import { parseHand } from "@/lib/hand-parser";
import { extractLeakSignals } from "@/lib/leak-engine";
import { insertHandReview, upsertLeakSummary, getTodayHandCount, getSubscriptionStatus } from "@/lib/db";
import { getMemoryContext } from "@/lib/coach-memory";
import { getUser } from "@/lib/supabase/server";

const FREE_DAILY_LIMIT = 3;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Free tier limit check
  const [plan, todayCount] = await Promise.all([
    getSubscriptionStatus(user.id),
    getTodayHandCount(user.id),
  ]);
  if (plan === "free" && todayCount >= FREE_DAILY_LIMIT) {
    return new Response(JSON.stringify({ error: "daily_limit_reached" }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await req.json();
  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const memory = await getMemoryContext(user.id);
  const systemPrompt = memory.recentHandsSummary
    ? `${SYSTEM_PROMPT}\n\n## Player's prior hands (reference when relevant — especially for pattern recognition)\n${memory.recentHandsSummary}`
    : SYSTEM_PROMPT;

  const anthropicMessages = buildConversationMessages(messages as ChatMessage[]);
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const lastUserMsg =
    (messages as ChatMessage[]).filter((m) => m.role === "user").at(-1)
      ?.content ?? "";

  const userId = user.id;
  const readableStream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      } finally {
        controller.close();
      }

      if (lastUserMsg) {
        try {
          const parsed = parseHand(lastUserMsg);
          const signals = extractLeakSignals(parsed);
          await insertHandReview(userId, {
            rawInput: lastUserMsg,
            parsedHand: parsed,
            aiResponse: fullResponse,
            leakSignals: signals,
          });
          for (const s of signals) {
            if (s.category !== "unknown") {
              await upsertLeakSummary(userId, s.category, s.confidence);
            }
          }
        } catch {
          // Non-critical
        }
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
