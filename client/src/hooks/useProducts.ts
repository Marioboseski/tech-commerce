import { skipToken, useQuery } from '@tanstack/react-query';
import { getProductById, getProducts } from '../services/productApi';
import type { ProductFilters } from '../services/productApi';

// Cache keys for products. Every different id or filter combination is
// cached separately, e.g. ['products', 'list', { categoryId: 1 }].
export const productKeys = {
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (id: number | null) => ['products', 'detail', id] as const,
};

// One product with its details (GET /api/products/:id).
// data is null when the product does not exist. Pass null as id to skip the
// request (e.g. an invalid id in the URL).
export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: id === null ? skipToken : () => getProductById(id),
  });
}

// A list of products (GET /api/products?...). Pass enabled: false to wait,
// e.g. until another request has finished.
export function useProducts(
  filters: ProductFilters,
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    enabled,
  });
}
