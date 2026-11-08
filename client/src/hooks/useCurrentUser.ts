import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, loginUser, logoutUser } from '../services/authApi';

// One cache entry for "who is logged in", shared by every component.
export const authKeys = {
  me: ['auth', 'me'] as const,
};

// The logged-in user, or null. Asks GET /api/auth/me once; after that all
// components read the same cached answer.
// isPending is true while we do not know yet (e.g. right after a refresh).
export function useCurrentUser() {
  const { data, isPending } = useQuery({
    queryKey: authKeys.me,
    queryFn: getCurrentUser,
    // Login state only changes through login/logout below, which update the
    // cache themselves, so there is no need to ask the server again.
    staleTime: Infinity,
    // "Not logged in" (401) already returns null. If the server is down,
    // do not retry 3 times; we simply treat the user as logged out.
    retry: false,
  });

  return { user: data ?? null, isPending };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    // The server already sent us the user, so put it straight in the cache:
    // the header updates immediately, without another /me request.
    onSuccess: (user) => queryClient.setQueryData(authKeys.me, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => queryClient.setQueryData(authKeys.me, null),
  });
}
