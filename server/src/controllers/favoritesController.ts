import * as favoritesService from "../services/favoritesService.js";
import { isValidId } from "../lib/validation.js";
import { HttpError } from "../lib/httpError.js";
import { getAuthUserId } from "../middleware/requireAuth.js";
import type { Request, Response } from "express";

// GET /api/favorites
export const getFavorites = async (req: Request, res: Response) => {
  const products = await favoritesService.getFavoriteProducts(getAuthUserId(req));
  return res.status(200).json(products);
};

// POST /api/favorites   body: { "productId": 5 }
export const addFavorite = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = req.body ?? {};

  if (!isValidId(productId)) {
    throw new HttpError(400, "productId must be a positive integer");
  }

  const favorite = await favoritesService.addFavorite(userId, productId);

  if (!favorite) {
    throw new HttpError(404, "Product not found");
  }

  return res.status(201).json(favorite);
};

// DELETE /api/favorites/:productId
export const removeFavorite = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const productId = Number(req.params.productId);

  if (!isValidId(productId)) {
    throw new HttpError(400, "productId must be a positive integer");
  }

  await favoritesService.removeFavorite(userId, productId);
  return res.status(204).end();
};
