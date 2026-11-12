import * as favoritesService from "../services/favoritesService.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import { getAuthUserId } from "../middleware/requireAuth.js";
import { addFavoriteSchema, favoriteParamsSchema } from "../schemas/favoritesSchemas.js";
import type { Request, Response } from "express";

// GET /api/favorites
export const getFavorites = async (req: Request, res: Response) => {
  const products = await favoritesService.getFavoriteProducts(getAuthUserId(req));
  return res.status(200).json(products);
};

// POST /api/favorites   body: { "productId": 5 }
export const addFavorite = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = parseInput(addFavoriteSchema, req.body);

  const favorite = await favoritesService.addFavorite(userId, productId);

  if (!favorite) {
    throw new HttpError(404, "Product not found");
  }

  return res.status(201).json(favorite);
};

// DELETE /api/favorites/:productId
export const removeFavorite = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = parseInput(favoriteParamsSchema, req.params);

  await favoritesService.removeFavorite(userId, productId);
  return res.status(204).end();
};
