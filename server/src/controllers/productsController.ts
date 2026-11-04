import * as productService from "../services/productsService.js";
import type { Request, Response } from "express";

const MAX_IDS = 100;
const MAX_SEARCH_LENGTH = 100;
const MAX_LIMIT = 100;

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

  // Comma-separated product ids, e.g. "1,5,12" (used by the cart).
  const idsParam = req.query.ids;

  let ids: number[] | undefined;

  if (idsParam !== undefined) {
    if (typeof idsParam !== "string" || !/^[1-9]\d*(,[1-9]\d*)*$/.test(idsParam)) {
      return res.status(400).json({
        message: "ids must be a comma-separated list of positive integers"
      })
    }
    ids = idsParam.split(",").map(Number);
    if (ids.length > MAX_IDS) {
      return res.status(400).json({
        message: `ids can contain at most ${MAX_IDS} values`
      })
    }
  }

  // Free-text search in product name, description and category name.
  const searchParam = req.query.search;

  let search: string | undefined;

  if (searchParam !== undefined) {
    if (typeof searchParam !== "string" || searchParam.trim().length === 0 || searchParam.trim().length > MAX_SEARCH_LENGTH) {
      return res.status(400).json({
        message: `search must be between 1 and ${MAX_SEARCH_LENGTH} characters`
      })
    }
    search = searchParam.trim();
  }

  // Maximum number of products to return, e.g. 6 for search suggestions.
  const limitParam = req.query.limit;

  let limit: number | undefined;

  if (limitParam !== undefined) {
    if (typeof limitParam !== "string" || !/^[1-9]\d*$/.test(limitParam) || Number(limitParam) > MAX_LIMIT) {
      return res.status(400).json({
        message: `limit must be an integer between 1 and ${MAX_LIMIT}`
      })
    }
    limit = Number(limitParam);
  }

  const products = await productService.getProducts({ categoryId, minPrice, maxPrice, ids, search, limit });
  return res.json(products);
}

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(Number(id));
  return res.json(product);
}
