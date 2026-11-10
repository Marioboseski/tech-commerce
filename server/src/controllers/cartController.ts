import * as cartService from "../services/cartService.js";
import { MAX_CART_QUANTITY } from "../services/cartService.js";
import { isValidId } from "../lib/validation.js";
import type { Request, Response } from "express";

export const getCart = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const items = await cartService.getCartItems(req.auth.userId);
  return res.status(200).json(items);
};

export const addToCart = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const { productId } = req.body ?? {};

  if (!isValidId(productId)) {
    return res.status(400).json({ message: "productId must be a positive integer" });
  }

  const result = await cartService.addCartItem(req.auth.userId, productId);

  if (result.status === "product_not_found") {
    return res.status(404).json({ message: "Product not found" });
  }

  if (result.status === "limit_reached") {
    return res.status(400).json({
      message: `You can add at most ${MAX_CART_QUANTITY} of one product`,
    });
  }

  // 200, not 201: often nothing new is created, only the quantity goes up.
  return res.status(200).json(result.item);
};

// PATCH /api/cart/:productId   body: { "quantity": 3 }
export const updateCartItem = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  // Values from the URL are always text ("5"), so turn them into a number.
  const productId = Number(req.params.productId);
  const { quantity } = req.body ?? {};

  if (!isValidId(productId)) {
    return res.status(400).json({ message: "productId must be a positive integer" });
  }

  // Must be a whole number from 1 to 10. To remove a product, use DELETE.
  if (!isValidId(quantity) || quantity > MAX_CART_QUANTITY) {
    return res.status(400).json({
      message: `quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`,
    });
  }

  const item = await cartService.updateCartItemQuantity(
    req.auth.userId,
    productId,
    quantity,
  );

  if (!item) {
    return res.status(404).json({ message: "Product is not in the cart" });
  }

  return res.status(200).json(item);
};

// DELETE /api/cart/:productId
export const removeFromCart = async (req: Request, res: Response) => {
  if (!req.auth) {
    return res.status(401).json({ message: "Not logged in" });
  }

  const productId = Number(req.params.productId);

  if (!isValidId(productId)) {
    return res.status(400).json({ message: "productId must be a positive integer" });
  }

  await cartService.removeCartItem(req.auth.userId, productId);
  // 204 = done, nothing to send back.
  return res.status(204).end();
};
