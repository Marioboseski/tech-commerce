import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { categories, products } from '../data/catalog';
import StoreHeader from '../components/layout/StoreHeader';
import ProductCard from '../components/catalog/ProductCard';
import { useFavorites } from '../context/FavoritesContext';

export default function CategoryPage() {
  const { slug } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const category = categories.find(
    (item) => item.name.toLowerCase() === slug?.toLowerCase(),
  );

  useEffect(() => {
    setMinPrice('');
    setMaxPrice('');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
  }, [category?.name]);

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const categoryProducts = products.filter(
    (product) => product.category === category.name,
  );
  const filteredProducts = categoryProducts.filter((product) => {
    const minimum = appliedMinPrice === '' ? 0 : Number(appliedMinPrice);
    const maximum = appliedMaxPrice === '' ? Infinity : Number(appliedMaxPrice);
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
                  setAppliedMinPrice(minPrice);
                  setAppliedMaxPrice(maxPrice);
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
                {(minPrice || maxPrice || appliedMinPrice || appliedMaxPrice) && (
                  <button
                    className="clear-price-filter"
                    type="button"
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                      setAppliedMinPrice('');
                      setAppliedMaxPrice('');
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
