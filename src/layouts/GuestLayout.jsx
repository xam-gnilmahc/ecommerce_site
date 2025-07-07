// layouts/GuestLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "../components";

const GuestLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

export default GuestLayout;
