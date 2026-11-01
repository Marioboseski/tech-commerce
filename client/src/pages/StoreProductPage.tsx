import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { products } from '../data/catalog';
import { money } from '../lib/formatters';
import StoreHeader from '../components/layout/StoreHeader';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/catalog/ProductCard';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

export default function StoreProductPage() {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return <Navigate to="/" replace />;
  }
  const relatedProducts = products
    .filter(
      (item) => item.category === product.category && item.id !== product.id,
    )
    .slice(0, 3);

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
            <ProductGallery key={product.id} product={product} />
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
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    addToCart(product.id);
                    setAddedToCart(true);
                    window.setTimeout(() => setAddedToCart(false), 2200);
                  }}
                >
                  {user ? 'Add to cart' : 'Sign in to add to cart'}
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
                <dt>SKU</dt>
                <dd>
                  TS-{product.category.slice(0, 3).toUpperCase()}-
                  {String(product.id).padStart(3, '0')}
                </dd>
              </div>
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
          {relatedProducts.length > 0 && (
            <section className="related-products">
              <p className="eyebrow">YOU MAY ALSO LIKE</p>
              <h2 className="section-title">More in {product.category}</h2>
              <div className="product-grid">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    isFavorite={favorites.has(relatedProduct.id)}
                    onFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
      {addedToCart && (
        <div className="toast show" role="status">
          Added to cart
        </div>
      )}
    </div>
  );
}
