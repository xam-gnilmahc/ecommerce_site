import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../../common/ProtectedRoute';

const AuthLayout: React.FC = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

export default AuthLayout;
