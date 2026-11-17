import { Link, Navigate } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatDate, money } from '../lib/formatters';
import ErrorState from '../components/feedback/ErrorState';
import { useOrders } from '../hooks/useOrders';

export default function OrdersPage() {
  const { orders, isLoggedIn, isPending, isError, refetch } = useOrders();

  // Wait until we know who is logged in (e.g. right after a refresh).
  if (!isPending && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="checkout-page">
      <StoreHeader />
      <main className="container section">
        <p className="eyebrow">MY ACCOUNT</p>
        <h1 className="section-title">My orders</h1>
        {isPending ? (
          <p className="subheading">Loading your orders…</p>
        ) : isError ? (
          <ErrorState what="your orders" onRetry={refetch} />
        ) : orders.length ? (
          <div className="orders-list">
            {orders.map((order) => {
              const pieces = order.items.reduce(
                (total, item) => total + item.quantity,
                0,
              );
              return (
                <Link
                  className="order-row"
                  key={order.id}
                  to={`/orders/${order.id}`}
                >
                  <strong>Order #{order.id}</strong>
                  <span>{formatDate(order.createdAt)}</span>
                  <span>
                    {pieces} item{pieces === 1 ? '' : 's'}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <strong className="order-row-total">
                    {money(order.total)}
                  </strong>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="favorites-empty-state">
            <h2>No orders yet</h2>
            <p>When you place an order, it will appear here.</p>
            <Link className="primary-button" to="/">
              Browse products
            </Link>
          </div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
