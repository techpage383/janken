import { Router } from "express";
import { HttpError } from "../lib/http-error.ts";
import { asyncHandler } from "../middleware/async-handler.ts";
import * as matchesRepo from "../repositories/matches.repo.ts";
import * as playersRepo from "../repositories/players.repo.ts";

export const meRouter = Router();

meRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const header = req.headers["x-player-name"];
    const name =
      typeof header === "string" && header.trim().length > 0 ? header.trim() : "Player_404";
    const profile = await playersRepo.findPlayer(name);
    if (!profile) throw new HttpError(404, "Unknown player");
    const matches = await matchesRepo.listMatchesForPlayer(name, 100);
    res.json({ profile, matches });
  }),
);
