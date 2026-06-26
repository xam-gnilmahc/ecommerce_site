// layouts/GuestLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../ui/Navbar';
import Footer from '../../ui/Footer';

const GuestLayout = () => (
  <>
    <Outlet />
  </>
);

export default GuestLayout;
