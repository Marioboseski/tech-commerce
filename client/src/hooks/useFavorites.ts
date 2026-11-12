import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from '../services/favoritesApi';
import type { ApiProduct } from '../types/product';
import { useCurrentUser } from './useCurrentUser';

// Every user has their own cache entry, so after logging in as someone else
// we never show the previous user's favorites.
export const favoriteKeys = {
  all: ['favorites'] as const,
  list: (userId: number) => ['favorites', userId] as const,
};

type ToggleVariables = {
  product: ApiProduct;
  isFavorite: boolean;
};

// The logged-in user's favorites, read from GET /api/favorites.
// toggleFavorite adds or removes a product (and sends guests to /login).
export function useFavorites() {
  const { user, isPending: userPending } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryKey = favoriteKeys.list(user?.id ?? 0);

  const favoritesQuery = useQuery({
    queryKey,
    queryFn: getFavorites,
    // Guests have no favorites, so do not ask the server (it would say 401).
    enabled: user !== null,
  });

  const favoriteProducts = favoritesQuery.data ?? [];
  // A Set makes favoriteIds.has(id) quick for every product card.
  const favoriteIds = new Set(favoriteProducts.map((product) => product.id));

  const toggleMutation = useMutation({
    mutationFn: ({ product, isFavorite }: ToggleVariables) =>
      isFavorite ? removeFavorite(product.id) : addFavorite(product.id),

    // Optimistic update: change the cache (and the heart) right away,
    // before the server answers.
    onMutate: async ({ product, isFavorite }) => {
      // Stop a running GET, so its older answer does not overwrite our change.
      await queryClient.cancelQueries({ queryKey });
      // Remember the list as it was, in case we need to undo.
      const previous = queryClient.getQueryData<ApiProduct[]>(queryKey);

      queryClient.setQueryData<ApiProduct[]>(queryKey, (old = []) =>
        isFavorite
          ? old.filter((favorite) => favorite.id !== product.id)
          : [product, ...old],
      );

      // Whatever we return here is given to onError as `context`.
      return { previous };
    },

    // The server said no: put the old list back, so the heart flips back.
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
    },

    // Success or error: load the real list from the server once more,
    // so the cache matches the database.
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const toggleFavorite = (product: ApiProduct) => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleMutation.mutate({ product, isFavorite: favoriteIds.has(product.id) });
  };

  return {
    favoriteProducts,
    favoriteIds,
    toggleFavorite,
    isLoggedIn: user !== null,
    // True while we do not know yet: who is logged in, or their favorites.
    isPending: userPending || (user !== null && favoritesQuery.isPending),
    // The request failed (after retries). refetch() = "Try again".
    isError: user !== null && favoritesQuery.isError,
    refetch: favoritesQuery.refetch,
  };
}
