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
  const server = app.listen(config.port);

  server.once("listening", () => {
    const prod = process.env.NODE_ENV === "production";
    console.log(
      prod
        ? `Server (API + React build) http://localhost:${config.port}`
        : `Express API http://localhost:${config.port}`,
    );
    if (prod) {
      console.log("Serving static files from dist/");
    } else {
      console.log("Dev: run Vite on :8080 (npm run dev:client) — proxy /api → this server");
    }
    console.log(
      `MySQL: ${config.mysql.user}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`,
    );
  });

  server.once("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `\n[server] Port ${config.port} is already in use.\n` +
          `  Set PORT=3001 in .env (then set VITE_API_URL=http://localhost:3001 for the SPA), or stop the other process.\n` +
          `  Windows: netstat -ano | findstr :${config.port}  →  taskkill /PID <pid> /F\n`,
      );
      void closePool();
      process.exit(1);
      return;
    }
    console.error(err);
    void closePool();
    process.exit(1);
  });
}

main().catch((err) => {
  console.error(err);
  printDbHint(err);
  void closePool();
  process.exit(1);
});
