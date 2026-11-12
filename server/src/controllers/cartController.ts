import * as cartService from "../services/cartService.js";
import { MAX_CART_QUANTITY } from "../services/cartService.js";
import { isValidId } from "../lib/validation.js";
import { HttpError } from "../lib/httpError.js";
import { getAuthUserId } from "../middleware/requireAuth.js";
import type { Request, Response } from "express";

// GET /api/cart
export const getCart = async (req: Request, res: Response) => {
  const items = await cartService.getCartItems(getAuthUserId(req));
  return res.status(200).json(items);
};

// POST /api/cart   body: { "productId": 5 }   → adds 1 piece
export const addToCart = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { productId } = req.body ?? {};

  if (!isValidId(productId)) {
    throw new HttpError(400, "productId must be a positive integer");
  }

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

// PATCH /api/cart/:productId   body: { "quantity": 3 }
export const updateCartItem = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  // Values from the URL are always text ("5"), so turn them into a number.
  const productId = Number(req.params.productId);
  const { quantity } = req.body ?? {};

  if (!isValidId(productId)) {
    throw new HttpError(400, "productId must be a positive integer");
  }

  // Must be a whole number from 1 to 10. To remove a product, use DELETE.
  if (!isValidId(quantity) || quantity > MAX_CART_QUANTITY) {
    throw new HttpError(400, `quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`);
  }

  const item = await cartService.updateCartItemQuantity(userId, productId, quantity);

  if (!item) {
    throw new HttpError(404, "Product is not in the cart");
  }

  return res.status(200).json(item);
};

// DELETE /api/cart/:productId
export const removeFromCart = async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const productId = Number(req.params.productId);

  if (!isValidId(productId)) {
    throw new HttpError(400, "productId must be a positive integer");
  }

  await cartService.removeCartItem(userId, productId);
  // 204 = done, nothing to send back.
  return res.status(204).end();
};
