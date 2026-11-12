import { ApiError, apiRequest } from '../lib/apiClient';
import type { ApiProduct, ApiProductDetails } from '../types/product';

export type ProductFilters = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  ids?: number[];
  search?: string;
  limit?: number;
};

export const getProducts = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });
  const query = params.size ? `?${params}` : '';

  return apiRequest<ApiProduct[]>(`/api/products${query}`);
};

// Resolves to null when the product does not exist (404).
export const getProductById = async (
  id: number,
): Promise<ApiProductDetails | null> => {
  try {
    return await apiRequest<ApiProductDetails>(`/api/products/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
};
