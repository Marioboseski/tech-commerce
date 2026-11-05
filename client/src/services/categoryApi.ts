const API_URL = import.meta.env.VITE_API_URL;
import type { ApiCategory } from "../types/category";

export const getCategories = async (): Promise<ApiCategory[]> => {
  if (!API_URL) {
    throw new Error("Missing VITE_API_URL environment variable");
  }

  const res = await fetch(`${API_URL}/api/categories`);
  // TanStack Query treats a thrown error as a failed request (and retries it);
  // without this, an error response would be cached as if it were categories.
  if (!res.ok) {
    throw new Error(`Failed to fetch categories: ${res.status}`);
  }
  return res.json();
}