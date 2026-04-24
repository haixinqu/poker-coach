import { ParsedSession } from "./types";

function extractResult(text: string): number | undefined {
  const wonMatch = text.match(/won\s+\$?(\d+)/i);
  if (wonMatch) return parseInt(wonMatch[1]);
  const lostMatch = text.match(/lost\s+\$?(\d+)/i);
  if (lostMatch) return -parseInt(lostMatch[1]);
  const plusMatch = text.match(/[+]\s*\$?(\d+)/);
  if (plusMatch) return parseInt(plusMatch[1]);
  const minusMatch = text.match(/[-]\s*\$?(\d+)/);
  if (minusMatch) return -parseInt(minusMatch[1]);
  return undefined;
}

function extractDuration(text: string): number | undefined {
  const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*hours?/i);
  if (hoursMatch) return Math.round(parseFloat(hoursMatch[1]) * 60);
  const minsMatch = text.match(/(\d+)\s*min/i);
  if (minsMatch) return parseInt(minsMatch[1]);
  return undefined;
}

function extractStakes(text: string): string | undefined {
  const match = text.match(/\$?(\d+)\s*[/\/]\s*\$?(\d+)/);
  return match ? `${match[1]}/${match[2]}` : undefined;
}

function extractLocation(text: string): string | undefined {
  const knownRooms = ["commerce", "bicycle", "hustler", "aria", "bellagio", "wynn", "mgm", "venetian", "the lodge", "bay 101"];
  const lower = text.toLowerCase();
  for (const room of knownRooms) {
    if (lower.includes(room)) return room.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  const atMatch = text.match(/at\s+([A-Z][a-zA-Z\s]+?)(?:,|\.|$)/);
  return atMatch ? atMatch[1].trim() : undefined;
}

export function parseSession(raw: string): ParsedSession {
  const missing: string[] = [];

  const resultAmount = extractResult(raw);
  if (resultAmount === undefined) missing.push("result");

  const durationMinutes = extractDuration(raw);
  if (!durationMinutes) missing.push("duration");

  const stakes = extractStakes(raw);
  if (!stakes) missing.push("stakes");

  const location = extractLocation(raw);
  if (!location) missing.push("location");

  const gameType = /omaha|plo/i.test(raw) ? "PLO" : "NLHE";

  return {
    date: new Date().toISOString(),
    location,
    stakes,
    gameType,
    durationMinutes,
    resultAmount,
    notes: raw,
    missingFields: missing,
  };
}
