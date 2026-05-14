import { pool } from "../db/pool.ts";

type PlayerRow = { name: string; wallet: string; balance: string | number };

export async function findPlayer(name: string): Promise<{
  name: string;
  wallet: string;
  balance: number;
} | null> {
  const [rows] = await pool.query("SELECT name, wallet, balance FROM players WHERE name = ?", [
    name,
  ]);
  const list = rows as PlayerRow[];
  const r = list[0];
  if (!r) return null;
  return {
    name: r.name,
    wallet: r.wallet,
    balance: Number(r.balance),
  };
}
