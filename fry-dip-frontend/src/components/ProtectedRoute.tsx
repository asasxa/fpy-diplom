import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: Props) => {
  const { isAuthenticated, is_admin } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !is_admin) {
    return <Navigate to="/storage" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};