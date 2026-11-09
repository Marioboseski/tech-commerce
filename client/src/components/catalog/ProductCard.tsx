import { Link } from 'react-router-dom';
import type { ApiProduct } from '../../types/product';
import { money } from '../../lib/formatters';
import { getProductImage } from '../../lib/productImage';
type Props = {
  product: ApiProduct;
  onFavorite?: (product: ApiProduct) => void;
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
        <img src={getProductImage(product)} alt={product.name} />
        {onFavorite && (
          <button
            className={`heart ${isFavorite ? 'active' : ''}`}
            onClick={() => onFavorite(product)}
            aria-label="Toggle favorite"
          >
            ♥
          </button>
        )}
      </div>
      <div className="product-info">
        <div className="product-category">{product.category.name}</div>
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="product-description">{product.description}</p>

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
