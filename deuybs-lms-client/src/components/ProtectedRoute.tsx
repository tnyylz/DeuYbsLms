// Path: src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  children: React.ReactNode;
  role?: 'Student' | 'Teacher';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}