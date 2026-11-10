import * as favoritesService from "../services/favoritesService.js";
import { isValidId } from "../lib/validation.js";
import type { Request, Response } from "express";

export const getFavorites = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const products = await favoritesService.getFavoriteProducts(req.auth.userId);
  return res.status(200).json(products);
};

export const addFavorite = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { productId } = req.body ?? {};

  if (!isValidId(productId)) {
    return res.status(400).json({ message: "productId must be a positive integer" });
  }

  const favorite = await favoritesService.addFavorite(req.auth.userId, productId);

  if (!favorite) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.status(201).json(favorite);
};

export const removeFavorite = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const productId = Number(req.params.productId);

  if (!isValidId(productId)) {
    return res.status(400).json({ message: "productId must be a positive integer" });
  }

  await favoritesService.removeFavorite(req.auth.userId, productId);
  return res.status(204).end();
};
