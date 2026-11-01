import { Link } from 'react-router-dom';
import type { Product } from '../../data/catalog';
import { money } from '../../lib/formatters';
type Props = {
  product: Product;
  onFavorite?: (id: number) => void;
  isFavorite?: boolean;
};
export default function ProductCard({
  product,
  onFavorite,
  isFavorite = false,
}: Props) {
  return (
    <article className="product-card">
      <div className="product-image">
        <span className="badge">{product.badge}</span>
        <img src={product.image} alt={product.name} />
        {onFavorite && (
          <button
            className={`heart ${isFavorite ? 'active' : ''}`}
            onClick={() => onFavorite(product.id)}
            aria-label="Toggle favorite"
          >
            ♥
          </button>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          ★★★★★ <span>{product.rating}/5</span>
        </div>
        <div className="product-bottom">
          <strong className="price">{money(product.price)}</strong>
          <Link className="add-button" to={`/products/${product.id}`}>
            View product
          </Link>
        </div>
      </div>
    </article>
  );
}
