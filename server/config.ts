import "dotenv/config";

const defaultOrigins = ["http://localhost:8080", "http://127.0.0.1:8080"];

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
