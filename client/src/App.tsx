import { Route, Routes } from 'react-router-dom';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';
import StorefrontPage from './pages/StorefrontPage';
import StoreProductPage from './pages/StoreProductPage';
import CartDrawer from './components/cart/CartDrawer';
import AccountPage from './pages/AccountPage';
import AccountDashboardPage from './pages/AccountDashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import { CartDrawerProvider } from './context/CartDrawerProvider';
import { useCartDrawer } from './hooks/useCartDrawer';

function AppRoutes() {
  const { cartOpen, setCartOpen } = useCartDrawer();

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
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </>
  );
}

const App = () => (
  <CartDrawerProvider>
    <AppRoutes />
  </CartDrawerProvider>
);

export default App;
