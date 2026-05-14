import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/http-error.ts";
import { asyncHandler } from "../middleware/async-handler.ts";
import * as roomsRepo from "../repositories/rooms.repo.ts";

const postBodySchema = z.object({
  stake: z.union([z.literal(1), z.literal(5), z.literal(10)]),
  host: z.string().min(1).max(64).optional(),
  name: z.string().min(1).max(200).optional(),
});

export const roomsRouter = Router();

roomsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rooms = await roomsRepo.findAllRooms();
    res.json({ rooms });
  }),
);

roomsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = postBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid body: stake (1|5|10) required");
    }
    const { stake, name } = parsed.data;
    const host = parsed.data.host ?? "Player_404";
    const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();
    const room = await roomsRepo.insertRoom({
      id,
      name: name ?? "新しいルーム",
      host,
      stake,
      players: [host],
      status: "waiting",
      createdAt: now,
    });
    res.status(201).json({ room });
  }),
);

roomsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const room = await roomsRepo.findRoomById(req.params.id);
    if (!room) throw new HttpError(404, "Room not found");
    res.json({ room });
  }),
);
