import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function migrate(): Promise<void> {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await pool.query(statement);
  }

  await migrateStakeTiers();
  await migratePlayerAvatar();
}

async function migratePlayerAvatar(): Promise<void> {
  try {
    await pool.query(
      `ALTER TABLE players ADD COLUMN avatar VARCHAR(16) NOT NULL DEFAULT '🎮'`,
    );
  } catch {
    /* column already exists */
  }
}

/** Upgrade DBs created before virtual-coin tiers (1/5/10 → 10/20/50/100). */
async function migrateStakeTiers(): Promise<void> {
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS c FROM rooms WHERE stake IN (20, 50, 100)`,
  );
  const alreadyMigrated = Number((countRows as { c: number }[])[0]?.c) > 0;

  // MariaDB (XAMPP): use DROP CONSTRAINT, not DROP CHECK.
  try {
    await pool.query(`ALTER TABLE rooms DROP CONSTRAINT chk_rooms_stake`);
  } catch {
    /* missing or already dropped */
  }

  if (!alreadyMigrated) {
    await pool.query(
      `UPDATE rooms SET stake = CASE stake
        WHEN 1 THEN 10 WHEN 5 THEN 20 WHEN 10 THEN 50
        ELSE stake END
       WHERE stake IN (1, 5, 10)`,
    );
    await pool.query(
      `UPDATE matches SET stake = CASE stake
        WHEN 1 THEN 10 WHEN 5 THEN 20 WHEN 10 THEN 50
        ELSE stake END
       WHERE stake IN (1, 5, 10)`,
    );
  }

  try {
    await pool.query(
      `ALTER TABLE rooms ADD CONSTRAINT chk_rooms_stake CHECK (\`stake\` IN (10, 20, 50, 100))`,
    );
  } catch {
    /* already applied */
  }
}
