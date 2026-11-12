import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { money } from '../../lib/formatters';
import { getProductImage } from '../../lib/productImage';
import { useFavorites } from '../../hooks/useFavorites';

const PREVIEW_COUNT = 3;

export default function FavoritesMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Same cached list as the favorites page, so no extra request here.
  const { favoriteProducts, isLoggedIn, isPending, isError } = useFavorites();
  // The list is newest first, so the preview shows the latest saved products.
  const previewProducts = favoriteProducts.slice(0, PREVIEW_COUNT);
  const favoritesCount = favoriteProducts.length;

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
          {isPending ? (
            <p className="favorites-empty">Loading favorites…</p>
          ) : isError ? (
            <p className="favorites-empty">Could not load your favorites.</p>
          ) : !isLoggedIn ? (
            <p className="favorites-empty">
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>{' '}
              to save favorites.
            </p>
          ) : (
            <>
              <p className="favorites-dropdown-title">Favorites</p>
              {previewProducts.length === 0 && (
                <p className="favorites-empty">
                  There is nothing in your favorites yet.
                </p>
              )}
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
              {/* Always shown, so the favorites page can always be reached. */}
              <Link
                className="favorites-view-all"
                role="menuitem"
                to="/favorites"
                onClick={() => setOpen(false)}
              >
                View all favorites
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
