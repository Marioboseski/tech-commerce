import { Link } from 'react-router-dom';
import { categories } from '../../data/catalog';
export default function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link className="logo" to="/">
            <span className="logo-mark">⬡</span>
            <span>
              Tech<span className="logo-accent">Store</span>
            </span>
          </Link>
          <p className="footer-copy">
            Thoughtfully selected tech for modern everyday use.
          </p>
        </div>
        <div>
          <h4>Categories</h4>
          <ul>
            {categories.slice(0, 3).map((category) => (
              <li key={category.name}>
                <Link to={`/categories/${category.name.toLowerCase()}`}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>More</h4>
          <ul>
            <li>
              <Link to="/categories/desktops">Desktops</Link>
            </li>
            <li>
              <Link to="/categories/accessories">Accessories</Link>
            </li>
            <li>
              <a href="#home">Back to top</a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Template notes</h4>
          <ul>
            <li>Responsive grid layout</li>
            <li>Mock product data</li>
            <li>Search, filters and cart</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} TechStore. Demo storefront.</span>
        <span>Built in React.</span>
      </div>
    </footer>
  );
}
