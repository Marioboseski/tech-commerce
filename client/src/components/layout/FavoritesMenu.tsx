import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { money } from '../../lib/formatters';
import { getProductImage } from '../../lib/productImage';
import { useFavorites } from '../../hooks/useFavorites';
import { useProductsByIds } from '../../hooks/useProductsByIds';

const PREVIEW_COUNT = 3;

export default function FavoritesMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();
  // The header is on every page, so products are only requested when the
  // dropdown is opened. The badge count comes from the saved ids.
  const previewIds = [...favorites].slice(0, PREVIEW_COUNT);
  const { products, loading } = useProductsByIds(open ? previewIds : []);
  const previewProducts = products.filter((product) =>
    previewIds.includes(product.id),
  );
  const favoritesCount = favorites.size;

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
        aria-label={`Open favorites${favoritesCount ? `, ${favoritesCount} saved` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="icon-wrap">
          <Heart className="header-action-icon" aria-hidden="true" />
          {favoritesCount > 0 && <b className="cart-count">{favoritesCount}</b>}
        </span>
        <span className="action-label">Favorites</span>
      </button>
      {open && (
        <div
          className="favorites-dropdown"
          role="menu"
          aria-label="Favorite products"
        >
          {loading ? (
            <p className="favorites-empty">Loading favorites…</p>
          ) : previewProducts.length ? (
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
                    <img src={getProductImage(product)} alt="" />
                  </span>
                  <span>
                    <strong>{product.name}</strong>
                    <small>{money(product.price)}</small>
                  </span>
                </Link>
              ))}
              {favoritesCount > PREVIEW_COUNT && (
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
