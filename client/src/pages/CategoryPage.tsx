import { useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import StoreHeader from '../components/layout/StoreHeader';
import ProductCard from '../components/catalog/ProductCard';
import { useCategories } from '../hooks/useCategories';
import { useFavorites } from '../hooks/useFavorites';
import { useProducts } from '../hooks/useProducts';
import ErrorState from '../components/feedback/ErrorState';
import { getCategoryMeta } from '../lib/categoryMeta';

// Same rule as the API: a non-negative number such as "100" or "99.99".
// Anything else in the URL is ignored instead of being sent to the server.
const parsePrice = (value: string | null) =>
  value !== null && /^\d+(\.\d+)?$/.test(value) ? Number(value) : undefined;

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { categories, categoriesLoaded, categoriesError, refetchCategories } =
    useCategories();
  const [minPrice, setMinPrice] = useState(
    () => searchParams.get('minPrice') ?? '',
  );
  const [maxPrice, setMaxPrice] = useState(
    () => searchParams.get('maxPrice') ?? '',
  );

  const category = categories.find((item) => item.slug === slug);
  const categoryId = category?.id;
  const appliedMinPrice = parsePrice(searchParams.get('minPrice'));
  const appliedMaxPrice = parsePrice(searchParams.get('maxPrice'));
  // The API rejects min > max, so we skip the request and show no products.
  const invalidRange =
    appliedMinPrice !== undefined &&
    appliedMaxPrice !== undefined &&
    appliedMinPrice > appliedMaxPrice;
  // Each category + price range is a separate cache entry, so results from a
  // previous category or range are never shown for the current one.
  const {
    data: products,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts(
    { categoryId, minPrice: appliedMinPrice, maxPrice: appliedMaxPrice },
    { enabled: categoryId !== undefined && !invalidRange },
  );

  if (categoriesError) {
    return (
      <div className="listing-page">
        <StoreHeader />
        <main>
          <section className="container section">
            <ErrorState what="this category" onRetry={refetchCategories} />
          </section>
        </main>
      </div>
    );
  }

  if (!categoriesLoaded) {
    return (
      <div className="listing-page">
        <StoreHeader />
        <main>
          <section className="container section">
            <p className="subheading">Loading category…</p>
          </section>
        </main>
      </div>
    );
  }

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const meta = getCategoryMeta(category.slug);
  // products is undefined while loading (and after an error, see below).
  const productsLoading =
    !invalidRange && !productsError && products === undefined;
  const filteredProducts = invalidRange ? [] : (products ?? []);

  return (
    <div className="listing-page">
      <StoreHeader />
      <main>
        <section className="container section">
          <p className="eyebrow">CATEGORY</p>
          <div className="category-heading">
            <div>
              <h1 className="section-title">{category.name}</h1>
              <p className="subheading">{meta.tagline}</p>
            </div>
            <div className="category-heading-icon">{meta.icon}</div>
          </div>
          <div className="category-products-layout">
            <aside
              className="price-filter-sidebar"
              aria-label="Filter by price"
            >
              <div className="price-filter-heading">
                <span>Filter products</span>
                <h2>Price range</h2>
              </div>
              <form
                className="price-filter-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearchParams(
                    (current) => {
                      const next = new URLSearchParams(current);
                      if (minPrice) {
                        next.set('minPrice', minPrice);
                      } else {
                        next.delete('minPrice');
                      }
                      if (maxPrice) {
                        next.set('maxPrice', maxPrice);
                      } else {
                        next.delete('maxPrice');
                      }
                      return next;
                    },
                    { replace: true },
                  );
                }}
              >
                <label>
                  <span>Minimum price</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="e.g. 100"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                  />
                </label>
                <label>
                  <span>Maximum price</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    placeholder="e.g. 1000"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                  />
                </label>
                <button className="apply-price-filter" type="submit">
                  Apply filter
                </button>
                {(minPrice ||
                  maxPrice ||
                  searchParams.get('minPrice') ||
                  searchParams.get('maxPrice')) && (
                  <button
                    className="clear-price-filter"
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setSearchParams({}, { replace: true });
                    }}
                  >
                    Clear price filter
                  </button>
                )}
              </form>
            </aside>
            <div className="category-product-results">
              {productsError ? (
                <ErrorState what="the products" onRetry={refetchProducts} />
              ) : productsLoading ? (
                <p className="subheading">Loading products…</p>
              ) : (
                <>
                  <p className="subheading">
                    {filteredProducts.length} product
                    {filteredProducts.length === 1 ? '' : 's'} available
                  </p>
                  {filteredProducts.length ? (
                    <div className="product-grid">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          isFavorite={favoriteIds.has(product.id)}
                          onFavorite={toggleFavorite}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <h3>No products in this price range</h3>
                      <p>
                        Adjust or clear the price filter to see more products.
                      </p>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => {
                          setMinPrice('');
                          setMaxPrice('');
                          setSearchParams({}, { replace: true });
                        }}
                      >
                        Clear price filter
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
