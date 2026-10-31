import { Link } from 'react-router-dom';
import type { Category } from '../../data/catalog';
type Props={category:{name:Exclude<Category,'All'>;tagline:string;icon:string}};
export default function CategoryCard({category}:Props){return <Link className="category-card" to={`/categories/${category.name.toLowerCase()}`}><div className="category-art">{category.icon}</div><strong>{category.name}</strong><small>{category.tagline}</small><span>Browse category →</span></Link>}
