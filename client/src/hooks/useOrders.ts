import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrder, getOrders } from '../services/ordersApi';
import type { Order } from '../types/order';
import { cartKeys } from './useCart';
import { useCurrentUser } from './useCurrentUser';

// Every user has their own cache entries (like favorites and cart).
export const orderKeys = {
  all: ['orders'] as const,
  list: (userId: number) => ['orders', userId, 'list'] as const,
  detail: (userId: number, orderId: number) =>
    ['orders', userId, 'detail', orderId] as const,
};

export function useOrders() {
  const { user, isPending: userPending } = useCurrentUser();

  const ordersQuery = useQuery({
    queryKey: orderKeys.list(user?.id ?? 0),
    queryFn: getOrders,
    // Guests have no orders, so do not ask the server (it would say 401).
    enabled: user !== null,
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoggedIn: user !== null,
    isPending: userPending || (user !== null && ordersQuery.isPending),
    isError: user !== null && ordersQuery.isError,
    refetch: ordersQuery.refetch,
  };
}

// order is undefined while loading and null when it does not exist.
export function useOrder(orderId: number | null) {
  const { user, isPending: userPending } = useCurrentUser();

  const orderQuery = useQuery({
    queryKey: orderKeys.detail(user?.id ?? 0, orderId ?? 0),
    queryFn: () => getOrder(orderId as number),
    enabled: user !== null && orderId !== null,
  });

  return {
    order: orderQuery.data,
    isLoggedIn: user !== null,
    isPending: userPending || (user !== null && orderQuery.isPending),
    isError: user !== null && orderQuery.isError,
    refetch: orderQuery.refetch,
  };
}

export function useCreateOrder() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const userId = user?.id ?? 0;

  return useMutation({
    mutationFn: createOrder,
    meta: { inlineError: true },
    onSuccess: (order: Order) => {
      // The server emptied the cart: load it again (it comes back empty).
      // Not set to [] by hand here, because then the checkout page would
      // switch to "Your cart is empty" before we move to the order page.
      queryClient.invalidateQueries({ queryKey: cartKeys.list(userId) });
      // The details page can show the new order without loading it again.
      queryClient.setQueryData(orderKeys.detail(userId, order.id), order);
      queryClient.invalidateQueries({ queryKey: orderKeys.list(userId) });
    },
  });
}
