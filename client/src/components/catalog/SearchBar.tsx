import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { money } from '../../lib/formatters';
import { getProductImage } from '../../lib/productImage';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useProducts } from '../../hooks/useProducts';

// Wait until the user stops typing before calling the API.
const SEARCH_DELAY_MS = 300;
const MAX_RESULTS = 6;
// Must match MAX_SEARCH_LENGTH on the server.
const MAX_QUERY_LENGTH = 100;

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (event: FormEvent) => void;
};
export default function SearchBar({ query, onQueryChange, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const debouncedQuery = useDebouncedValue(normalizedQuery, SEARCH_DELAY_MS);
  // Requested only while the dropdown is open and there is text to search.
  const { data, isError } = useProducts(
    { search: debouncedQuery, limit: MAX_RESULTS },
    { enabled: open && debouncedQuery !== '' },
  );
  // True while waiting for the delay or for the API response.
  const searching =
    debouncedQuery !== normalizedQuery || (data === undefined && !isError);
  const results = data ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    setOpen(false);
    onSubmit(event);
  };

  return (
    <div className="search-area" ref={searchRef}>
      <form className="search-form" onSubmit={handleSubmit} role="search">
        <Search className="search-icon" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(Boolean(event.target.value.trim()));
          }}
          onFocus={() => setOpen(Boolean(normalizedQuery))}
          maxLength={MAX_QUERY_LENGTH}
          placeholder="Search laptops, smartphones, tablets..."
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={open && Boolean(normalizedQuery)}
          aria-controls="product-search-results"
        />
        <button className="search-button">Search</button>
      </form>
      {open && normalizedQuery && (
        <div
          className="search-results"
          id="product-search-results"
          role="listbox"
          aria-label="Product search results"
        >
          {searching ? (
            <p className="search-empty">Searching…</p>
          ) : isError ? (
            <p className="search-empty">Search is not available right now.</p>
          ) : results.length ? (
            results.map((product) => (
              <Link
                className="search-result"
                key={product.id}
                to={`/products/${product.id}`}
                role="option"
                onClick={() => {
                  onQueryChange(product.name);
                  setOpen(false);
                }}
              >
                <span className="search-result-icon">
                  <img src={getProductImage(product)} alt="" />
                </span>
                <span className="search-result-copy">
                  <strong>{product.name}</strong>
                  <small>{product.category.name}</small>
                </span>
                <strong className="search-result-price">
                  {money(product.price)}
                </strong>
              </Link>
            ))
          ) : (
            <p className="search-empty">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
}
