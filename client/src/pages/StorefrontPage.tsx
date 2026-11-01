import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { categories, products } from '../data/catalog';
import type { Category } from '../data/catalog';
import CategoryCard from '../components/catalog/CategoryCard';
import ProductCard from '../components/catalog/ProductCard';
import SearchBar from '../components/catalog/SearchBar';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useFavorites } from '../context/FavoritesContext';

const features = [
  ['✦', 'Curated tech', 'Popular devices and everyday essentials in one place.'],
  ['◈', 'Saved favorites', 'Keep products you want to compare or revisit later.'],
  ['◌', 'Product details', 'Review key specifications before choosing a device.'],
  ['↻', 'Cart at a glance', 'Review your selected products whenever you need.'],
];

export default function StorefrontPage() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const { favorites, toggleFavorite } = useFavorites();

  const shown = useMemo(
    () =>
      products
        .filter(
          (product) =>
            (category === 'All' || product.category === category) &&
            `${product.name} ${product.category} ${product.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'price-asc'
            ? a.price - b.price
            : sort === 'price-desc'
              ? b.price - a.price
              : sort === 'name'
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [category, query, sort],
  );

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="storefront" id="home">
      <StoreHeader
        middle={
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            onSubmit={submitSearch}
          />
        }
      />
      <main>
        <section className="container section">
          <div className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">MODERN TECH STORE</p>
              <h1>
                Find the right tech for work, play and everyday life.
              </h1>
              <p className="hero-text">
                Shop laptops, smartphones, tablets, desktops and accessories.
                Compare products, save your favorites and build your cart with
                confidence.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#products">
                  Shop products
                </a>
                <button
                  className="ghost-button"
                  onClick={() =>
                    document
                      .getElementById('categories')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Shop by category
                </button>
              </div>
              <div className="hero-stats">
                <div className="stat-pill">
                  <strong>5</strong>
                  <span>Technology categories</span>
                </div>
                <div className="stat-pill">
                  <strong>12</strong>
                  <span>Products to explore</span>
                </div>
                <div className="stat-pill">
                  <strong>Easy</strong>
                  <span>Favorites and cart</span>
                </div>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <i className="orb one" />
              <i className="orb two" />
              <i className="device laptop" />
              <i className="device phone" />
              <div className="float-card top">
                <span>SHOP LAPTOPS</span>
                <strong>Laptops</strong>
                <small>Power for work, study and play</small>
              </div>
              <div className="float-card bottom">
                <span>TRENDING NOW</span>
                <strong>Tech for every setup</strong>
                <small>Accessories that complete your desk</small>
              </div>
            </div>
          </div>
        </section>
        <section className="container features-strip">
          {features.map(([icon, title, text]) => (
            <article className="feature-box" key={title}>
              <div className="feature-icon">{icon}</div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </section>
        <section className="container section" id="categories">
          <div className="section-top">
            <div>
              <p className="eyebrow">BROWSE THE COLLECTION</p>
              <h2 className="section-title">Shop by category</h2>
              <p className="subheading">
                Visual category cards with subtle gradients and device artwork.
              </p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </section>
        <section className="container section">
          <div className="section-top">
            <div>
              <p className="eyebrow">STORE HIGHLIGHTS</p>
              <h2 className="section-title">A more visual homepage</h2>
            </div>
          </div>
          <div className="panel-grid">
            <article className="info-panel">
              <span className="panel-kicker">Workspace</span>
              <h3>Build a setup for focus and productivity.</h3>
              <p>
                Balanced layouts for laptops, desktops and accessories with
                clean visual hierarchy.
              </p>
              <span className="panel-emoji">🖥️</span>
            </article>
            <article className="info-panel">
              <span className="panel-kicker">Mobile</span>
              <h3>Portable devices in a lighter visual style.</h3>
              <span className="panel-emoji">📱</span>
            </article>
            <article className="info-panel">
              <span className="panel-kicker">Accessories</span>
              <h3>Layered graphics for a richer storefront feel.</h3>
              <span className="panel-emoji">🎧</span>
            </article>
          </div>
        </section>
        <section className="container section" id="products">
          <div className="section-top">
            <div>
              <p className="eyebrow">CURATED FOR YOU</p>
              <h2 className="section-title">Explore products</h2>
              <p className="subheading">
                Showing {shown.length} product{shown.length === 1 ? '' : 's'}
                {category !== 'All' ? ` in ${category}` : ''}.
              </p>
            </div>
            <div className="filters">
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as Category);
                }}
              >
                <option value="All">All categories</option>
                {categories.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
          {shown.length ? (
            <div className="product-grid">
              {shown.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onFavorite={toggleFavorite}
                  isFavorite={favorites.has(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="primary-button"
                onClick={() => {
                  setQuery('');
                  setCategory('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
