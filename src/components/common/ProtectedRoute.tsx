import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
