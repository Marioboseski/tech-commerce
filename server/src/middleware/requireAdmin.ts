import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/httpError.js";
import { getUserById } from "../services/authService.js";
import { getAuthUserId } from "./requireAuth.js";

// Use after requireAuth. The role is read from the database, not from the
// token: a token lives 7 days, so a removed admin would otherwise keep
// access until it expires.
export const requireAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  const user = await getUserById(getAuthUserId(req));

  if (!user) {
    throw new HttpError(401, "Not logged in");
  }

  // 403 = logged in, but not allowed (401 would mean "log in first").
  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Admins only");
  }

  next();
};
