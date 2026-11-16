import { z } from "zod";
import { idTextSchema } from "./commonSchemas.js";

const MAX_SEARCH_LENGTH = 100;
const MAX_LIMIT = 100;

const priceText = (name: string) =>
  z
    .string(`${name} must be a non-negative number`)
    .regex(/^\d+(\.\d+)?$/, `${name} must be a non-negative number`)
    .transform(Number);

export const productsQuerySchema = z
  .object({
    categoryId: idTextSchema("categoryId").optional(),
    minPrice: priceText("minPrice").optional(),
    maxPrice: priceText("maxPrice").optional(),
    search: z
      .string(`search must be between 1 and ${MAX_SEARCH_LENGTH} characters`)
      .trim()
      .min(1, `search must be between 1 and ${MAX_SEARCH_LENGTH} characters`)
      .max(MAX_SEARCH_LENGTH, `search must be between 1 and ${MAX_SEARCH_LENGTH} characters`)
      .optional(),
    // Maximum number of products to return, e.g. 6 for search suggestions.
    limit: z
      .string(`limit must be an integer between 1 and ${MAX_LIMIT}`)
      .regex(/^\d+$/, `limit must be an integer between 1 and ${MAX_LIMIT}`)
      .transform(Number)
      .pipe(
        z
          .number()
          .min(1, `limit must be an integer between 1 and ${MAX_LIMIT}`)
          .max(MAX_LIMIT, `limit must be an integer between 1 and ${MAX_LIMIT}`),
      )
      .optional(),
  })
  .refine(
    ({ minPrice, maxPrice }) =>
      minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
    { message: "minPrice cannot be greater than maxPrice", path: ["minPrice"] },
  );

export const productParamsSchema = z.object({
  id: idTextSchema("id"),
});
