import type { Product } from '../../data/catalog';
import { money } from '../../data/catalog';
type Props = {
  cart: Record<number, number>;
  products: Product[];
  onClose: () => void;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
};
export default function CartDrawer({
  cart,
  products,
  onClose,
  onQuantityChange,
  onRemove,
}: Props) {
  const entries = Object.entries(cart).filter(([, count]) => count > 0);
  const total = entries.reduce(
    (sum, [id, count]) =>
      sum +
      (products.find((product) => product.id === Number(id))?.price ?? 0) *
        count,
    0,
  );
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
          {entries.length ? (
            entries.map(([id, count]) => {
              const product = products.find((item) => item.id === Number(id))!;
              return (
                <div className="cart-item" key={id}>
                  <div className="thumb">{product.icon}</div>
                  <div>
                    <strong>{product.name}</strong>
                    <p>{money(product.price)}</p>
                    <div className="quantity">
                      <button onClick={() => onQuantityChange(product.id, -1)}>
                        −
                      </button>{' '}
                      {count}{' '}
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
            <strong>{money(total)}</strong>
          </div>
          <p className="subheading">Demo only — checkout is not connected.</p>
        </div>
      </aside>
    </>
  );
}
