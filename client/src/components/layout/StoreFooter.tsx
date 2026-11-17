import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { FREE_SHIPPING_FROM } from '../../lib/cart';
import { money } from '../../lib/formatters';

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const highlights: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: (
      <svg {...iconProps}>
        <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </svg>
    ),
    title: 'Free shipping',
    text: `On orders over ${money(FREE_SHIPPING_FROM)}`,
  },
  {
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 9.5v5M18 9.5v5" />
      </svg>
    ),
    title: 'Pay on delivery',
    text: 'Pay when your order arrives',
  },
  {
    icon: (
      <svg {...iconProps}>
        <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
        <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      </svg>
    ),
    title: 'Secure account',
    text: 'Your orders and favorites in one place',
  },
];

export default function StoreFooter() {
  const { categories } = useCategories();
  const { user } = useCurrentUser();

  const accountLinks = user
    ? [
        { to: '/profile', label: 'My profile' },
        { to: '/orders', label: 'My orders' },
        { to: '/favorites', label: 'Favorites' },
      ]
    : [
        { to: '/login', label: 'Sign in' },
        { to: '/register', label: 'Create account' },
      ];

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="logo" to="/">
            <span className="logo-mark">⬡</span>
            <span>
              Tech<span className="logo-accent">Store</span>
            </span>
          </Link>
          <p className="footer-copy">
            Thoughtfully selected tech for modern everyday use.
          </p>
        </div>
        <nav aria-label="Shop">
          <h4>Shop</h4>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/categories/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account">
          <h4>Account</h4>
          <ul>
            {accountLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h4>Why TechStore</h4>
          <ul className="footer-highlights">
            {highlights.map((item) => (
              <li key={item.title}>
                <span className="footer-highlight-icon">{item.icon}</span>
                <span>
                  <strong>{item.title}</strong>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} TechStore. All rights reserved.
        </span>
        <button
          type="button"
          className="footer-top-button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
