import { apiRequest } from '../../lib/apiClient';
import type {
  AdminProduct,
  AdminProductFilters,
  AdminProductInput,
  AdminProductListItem,
  AdminStats,
  CategorySpecFields,
  Paginated,
} from '../types';

export const getAdminStats = () => apiRequest<AdminStats>('/api/admin/stats');

export const getCategorySpecFields = () =>
  apiRequest<CategorySpecFields>('/api/admin/category-spec-fields');

export const getAdminProducts = ({
  page,
  pageSize,
  search,
  categoryId,
  status,
}: AdminProductFilters) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    status,
  });
  if (search.trim()) {
    params.set('search', search.trim());
  }
  if (categoryId !== undefined) {
    params.set('categoryId', String(categoryId));
  }
  return apiRequest<Paginated<AdminProductListItem>>(
    `/api/admin/products?${params}`,
  );
};

export const getAdminProduct = (id: number) =>
  apiRequest<AdminProduct>(`/api/admin/products/${id}`);

export const createAdminProduct = (input: AdminProductInput) =>
  apiRequest<AdminProduct>('/api/admin/products', {
    method: 'POST',
    body: input,
  });

export const updateAdminProduct = ({
  id,
  input,
}: {
  id: number;
  input: AdminProductInput;
}) =>
  apiRequest<AdminProduct>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: input,
  });

export const setAdminProductStatus = ({
  id,
  isActive,
}: {
  id: number;
  isActive: boolean;
}) =>
  apiRequest<AdminProduct>(`/api/admin/products/${id}/status`, {
    method: 'PATCH',
    body: { isActive },
  });

export const uploadAdminProductImage = ({
  id,
  file,
}: {
  id: number;
  file: File;
}) => {
  const body = new FormData();
  // Same field name as uploadImage (multer .single("image")) on the server.
  body.append('image', file);
  return apiRequest<AdminProduct>(`/api/admin/products/${id}/image`, {
    method: 'POST',
    body,
  });
};

export const removeAdminProductImage = (id: number) =>
  apiRequest<AdminProduct>(`/api/admin/products/${id}/image`, {
    method: 'DELETE',
  });
