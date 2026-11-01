import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { categories, products } from '../data/catalog';
import StoreHeader from '../components/layout/StoreHeader';
import ProductCard from '../components/catalog/ProductCard';
import { useFavorites } from '../context/FavoritesContext';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, toggleFavorite } = useFavorites();
  const [minPrice, setMinPrice] = useState(() => searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') ?? '');
  const category = categories.find(
    (item) => item.name.toLowerCase() === slug?.toLowerCase(),
  );

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') ?? '');
    setMaxPrice(searchParams.get('maxPrice') ?? '');
  }, [category?.name]);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const categoryProducts = products.filter(
    (product) => product.category === category.name,
  );
  const filteredProducts = categoryProducts.filter((product) => {
    const minimum = searchParams.get('minPrice') === null ? 0 : Number(searchParams.get('minPrice'));
    const maximum = searchParams.get('maxPrice') === null ? Infinity : Number(searchParams.get('maxPrice'));
    return product.price >= minimum && product.price <= maximum;
  });

  return (
    <div className="listing-page">
      <StoreHeader />
      <main>
        <section className="container section">
          <p className="eyebrow">CATEGORY</p>
          <div className="category-heading">
            <div>
              <h1 className="section-title">{category.name}</h1>
              <p className="subheading">{category.tagline}</p>
            </div>
            <div className="category-heading-icon">{category.icon}</div>
          </div>
          <div className="category-products-layout">
            <aside className="price-filter-sidebar" aria-label="Filter by price">
              <div className="price-filter-heading">
                <span>Filter products</span>
                <h2>Price range</h2>
              </div>
              <form
                className="price-filter-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearchParams((current) => {
                    const next = new URLSearchParams(current);
                    if (minPrice) next.set('minPrice', minPrice);
                    else next.delete('minPrice');
                    if (maxPrice) next.set('maxPrice', maxPrice);
                    else next.delete('maxPrice');
                    return next;
                  }, { replace: true });
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
                {(minPrice || maxPrice || searchParams.get('minPrice') || searchParams.get('maxPrice')) && (
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
              <p className="subheading">
                {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} available
              </p>
              {filteredProducts.length ? (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.has(product.id)}
                      onFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No products in this price range</h3>
                  <p>Adjust or clear the price filter to see more products.</p>
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
