const API_URL = import.meta.env.VITE_API_URL;
import type { ApiCategory } from "../types/category";

export const getCategories = async (): Promise<ApiCategory[]> => {
  const res = await fetch(`${API_URL}/api/categories`);
  return res.json();
}