import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.ts";
import * as matchesRepo from "../repositories/matches.repo.ts";

export const matchesRouter = Router();

matchesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const raw = Number(req.query.limit);
    const limit = Number.isFinite(raw) ? Math.min(200, Math.max(1, Math.floor(raw))) : 80;
    const matches = await matchesRepo.listMatches(limit);
    res.json({ matches });
  }),
);
