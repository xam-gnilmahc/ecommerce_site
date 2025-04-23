import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/authContext'; // adjust path if needed

const Navbar = () => {
  const state = useSelector(state => state.handleCart);
  const { user, logout, cart } = useAuth(); // get user and logout from context

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light py-3 sticky-top">
      <div className="container">
        <button
          className="navbar-toggler mx-2"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto my-2 text-center">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home </NavLink>
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

          <div className="buttons text-center">
            {/* Only show these if not logged in */}
            {!user ? (
              <>
                <NavLink to="/login" className="btn btn-outline-dark m-2">
                  <i className="fa fa-sign-in-alt mr-1"></i> Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-dark m-2">
                  <i className="fa fa-user-plus mr-1"></i> Register
                </NavLink>
              </>
            ) : (
              <>
                {/* Show logout and username when logged in */}
                <span className="mx-2">Hello, {user.full_name}</span>
                <button
                  onClick={logout}
                  className="btn btn-outline-dark m-2"
                >
                  <i className="fa fa-sign-out-alt mr-1"></i> Logout
                </button>
                <NavLink to="/cart" className="btn btn-outline-dark m-2">
                  <i className="fa fa-cart-shopping mr-1"></i> Cart ({cart.length})
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
