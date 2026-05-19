/** Shared types + virtual coin helpers (frontend + server import this file). */

export type Hand = "rock" | "paper" | "scissors";
export type RoomStatus = "waiting" | "playing" | "finished";

export const STAKE_TIERS = [10, 20, 50, 100] as const;
export type StakeTier = (typeof STAKE_TIERS)[number];

export interface Room {
  id: string;
  name: string;
  host: string;
  maxPlayers: 2;
  stake: StakeTier;
  players: string[];
  status: RoomStatus;
  createdAt: number;
}

export interface Match {
  id: string;
  roomId: string;
  roomName: string;
  stake: number;
  winner: string;
  loser: string;
  winnerHand: Hand;
  loserHand: Hand;
  payout: number;
  finishedAt: number;
}

export const HAND_EMOJI: Record<Hand, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};

export const HAND_JP: Record<Hand, string> = {
  rock: "グー",
  paper: "パー",
  scissors: "チョキ",
};

export function determineWinner(a: Hand, b: Hand): "a" | "b" | "draw" {
  if (a === b) return "draw";
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  )
    return "a";
  return "b";
}

export function formatCoins(amount: number): string {
  return Math.round(amount).toLocaleString("ja-JP");
}

export function formatCoinsWithUnit(amount: number): string {
  return `${formatCoins(amount)} コイン`;
}

export function stakeTierLabel(tier: StakeTier): string {
  return `${formatCoins(tier)} コイン`;
}

export function calcWinPayout(stake: number, maxPlayers = 2): number {
  return stake * (maxPlayers - 1) * 1.9;
}
