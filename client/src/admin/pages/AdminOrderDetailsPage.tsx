import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../../components/feedback/ErrorState';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import { ApiError } from '../../lib/apiClient';
import { carrierLabels } from '../../lib/carriers';
import { formatDate, formatDateTime, money } from '../../lib/formatters';
import { statusLabels } from '../../lib/orderStatus';
import { defaultPlaceholder } from '../../lib/productImage';
import type { Shipment } from '../../schemas/shipmentSchema';
import { showToast } from '../../stores/toastStore';
import type { OrderStatus } from '../../types/order';
import ShipOrderForm from '../components/ShipOrderForm';
import { useAdminOrder, useSetOrderStatus } from '../hooks/useAdminOrders';

// Button text for each status the order can move to. Which buttons are
// shown comes from the server (order.nextStatuses), not from here.
const statusActions: Record<
  OrderStatus,
  { label: string; done: string; danger?: boolean }
> = {
  PENDING: { label: 'Mark as pending', done: 'Order is pending again' },
  PROCESSING: {
    label: 'Start processing',
    done: 'Order is being processed',
  },
  SHIPPED: { label: 'Mark as shipped', done: 'Order marked as shipped' },
  DELIVERED: { label: 'Mark as delivered', done: 'Order marked as delivered' },
  CANCELLED: {
    label: 'Cancel order',
    done: 'Order cancelled',
    danger: true,
  },
};

export default function AdminOrderDetailsPage() {
  const { orderId } = useParams();
  const id = orderId && /^[1-9]\d*$/.test(orderId) ? Number(orderId) : null;
  const { data: order, isPending, isError, error, refetch } = useAdminOrder(id);
  const setStatus = useSetOrderStatus();
  // "Mark as shipped" first asks for the carrier and tracking number.
  const [shipping, setShipping] = useState(false);

  const ship = async (shipment: Shipment) => {
    if (!order) {
      return;
    }
    await setStatus.mutateAsync({
      orderId: order.id,
      status: 'SHIPPED',
      shipment,
    });
    setShipping(false);
    showToast(statusActions.SHIPPED.done);
  };

  const changeStatus = (status: OrderStatus) => {
    if (!order) {
      return;
    }
    if (status === 'SHIPPED') {
      setShipping(true);
      return;
    }
    const action = statusActions[status];
    if (
      action.danger &&
      !window.confirm(`Cancel order #${order.id}? This cannot be undone.`)
    ) {
      return;
    }
    setStatus.mutate(
      { orderId: order.id, status },
      { onSuccess: () => showToast(action.done) },
    );
  };

  const notFound =
    id === null || (error instanceof ApiError && error.status === 404);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-title">
          {order ? `Order #${order.id}` : 'Order'}
        </h1>
        <Link className="ghost-button" to="/admin/orders">
          Back to orders
        </Link>
      </div>

      {notFound ? (
        <p className="subheading">This order does not exist.</p>
      ) : isError ? (
        <ErrorState what="this order" onRetry={refetch} />
      ) : isPending ? (
        <p className="subheading">Loading order…</p>
      ) : (
        <div className="admin-order-layout">
          <section className="admin-form-section">
            <div className="admin-order-status-row">
              <span>
                Placed on {formatDate(order.createdAt)} ·{' '}
                <OrderStatusBadge status={order.status} />
              </span>
              <div className="admin-order-actions">
                {order.nextStatuses.length === 0 ? (
                  <span className="admin-hint">
                    This order is final and cannot change any more.
                  </span>
                ) : (
                  order.nextStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={
                        statusActions[status].danger
                          ? 'ghost-button admin-danger-button'
                          : 'primary-button'
                      }
                      disabled={setStatus.isPending || shipping}
                      onClick={() => changeStatus(status)}
                    >
                      {statusActions[status].label}
                    </button>
                  ))
                )}
              </div>
            </div>

            {shipping && order.nextStatuses.includes('SHIPPED') && (
              <ShipOrderForm
                onSubmit={ship}
                onCancel={() => setShipping(false)}
              />
            )}

            <h2>Products</h2>
            {order.items.map((item, index) => (
              <div className="cart-item" key={`${item.productId}-${index}`}>
                <div className="thumb">
                  <img src={item.imageUrl ?? defaultPlaceholder} alt="" />
                </div>
                <div>
                  <strong>{item.productName}</strong>
                  <p>
                    {money(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <strong>{money(item.unitPrice * item.quantity)}</strong>
              </div>
            ))}
          </section>

          <aside className="admin-order-side">
            <section className="admin-form-section">
              <h2>Customer</h2>
              <p className="order-address">
                {order.customer.fullName}
                <br />
                {order.customer.email}
              </p>
              <h2>Delivery</h2>
              <p className="order-address">
                {order.fullName}
                <br />
                {order.street}
                <br />
                {order.postalCode} {order.city}
              </p>
              {order.carrier && (
                <>
                  <h2>Shipment</h2>
                  <p className="order-address">
                    {carrierLabels[order.carrier]}
                    <br />
                    <span className="admin-tracking-number">
                      {order.trackingNumber}
                    </span>
                  </p>
                </>
              )}
            </section>
            <section className="admin-form-section">
              <h2>History</h2>
              <ol className="admin-order-history">
                {order.statusHistory.map((step, index) => (
                  <li key={`${step.status}-${index}`}>
                    <strong>{statusLabels[step.status]}</strong>
                    <span>{formatDateTime(step.createdAt)}</span>
                    <span className="admin-hint">
                      {step.changedBy ? `by ${step.changedBy.fullName}` : '—'}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <section className="admin-form-section">
              <h2>Total</h2>
              <div className="checkout-summary-line">
                <span>Subtotal</span>
                <strong>{money(order.subtotal)}</strong>
              </div>
              <div className="checkout-summary-line">
                <span>Delivery</span>
                <strong>
                  {order.shippingCost ? money(order.shippingCost) : 'Free'}
                </strong>
              </div>
              <div className="checkout-summary-line checkout-grand-total">
                <span>Total</span>
                <strong>{money(order.total)}</strong>
              </div>
              <p className="admin-hint">Payment on delivery.</p>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
