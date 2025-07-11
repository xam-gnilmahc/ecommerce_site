// layouts/AuthLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "../components/index.js";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

const AuthLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

export default AuthLayout;
