// components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) return null; // Or show loading spinner if desired

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
