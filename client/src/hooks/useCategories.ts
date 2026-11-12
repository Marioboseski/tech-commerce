import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/categoryApi';
import type { ApiCategory } from '../types/category';

// Categories rarely change, so a loaded list is reused for 10 minutes
// before TanStack Query fetches it again.
const CATEGORIES_STALE_TIME = 10 * 60 * 1000;

// Stable empty list while loading, so components get the same array every render.
const NO_CATEGORIES: ApiCategory[] = [];

export function useCategories() {
  const { data, isSuccess, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: CATEGORIES_STALE_TIME,
  });

  return {
    categories: data ?? NO_CATEGORIES,
    categoriesLoaded: isSuccess,
    categoriesError: isError,
    refetchCategories: refetch,
  };
}
