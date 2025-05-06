import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './Navbar.css';
import logo from './assets/logo.png';
const PublicNavbar = () => {


  return (
    <>
      <nav className="navbar">
        

          {/* Hamburger */}
         
          {/* Logo */}
          <NavLink to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img
              src={logo}
              alt="Logo"
              style={{ width: '100px', height: '60px', objectFit: 'contain' }}
            />
          </NavLink>   
      </nav>
    </>
  );
};

export default PublicNavbar;
