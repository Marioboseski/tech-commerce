import { z } from "zod";
import { idSchema, idTextSchema } from "./commonSchemas.js";

// Nobody needs more than 10 of the same laptop or phone in one order.
export const MAX_CART_QUANTITY = 10;

// POST /api/cart   body: { "productId": 5 }
export const addToCartSchema = z.object({
  productId: idSchema("productId"),
});

// PATCH /api/cart/:productId   body: { "quantity": 3 }
// 1 to 10. To remove a product, use DELETE.
export const updateCartItemSchema = z.object({
  quantity: z
    .number(`quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`)
    .int(`quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`)
    .min(1, `quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`)
    .max(MAX_CART_QUANTITY, `quantity must be a whole number from 1 to ${MAX_CART_QUANTITY}`),
});

// PATCH and DELETE /api/cart/:productId
export const cartParamsSchema = z.object({
  productId: idTextSchema("productId"),
});
