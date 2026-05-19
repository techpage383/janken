import "dotenv/config";

/** Local dev: match the URL in the browser (scheme + host + port). Vite default here is 8080; 5173 is common if you change `vite.config.ts`. */
const defaultOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
  "http://[::1]:8081",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://[::1]:5173",
];

/** XAMPP / local MySQL or MariaDB (phpMyAdmin). Create database `janken` before first server start. */
export const config = {
  port: Number(process.env.PORT) || 3000,
  mysql: {
    host: process.env.MYSQL_HOST ?? "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "janken",
  },
  corsOrigins: (process.env.CORS_ORIGIN ?? defaultOrigins.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
