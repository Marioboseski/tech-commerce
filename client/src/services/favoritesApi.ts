import type { ApiProduct } from '../types/product';

const API_URL = import.meta.env.VITE_API_URL;

// All favorites routes need the login cookie, so every request sends it
// (credentials: 'include'), the same way as in authApi.ts.
const favoritesRequest = async (path: string, init: RequestInit = {}) => {
  if (!API_URL) {
    throw new Error('Missing VITE_API_URL environment variable');
  }

  const res = await fetch(`${API_URL}/api/favorites${path}`, {
    ...init,
    credentials: 'include',
  });

  // fetch does not throw on 400/401/404/500, so we do it ourselves.
  if (!res.ok) {
    throw new Error(`Favorites request failed: ${res.status}`);
  }

  return res;
};

// The logged-in user's favorite products, newest first.
export const getFavorites = async (): Promise<ApiProduct[]> => {
  const res = await favoritesRequest('');
  return res.json();
};

export const addFavorite = async (productId: number): Promise<void> => {
  await favoritesRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
};

export const removeFavorite = async (productId: number): Promise<void> => {
  await favoritesRequest(`/${productId}`, { method: 'DELETE' });
};
