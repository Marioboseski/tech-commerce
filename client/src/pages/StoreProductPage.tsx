import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { money } from '../lib/formatters';
import { getProductImage } from '../lib/productImage';
import { getProductSpecs } from '../lib/productSpecs';
import { getProductById, getProducts } from '../services/productApi';
import type { ApiProduct, ApiProductDetails } from '../types/product';
import StoreHeader from '../components/layout/StoreHeader';
import ProductGallery from '../components/product/ProductGallery';
import ProductCard from '../components/catalog/ProductCard';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';

type LoadedProduct = {
  id: number;
  product: ApiProductDetails | null;
};

export default function StoreProductPage() {
  const { id } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const [loaded, setLoaded] = useState<LoadedProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);

  const productId = id && /^[1-9]\d*$/.test(id) ? Number(id) : null;

  useEffect(() => {
    if (productId === null) {
      return;
    }

    let ignore = false;

    const loadProduct = async () => {
      const data = await getProductById(productId);
      if (ignore) {
        return;
      }
      setLoaded({ id: productId, product: data });
      setRelatedProducts([]);
      if (!data) {
        return;
      }

      const sameCategory = await getProducts(data.categoryId);
      if (!ignore) {
        setRelatedProducts(
          sameCategory.filter((item) => item.id !== data.id).slice(0, 3),
        );
      }
    };
    loadProduct();

    return () => {
      ignore = true;
    };
  }, [productId]);

  if (productId === null) {
    return <Navigate to="/" replace />;
  }

  // Covers the first load and switching to another product (e.g. a related one).
  if (!loaded || loaded.id !== productId) {
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

  const { product } = loaded;

  if (!product) {
    return <Navigate to="/" replace />;
  }

  const specs = getProductSpecs(product);

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
