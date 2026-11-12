import { z } from "zod";
import { idSchema, idTextSchema } from "./commonSchemas.js";

// Nobody needs more than 10 of the same laptop or phone in one order.
export const MAX_CART_QUANTITY = 10;

export const addToCartSchema = z.object({
  productId: idSchema("productId"),
});

// 0 is not allowed: removing a product is DELETE.
export const updateCartItemSchema = z.object({
  quantity: z
    .number(`quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`)
    .int(`quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`)
    .min(1, `quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`)
    .max(MAX_CART_QUANTITY, `quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`),
});

export const cartParamsSchema = z.object({
  productId: idTextSchema("productId"),
});
