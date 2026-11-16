import { apiRequest } from '../lib/apiClient';
import type { CartItem } from '../types/cart';

// Same limit as the server (MAX_CART_QUANTITY in cartSchemas.ts).
export const MAX_CART_QUANTITY = 10;

export const getCart = () => apiRequest<CartItem[]>('/api/cart');

export const addToCart = (productId: number) =>
  apiRequest<void>('/api/cart', { method: 'POST', body: { productId } });

export const updateCartQuantity = ({
  productId,
  quantity,
}: {
  productId: number;
  quantity: number;
}) =>
  apiRequest<void>(`/api/cart/${productId}`, {
    method: 'PATCH',
    body: { quantity },
  });

export const removeFromCart = (productId: number) =>
  apiRequest<void>(`/api/cart/${productId}`, { method: 'DELETE' });
