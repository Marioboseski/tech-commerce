import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorState from '../../components/feedback/ErrorState';
import { useCategories } from '../../hooks/useCategories';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { formatDate, money } from '../../lib/formatters';
import { getProductImage } from '../../lib/productImage';
import { showToast } from '../../stores/toastStore';
import {
  useAdminProducts,
  useSetProductStatus,
} from '../hooks/useAdminProducts';
import type { ProductStatusFilter } from '../types';

const PAGE_SIZE = 20;
const SEARCH_DELAY_MS = 300;
const STATUSES: ProductStatusFilter[] = ['all', 'active', 'archived'];

const isStatus = (value: string | null): value is ProductStatusFilter =>
  STATUSES.includes(value as ProductStatusFilter);

export default function AdminProductsPage() {
  // Filters live in the URL (?page=2&status=archived...), so refresh and
  // the Back button keep the same view.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') ?? '';
  const categoryParam = Number(searchParams.get('categoryId'));
  const categoryId = categoryParam > 0 ? categoryParam : undefined;
  const statusParam = searchParams.get('status');
  const status = isStatus(statusParam) ? statusParam : 'all';

  const { categories } = useCategories();
  const setStatus = useSetProductStatus();

  // The input updates at once; the URL (and the request) only after a pause.
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DELAY_MS);

  const updateParams = (updates: Record<string, string | undefined>) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(updates)) {
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
        }
        return next;
      },
      { replace: true },
    );
  };

  useEffect(() => {
    if (debouncedSearch.trim() !== search) {
      // A new search starts again at page 1.
      updateParams({ search: debouncedSearch.trim(), page: undefined });
    }
    // updateParams changes every render; only the debounced text matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, search]);

  const { data, isPending, isError, refetch, isPlaceholderData } =
    useAdminProducts({ page, pageSize: PAGE_SIZE, search, categoryId, status });

  const toggleActive = (id: number, isActive: boolean, name: string) => {
    setStatus.mutate(
      { id, isActive },
      {
        onSuccess: () =>
          showToast(isActive ? `${name} restored` : `${name} archived`),
      },
    );
  };

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-title">Products</h1>
        <Link className="primary-button" to="/admin/products/new">
          New product
        </Link>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name or SKU"
          aria-label="Search products"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <select
          aria-label="Category"
          value={categoryId ?? ''}
          onChange={(event) =>
            updateParams({ categoryId: event.target.value, page: undefined })
          }
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Status"
          value={status}
          onChange={(event) =>
            updateParams({
              status: event.target.value === 'all' ? '' : event.target.value,
              page: undefined,
            })
          }
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isPending ? (
        <p className="subheading">Loading products…</p>
      ) : isError ? (
        <ErrorState what="the products" onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <p className="subheading">No products match these filters.</p>
      ) : (
        <>
          <div
            className={`admin-table-wrap ${isPlaceholderData ? 'is-loading' : ''}`}
          >
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={getProductImage(product)} alt="" />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.category.name}</td>
                    <td>{money(product.price)}</td>
                    <td>
                      <span
                        className={`order-status ${product.isActive ? 'order-status-delivered' : 'order-status-cancelled'}`}
                      >
                        {product.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td>{formatDate(product.updatedAt)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <Link to={`/admin/products/${product.id}/edit`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={setStatus.isPending}
                          onClick={() =>
                            toggleActive(
                              product.id,
                              !product.isActive,
                              product.name,
                            )
                          }
                        >
                          {product.isActive ? 'Archive' : 'Restore'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>
              {data.total} product{data.total === 1 ? '' : 's'} · page{' '}
              {data.page} of {data.totalPages}
            </span>
            <button
              type="button"
              className="ghost-button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              Previous
            </button>
            <button
              type="button"
              className="ghost-button"
              disabled={page >= data.totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}
