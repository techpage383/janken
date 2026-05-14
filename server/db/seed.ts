import { ME, MOCK_MATCHES, MOCK_ROOMS, MY_MATCHES, type Match } from "../../src/lib/mock-data.ts";
import { pool } from "./pool.ts";

function allMatches(): Match[] {
  const byId = new Map<string, Match>();
  for (const m of MOCK_MATCHES) byId.set(m.id, m);
  for (const m of MY_MATCHES) byId.set(m.id, m);
  return [...byId.values()];
}

export async function seedIfEmpty(): Promise<void> {
  const [rows] = await pool.query("SELECT COUNT(*) AS c FROM rooms");
  const first = (rows as { c: number | string }[])[0];
  if (Number(first?.c ?? 0) > 0) return;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`INSERT INTO players (name, wallet, balance) VALUES (?, ?, ?)`, [
      ME.name,
      ME.wallet,
      ME.balance,
    ]);

    for (const r of MOCK_ROOMS) {
      await conn.query(
        `INSERT INTO rooms (id, name, host, max_players, stake, status, players, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.name,
          r.host,
          r.maxPlayers,
          r.stake,
          r.status,
          JSON.stringify(r.players),
          r.createdAt,
        ],
      );
    }

    for (const m of allMatches()) {
      await conn.query(
        `INSERT INTO matches (id, room_id, room_name, stake, winner, loser, winner_hand, loser_hand, payout, finished_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.roomId,
          m.roomName,
          m.stake,
          m.winner,
          m.loser,
          m.winnerHand,
          m.loserHand,
          m.payout,
          m.finishedAt,
        ],
      );
    }

    await conn.commit();
    console.log("Database seeded (rooms, matches, default player).");
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
