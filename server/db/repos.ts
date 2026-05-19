/** All MySQL access in one file. */
import {
  DEFAULT_AVATAR,
  isAvatarPreset,
  type Hand,
  type Match,
  type PlayerProfile,
  type Room,
  type RoomStatus,
  type StakeTier,
} from "../../src/lib/types.ts";
import { pool } from "./pool.ts";

type RoomRow = {
  id: string;
  name: string;
  host: string;
  max_players: number;
  stake: number;
  status: string;
  players: string | Buffer;
  created_at: number;
};

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

function parsePlayers(raw: string | Buffer): string[] {
  const text =
    typeof raw === "string" ? raw : raw instanceof Buffer ? raw.toString("utf8") : "";
  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    /* empty */
  }
  return [];
}

function toRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    host: row.host,
    maxPlayers: 2,
    stake: Number(row.stake) as StakeTier,
    players: parsePlayers(row.players),
    status: row.status as RoomStatus,
    createdAt: Number(row.created_at),
  };
}

function toMatch(row: MatchRow): Match {
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

export async function listRooms(): Promise<Room[]> {
  const [rows] = await pool.query(
    `SELECT id, name, host, max_players, stake, status, players, created_at
     FROM rooms ORDER BY created_at DESC`,
  );
  return (rows as RoomRow[]).map(toRoom);
}

export async function getRoom(id: string): Promise<Room | null> {
  const [rows] = await pool.query(
    `SELECT id, name, host, max_players, stake, status, players, created_at
     FROM rooms WHERE id = ?`,
    [id],
  );
  const row = (rows as RoomRow[])[0];
  return row ? toRoom(row) : null;
}

export async function createRoom(input: {
  id: string;
  name: string;
  host: string;
  stake: StakeTier;
  players: string[];
  status: RoomStatus;
  createdAt: number;
}): Promise<Room> {
  await pool.query(
    `INSERT INTO rooms (id, name, host, max_players, stake, status, players, created_at)
     VALUES (?, ?, ?, 2, ?, ?, ?, ?)`,
    [
      input.id,
      input.name,
      input.host,
      input.stake,
      input.status,
      JSON.stringify(input.players),
      input.createdAt,
    ],
  );
  const room = await getRoom(input.id);
  if (!room) throw new Error("createRoom failed");
  return room;
}

export async function listMatches(limit: number): Promise<Match[]> {
  const [rows] = await pool.query(
    `SELECT id, room_id, room_name, stake, winner, loser, winner_hand, loser_hand, payout, finished_at
     FROM matches ORDER BY finished_at DESC LIMIT ?`,
    [limit],
  );
  return (rows as MatchRow[]).map(toMatch);
}

export async function listMatchesForPlayer(player: string, limit: number): Promise<Match[]> {
  const [rows] = await pool.query(
    `SELECT id, room_id, room_name, stake, winner, loser, winner_hand, loser_hand, payout, finished_at
     FROM matches WHERE winner = ? OR loser = ? ORDER BY finished_at DESC LIMIT ?`,
    [player, player, limit],
  );
  return (rows as MatchRow[]).map(toMatch);
}

type PlayerRow = {
  name: string;
  wallet: string;
  balance: string | number;
  avatar?: string;
};

function toPlayer(row: PlayerRow): PlayerProfile {
  const avatar =
    row.avatar && isAvatarPreset(row.avatar) ? row.avatar : DEFAULT_AVATAR;
  return { name: row.name, wallet: row.wallet, balance: Number(row.balance), avatar };
}

export async function getPlayer(name: string): Promise<PlayerProfile | null> {
  const [rows] = await pool.query(
    "SELECT name, wallet, balance, avatar FROM players WHERE name = ?",
    [name],
  );
  const r = (rows as PlayerRow[])[0];
  return r ? toPlayer(r) : null;
}

export async function updatePlayerAvatar(
  name: string,
  avatar: string,
): Promise<PlayerProfile | null> {
  if (!isAvatarPreset(avatar)) return null;
  await pool.query("UPDATE players SET avatar = ? WHERE name = ?", [avatar, name]);
  return getPlayer(name);
}
