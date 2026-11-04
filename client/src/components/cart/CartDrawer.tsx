import { money } from '../../lib/formatters';
import { getCartEntries, getCartTotals } from '../../lib/cart';
import { getProductImage } from '../../lib/productImage';
import { useCartProducts } from '../../hooks/useCartProducts';
import { Link } from 'react-router-dom';
type Props = {
  cart: Record<number, number>;
  onClose: () => void;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
};
export default function CartDrawer({
  cart,
  onClose,
  onQuantityChange,
  onRemove,
}: Props) {
  const { products, loading } = useCartProducts(cart);
  const entries = getCartEntries(cart, products);
  const { subtotal, shipping, total } = getCartTotals(cart, products);
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
          {loading ? (
            <p>Loading cart…</p>
          ) : entries.length ? (
            entries.map(({ product, quantity }) => {
              return (
                <div className="cart-item" key={product.id}>
                  <div className="thumb">
                    <img src={getProductImage(product)} alt="" />
                  </div>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{money(product.price)}</p>
                    <div className="quantity">
                      <button onClick={() => onQuantityChange(product.id, -1)}>
                        −
                      </button>{' '}
                      {quantity}{' '}
                      <button onClick={() => onQuantityChange(product.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="remove"
                    onClick={() => onRemove(product.id)}
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
          {entries.length ? (
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
