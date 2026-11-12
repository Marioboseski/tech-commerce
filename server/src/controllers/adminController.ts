import * as adminService from "../services/adminService.js";
import type { Request, Response } from "express";

export const getStats = async (_req: Request, res: Response) => {
  const stats = await adminService.getAdminStats();
  return res.status(200).json(stats);
};
