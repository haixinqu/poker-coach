import { ParsedHand, Position } from "./types";

const POSITION_PATTERNS: [RegExp, Position][] = [
  [/\bUTG\+2\b/i, "UTG+2"],
  [/\bUTG\+1\b/i, "UTG+1"],
  [/\bUTG\b/i, "UTG"],
  [/\b(lojack|LJ)\b/i, "LJ"],
  [/\b(hijack|HJ)\b/i, "HJ"],
  [/\b(cutoff|CO)\b/i, "CO"],
  [/\b(button|BTN|BU)\b/i, "BTN"],
  [/\b(small blind|SB)\b/i, "SB"],
  [/\b(big blind|BB)\b/i, "BB"],
];

function extractPosition(text: string): Position | undefined {
  for (const [pattern, pos] of POSITION_PATTERNS) {
    if (pattern.test(text)) return pos;
  }
  return undefined;
}

function extractStakes(text: string): string | undefined {
  const match = text.match(/\$?(\d+)\s*[/\/]\s*\$?(\d+)/);
  return match ? `${match[1]}/${match[2]}` : undefined;
}

function extractEffectiveStack(text: string): number | undefined {
  const bbMatch = text.match(/(\d+)\s*bb/i);
  if (bbMatch) return parseInt(bbMatch[1]);
  const stackMatch = text.match(/(\d+)\s*(dollar|chip|deep)/i);
  if (stackMatch) return parseInt(stackMatch[1]);
  return undefined;
}

function extractHoleCards(text: string): string | undefined {
  const match = text.match(/\b([2-9TJQKA]{1,2}[shdc]?[o]?)\s+([2-9TJQKA]{1,2}[shdc]?[o]?)\b|\b([AKQJTakqjt2-9]{2}[os]?)\b/);
  return match ? match[0] : undefined;
}

function extractBoard(text: string): string | undefined {
  const match = text.match(/flop\s+([^\,\.]+)/i);
  return match ? match[1].trim() : undefined;
}

export function parseHand(raw: string): ParsedHand {
  const missing: string[] = [];

  const stakes = extractStakes(raw);
  if (!stakes) missing.push("stakes");

  const heroPos = extractPosition(raw.split(/villain|opponent|he |they /i)[0]);
  if (!heroPos) missing.push("hero position");

  const effectiveStack = extractEffectiveStack(raw);
  if (!effectiveStack) missing.push("effective stack");

  const holeCards = extractHoleCards(raw);
  if (!holeCards) missing.push("hole cards");

  const board = extractBoard(raw);
  if (!board) missing.push("board");

  const format = /mtt|tournament/i.test(raw) ? "mtt" : /cash|live/i.test(raw) ? "cash" : "unknown";

  return {
    stakes,
    format,
    effectiveStack,
    heroPosition: heroPos,
    holeCards,
    board,
    actionSequence: raw,
    missingFields: missing,
  };
}
