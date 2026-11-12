import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from '../services/cartApi';
import { getCartQuantity, getCartTotals } from '../lib/cart';
import type { CartItem } from '../types/cart';
import { useCurrentUser } from './useCurrentUser';

// Every user has their own cache entry (like favorites).
export const cartKeys = {
  all: ['cart'] as const,
  list: (userId: number) => ['cart', userId] as const,
};

// All cart changes share this scope, so TanStack Query sends them to the
// server ONE AFTER ANOTHER, in click order. Without it, quick clicks on +
// (quantity 2, 3, 4) could reach the server in the wrong order.
const cartScope = { id: 'cart' };

// What onMutate remembers, so onError can put the cart back ("roll back").
type RollbackContext = { previous?: CartItem[] };

// The logged-in user's cart, read from GET /api/cart, plus the actions.
export function useCart() {
  const { user, isPending: userPending } = useCurrentUser();
  const queryClient = useQueryClient();
  const queryKey = cartKeys.list(user?.id ?? 0);

  const cartQuery = useQuery({
    queryKey,
    queryFn: getCart,
    // Guests have no cart, so do not ask the server (it would say 401).
    enabled: user !== null,
  });

  const cartItems = cartQuery.data ?? [];

  // --- Shared steps for the optimistic changes (− / + and ×) ---

  // Change the cached cart right away and remember how it was before.
  const changeCacheNow = async (change: (items: CartItem[]) => CartItem[]) => {
    // Stop a running GET, so its older answer does not overwrite our change.
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData<CartItem[]>(queryKey);
    queryClient.setQueryData<CartItem[]>(queryKey, (old = []) => change(old));
    return { previous };
  };

  // The server said no: put the cart back as it was.
  const undoCacheChange = (
    _error: Error,
    _variables: unknown,
    context: RollbackContext | undefined,
  ) => {
    queryClient.setQueryData(queryKey, context?.previous);
  };

  // Reload the real cart from the server, but only after the LAST change in
  // a row of quick clicks. Reloading in between would show an older number
  // for a moment (3 → 2 → 3).
  const reloadWhenLastChange = () => {
    if (queryClient.isMutating({ mutationKey: cartKeys.all }) === 1) {
      return queryClient.invalidateQueries({ queryKey });
    }
  };

  // --- Actions ---

  // Waits for the server (no optimistic update), so the page can show
  // "Adding…", then "Added" or the server's error (e.g. the limit of 10).
  const addMutation = useMutation({
    mutationKey: cartKeys.all,
    scope: cartScope,
    mutationFn: addToCart,
    // The product page shows the error itself (e.g. the limit of 10).
    meta: { inlineError: true },
    // The answer has no product data, so load the full cart again.
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const quantityMutation = useMutation<
    void,
    Error,
    { productId: number; quantity: number },
    RollbackContext
  >({
    mutationKey: cartKeys.all,
    scope: cartScope,
    mutationFn: updateCartQuantity,
    onMutate: ({ productId, quantity }) =>
      changeCacheNow((items) =>
        items.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      ),
    onError: undoCacheChange,
    onSettled: reloadWhenLastChange,
  });

  const removeMutation = useMutation<void, Error, number, RollbackContext>({
    mutationKey: cartKeys.all,
    scope: cartScope,
    mutationFn: removeFromCart,
    onMutate: (productId) =>
      changeCacheNow((items) =>
        items.filter((item) => item.productId !== productId),
      ),
    onError: undoCacheChange,
    onSettled: reloadWhenLastChange,
  });

  return {
    cartItems,
    cartCount: getCartQuantity(cartItems),
    totals: getCartTotals(cartItems),
    isLoggedIn: user !== null,
    // True while we do not know yet: who is logged in, or their cart.
    isPending: userPending || (user !== null && cartQuery.isPending),
    // The request failed (after retries). refetch() = "Try again".
    isError: user !== null && cartQuery.isError,
    refetch: cartQuery.refetch,
    // The whole mutation, so the page can use .mutate, .isPending and .error.
    addToCart: addMutation,
    changeQuantity: (productId: number, quantity: number) =>
      quantityMutation.mutate({ productId, quantity }),
    removeFromCart: (productId: number) => removeMutation.mutate(productId),
  };
}
