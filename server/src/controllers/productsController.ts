import * as productService from "../services/productsService.js";
import type { Request, Response } from "express";

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

  const products = await productService.getProducts(categoryId);
  return res.json(products);
}

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(Number(id));
  return res.json(product);
}