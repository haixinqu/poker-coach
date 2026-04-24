import { getRecentHandReviews } from "./db";
import { LeakCategory } from "./types";

export interface MemoryContext {
  recentHandsSummary: string | null;
  playerProfile: string | null;
}

interface LeakSignalRaw {
  category: LeakCategory;
  confidence: number;
}

export async function getMemoryContext(userId: string): Promise<MemoryContext> {
  const hands = await getRecentHandReviews(userId, 6);

  if (hands.length === 0) {
    return { recentHandsSummary: null, playerProfile: null };
  }

  const lines = hands.map((h, i) => {
    const date = h.created_at.slice(0, 10);
    const snippet = h.raw_input.slice(0, 150).replace(/\n/g, " ").trim();
    let leakNote = "";
    if (h.leak_signals) {
      try {
        const signals = JSON.parse(h.leak_signals) as LeakSignalRaw[];
        const notable = signals
          .filter((s) => s.category !== "unknown" && s.confidence > 0.4)
          .map((s) => s.category);
        if (notable.length > 0) leakNote = ` [flagged: ${notable.join(", ")}]`;
      } catch {
        // ignore parse errors
      }
    }
    return `Hand ${i + 1} (${date}): ${snippet}${leakNote}`;
  });

  return {
    recentHandsSummary: lines.join("\n"),
    playerProfile: null,
  };
}
