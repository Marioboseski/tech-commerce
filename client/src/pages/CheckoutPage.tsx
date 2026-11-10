import { useState } from 'react';
import { Link } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { money } from '../lib/formatters';
import { useCart } from '../hooks/useCart';

export default function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false);
  const { cartItems, totals, isLoggedIn, isPending } = useCart();
  const { subtotal, shipping, total } = totals;

  return (
    <div className="checkout-page">
      <StoreHeader />
      <main className="container section">
        <p className="eyebrow">CHECKOUT</p>
        <h1 className="section-title">Complete your order</h1>
        {isPending ? (
          <p className="subheading">Loading your order…</p>
        ) : !isLoggedIn ? (
          <div className="favorites-empty-state">
            <h2>Sign in to check out</h2>
            <p>Your cart is saved to your account.</p>
            <Link className="primary-button" to="/login">
              Sign in
            </Link>
          </div>
        ) : cartItems.length ? (
          <div className="checkout-layout">
            <form
              className="checkout-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <h2>Delivery details</h2>
              <label>
                Full name
                <input required autoComplete="name" />
              </label>
              <label>
                Email address
                <input required type="email" autoComplete="email" />
              </label>
              <label>
                Street address
                <input required autoComplete="street-address" />
              </label>
              <div className="checkout-form-row">
                <label>
                  City
                  <input required autoComplete="address-level2" />
                </label>
                <label>
                  Postal code
                  <input required autoComplete="postal-code" />
                </label>
              </div>
              <button className="primary-button" type="submit">
                Place demo order
              </button>
              {submitted && (
                <p className="checkout-message">
                  Order UI is ready; payment and order submission will be
                  connected with the backend.
                </p>
              )}
            </form>
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
