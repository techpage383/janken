import { allSeedMatches, SEED_PLAYER, SEED_ROOMS } from "./seed-data.ts";
import { pool } from "./pool.ts";

export async function seedIfEmpty(): Promise<void> {
  const [rows] = await pool.query("SELECT COUNT(*) AS c FROM rooms");
  const first = (rows as { c: number | string }[])[0];
  if (Number(first?.c ?? 0) > 0) return;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`INSERT INTO players (name, wallet, balance, avatar) VALUES (?, ?, ?, ?)`, [
      SEED_PLAYER.name,
      SEED_PLAYER.wallet,
      SEED_PLAYER.balance,
      SEED_PLAYER.avatar,
    ]);

    for (const r of SEED_ROOMS) {
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

    for (const m of allSeedMatches()) {
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
