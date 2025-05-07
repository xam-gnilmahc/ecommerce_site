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
            <span
  style={{
    background: "linear-gradient(135deg, #0d6efd, #6610f2)",
    color: "#fff",
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "20px",
    marginLeft: "12px",
    fontWeight: "600",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    letterSpacing: "0.5px"
  }}
>
  DEV MODE
</span>

          </NavLink>   
      </nav>
    </>
  );
};

export default PublicNavbar;
