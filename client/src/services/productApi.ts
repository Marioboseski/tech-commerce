const API_URL = import.meta.env.VITE_API_URL;
import type { ApiProduct, ApiProductDetails } from "../types/product";

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

// Resolves to null when the product does not exist.
export const getProductById = async (id: number): Promise<ApiProductDetails | null> => {
  if (!API_URL) {
    throw new Error("Missing VITE_API_URL environment variable");
  }

  const res = await fetch(`${API_URL}/api/products/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }
  return res.json();
}