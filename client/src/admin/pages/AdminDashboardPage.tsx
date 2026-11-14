import { Link } from 'react-router-dom';
import ErrorState from '../../components/feedback/ErrorState';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { formatDate, money } from '../../lib/formatters';
import { defaultPlaceholder } from '../../lib/productImage';
import { useAdminStats } from '../hooks/useAdminStats';

export default function AdminDashboardPage() {
  const { data: stats, isPending, isError, refetch } = useAdminStats();

  return (
    <>
      <h1 className="admin-title">Dashboard</h1>
      {isPending ? (
        <p className="subheading">Loading…</p>
      ) : isError ? (
        <ErrorState what="the dashboard" onRetry={refetch} />
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span>Total sales</span>
              <strong>{money(stats.totalSales)}</strong>
              <small>Without cancelled orders</small>
            </div>
            <div className="admin-stat-card">
              <span>Last 30 days</span>
              <strong>{money(stats.salesLast30Days)}</strong>
              <small>
                {stats.ordersLast30Days} order
                {stats.ordersLast30Days === 1 ? '' : 's'}
              </small>
            </div>
            {/* Opens the orders that still need to be shipped. */}
            <Link
              className="admin-stat-card admin-stat-card-link"
              to="/admin/orders?status=PENDING"
            >
              <span>Pending orders</span>
              <strong>{stats.pendingOrders}</strong>
              <small>of {stats.orders} orders</small>
            </Link>
            <Link
              className="admin-stat-card admin-stat-card-link"
              to="/admin/products"
            >
              <span>Products</span>
              <strong>{stats.products}</strong>
              <small>{stats.activeProducts} in the shop</small>
            </Link>
            <div className="admin-stat-card">
              <span>Customers</span>
              <strong>{stats.customers}</strong>
              <small>Registered accounts</small>
            </div>
          </div>

          <div className="admin-dashboard-grid">
            <section className="admin-form-section">
              <div className="admin-section-header">
                <h2>Recent orders</h2>
                <Link to="/admin/orders">View all</Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <p className="admin-hint">No orders yet.</p>
              ) : (
                <div className="admin-table-wrap admin-table-plain">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link to={`/admin/orders/${order.id}`}>
                              <strong>#{order.id}</strong>
                            </Link>
                          </td>
                          <td>{order.user.fullName}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>{money(order.total)}</td>
                          <td>
                            <OrderStatusBadge status={order.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-form-section">
              <div className="admin-section-header">
                <h2>Top products</h2>
              </div>
              {stats.topProducts.length === 0 ? (
                <p className="admin-hint">Nothing sold yet.</p>
              ) : (
                <ol className="admin-top-products">
                  {stats.topProducts.map((product) => (
                    <li key={product.id}>
                      <img
                        src={product.imageUrl ?? defaultPlaceholder}
                        alt=""
                      />
                      <Link to={`/admin/products/${product.id}/edit`}>
                        {product.name}
                      </Link>
                      <span>{product.quantitySold} sold</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
