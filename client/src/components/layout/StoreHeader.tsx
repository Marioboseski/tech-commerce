import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../../data/catalog';
import SearchBar from '../catalog/SearchBar';
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
  const [headerQuery, setHeaderQuery] = useState('');
  const [favoritesActive, setFavoritesActive] = useState(false);

  const submitHeaderSearch = (event: FormEvent) => {
    event.preventDefault();
    navigate('/');
  };

  const defaultActions = (
    <>
      <button
        className={`icon-button header-action ${favoritesActive ? 'is-active' : ''}`}
        type="button"
        aria-label="Show favorites"
        onClick={() => {
          setFavoritesActive((value) => !value);
          navigate('/');
        }}
      >
        <svg className="header-action-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
        <span className="action-label">Favorites</span>
      </button>
      <button
        className="icon-button header-action"
        type="button"
        aria-label="Open shopping cart"
        onClick={() => navigate('/')}
      >
        <span className="icon-wrap">
          <svg className="header-action-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L20 7.05H5.12" />
          </svg>
        </span>
        <span className="action-label">Cart</span>
      </button>
    </>
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
