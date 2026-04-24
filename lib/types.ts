export type Position = "UTG" | "UTG+1" | "UTG+2" | "LJ" | "HJ" | "CO" | "BTN" | "SB" | "BB" | "unknown";

export type Street = "preflop" | "flop" | "turn" | "river";

export type LeakCategory =
  | "preflop_too_loose_ep"
  | "over_defending_blind_vs_open"
  | "passive_turn_play"
  | "river_overcall"
  | "under_bluffing_river"
  | "value_betting_too_thin_vs_nits"
  | "stack_depth_misplay"
  | "unknown";

export interface ParsedHand {
  stakes?: string;
  format?: "cash" | "mtt" | "unknown";
  effectiveStack?: number;
  heroPosition?: Position;
  villainPosition?: Position;
  holeCards?: string;
  board?: string;
  actionSequence?: string;
  potSize?: number;
  reads?: string;
  missingFields: string[];
}

export interface ParsedSession {
  date?: string;
  location?: string;
  stakes?: string;
  gameType?: string;
  durationMinutes?: number;
  resultAmount?: number;
  notes?: string;
  missingFields: string[];
}

export interface LeakSignal {
  category: LeakCategory;
  confidence: number;
  note?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LeakSummary {
  id: string;
  category: LeakCategory;
  label: string;
  confidence: number;
  count: number;
  example?: string;
}
