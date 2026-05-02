import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const token = localStorage.getItem('token');

  if (!token) {
    if (isAuthenticated) logout();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;