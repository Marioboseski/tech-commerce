import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { products } from '../../data/catalog';
import { money } from '../../lib/formatters';
import { useFavorites } from '../../hooks/useFavorites';

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
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
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
          <Heart className="header-action-icon" aria-hidden="true" />
          {favoriteProducts.length > 0 && (
            <b className="cart-count">{favoriteProducts.length}</b>
          )}
        </span>
        <span className="action-label">Favorites</span>
      </button>
      {open && (
        <div
          className="favorites-dropdown"
          role="menu"
          aria-label="Favorite products"
        >
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
                  <span className="favorite-preview-icon">
                    <img src={product.image} alt="" />
                  </span>
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
            <p className="favorites-empty">
              There is nothing in your favorites yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
