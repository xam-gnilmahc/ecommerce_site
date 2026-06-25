// layouts/GuestLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../ui/Navbar';
import Footer from '../../ui/Footer';

const GuestLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

export default GuestLayout;
