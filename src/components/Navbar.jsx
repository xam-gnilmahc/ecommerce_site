import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, cart } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const toggleModal = () => setIsModalOpen(prev => !prev);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      <nav className="navbar navbar-light  py-3 sticky-top" style={{ position: 'relative' }}>
        <div className="container d-flex justify-content-between align-items-center">

          {/* Hamburger */}
          <div
            onClick={toggleModal}
            className={`menu-toggle-icon ${isModalOpen ? 'rotate' : ''}`}
            style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
          >
            <i className="fa-solid fa-bars-staggered fs-4 text-dark"></i>
          </div>

          {/* Logo */}
          <NavLink to="/" className="text-decoration-none d-flex align-items-center gap-2">
            <img
              src="https://cdn.iconscout.com/icon/free/png-256/free-amazon-icon-download-in-svg-png-gif-file-formats--logo-a-load-shopping-marketplace-font-awesome-pack-user-interface-icons-44447.png"
              alt="Logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <h5 className="m-0 fw-bold text-dark">ShopZone</h5>
          </NavLink>

          {/* Right Auth/Cart */}
          <div className="d-flex align-items-center gap-2">
            {!user ? (
              <>
                <NavLink to="/login" className="btn btn-outline-dark btn-sm">
                  <i className="fa fa-sign-in-alt me-1"></i> Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-dark btn-sm">
                  <i className="fa fa-user-plus me-1"></i> Register
                </NavLink>
              </>
            ) : (
              <>
                <span className="text-muted small">Hi, <strong>{user.full_name}</strong></span>
                <NavLink to="/cart" className="btn btn-outline-dark btn-sm position-relative">
                  <i className="fa fa-shopping-cart me-1"></i> Cart
                  {cart.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cart.length}
                    </span>
                  )}
                </NavLink>
                <button onClick={logout} className="btn btn-outline-dark btn-sm">
                  <i className="fa fa-sign-out-alt me-1"></i> Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Animated Menu (with ref) */}
        {isModalOpen && (
          <div ref={modalRef} className="custom-modal animate-slide-down">
            <h5 className="text-dark mb-3">Menu</h5>
            <NavLink to="/" className="nav-item-link" onClick={toggleModal} style={{ textDecoration: 'none' }}>Home</NavLink>
            <NavLink to="/product" className="nav-item-link" onClick={toggleModal} style={{ textDecoration: 'none' }}>Products</NavLink>
            <NavLink to="/about" className="nav-item-link" onClick={toggleModal} style={{ textDecoration: 'none' }}>About</NavLink>
            <NavLink to="/contact" className="nav-item-link" onClick={toggleModal} style={{ textDecoration: 'none' }}>Contact</NavLink>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
