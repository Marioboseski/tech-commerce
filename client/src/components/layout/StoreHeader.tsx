import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useCategories } from '../../hooks/useCategories';
import { getCartQuantity } from '../../lib/cart';
import SearchBar from '../catalog/SearchBar';
import FavoritesMenu from './FavoritesMenu';
import ProfileMenu from './ProfileMenu';

type StoreHeaderProps = {
  middle?: ReactNode;
  actions?: ReactNode;
};

export default function StoreHeader({ middle, actions }: StoreHeaderProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cart, setCartOpen } = useCart();
  const { categories } = useCategories();
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
        <ShoppingCart className="header-action-icon" aria-hidden="true" />
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
          <span className="header-divider" aria-hidden="true" />
          <ProfileMenu />
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
              key={item.id}
              className={`nav-link ${pathname === `/categories/${item.slug}` ? 'active' : ''}`}
              to={`/categories/${item.slug}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
