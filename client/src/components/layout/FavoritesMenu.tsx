import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { money, products } from '../../data/catalog';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoritesMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();
  const favoriteProducts = useMemo(
    () => products.filter((product) => favorites.has(product.id)),
    [favorites],
  );
  const previewProducts = favoriteProducts.slice(0, 3);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className="favorites-menu" ref={menuRef}>
      <button
        className={`icon-button header-action ${open ? 'is-active' : ''}`}
        type="button"
        aria-label={`Open favorites${favoriteProducts.length ? `, ${favoriteProducts.length} saved` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="icon-wrap">
          <svg className="header-action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
          </svg>
          {favoriteProducts.length > 0 && (
            <b className="cart-count">{favoriteProducts.length}</b>
          )}
        </span>
        <span className="action-label">Favorites</span>
      </button>
      {open && (
        <div className="favorites-dropdown" role="menu" aria-label="Favorite products">
          {previewProducts.length ? (
            <>
              <p className="favorites-dropdown-title">Favorites</p>
              {previewProducts.map((product) => (
                <Link
                  className="favorite-preview"
                  key={product.id}
                  role="menuitem"
                  to={`/products/${product.id}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="favorite-preview-icon" aria-hidden="true">{product.icon}</span>
                  <span>
                    <strong>{product.name}</strong>
                    <small>{money(product.price)}</small>
                  </span>
                </Link>
              ))}
              {favoriteProducts.length > 3 && (
                <Link
                  className="favorites-view-all"
                  role="menuitem"
                  to="/favorites"
                  onClick={() => setOpen(false)}
                >
                  View all favorites
                </Link>
              )}
            </>
          ) : (
            <p className="favorites-empty">There is nothing in your favorites yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
