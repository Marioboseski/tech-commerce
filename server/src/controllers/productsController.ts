import * as productService from "../services/productsService.js";
import { HttpError } from "../lib/httpError.js";
import { parseInput } from "../lib/validate.js";
import { productParamsSchema, productsQuerySchema } from "../schemas/productsSchemas.js";
import type { Request, Response } from "express";

// GET /api/products?categoryId=&minPrice=&maxPrice=&ids=&search=&limit=
export const getProducts = async (req: Request, res: Response) => {
  const { categoryId, minPrice, maxPrice, ids, search, limit } = parseInput(
    productsQuerySchema,
    req.query,
  );

  const products = await productService.getProducts({
    categoryId,
    minPrice,
    maxPrice,
    ids,
    search,
    limit,
  });
  return res.json(products);
};

// GET /api/products/:id
export const getProductById = async (req: Request, res: Response) => {
  const { id } = parseInput(productParamsSchema, req.params);

  const product = await productService.getProductById(id);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return res.json(product);
};
