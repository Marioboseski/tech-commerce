import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiClient';
import { clearSession } from './session';
import { showToast } from '../stores/toastStore';

// Lets a mutation say "I show my error myself, no toast needed":
// useMutation({ ..., meta: { inlineError: true } })
declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { inlineError?: boolean };
  }
}

const MAX_RETRIES = 2;

// 401 = the login cookie is gone or expired: show the user as logged out.
const handleUnauthorized = (error: Error) => {
  if (error instanceof ApiError && error.status === 401) {
    clearSession(queryClient);
  }
};

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleUnauthorized,
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleUnauthorized(error);
      // A short message at the bottom, e.g. when ♥ or + fails, unless the
      // page already shows this error itself (forms, Add to cart).
      if (!mutation.meta?.inlineError) {
        showToast(error.message, 'error');
      }
    },
  }),
  defaultOptions: {
    queries: {
      // Trying again only helps when the server or network had a problem.
      // 4xx answers (400, 401, 404...) will be the same every time.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < MAX_RETRIES;
      },
    },
  },
});
