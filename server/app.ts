import cors from "cors";
import express from "express";
import { config } from "./config.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { dashboardRouter } from "./routes/dashboard.ts";
import { matchesRouter } from "./routes/matches.ts";
import { meRouter } from "./routes/me.ts";
import { roomsRouter } from "./routes/rooms.ts";

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (config.corsOrigins.includes(origin)) {
          callback(null, origin);
          return;
        }
        // Reject without throwing — avoids flooding the terminal on every browser request.
        callback(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/rooms", roomsRouter);
  app.use("/api/matches", matchesRouter);
  app.use("/api/me", meRouter);
  app.use("/api/stats/dashboard", dashboardRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}
