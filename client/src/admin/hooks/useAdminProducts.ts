import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createAdminProduct,
  getAdminProduct,
  getAdminProducts,
  getCategorySpecFields,
  removeAdminProductImage,
  setAdminProductStatus,
  updateAdminProduct,
  uploadAdminProductImage,
} from '../services/adminApi';
import type { AdminProductFilters } from '../types';
import { adminKeys } from './useAdminStats';

export const adminProductKeys = {
  all: [...adminKeys.all, 'products'] as const,
  list: (filters: AdminProductFilters) =>
    [...adminKeys.all, 'products', 'list', filters] as const,
  detail: (id: number | null) =>
    [...adminKeys.all, 'products', 'detail', id] as const,
  specFields: [...adminKeys.all, 'category-spec-fields'] as const,
};

export function useAdminProducts(filters: AdminProductFilters) {
  return useQuery({
    queryKey: adminProductKeys.list(filters),
    queryFn: () => getAdminProducts(filters),
    // While the next page loads, keep the current one on screen.
    placeholderData: keepPreviousData,
  });
}

export function useAdminProduct(id: number | null) {
  return useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: id === null ? skipToken : () => getAdminProduct(id),
  });
}

// Which spec fields each category has. Only changes with a deploy.
export function useCategorySpecFields() {
  return useQuery({
    queryKey: adminProductKeys.specFields,
    queryFn: getCategorySpecFields,
    staleTime: Infinity,
  });
}

// After any change: the admin lists and numbers, and the shop's own
// product, cart and favorites caches (an archived product leaves them).
const useRefreshAfterProductChange = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['cart'] }),
      queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    ]);
};

export function useCreateProduct() {
  const refresh = useRefreshAfterProductChange();
  return useMutation({
    mutationFn: createAdminProduct,
    // The form shows the errors under its fields.
    meta: { inlineError: true },
    onSuccess: refresh,
  });
}

export function useUpdateProduct() {
  const refresh = useRefreshAfterProductChange();
  return useMutation({
    mutationFn: updateAdminProduct,
    meta: { inlineError: true },
    onSuccess: refresh,
  });
}

export function useSetProductStatus() {
  const refresh = useRefreshAfterProductChange();
  return useMutation({
    mutationFn: setAdminProductStatus,
    onSuccess: refresh,
  });
}

export function useUploadProductImage() {
  const refresh = useRefreshAfterProductChange();
  return useMutation({
    mutationFn: uploadAdminProductImage,
    // The form shows the error under the image field.
    meta: { inlineError: true },
    onSuccess: refresh,
  });
}

export function useRemoveProductImage() {
  const refresh = useRefreshAfterProductChange();
  return useMutation({
    mutationFn: removeAdminProductImage,
    onSuccess: refresh,
  });
}
