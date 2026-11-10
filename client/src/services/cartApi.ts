import type { CartItem } from '../types/cart';

const API_URL = import.meta.env.VITE_API_URL;

// Same limit as the server (MAX_CART_QUANTITY in cartService.ts).
export const MAX_CART_QUANTITY = 10;

// All cart routes need the login cookie (credentials: 'include').
// fetch does not throw on 400/401/404/500, so we throw with the server's
// message, e.g. "You can add at most 10 of one product".
const cartRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  const res = await fetch(`${API_URL}/api/cart${path}`, {
    ...init,
    credentials: 'include',
  });

  if (!res.ok) {
    // The body may not be JSON (e.g. an HTML 500 page), so parsing can fail.
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Cart request failed: ${res.status}`);
  }

  return res;
};

const jsonBody = (method: string, data: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// The logged-in user's cart, in the order the products were added.
export const getCart = async (): Promise<CartItem[]> => {
  const res = await cartRequest('');
  return res.json();
};

// Adds one piece (a new row, or quantity + 1).
export const addToCart = async (productId: number): Promise<void> => {
  await cartRequest('', jsonBody('POST', { productId }));
};

// Sets the exact quantity (1 to MAX_CART_QUANTITY).
export const updateCartQuantity = async ({
  productId,
  quantity,
}: {
  productId: number;
  quantity: number;
}): Promise<void> => {
  await cartRequest(`/${productId}`, jsonBody('PATCH', { quantity }));
};

export const removeFromCart = async (productId: number): Promise<void> => {
  await cartRequest(`/${productId}`, { method: 'DELETE' });
};
