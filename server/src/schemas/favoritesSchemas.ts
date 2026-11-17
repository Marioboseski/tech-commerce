import { z } from "zod";
import { idSchema, idTextSchema } from "./commonSchemas.js";

export const addFavoriteSchema = z.object({
  productId: idSchema("productId"),
});

export const favoriteParamsSchema = z.object({
  productId: idTextSchema("productId"),
});
