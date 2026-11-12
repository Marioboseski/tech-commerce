import ErrorState from '../../components/feedback/ErrorState';
import { useAdminStats } from '../hooks/useAdminStats';

export default function AdminDashboardPage() {
  const { data: stats, isPending, isError, refetch } = useAdminStats();

  return (
    <>
      <h1 className="admin-title">Dashboard</h1>
      {isPending ? (
        <p className="subheading">Loading…</p>
      ) : isError ? (
        <ErrorState what="the dashboard" onRetry={refetch} />
      ) : (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Products</span>
            <strong>{stats.products}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Orders</span>
            <strong>{stats.orders}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Pending orders</span>
            <strong>{stats.pendingOrders}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Customers</span>
            <strong>{stats.customers}</strong>
          </div>
        </div>
      )}
    </>
  );
}
