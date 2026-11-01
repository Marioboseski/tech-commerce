import { Navigate, useLocation } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useAuth } from '../hooks/useAuth';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isOrders = pathname === '/orders';
  return (
    <div className="account-page">
      <StoreHeader />
      <main className="container section account-main">
        <section className="account-card account-dashboard">
          <p className="eyebrow">MY ACCOUNT</p>
          <h1 className="section-title">
            {isOrders ? 'My orders' : `Hello, ${user.name}`}
          </h1>
          {isOrders ? (
            <p className="account-note">
              Your completed orders will appear here after checkout is connected
              to the backend.
            </p>
          ) : (
            <>
              <p className="account-note">{user.email}</p>
              <p className="account-note">
                Your profile, saved addresses and order history will be
                available here once the backend is connected.
              </p>
            </>
          )}
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
