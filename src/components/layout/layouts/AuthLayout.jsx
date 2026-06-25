// layouts/AuthLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../../ui/ProtectedRoute';

const AuthLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

export default AuthLayout;
