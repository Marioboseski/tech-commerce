import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../../data/catalog';
import { useCart } from '../../hooks/useCart';
import { getCartQuantity } from '../../lib/cart';
import SearchBar from '../catalog/SearchBar';
import FavoritesMenu from './FavoritesMenu';
import ProfileMenu from './ProfileMenu';

type StoreHeaderProps = {
  middle?: ReactNode;
  actions?: ReactNode;
  /** Connect this to the real auth session when authentication is added. */
  isAuthenticated?: boolean;
};

export default function StoreHeader({
  middle,
  actions,
  isAuthenticated = false,
}: StoreHeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cart, setCartOpen } = useCart();
  const [headerQuery, setHeaderQuery] = useState('');
  const cartQuantity = getCartQuantity(cart);

  const submitHeaderSearch = (event: FormEvent) => {
    event.preventDefault();
    const search = headerQuery.trim();
    navigate(search ? `/?search=${encodeURIComponent(search)}` : '/');
  };

  const defaultActions = (
    <button
      className="icon-button header-action"
      type="button"
      aria-label="Open shopping cart"
      onClick={() => setCartOpen(true)}
    >
      <span className="icon-wrap">
        <svg
          className="header-action-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20 7.05H5.12" />
        </svg>
        {cartQuantity > 0 && <b className="cart-count">{cartQuantity}</b>}
      </span>
      <span className="action-label">Cart</span>
    </button>
  );

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="logo" to="/">
          <span className="logo-mark">⬡</span>
          <span>
            Tech<span className="logo-accent">Store</span>
          </span>
        </Link>
        {middle ?? (
          <SearchBar
            query={headerQuery}
            onQueryChange={setHeaderQuery}
            onSubmit={submitHeaderSearch}
          />
        )}
        <div className="header-actions">
          <FavoritesMenu />
          {actions ?? defaultActions}
          <ProfileMenu isAuthenticated={isAuthenticated} />
        </div>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        <div className="container nav-inner">
          <Link
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            to="/"
          >
            Home
          </Link>
          {categories.map((item) => (
            <Link
              key={item.name}
              className={`nav-link ${pathname === `/categories/${item.name.toLowerCase()}` ? 'active' : ''}`}
              to={`/categories/${item.name.toLowerCase()}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
