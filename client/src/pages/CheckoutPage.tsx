import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { money } from '../lib/formatters';
import ErrorState from '../components/feedback/ErrorState';
import { useCart } from '../hooks/useCart';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useCreateOrder } from '../hooks/useOrders';
import type { DeliveryAddress } from '../types/order';

// Same limits as the server (ordersController.ts).
const MAX_LENGTHS = {
  fullName: 100,
  street: 255,
  city: 100,
  postalCode: 20,
};

type DeliveryFormProps = {
  defaultFullName: string;
};

// The form is its own component, so it is only created once we know the
// user: then useState can start with their name already filled in.
function DeliveryForm({ defaultFullName }: DeliveryFormProps) {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: defaultFullName,
    street: '',
    city: '',
    postalCode: '',
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      // mutateAsync waits for the answer and gives us the new order.
      const order = await createOrder.mutateAsync(address);
      // "Thank you" is shown only when we come from here (state.justPlaced).
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch {
      // Nothing to do here: the message is shown from createOrder.error.
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2>Delivery details</h2>
      <label>
        Full name
        <input
          required
          name="fullName"
          autoComplete="name"
          maxLength={MAX_LENGTHS.fullName}
          value={address.fullName}
          onChange={handleChange}
        />
      </label>
      <label>
        Street address
        <input
          required
          name="street"
          autoComplete="street-address"
          maxLength={MAX_LENGTHS.street}
          value={address.street}
          onChange={handleChange}
        />
      </label>
      <div className="checkout-form-row">
        <label>
          City
          <input
            required
            name="city"
            autoComplete="address-level2"
            maxLength={MAX_LENGTHS.city}
            value={address.city}
            onChange={handleChange}
          />
        </label>
        <label>
          Postal code
          <input
            required
            name="postalCode"
            autoComplete="postal-code"
            maxLength={MAX_LENGTHS.postalCode}
            value={address.postalCode}
            onChange={handleChange}
          />
        </label>
      </div>
      <button
        className="primary-button"
        type="submit"
        // Also stops a double click from sending two orders.
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? 'Placing order…' : 'Place order'}
      </button>
      {createOrder.error && (
        <p className="account-error" role="alert">
          {createOrder.error.message}
        </p>
      )}
      <p className="checkout-message">
        You pay on delivery. No card details are needed.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const { user } = useCurrentUser();
  const { cartItems, totals, isLoggedIn, isPending, isError, refetch } =
    useCart();
  const { subtotal, shipping, total } = totals;

  return (
    <div className="checkout-page">
      <StoreHeader />
      <main className="container section">
        <p className="eyebrow">CHECKOUT</p>
        <h1 className="section-title">Complete your order</h1>
        {isPending ? (
          <p className="subheading">Loading your order…</p>
        ) : isError ? (
          <ErrorState what="your cart" onRetry={refetch} />
        ) : !isLoggedIn || !user ? (
          <div className="favorites-empty-state">
            <h2>Sign in to check out</h2>
            <p>Your cart is saved to your account.</p>
            <Link className="primary-button" to="/login">
              Sign in
            </Link>
          </div>
        ) : cartItems.length ? (
          <div className="checkout-layout">
            <DeliveryForm defaultFullName={user.fullName} />
            <aside className="checkout-summary">
              <h2>Order summary</h2>
              {cartItems.map(({ product, quantity }) => {
                return (
                  <div className="checkout-item" key={product.id}>
                    <span>
                      {product.name} × {quantity}
                    </span>
                    <strong>{money(product.price * quantity)}</strong>
                  </div>
                );
              })}
              <div className="checkout-summary-line">
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <div className="checkout-summary-line">
                <span>Delivery</span>
                <strong>{shipping ? money(shipping) : 'Free'}</strong>
              </div>
              <div className="checkout-summary-line checkout-grand-total">
                <span>Total</span>
                <strong>{money(total)}</strong>
              </div>
            </aside>
          </div>
        ) : (
          <div className="favorites-empty-state">
            <h2>Your cart is empty</h2>
            <p>Add a product before continuing to checkout.</p>
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
