import * as categoryService from "../services/categoriesService.js";
import type { Request, Response } from "express";

export const getCategories = async (req: Request, res: Response) => {
  const categories = await categoryService.getCategories();
  return res.json(categories);
}