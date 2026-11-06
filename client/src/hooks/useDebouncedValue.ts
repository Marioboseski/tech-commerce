import { useEffect, useState } from 'react';

// Returns the value only after it has stopped changing for `delayMs`.
// Used for search, so the API is called once the user stops typing instead
// of on every key press.
export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
