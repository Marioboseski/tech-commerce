import { Link } from 'react-router-dom';
import ErrorState from '../../components/feedback/ErrorState';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { formatDate, money } from '../../lib/formatters';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { useTableParams } from '../hooks/useTableParams';
import type { OrderStatusFilter } from '../types';

const PAGE_SIZE = 20;
const STATUS_FILTERS: { value: OrderStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const isStatusFilter = (value: string | null): value is OrderStatusFilter =>
  STATUS_FILTERS.some((filter) => filter.value === value);

export default function AdminOrdersPage() {
  const {
    searchParams,
    page,
    search,
    searchInput,
    setSearchInput,
    updateParams,
  } = useTableParams();
  const statusParam = searchParams.get('status');
  const status = isStatusFilter(statusParam) ? statusParam : 'ALL';

  const { data, isPending, isError, refetch, isPlaceholderData } =
    useAdminOrders({ page, pageSize: PAGE_SIZE, status, search });

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-title">Orders</h1>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Order number (#12), customer name or email"
          aria-label="Search orders"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <select
          aria-label="Status"
          value={status}
          onChange={(event) =>
            updateParams({
              status: event.target.value === 'ALL' ? '' : event.target.value,
              page: undefined,
            })
          }
        >
          {STATUS_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {isPending ? (
        <p className="subheading">Loading orders…</p>
      ) : isError ? (
        <ErrorState what="the orders" onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <p className="subheading">No orders match these filters.</p>
      ) : (
        <>
          <div
            className={`admin-table-wrap ${isPlaceholderData ? 'is-loading' : ''}`}
          >
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>#{order.id}</strong>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="admin-customer-cell">
                        <span>{order.user.fullName}</span>
                        <small>{order.user.email}</small>
                      </div>
                    </td>
                    <td>{order.itemCount}</td>
                    <td>{money(order.total)}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <Link to={`/admin/orders/${order.id}`}>View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>
              {data.total} order{data.total === 1 ? '' : 's'} · page {data.page}{' '}
              of {data.totalPages}
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
