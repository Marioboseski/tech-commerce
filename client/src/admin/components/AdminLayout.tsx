import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { ApiUser } from '../../types/auth';

type AdminLayoutProps = {
  user: ApiUser;
  children: ReactNode;
};

// New admin sections (Products, Orders) are added to this list.
// end: Dashboard (/admin) is active only on /admin itself; Products stays
// active on /admin/products/new and /admin/products/5/edit too.
const navItems = [
  { label: 'Dashboard', to: '/admin', end: true },
  { label: 'Products', to: '/admin/products', end: false },
];

export default function AdminLayout({ user, children }: AdminLayoutProps) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="logo admin-logo" to="/admin">
          <span className="logo-mark">⬡</span>
          <span>
            Tech<span className="logo-accent">Store</span>
          </span>
        </Link>
        <p className="admin-badge">Admin</p>
        <nav className="admin-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span>
            Signed in as <strong>{user.fullName}</strong>
          </span>
          <Link className="ghost-button" to="/">
            Back to store
          </Link>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
