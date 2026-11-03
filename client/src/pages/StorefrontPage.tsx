import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import CategoryCard from '../components/catalog/CategoryCard';
import ProductCard from '../components/catalog/ProductCard';
import SearchBar from '../components/catalog/SearchBar';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useFavorites } from '../hooks/useFavorites';
import { getProducts } from '../services/productApi';
import type { ApiProduct } from '../types/product';
import { getCategories } from '../services/categoryApi';
import type { ApiCategory } from '../types/category';

export default function StorefrontPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { favorites, toggleFavorite } = useFavorites();
  const requestedCategory = searchParams.get('category');
  const category = requestedCategory &&
    categories.some((item) => item.slug === requestedCategory)
    ? (requestedCategory) : 'All';
  const selectedCategory = categories.find((item) => item.slug === category);
  const selectedCategoryId = selectedCategory?.id;
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const query = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';

  useEffect(() => {
    if (!categoriesLoaded) return;

    let ignore = false;

    const loadProducts = async () => {
      try {
        const data = await getProducts(selectedCategoryId);

        if (!ignore) {
          setProducts(data);
        }
      } catch (error) {
        console.log("Failed to load products", error);
      }
    }
    loadProducts();

    return () => {
      ignore = true;
    }
  }, [categoriesLoaded, selectedCategoryId]);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
      setCategoriesLoaded(true);
    }
    loadCategories();
  }, []);

  const updateFilters = (updates: Record<string, string>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        Object.entries(updates).forEach(([key, value]) => {
          if (value && value !== 'All' && value !== 'featured') {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        });
        return next;
      },
      { replace: true },
    );
  };

  const shown = useMemo(
    () =>
      products
        .filter(
          (product) =>
            `${product.name} ${product.category.name} ${product.description}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'price-asc'
            ? a.price - b.price
            : sort === 'price-desc'
              ? b.price - a.price
              : sort === 'name'
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [products, query, sort],
  );

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="storefront" id="home">
      <StoreHeader
        middle={
          <SearchBar
            query={query}
            onQueryChange={(value) => updateFilters({ search: value })}
            onSubmit={submitSearch}
          />
        }
      />
      <main>
        <section className="container section">
          <div className="hero-card">
            <div className="hero-copy">
              <p className="eyebrow">MODERN TECH STORE</p>
              <h1>Find the right tech for work, play and everyday life.</h1>
              <p className="hero-text">
                Shop laptops, smartphones, tablets, desktops and accessories.
                Compare products, save your favorites and build your cart with
                confidence.
              </p>
              <div className="hero-actions">
                <a className="primary-button" href="#products">
                  Shop products
                </a>
                <button
                  className="ghost-button"
                  onClick={() =>
                    document
                      .getElementById('categories')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Shop by category
                </button>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="hero-product-photo hero-product-main">
                <img src="/products/novabook-air.jpg" alt="" />
              </div>
            </div>
          </div>
        </section>
        <section className="container section" id="categories">
          <div className="section-top">
            <div>
              <p className="eyebrow">BROWSE THE COLLECTION</p>
              <h2 className="section-title">Shop by category</h2>
              <p className="subheading">
                Visual category cards with subtle gradients and device artwork.
              </p>
            </div>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        </section>
        <section className="container section">
          <div className="section-top">
            <div>
              <p className="eyebrow">SHOP BY YOUR SETUP</p>
              <h2 className="section-title">Tech for every day</h2>
            </div>
          </div>
          <div className="panel-grid">
            <article className="info-panel">
              <span className="panel-kicker">Workspace</span>
              <h3>Build a workspace that works for you.</h3>
              <p>
                Browse laptops, desktops and accessories for focused work and
                everyday productivity.
              </p>
              <img
                className="panel-image"
                src="/products/studiodesk.jpg"
                alt=""
              />
            </article>
            <article className="info-panel">
              <span className="panel-kicker">Mobile</span>
              <h3>Take your tech wherever you go.</h3>
              <img
                className="panel-image"
                src="/products/apex-pro.jpg"
                alt=""
              />
            </article>
            <article className="info-panel">
              <span className="panel-kicker">Accessories</span>
              <h3>Complete the setup with the right extras.</h3>
              <img
                className="panel-image"
                src="/products/wavepods.jpg"
                alt=""
              />
            </article>
          </div>
        </section>
        <section className="container section" id="products">
          <div className="section-top">
            <div>
              <p className="eyebrow">CURATED FOR YOU</p>
              <h2 className="section-title">Explore products</h2>
              <p className="subheading">
                Showing {shown.length} product{shown.length === 1 ? '' : 's'}
                {category !== 'All' ? ` in ${category}` : ''}.
              </p>
            </div>
            <div className="filters">
              <select
                value={category}
                onChange={(event) => {
                  updateFilters({ category: event.target.value });
                }}
              >
                <option value="All">All categories</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.slug}>{item.name}</option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) =>
                  updateFilters({ sort: event.target.value })
                }
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
          {shown.length ? (
            <div className="product-grid">
              {shown.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onFavorite={toggleFavorite}
                  isFavorite={favorites.has(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try another search or choose a different category.</p>
              <button
                className="primary-button"
                onClick={() => {
                  updateFilters({ search: '', category: '' });
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
