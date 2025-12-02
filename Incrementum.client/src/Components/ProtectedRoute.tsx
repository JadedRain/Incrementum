import { useAuth } from '../Context/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { apiKey } = useAuth();

  if (!apiKey) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
