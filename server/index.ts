import { createApp } from "./app.ts";
import { config } from "./config.ts";
import { closePool } from "./db/pool.ts";
import { migrate } from "./db/migrate.ts";
import { seedIfEmpty } from "./db/seed.ts";

function printDbHint(err: unknown): void {
  if (!err || typeof err !== "object") return;
  const e = err as { code?: string; errno?: number; sqlMessage?: string };
  const code = e.code ?? "";
  if (code === "ECONNREFUSED") {
    console.error(
      "\n[database] Cannot reach MySQL. Start MySQL in XAMPP Control Panel and check MYSQL_HOST / MYSQL_PORT in .env.\n",
    );
    return;
  }
  if (code === "ER_ACCESS_DENIED_ERROR" || code === "ER_ACCESS_DENIED_NO_PASSWORD_ERROR") {
    console.error(
      "\n[database] Access denied. Set MYSQL_USER and MYSQL_PASSWORD in .env (XAMPP default is often root with empty password).\n",
    );
    return;
  }
  if (code === "ER_BAD_DB_ERROR") {
    console.error(
      "\n[database] Unknown database. Create it in phpMyAdmin: CREATE DATABASE janken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n",
    );
  }
}

async function main(): Promise<void> {
  await migrate();
  await seedIfEmpty();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`Express API listening on http://localhost:${config.port}`);
    console.log(
      `MySQL: ${config.mysql.user}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`,
    );
  });
}

main().catch((err) => {
  console.error(err);
  printDbHint(err);
  void closePool();
  process.exit(1);
});
