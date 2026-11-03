const API_URL = import.meta.env.VITE_API_URL;
import type { ApiProduct } from "../types/product";

export const getProducts = async (categoryId? : number): Promise<ApiProduct[]> => {

  if (!API_URL) {
    throw new Error ("Missing VITE_API_URL environment variable");
  }

  const query = categoryId !== undefined ? `?categoryId=${categoryId}` : "";

  const res = await fetch(`${API_URL}/api/products${query}`);
  if (!res.ok) {
    throw new Error (`Failed to fetch products: ${res.status}`)
  }
  return res.json();
}

export const getProductById = async (id: number): Promise<ApiProduct> => {
  const res = await fetch(`${API_URL}/api/products/${id}`);
  return res.json();
}