import type { Room, RoomStatus } from "../../src/lib/mock-data.ts";
import { pool } from "../db/pool.ts";

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

export function rowToRoom(row: RoomRow): Room {
  const raw =
    typeof row.players === "string"
      ? row.players
      : row.players instanceof Buffer
        ? row.players.toString("utf8")
        : "";
  let players: string[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      players = parsed.filter((p): p is string => typeof p === "string");
    }
  } catch {
    players = [];
  }
  return {
    id: row.id,
    name: row.name,
    host: row.host,
    maxPlayers: 2,
    stake: Number(row.stake) as 1 | 5 | 10,
    players,
    status: row.status as RoomStatus,
    createdAt: Number(row.created_at),
  };
}

export async function findAllRooms(): Promise<Room[]> {
  const [rows] = await pool.query(
    `SELECT id, name, host, max_players, stake, status, players, created_at
     FROM rooms ORDER BY created_at DESC`,
  );
  return (rows as RoomRow[]).map(rowToRoom);
}

export async function findRoomById(id: string): Promise<Room | null> {
  const [rows] = await pool.query(
    `SELECT id, name, host, max_players, stake, status, players, created_at
     FROM rooms WHERE id = ?`,
    [id],
  );
  const list = rows as RoomRow[];
  return list[0] ? rowToRoom(list[0]) : null;
}

export async function insertRoom(input: {
  id: string;
  name: string;
  host: string;
  stake: 1 | 5 | 10;
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
  const room = await findRoomById(input.id);
  if (!room) throw new Error("insertRoom returned no row");
  return room;
}
