import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Not logged in: go to login, and remember the page they wanted
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Logged in, but this page is for the admin only
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Everything is fine: show the page
  return children;
}

export default ProtectedRoute;