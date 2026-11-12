import { Link } from 'react-router-dom';
import StoreHeader from '../components/layout/StoreHeader';
import ProductCard from '../components/catalog/ProductCard';
import ErrorState from '../components/feedback/ErrorState';
import { useFavorites } from '../hooks/useFavorites';

export default function FavoritesPage() {
  const {
    favoriteProducts,
    toggleFavorite,
    isLoggedIn,
    isPending,
    isError,
    refetch,
  } = useFavorites();
  const count = favoriteProducts.length;

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
                {isPending
                  ? 'Loading favorites…'
                  : isError
                    ? ''
                    : !isLoggedIn
                      ? 'Sign in to see your favorites.'
                      : count
                        ? `${count} saved product${count === 1 ? '' : 's'}.`
                        : 'There is nothing in your favorites yet.'}
              </p>
            </div>
          </div>
          {isPending ? null : isError ? (
            <ErrorState what="your favorites" onRetry={refetch} />
          ) : !isLoggedIn ? (
            <div className="favorites-empty-state">
              <h2>Your favorites are saved to your account</h2>
              <p>
                <Link to="/login">Sign in</Link> to see and save your favorite
                products.
              </p>
            </div>
          ) : count ? (
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
