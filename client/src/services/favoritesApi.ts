import { apiRequest } from '../lib/apiClient';
import type { ApiProduct } from '../types/product';

// The logged-in user's favorite products, newest first.
export const getFavorites = () => apiRequest<ApiProduct[]>('/api/favorites');

export const addFavorite = (productId: number) =>
  apiRequest<void>('/api/favorites', { method: 'POST', body: { productId } });

export const removeFavorite = (productId: number) =>
  apiRequest<void>(`/api/favorites/${productId}`, { method: 'DELETE' });
