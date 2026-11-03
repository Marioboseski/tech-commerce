import { Link } from 'react-router-dom';
import type { ApiCategory } from '../../types/category';
type Props = {
  category: ApiCategory;
};
export default function CategoryCard({ category }: Props) {
  return (
    <Link
      className="category-card"
      to={`/categories/${category.name.toLowerCase()}`}
    >
      <div className="category-art">
        <span>{category.name}</span>
      </div>
      <strong>{category.name}</strong>
      <span>Browse category →</span>
    </Link>
  );
}
