import StoreHeader from '../components/layout/StoreHeader';
import ProductCard from '../components/catalog/ProductCard';
import { products } from '../data/catalog';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();
  const favoriteProducts = products.filter((product) =>
    favorites.has(product.id),
  );

  return (
    <div className="listing-page">
      <StoreHeader />
      <main>
        <section className="container section">
          <p className="eyebrow">SAVED FOR LATER</p>
          <div className="favorites-page-heading">
            <div>
              <h1 className="section-title">Favorites</h1>
              <p className="subheading">
                {favoriteProducts.length
                  ? `${favoriteProducts.length} saved product${favoriteProducts.length === 1 ? '' : 's'}.`
                  : 'There is nothing in your favorites yet.'}
              </p>
            </div>
          </div>
          {favoriteProducts.length ? (
            <div className="product-grid">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite
                  onFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="favorites-empty-state">
              <h2>Nothing saved yet</h2>
              <p>Use the heart on any product to add it to your favorites.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
