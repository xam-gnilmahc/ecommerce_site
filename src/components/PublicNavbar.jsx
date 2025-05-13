import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './PublicNabar.css';
import logo from './assets/logo.png';

const PublicNavbar = () => {

  return (
    <>
      <nav className="navbar navBar bg-light">
        {/* Logo */}
        <NavLink to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className="navbar-logo"
          />
          <span className="dev-mode-badge">
            DEV MODE
          </span>
        </NavLink>
      </nav>
      
    </>
  );
};

export default PublicNavbar;
