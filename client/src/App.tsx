import { Route, Routes, useLocation } from 'react-router-dom';
import CategoryPage from './pages/CategoryPage';
import FavoritesPage from './pages/FavoritesPage';
import StorefrontPage from './pages/StorefrontPage';
import StoreProductPage from './pages/StoreProductPage';
import CartDrawer from './components/cart/CartDrawer';
import AccountPage from './pages/AccountPage';
import AccountDashboardPage from './pages/AccountDashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import Toaster from './components/feedback/Toaster';
import { useCartDrawerStore } from './stores/cartDrawerStore';

export default function App() {
  // Take only what this component needs from the store (a "selector"),
  // so App re-renders only when these values change.
  const cartOpen = useCartDrawerStore((state) => state.cartOpen);
  const closeCart = useCartDrawerStore((state) => state.closeCart);
  const { pathname } = useLocation();

  return (
    // A crash while drawing a page shows a "Something went wrong" screen
    // instead of a white page. The toast is outside, so it always works.
    <>
      {/* key: a new page gives a fresh boundary, so after a crash the user
          can still go to another page. */}
      <ErrorBoundary key={pathname}>
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<AccountPage />} />
          <Route path="/register" element={<AccountPage />} />
          <Route path="/profile" element={<AccountDashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/products/:id" element={<StoreProductPage />} />
        </Routes>
        {cartOpen && <CartDrawer onClose={closeCart} />}
      </ErrorBoundary>
      <Toaster />
    </>
  );
}
