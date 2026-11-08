import { Navigate, useLocation } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function AccountDashboardPage() {
  const { user, isPending } = useCurrentUser();
  const { pathname } = useLocation();

  // Right after a refresh we do not know yet who is logged in. Without this
  // wait, a logged-in user would be sent to /login for a moment.
  if (isPending) {
    return (
      <div className="account-page">
        <StoreHeader />
        <main className="container section account-main">
          <p className="subheading">Loading your account…</p>
        </main>
        <StoreFooter />
      </div>
    );
  }

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
            {isOrders ? 'My orders' : `Hello, ${user.fullName}`}
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
