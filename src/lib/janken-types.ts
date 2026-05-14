export type Hand = "rock" | "paper" | "scissors";
export type RoomStatus = "waiting" | "playing" | "finished";

export interface Room {
  id: string;
  name: string;
  host: string;
  maxPlayers: 2;
  stake: 1 | 5 | 10;
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
