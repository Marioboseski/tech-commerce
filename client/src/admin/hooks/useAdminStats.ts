import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '../services/adminApi';

// All admin data starts with 'admin', so logout can remove it in one go.
export const adminKeys = {
  all: ['admin'] as const,
  stats: ['admin', 'stats'] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: getAdminStats,
  });
}
