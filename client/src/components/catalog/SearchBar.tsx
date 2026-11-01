import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../../data/catalog';
import { money } from '../../lib/formatters';
type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: (event: FormEvent) => void;
};
export default function SearchBar({ query, onQueryChange, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      normalizedQuery
        ? products
            .filter((product) =>
              `${product.name} ${product.category} ${product.description}`
                .toLowerCase()
                .includes(normalizedQuery),
            )
            .slice(0, 6)
        : [],
    [normalizedQuery],
  );

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
        <span aria-hidden="true">⌕</span>
        <input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(Boolean(event.target.value.trim()));
          }}
          onFocus={() => setOpen(Boolean(normalizedQuery))}
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
          {results.length ? (
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
                  <img src={product.image} alt="" />
                </span>
                <span className="search-result-copy">
                  <strong>{product.name}</strong>
                  <small>{product.category}</small>
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
