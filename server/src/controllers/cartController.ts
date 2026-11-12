import * as cartService from "../services/cartService.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import { getAuthUserId } from "../middleware/requireAuth.js";
import {
  MAX_CART_QUANTITY,
  addToCartSchema,
  cartParamsSchema,
  updateCartItemSchema,
} from "../schemas/cartSchemas.js";
import type { Request, Response } from "express";

export const getCart = async (req: Request, res: Response) => {
  const items = await cartService.getCartItems(getAuthUserId(req));
  return res.status(200).json(items);
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = parseInput(addToCartSchema, req.body);

  const result = await cartService.addCartItem(userId, productId);

  if (result.status === "product_not_found") {
    throw new HttpError(404, "Product not found");
  }

  if (result.status === "limit_reached") {
    throw new HttpError(400, `You can add at most ${MAX_CART_QUANTITY} of one product`);
  }

  // 200, not 201: often nothing new is created, only the quantity goes up.
  return res.status(200).json(result.item);
};

export const updateCartItem = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = parseInput(cartParamsSchema, req.params);
  const { quantity } = parseInput(updateCartItemSchema, req.body);

  const item = await cartService.updateCartItemQuantity(userId, productId, quantity);

  if (!item) {
    throw new HttpError(404, "Product is not in the cart");
  }

  return res.status(200).json(item);
};

export const removeFromCart = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = parseInput(cartParamsSchema, req.params);

  await cartService.removeCartItem(userId, productId);
  return res.status(204).end();
};
