import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { ADMIN_EMAIL } from '../config/admin';
import { Navigate } from 'react-router-dom';

interface Props { children: React.ReactElement }

export default function AdminRoute({ children }: Props) {
  const { email } = useAuth();
  if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return children;
  }
  return <Navigate to="/" replace />;
}