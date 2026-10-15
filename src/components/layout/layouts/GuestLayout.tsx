import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestLayout: React.FC = () => (
  <>
    <Outlet />
  </>
);

export default GuestLayout;
