import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { categories } from '../data/catalog';

type StoreHeaderProps = { middle?: ReactNode; actions?: ReactNode };

export default function StoreHeader({ middle, actions }: StoreHeaderProps) {
  const { pathname } = useLocation();
  return <header className="site-header">
    <div className="container header-inner">
      <Link className="logo" to="/"><span className="logo-mark">⬡</span><span>Tech<span className="logo-accent">Store</span></span></Link>
      {middle}
      {actions && <div className="header-actions">{actions}</div>}
    </div>
    <nav className="main-nav" aria-label="Main navigation"><div className="container nav-inner">
      <Link className={`nav-link ${pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
      {categories.map(item => <Link key={item.name} className={`nav-link ${pathname === `/categories/${item.name.toLowerCase()}` ? 'active' : ''}`} to={`/categories/${item.name.toLowerCase()}`}>{item.name}</Link>)}
    </div></nav>
  </header>;
}
