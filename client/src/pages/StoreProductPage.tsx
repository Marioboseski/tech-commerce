import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { money } from '../lib/formatters';
import { getProductImage } from '../lib/productImage';
import { getProductSpecs } from '../lib/productSpecs';
import StoreHeader from '../components/layout/StoreHeader';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/catalog/ProductCard';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useProduct, useProducts } from '../hooks/useProducts';

export default function StoreProductPage() {
  const { id } = useParams();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);

  const productId = id && /^[1-9]\d*$/.test(id) ? Number(id) : null;
  const { data: product } = useProduct(productId);
  // Related products are requested only once the product (and so its
  // category) is known.
  const { data: sameCategory = [] } = useProducts(
    { categoryId: product?.categoryId },
    { enabled: Boolean(product) },
  );

  if (productId === null) {
    return <Navigate to="/" replace />;
  }

  // undefined: still loading (also after switching to another product).
  // A failed request stays here too until error handling is added.
  if (product === undefined) {
    return (
      <div className="detail-page">
        <StoreHeader />
        <main>
          <section className="container section">
            <p className="subheading">Loading product…</p>
          </section>
        </main>
      </div>
    );
  }

  // null: the API answered that this product does not exist.
  if (product === null) {
    return <Navigate to="/" replace />;
  }

  const specs = getProductSpecs(product);
  const relatedProducts = sameCategory
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <div className="detail-page">
      <StoreHeader />
      <main>
        <section className="container section">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to={`/categories/${product.category.slug}`}>
              {product.category.name}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          <div className="product-detail">
            <ProductGallery
              key={product.id}
              name={product.name}
              image={getProductImage(product)}
            />
            <div className="detail-content">
              <p className="eyebrow">{product.category.name}</p>
              <h1>{product.name}</h1>
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
                  onClick={() => toggleFavorite(product)}
                >
                  {favoriteIds.has(product.id)
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
                <dd>{product.sku}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{product.category.name}</dd>
              </div>
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
              <div>
                <dt>Availability</dt>
                <dd>In stock</dd>
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
              <h2 className="section-title">More in {product.category.name}</h2>
              <div className="product-grid">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                    isFavorite={favoriteIds.has(relatedProduct.id)}
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
