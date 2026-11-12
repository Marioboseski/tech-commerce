import { Link, Navigate } from 'react-router-dom';
import StoreFooter from '../components/layout/StoreFooter';
import StoreHeader from '../components/layout/StoreHeader';
import { useCurrentUser } from '../hooks/useCurrentUser';

export default function AccountDashboardPage() {
  const { user, isPending } = useCurrentUser();

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

  // /orders has its own page now (OrdersPage), so this is only /profile.
  return (
    <div className="account-page">
      <StoreHeader />
      <main className="container section account-main">
        <section className="account-card account-dashboard">
          <p className="eyebrow">MY ACCOUNT</p>
          <h1 className="section-title">Hello, {user.fullName}</h1>
          <p className="account-note">{user.email}</p>
          <p className="account-note">
            <Link to="/orders">See your orders</Link>
          </p>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
