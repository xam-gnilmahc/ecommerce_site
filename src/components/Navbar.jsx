import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/authContext';

const Navbar = () => {
  const state = useSelector(state => state.handleCart);
  const { user, logout, cart } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="https://cdn.iconscout.com/icon/free/png-256/free-amazon-icon-download-in-svg-png-gif-file-formats--logo-a-load-shopping-marketplace-font-awesome-pack-user-interface-icons-44447.png"
            alt="Logo"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              marginRight: '10px',
            }}
          />
          <span className="fw-bold text-dark">ShopZone</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mx-auto text-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/product">Products</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about">About</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact">Contact</NavLink>
            </li>
          </ul>

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
                <span className="text-muted small me-2">
                  Hello, <strong>{user.full_name}</strong>
                </span>
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
      </div>
    </nav>
  );
};

export default Navbar;
