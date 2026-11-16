import { z } from "zod";
import { idSchema, idTextSchema, paginationFields, requiredText } from "./commonSchemas.js";
import { categorySpecs } from "../lib/productCategories.js";
import type { CategorySlug } from "../lib/productCategories.js";

// Decimal(12, 2) in the database.
const MAX_PRICE = 9_999_999_999.99;

export const adminProductsQuerySchema = z.object({
  ...paginationFields,
  search: z.string().trim().max(100).optional(),
  categoryId: idTextSchema("categoryId").optional(),
  status: z.enum(["active", "archived", "all"], "status must be active, archived or all").default("all"),
});

export const adminProductParamsSchema = z.object({
  id: idTextSchema("id"),
});

export const productBaseSchema = z.object({
  // Upper case, so "laptops-001" and "LAPTOPS-001" cannot both exist.
  sku: requiredText("SKU", 50)
    .toUpperCase()
    .regex(/^[A-Z0-9-]+$/, "SKU can only contain letters, numbers and -"),
  name: requiredText("Name", 255),
  description: requiredText("Description", 5000),
  price: z
    .number("Price must be a number")
    .positive("Price must be greater than 0")
    .max(MAX_PRICE, "Price is too big")
    // Floats cannot be checked with % 0.01, so compare in cents instead.
    .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, {
      message: "Price can have at most 2 decimals",
    }),
  categoryId: idSchema("categoryId"),
  // Checked separately with detailsSchemaFor(), once the category is known.
  details: z.record(z.string(), z.unknown(), "Specifications are required"),
});

export type ProductInput = z.output<typeof productBaseSchema>;

export const detailsSchemaFor = (slug: CategorySlug) => {
  const shape: Record<string, ReturnType<typeof requiredText>> = {};
  for (const [field, maxLength] of Object.entries(categorySpecs[slug].fields)) {
    shape[field] = requiredText(field, maxLength);
  }
  return z.object(shape);
};

export const productStatusSchema = z.object({
  isActive: z.boolean("isActive must be true or false"),
});
