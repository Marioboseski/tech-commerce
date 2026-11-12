import { money } from '../../lib/formatters';
import { getProductImage } from '../../lib/productImage';
import { useCart } from '../../hooks/useCart';
import ErrorState from '../feedback/ErrorState';
import { MAX_CART_QUANTITY } from '../../services/cartApi';
import { Link } from 'react-router-dom';
type Props = {
  onClose: () => void;
};
export default function CartDrawer({ onClose }: Props) {
  const {
    cartItems,
    totals,
    isLoggedIn,
    isPending,
    isError,
    refetch,
    changeQuantity,
    removeFromCart,
  } = useCart();
  const { subtotal, shipping, total } = totals;
  return (
    <>
      <button className="backdrop" aria-label="Close cart" onClick={onClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true">
        <div className="drawer-header">
          <div>
            <p className="eyebrow">YOUR SELECTION</p>
            <h2>Shopping cart</h2>
          </div>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="cart-items">
          {isPending ? (
            <p>Loading cart…</p>
          ) : isError ? (
            <ErrorState what="your cart" onRetry={refetch} />
          ) : !isLoggedIn ? (
            <p>
              <Link to="/login" onClick={onClose}>
                Sign in
              </Link>{' '}
              to see your cart.
            </p>
          ) : cartItems.length ? (
            cartItems.map(({ product, quantity }) => {
              return (
                <div className="cart-item" key={product.id}>
                  <div className="thumb">
                    <img src={getProductImage(product)} alt="" />
                  </div>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{money(product.price)}</p>
                    <div className="quantity">
                      {/* At 1, use × to remove the product. */}
                      <button
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                        onClick={() => changeQuantity(product.id, quantity - 1)}
                      >
                        −
                      </button>{' '}
                      {quantity}{' '}
                      <button
                        aria-label="Increase quantity"
                        disabled={quantity >= MAX_CART_QUANTITY}
                        onClick={() => changeQuantity(product.id, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove"
                    aria-label="Remove from cart"
                    onClick={() => removeFromCart(product.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })
          ) : (
            <p>
              Your cart is empty.
              <br />
              Add a few products to get started.
            </p>
          )}
        </div>
        <div className="cart-bottom">
          <div className="subtotal">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="cart-summary-line">
            <span>Delivery</span>
            <strong>{shipping ? money(shipping) : 'Free'}</strong>
          </div>
          <div className="cart-summary-line cart-total-line">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          {cartItems.length ? (
            <Link className="checkout-button" to="/checkout" onClick={onClose}>
              Continue to checkout
            </Link>
          ) : (
            <p className="subheading">Your cart is ready when you are.</p>
          )}
        </div>
      </aside>
    </>
  );
}
