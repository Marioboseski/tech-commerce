import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatDate, money } from '../lib/formatters';
import { defaultPlaceholder } from '../lib/productImage';
import { useOrder } from '../hooks/useOrders';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { state } = useLocation();
  // Only a whole number > 0 is a valid order number in the URL.
  const id = orderId && /^[1-9]\d*$/.test(orderId) ? Number(orderId) : null;
  const { order, isLoggedIn, isPending } = useOrder(id);
  // Set by the checkout page: navigate(..., { state: { justPlaced: true } }).
  const justPlaced =
    (state as { justPlaced?: boolean } | null)?.justPlaced === true;

  if (id === null) {
    return <Navigate to="/orders" replace />;
  }

  // Wait until we know who is logged in (e.g. right after a refresh).
  if (!isPending && !isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="checkout-page">
      <StoreHeader />
      <main className="container section">
        {isPending || order === undefined ? (
          // undefined = still loading. A failed request stays here too
          // until error handling is added.
          <p className="subheading">Loading your order…</p>
        ) : order === null ? (
          <div className="favorites-empty-state">
            <h2>Order not found</h2>
            <p>This order does not exist in your account.</p>
            <Link className="primary-button" to="/orders">
              My orders
            </Link>
          </div>
        ) : (
          <>
            {justPlaced && (
              <p className="account-success" role="status">
                Thank you for your order! We will deliver it to the address
                below.
              </p>
            )}
            <p className="eyebrow">ORDER #{order.id}</p>
            <h1 className="section-title">
              {justPlaced ? 'Order placed' : `Order #${order.id}`}
            </h1>
            <p className="subheading">
              Placed on {formatDate(order.createdAt)} ·{' '}
              <OrderStatusBadge status={order.status} />
            </p>

            <div className="checkout-layout">
              <section className="checkout-summary">
                <h2>Products</h2>
                {order.items.map((item, index) => (
                  // productId can be null (deleted product), so the index
                  // is part of the key.
                  <div className="cart-item" key={`${item.productId}-${index}`}>
                    <div className="thumb">
                      {/* No picture, or the product was deleted. */}
                      <img src={item.imageUrl ?? defaultPlaceholder} alt="" />
                    </div>
                    <div>
                      {/* Link only if the product still exists. */}
                      {item.productId !== null ? (
                        <Link to={`/products/${item.productId}`}>
                          <strong>{item.productName}</strong>
                        </Link>
                      ) : (
                        <strong>{item.productName}</strong>
                      )}
                      <p>
                        {money(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <strong>{money(item.unitPrice * item.quantity)}</strong>
                  </div>
                ))}
              </section>

              <aside className="checkout-summary">
                <h2>Delivery</h2>
                <p className="order-address">
                  {order.fullName}
                  <br />
                  {order.street}
                  <br />
                  {order.postalCode} {order.city}
                </p>
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
                <p className="checkout-message">Payment on delivery.</p>
                <Link className="ghost-button order-back-link" to="/orders">
                  All my orders
                </Link>
              </aside>
            </div>
          </>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
