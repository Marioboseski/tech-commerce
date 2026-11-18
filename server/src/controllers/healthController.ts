import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Below the Docker healthcheck timeout, so a stuck database connection is
// reported as 503 instead of leaving the request hanging.
const DATABASE_TIMEOUT_MS = 3000;

export const getHealth = async (_req: Request, res: Response) => {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error("Database timeout")), DATABASE_TIMEOUT_MS);
  });

  try {
    await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    return res.status(200).json({ status: "ok" });
  } catch {
    return res.status(503).json({ status: "error", message: "Database unavailable" });
  } finally {
    clearTimeout(timer);
  }
};
