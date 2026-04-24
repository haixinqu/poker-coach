import { LeakCategory, LeakSignal, ParsedHand } from "./types";

const RIVER_OVERCALL_SIGNALS = ["river", "jam", "shove", "call", "tank call"];
const PASSIVE_TURN_SIGNALS = ["check", "turn", "checked back", "gave up"];
const PREFLOP_LOOSE_EP_SIGNALS = ["utg", "open", "ep", "early"];

function scoreSignals(text: string, signals: string[]): number {
  const lower = text.toLowerCase();
  const hits = signals.filter((s) => lower.includes(s)).length;
  return hits / signals.length;
}

export function extractLeakSignals(hand: ParsedHand): LeakSignal[] {
  const text = hand.actionSequence ?? "";
  const signals: LeakSignal[] = [];

  const riverScore = scoreSignals(text, RIVER_OVERCALL_SIGNALS);
  if (riverScore > 0.4) {
    signals.push({ category: "river_overcall", confidence: Math.min(riverScore, 0.9) });
  }

  const turnScore = scoreSignals(text, PASSIVE_TURN_SIGNALS);
  if (turnScore > 0.4) {
    signals.push({ category: "passive_turn_play", confidence: Math.min(turnScore, 0.85) });
  }

  if (hand.heroPosition === "UTG" || hand.heroPosition === "UTG+1") {
    const epScore = scoreSignals(text, PREFLOP_LOOSE_EP_SIGNALS);
    if (epScore > 0.3) {
      signals.push({ category: "preflop_too_loose_ep", confidence: Math.min(epScore, 0.7) });
    }
  }

  if (signals.length === 0) {
    signals.push({ category: "unknown", confidence: 0.1 });
  }

  return signals;
}

export function leakCategoryLabel(category: LeakCategory): string {
  const labels: Record<LeakCategory, string> = {
    preflop_too_loose_ep: "Preflop: Too Loose EP",
    over_defending_blind_vs_open: "Over-defending Blinds",
    passive_turn_play: "Passive Turn Play",
    river_overcall: "River Overcalling",
    under_bluffing_river: "Under-bluffing River",
    value_betting_too_thin_vs_nits: "Value Betting Too Thin",
    stack_depth_misplay: "Stack Depth Misplay",
    unknown: "Unclassified",
  };
  return labels[category] ?? category;
}
