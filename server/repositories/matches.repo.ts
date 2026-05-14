import type { Hand, Match } from "../../src/lib/mock-data.ts";
import { pool } from "../db/pool.ts";

type MatchRow = {
  id: string;
  room_id: string;
  room_name: string;
  stake: number;
  winner: string;
  loser: string;
  winner_hand: string;
  loser_hand: string;
  payout: string | number;
  finished_at: number;
};

export function rowToMatch(row: MatchRow): Match {
  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.room_name,
    stake: Number(row.stake),
    winner: row.winner,
    loser: row.loser,
    winnerHand: row.winner_hand as Hand,
    loserHand: row.loser_hand as Hand,
    payout: Number(row.payout),
    finishedAt: Number(row.finished_at),
  };
}

export async function listMatches(limit: number): Promise<Match[]> {
  const [rows] = await pool.query(
    `SELECT id, room_id, room_name, stake, winner, loser, winner_hand, loser_hand, payout, finished_at
     FROM matches ORDER BY finished_at DESC LIMIT ?`,
    [limit],
  );
  return (rows as MatchRow[]).map(rowToMatch);
}

export async function listMatchesForPlayer(player: string, limit: number): Promise<Match[]> {
  const [rows] = await pool.query(
    `SELECT id, room_id, room_name, stake, winner, loser, winner_hand, loser_hand, payout, finished_at
     FROM matches
     WHERE winner = ? OR loser = ?
     ORDER BY finished_at DESC
     LIMIT ?`,
    [player, player, limit],
  );
  return (rows as MatchRow[]).map(rowToMatch);
}
