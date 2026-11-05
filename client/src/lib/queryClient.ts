import { QueryClient } from '@tanstack/react-query';

// One cache for all data loaded from the API (server state).
export const queryClient = new QueryClient();
