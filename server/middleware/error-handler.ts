import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.ts";

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error(err);
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof Error && err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS blocked" });
    return;
  }
  res.status(500).json({ error: "Internal Server Error" });
}
