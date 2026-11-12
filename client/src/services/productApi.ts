const API_URL = import.meta.env.VITE_API_URL;
import type { ApiProduct, ApiProductDetails } from "../types/product";

export type ProductFilters = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  ids?: number[];
  search?: string;
  limit?: number;
};

export const getProducts = async (filters: ProductFilters = {}): Promise<ApiProduct[]> => {

  if (!API_URL) {
    throw new Error ("Missing VITE_API_URL environment variable");
  }

  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
  });
  const query = params.size ? `?${params}` : "";

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
  // The server answers 404 for a product that does not exist.
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch product: ${res.status}`);
  }
  return res.json();
}