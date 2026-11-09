import { Route, Routes } from 'react-router-dom';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';
import StorefrontPage from './pages/StorefrontPage';
import StoreProductPage from './pages/StoreProductPage';
import CartDrawer from './components/cart/CartDrawer';
import AccountPage from './pages/AccountPage';
import AccountDashboardPage from './pages/AccountDashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import { CartProvider } from './context/CartProvider';
import { useCart } from './hooks/useCart';

function AppRoutes() {
  const { cart, cartOpen, changeQuantity, removeFromCart, setCartOpen } =
    useCart();

  return (
    <>
      <Routes>
        <Route path="/" element={<StorefrontPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<AccountPage />} />
        <Route path="/register" element={<AccountPage />} />
        <Route path="/profile" element={<AccountDashboardPage />} />
        <Route path="/orders" element={<AccountDashboardPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/products/:id" element={<StoreProductPage />} />
      </Routes>
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onQuantityChange={changeQuantity}
          onRemove={removeFromCart}
        />
      )}
    </>
  );
}

const App = () => (
  <CartProvider>
    <AppRoutes />
  </CartProvider>
);

export default App;
