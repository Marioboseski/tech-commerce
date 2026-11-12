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

// toggleFavorite sends guests to /login.
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

    // Optimistic: change the cache (and the heart) before the server answers.
    onMutate: async ({ product, isFavorite }) => {
      // Stop a running GET, so its older answer does not overwrite our change.
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ApiProduct[]>(queryKey);

      queryClient.setQueryData<ApiProduct[]>(queryKey, (old = []) =>
        isFavorite
          ? old.filter((favorite) => favorite.id !== product.id)
          : [product, ...old],
      );

      return { previous };
    },

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
    isError: user !== null && favoritesQuery.isError,
    refetch: favoritesQuery.refetch,
  };
}
