import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const SEARCH_DELAY_MS = 300;

// Filters of an admin table live in the URL (?page=2&status=...), so
// refresh and the Back button keep the same view. Shared by the products
// and orders tables.
export function useTableParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') ?? '';

  // Empty values are removed from the URL instead of written as "?x=".
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value) {
              next.set(key, value);
            } else {
              next.delete(key);
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // The input updates at once; the URL (and the request) only after a pause.
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DELAY_MS);

  useEffect(() => {
    if (debouncedSearch.trim() !== search) {
      // A new search starts again at page 1.
      updateParams({ search: debouncedSearch.trim(), page: undefined });
    }
  }, [debouncedSearch, search, updateParams]);

  return {
    searchParams,
    page,
    search,
    searchInput,
    setSearchInput,
    updateParams,
  };
}
