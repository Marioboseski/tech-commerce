import {
  keepPreviousData,
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getAdminOrder,
  getAdminOrders,
  setAdminOrderStatus,
} from '../services/adminApi';
import type { AdminOrderFilters } from '../types';
import { adminKeys } from './useAdminStats';

export const adminOrderKeys = {
  list: (filters: AdminOrderFilters) =>
    [...adminKeys.all, 'orders', 'list', filters] as const,
  detail: (orderId: number | null) =>
    [...adminKeys.all, 'orders', 'detail', orderId] as const,
};

export function useAdminOrders(filters: AdminOrderFilters) {
  return useQuery({
    queryKey: adminOrderKeys.list(filters),
    queryFn: () => getAdminOrders(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrder(orderId: number | null) {
  return useQuery({
    queryKey: adminOrderKeys.detail(orderId),
    queryFn: orderId === null ? skipToken : () => getAdminOrder(orderId),
  });
}

export function useSetOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAdminOrderStatus,
    onSuccess: (order) => {
      // The answer is the updated order: show it at once.
      queryClient.setQueryData(adminOrderKeys.detail(order.id), order);
      // Lists and the dashboard (pending count) are now out of date, and so
      // is "My Orders" if the admin also shops on this computer.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: adminKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
    },
    // e.g. 409 "changed by someone else": load the real current status.
    // (The message itself is shown by the global error toast.)
    onError: (_error, { orderId }) =>
      queryClient.invalidateQueries({
        queryKey: adminOrderKeys.detail(orderId),
      }),
  });
}
