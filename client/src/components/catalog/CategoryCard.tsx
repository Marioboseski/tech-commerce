import { Link } from 'react-router-dom';
import type { CatalogCategory } from '../../data/catalog';
type Props = {
  category: CatalogCategory;
};
export default function CategoryCard({ category }: Props) {
  return (
    <Link
      className="category-card"
      to={`/categories/${category.name.toLowerCase()}`}
    >
      <div className="category-art">
        <img src={category.image} alt="" />
        <span>{category.name}</span>
      </div>
      <strong>{category.name}</strong>
      <small>{category.tagline}</small>
      <span>Browse category →</span>
    </Link>
  );
}
