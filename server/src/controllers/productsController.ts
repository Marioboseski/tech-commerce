import * as productService from "../services/productsService.js";
import type { Request, Response } from "express";

export const getProducts = async (req: Request, res: Response) => {
  const products = await productService.getProducts();
  return res.json(products);
}

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await productService.getProductById(Number(id));
  return res.json(product);
}