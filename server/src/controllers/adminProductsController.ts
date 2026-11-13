import { z } from "zod";
import * as adminProductsService from "../services/adminProductsService.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import { categorySpecs, isCategorySlug } from "../lib/productCategories.js";
import { prisma } from "../lib/prisma.js";
import {
  adminProductParamsSchema,
  adminProductsQuerySchema,
  detailsSchemaFor,
  productBaseSchema,
  productStatusSchema,
} from "../schemas/adminProductSchemas.js";
import type { Request, Response } from "express";

export const listProducts = async (req: Request, res: Response) => {
  const filters = parseInput(adminProductsQuerySchema, req.query);
  const result = await adminProductsService.listProducts(filters);
  return res.status(200).json(result);
};

export const getProduct = async (req: Request, res: Response) => {
  const { id } = parseInput(adminProductParamsSchema, req.params);
  const product = await adminProductsService.getProduct(id);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return res.status(200).json(product);
};

// The spec fields depend on the category, so they are checked in a second
// step. Wrapped in { details } so field errors are named "details.ram",
// which the admin form can show under the right input.
// lockedCategoryId (update only): checked before the specs, otherwise a
// changed category would answer "battery is required" instead of the real
// problem.
const readProductBody = async (body: unknown, lockedCategoryId?: number) => {
  const input = parseInput(productBaseSchema, body);

  if (lockedCategoryId !== undefined && input.categoryId !== lockedCategoryId) {
    throwSaveError("category_changed");
  }

  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { slug: true },
  });
  if (!category || !isCategorySlug(category.slug)) {
    throw new HttpError(400, "Category not found", [
      { field: "categoryId", message: "Category not found" },
    ]);
  }

  const { details } = parseInput(
    z.object({ details: detailsSchemaFor(category.slug) }),
    { details: input.details },
  );

  return { input, details };
};

const throwSaveError = (status: string): never => {
  switch (status) {
    case "sku_taken":
      throw new HttpError(409, "A product with this SKU already exists", [
        { field: "sku", message: "A product with this SKU already exists" },
      ]);
    case "category_changed":
      throw new HttpError(400, "The category of a product cannot be changed", [
        { field: "categoryId", message: "The category of a product cannot be changed" },
      ]);
    case "not_found":
      throw new HttpError(404, "Product not found");
    default:
      throw new HttpError(400, "Category not found");
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { input, details } = await readProductBody(req.body);
  const result = await adminProductsService.createProduct(input, details);

  if (result.status !== "saved") {
    return throwSaveError(result.status);
  }

  return res.status(201).json(result.product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = parseInput(adminProductParamsSchema, req.params);

  const current = await prisma.product.findUnique({ where: { id }, select: { categoryId: true } });
  if (!current) {
    throw new HttpError(404, "Product not found");
  }

  const { input, details } = await readProductBody(req.body, current.categoryId);
  const result = await adminProductsService.updateProduct(id, input, details);

  if (result.status !== "saved") {
    return throwSaveError(result.status);
  }

  return res.status(200).json(result.product);
};

export const setProductStatus = async (req: Request, res: Response) => {
  const { id } = parseInput(adminProductParamsSchema, req.params);
  const { isActive } = parseInput(productStatusSchema, req.body);

  const product = await adminProductsService.setProductActive(id, isActive);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return res.status(200).json(product);
};

// The spec fields per category, so the admin form knows what to show.
export const getCategorySpecFields = (_req: Request, res: Response) => {
  const fields = Object.fromEntries(
    Object.entries(categorySpecs).map(([slug, spec]) => [slug, spec.fields]),
  );
  return res.status(200).json(fields);
};
