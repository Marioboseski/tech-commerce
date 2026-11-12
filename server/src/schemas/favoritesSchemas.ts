import { z } from "zod";
import { idSchema, idTextSchema } from "./commonSchemas.js";

// POST /api/favorites   body: { "productId": 5 }
export const addFavoriteSchema = z.object({
  productId: idSchema("productId"),
});

// DELETE /api/favorites/:productId
export const favoriteParamsSchema = z.object({
  productId: idTextSchema("productId"),
});
