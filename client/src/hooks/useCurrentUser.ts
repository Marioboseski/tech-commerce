import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, loginUser, logoutUser } from '../services/authApi';
import { clearSession } from '../lib/session';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

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
    meta: { inlineError: true },
    // The server already sent us the user, so put it straight in the cache:
    // the header updates immediately, without another /me request.
    onSuccess: (user) => queryClient.setQueryData(authKeys.me, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => clearSession(queryClient),
  });
}
