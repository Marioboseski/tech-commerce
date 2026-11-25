import { useMemo } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CategoryCard from '../components/catalog/CategoryCard';
import ProductCard from '../components/catalog/ProductCard';
import SearchBar from '../components/catalog/SearchBar';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import ErrorState from '../components/feedback/ErrorState';
import type { ApiProduct } from '../types/product';

// Stable empty list while the first request is loading.
const NO_PRODUCTS: ApiProduct[] = [];

export default function StorefrontPage() {
  const { categories, categoriesLoaded, categoriesError, refetchCategories } =
    useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const requestedCategory = searchParams.get('category');
  const category =
    requestedCategory &&
    categories.some((item) => item.slug === requestedCategory)
      ? requestedCategory
      : 'All';
  const selectedCategory = categories.find((item) => item.slug === category);
  const selectedCategoryId = selectedCategory?.id;
  const query = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';

  // Waits for the categories, because ?category=<slug> in the URL is turned
  // into a category id. The previous list stays visible while switching.
  const {
    data: products = NO_PRODUCTS,
    isPending: productsPending,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts(
    { categoryId: selectedCategoryId },
    { enabled: categoriesLoaded, keepPrevious: true },
  );

  const updateFilters = (updates: Record<string, string>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.entries(updates).forEach(([key, value]) => {
          if (value && value !== 'All' && value !== 'featured') {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        });
        return next;
      },
      { replace: true },
    );
  };

  const shown = useMemo(
    () =>
      products
        .filter((product) =>
          `${product.name} ${product.category.name} ${product.description}`
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
    [products, query, sort],
  );

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="storefront">
      <StoreHeader
        middle={
          <SearchBar
            query={query}
            onQueryChange={(value) => updateFilters({ search: value })}
            onSubmit={submitSearch}
          />
        }
      />
      <main>
        <section className="container section">
          <div className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">MODERN TECH STORE</p>
              <h1>Find the right tech for work, play and everyday life.</h1>
              <p className="hero-text">
                Shop laptops, smartphones, tablets, desktops and consoles.
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
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="hero-product-photo hero-product-main">
                <img src="/categories/laptops.webp" alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="container section" id="categories">
          <div className="section-top">
            <div>
              <p className="eyebrow">BROWSE THE COLLECTION</p>
              <h2 className="section-title">Shop by category</h2>
              <p className="subheading">
                Find the right device for work, study and play.
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
              <p className="eyebrow">SHOP BY YOUR SETUP</p>
              <h2 className="section-title">Tech for every day</h2>
            </div>
          </div>
          <div className="panel-grid">
            <Link className="info-panel" to="/categories/computers">
              {/* Text and picture side by side, so the picture can never
                  cover the text. */}
              <div className="panel-copy">
                <span className="panel-kicker">Workspace</span>
                <h3>Build a workspace that works for you.</h3>
                <p>
                  Browse laptops and desktops for focused work and everyday
                  productivity.
                </p>
              </div>
              <img
                className="panel-image"
                src="/categories/laptops.webp"
                alt=""
              />
            </Link>
            <Link className="info-panel" to="/categories/mobile-phones">
              <span className="panel-kicker">Mobile</span>
              <h3>Take your tech wherever you go.</h3>
              <img
                className="panel-image"
                src="/categories/mobile.webp"
                alt=""
              />
            </Link>
            <Link className="info-panel" to="/categories/consoles">
              <span className="panel-kicker">Gaming</span>
              <h3>Play anywhere, at home or on the go.</h3>
              <img
                className="panel-image"
                src="/categories/gaming.webp"
                alt=""
              />
            </Link>
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
                  updateFilters({ category: event.target.value });
                }}
              >
                <option value="All">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) =>
                  updateFilters({ sort: event.target.value })
                }
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
          {categoriesError ? (
            <ErrorState what="the categories" onRetry={refetchCategories} />
          ) : productsError ? (
            <ErrorState what="the products" onRetry={refetchProducts} />
          ) : productsPending ? (
            <p className="subheading">Loading products…</p>
          ) : shown.length ? (
            <div className="product-grid">
              {shown.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onFavorite={toggleFavorite}
                  isFavorite={favoriteIds.has(product.id)}
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
                  updateFilters({ search: '', category: '' });
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
