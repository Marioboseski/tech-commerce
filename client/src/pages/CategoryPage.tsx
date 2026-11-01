import { Navigate, useParams } from 'react-router-dom';
import { categories, products } from '../data/catalog';
import StoreHeader from '../components/layout/StoreHeader';
import ProductCard from '../components/catalog/ProductCard';
import { useFavorites } from '../context/FavoritesContext';

export default function CategoryPage() {
  const { slug } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const category = categories.find(
    (item) => item.name.toLowerCase() === slug?.toLowerCase(),
  );

  if (!category) {
    return <Navigate to="/" replace />;
  }

  const categoryProducts = products.filter(
    (product) => product.category === category.name,
  );

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
          <div className="product-grid">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
