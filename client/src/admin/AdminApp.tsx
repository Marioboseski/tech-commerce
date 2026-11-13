import { Navigate, Route, Routes } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import './admin.css';

// Everything under /admin. Loaded with React.lazy (see App.tsx), so
// shoppers never download this code.
// Hiding the page is only for convenience: the real protection is
// requireAdmin on the server (every /api/admin request is checked there).
export default function AdminApp() {
  const { user, isPending } = useCurrentUser();

  // Right after a refresh we do not know the user yet; deciding now would
  // send an admin to /login for a moment.
  if (isPending) {
    return <p className="admin-loading">Loading…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminLayout user={user}>
      {/* Paths here are relative to /admin. */}
      <Routes>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
