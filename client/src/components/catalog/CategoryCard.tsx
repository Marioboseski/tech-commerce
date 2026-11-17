import { Link } from 'react-router-dom';
import { getCategoryMeta } from '../../lib/categoryMeta';
import type { ApiCategory } from '../../types/category';
type Props = {
  category: ApiCategory;
};
export default function CategoryCard({ category }: Props) {
  const { image } = getCategoryMeta(category.slug);

  return (
    <Link className="category-card" to={`/categories/${category.slug}`}>
      <div className="category-art">
        {/* alt="" : the category name is already written on the card. */}
        {image && <img src={image} alt="" loading="lazy" />}
        <span>{category.name}</span>
      </div>
      <strong>{category.name}</strong>
      <span>Browse category →</span>
    </Link>
  );
}
