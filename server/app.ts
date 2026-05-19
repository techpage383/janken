import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { isAvatarPreset, STAKE_TIERS } from "../src/lib/types.ts";
import { config } from "./config.ts";
import { SEED_PLAYER } from "./db/seed-data.ts";
import * as db from "./db/repos.ts";

const serverDir = dirname(fileURLToPath(import.meta.url));
const clientDist = join(serverDir, "..", "dist");

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function wrap(
  fn: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    void fn(req, res).catch(next);
  };
}

function playerNameFromRequest(req: Request): string {
  const header = req.headers["x-player-name"];
  return typeof header === "string" && header.trim() ? header.trim() : SEED_PLAYER.name;
}

const createRoomBody = z.object({
  stake: z.union([
    z.literal(STAKE_TIERS[0]),
    z.literal(STAKE_TIERS[1]),
    z.literal(STAKE_TIERS[2]),
    z.literal(STAKE_TIERS[3]),
  ]),
  host: z.string().min(1).max(64).optional(),
  name: z.string().min(1).max(200).optional(),
});

export function createApp(): express.Application {
  const app = express();
  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.get(
    "/api/rooms",
    wrap(async (_req, res) => {
      res.json({ rooms: await db.listRooms() });
    }),
  );

  app.get(
    "/api/rooms/:id",
    wrap(async (req, res) => {
      const room = await db.getRoom(req.params.id);
      if (!room) throw new ApiError(404, "Room not found");
      res.json({ room });
    }),
  );

  app.post(
    "/api/rooms",
    wrap(async (req, res) => {
      const parsed = createRoomBody.safeParse(req.body);
      if (!parsed.success) throw new ApiError(400, "stake must be 10, 20, 50, or 100");
      const { stake, name } = parsed.data;
      const host = parsed.data.host ?? SEED_PLAYER.name;
      const room = await db.createRoom({
        id: `room-${Date.now()}`,
        name: name ?? "新しいルーム",
        host,
        stake,
        players: [host],
        status: "waiting",
        createdAt: Date.now(),
      });
      res.status(201).json({ room });
    }),
  );

  app.get(
    "/api/matches",
    wrap(async (req, res) => {
      const raw = Number(req.query.limit);
      const limit = Number.isFinite(raw) ? Math.min(200, Math.max(1, Math.floor(raw))) : 80;
      res.json({ matches: await db.listMatches(limit) });
    }),
  );

  app.get(
    "/api/me",
    wrap(async (req, res) => {
      const name = playerNameFromRequest(req);
      const profile = await db.getPlayer(name);
      if (!profile) throw new ApiError(404, "Unknown player");
      const matches = await db.listMatchesForPlayer(name, 100);
      res.json({ profile, matches });
    }),
  );

  app.patch(
    "/api/me/avatar",
    wrap(async (req, res) => {
      const name = playerNameFromRequest(req);
      const avatar = typeof req.body?.avatar === "string" ? req.body.avatar : "";
      if (!isAvatarPreset(avatar)) {
        throw new ApiError(400, "avatar must be one of the preset emojis");
      }
      const profile = await db.updatePlayerAvatar(name, avatar);
      if (!profile) throw new ApiError(404, "Unknown player");
      res.json({ profile });
    }),
  );

  app.get(
    "/api/stats/dashboard",
    wrap(async (_req, res) => {
      const rooms = await db.listRooms();
      const recentMatches = await db.listMatches(6);
      res.json({ featuredRooms: rooms.slice(0, 4), recentMatches });
    }),
  );

  if (isProduction) {
    app.use(express.static(clientDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path === "/health") return next();
      res.sendFile(join(clientDist, "index.html"), (err) => {
        if (err) next(err);
      });
    });
  }

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    if (err instanceof ApiError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
