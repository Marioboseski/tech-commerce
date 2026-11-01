import { Link, Navigate, useParams } from 'react-router-dom';
import { money, products } from '../data/catalog';
import StoreHeader from '../components/layout/StoreHeader';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export default function StoreProductPage() {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="detail-page">
      <StoreHeader />
      <main>
        <section className="container section">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/categories/${product.category.toLowerCase()}`}>
              {product.category}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          <div className="product-detail">
            <div className="detail-visual">
              <span className="badge">{product.badge}</span>
              <span>{product.icon}</span>
            </div>
            <div className="detail-content">
              <p className="eyebrow">{product.category}</p>
              <h1>{product.name}</h1>
              <div className="detail-rating">
                ★★★★★ <span>{product.rating}/5 · Demo review score</span>
              </div>
              <p className="detail-description">{product.description}</p>
              <strong className="detail-price">{money(product.price)}</strong>
              <div className="detail-actions">
                <button
                  className="primary-button"
                  onClick={() => addToCart(product.id)}
                >
                  Add to cart
                </button>
                <button
                  className="ghost-button"
                  onClick={() => toggleFavorite(product.id)}
                >
                  {favorites.has(product.id)
                    ? 'Remove from favorites'
                    : 'Save to favorites'}
                </button>
              </div>
              <div className="detail-note">
                Free delivery on demo orders over €75. Checkout will be
                connected when we introduce the API.
              </div>
            </div>
          </div>
          <section className="specifications">
            <div>
              <p className="eyebrow">PRODUCT DETAILS</p>
              <h2 className="section-title">Specifications</h2>
            </div>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{product.category}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>In stock</dd>
              </div>
              <div>
                <dt>Rating</dt>
                <dd>{product.rating} / 5</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>1–3 business days</dd>
              </div>
            </dl>
          </section>
        </section>
      </main>
    </div>
  );
}
