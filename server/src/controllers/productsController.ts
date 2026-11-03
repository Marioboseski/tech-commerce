import * as productService from "../services/productsService.js";
import type { Request, Response } from "express";

// Non-negative number such as "100" or "99.99". Returns null when invalid.
const parsePriceParam = (value: unknown): number | undefined | null => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string" || !/^\d+(\.\d+)?$/.test(value)) {
    return null;
  }
  return Number(value);
};

export const getProducts = async (req: Request, res: Response) => {
  const categoryIdParam = req.query.categoryId;

  let categoryId: number | undefined;

  if (categoryIdParam !== undefined) {
    if (typeof categoryIdParam !== "string" || !/^[1-9]\d*$/.test(categoryIdParam)) {
      return res.status(400).json({
        message: "categoryId must be a positive integer"
      })
    }
    categoryId = Number(categoryIdParam);
  }

  const minPrice = parsePriceParam(req.query.minPrice);
  const maxPrice = parsePriceParam(req.query.maxPrice);

  if (minPrice === null || maxPrice === null) {
    return res.status(400).json({
      message: "minPrice and maxPrice must be non-negative numbers"
    })
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    return res.status(400).json({
      message: "minPrice cannot be greater than maxPrice"
    })
  }

  const products = await productService.getProducts({ categoryId, minPrice, maxPrice });
  return res.json(products);
}

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(Number(id));
  return res.json(product);
}
