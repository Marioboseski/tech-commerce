import { useState } from 'react';
import { Link } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { money, products } from '../data/catalog';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false);
  const { cart } = useCart();
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const subtotal = entries.reduce(
    (total, [id, quantity]) =>
      total + (products.find((product) => product.id === Number(id))?.price ?? 0) * quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 9.9;

  return (
    <div className="checkout-page">
      <StoreHeader />
      <main className="container section">
        <p className="eyebrow">CHECKOUT</p>
        <h1 className="section-title">Complete your order</h1>
        {entries.length ? (
          <div className="checkout-layout">
            <form
              className="checkout-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <h2>Delivery details</h2>
              <label>Full name<input required autoComplete="name" /></label>
              <label>Email address<input required type="email" autoComplete="email" /></label>
              <label>Street address<input required autoComplete="street-address" /></label>
              <div className="checkout-form-row">
                <label>City<input required autoComplete="address-level2" /></label>
                <label>Postal code<input required autoComplete="postal-code" /></label>
              </div>
              <button className="primary-button" type="submit">Place demo order</button>
              {submitted && <p className="checkout-message">Order UI is ready; payment and order submission will be connected with the backend.</p>}
            </form>
            <aside className="checkout-summary">
              <h2>Order summary</h2>
              {entries.map(([id, quantity]) => {
                const product = products.find((item) => item.id === Number(id))!;
                return <div className="checkout-item" key={id}><span>{product.name} × {quantity}</span><strong>{money(product.price * quantity)}</strong></div>;
              })}
              <div className="checkout-summary-line"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div className="checkout-summary-line"><span>Delivery</span><strong>{shipping ? money(shipping) : 'Free'}</strong></div>
              <div className="checkout-summary-line checkout-grand-total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></div>
            </aside>
          </div>
        ) : (
          <div className="favorites-empty-state"><h2>Your cart is empty</h2><p>Add a product before continuing to checkout.</p><Link className="primary-button" to="/">Browse products</Link></div>
        )}
      </main>
      <StoreFooter />
    </div>
  );
}
