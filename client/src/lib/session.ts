import type { QueryClient } from '@tanstack/react-query';

// Forget who is logged in and their private data (favorites, cart, orders)
// on this computer. Used by logout and when the server says 401 (the login
// cookie expired or was deleted).
// The keys are written out here (same as authKeys.me, favoriteKeys.all,
// cartKeys.all, orderKeys.all) because importing them from the hooks would
// make the files import each other.
export const clearSession = (queryClient: QueryClient) => {
  queryClient.setQueryData(['auth', 'me'], null);
  queryClient.removeQueries({ queryKey: ['favorites'] });
  queryClient.removeQueries({ queryKey: ['cart'] });
  queryClient.removeQueries({ queryKey: ['orders'] });
};
