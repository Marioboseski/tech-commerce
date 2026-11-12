import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query';
import { getProductById, getProducts } from '../services/productApi';
import type { ProductFilters } from '../services/productApi';

export const productKeys = {
  list: (filters: ProductFilters) => ['products', 'list', filters] as const,
  detail: (id: number | null) => ['products', 'detail', id] as const,
};

// data is null when the product does not exist. Pass null as id to skip the
// request (e.g. an invalid id in the URL).
export function useProduct(id: number | null) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: id === null ? skipToken : () => getProductById(id),
  });
}

type UseProductsOptions = {
  // false: wait, e.g. until another request has finished.
  enabled?: boolean;
  // true: while new filters load, keep showing the previous list instead of
  // nothing.
  keepPrevious?: boolean;
};

export function useProducts(
  filters: ProductFilters,
  { enabled = true, keepPrevious = false }: UseProductsOptions = {},
) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    enabled,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  });
}
