import { Router } from "express";
import { asyncHandler } from "../middleware/async-handler.ts";
import * as matchesRepo from "../repositories/matches.repo.ts";
import * as roomsRepo from "../repositories/rooms.repo.ts";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rooms = await roomsRepo.findAllRooms();
    const recentMatches = await matchesRepo.listMatches(6);
    res.json({
      featuredRooms: rooms.slice(0, 4),
      recentMatches,
    });
  }),
);
