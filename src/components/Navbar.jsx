import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Navbar.css";
import logo from "./assets/logo.png";
import { RiShoppingBagLine } from "react-icons/ri";
import Badge from "@mui/material/Badge";

const Navbar = () => {
  const { user, logout, cart } = useAuth();

  return (
    <nav className="navbar navBar navbar-expand-lg bg-light px-3">
      {/* Logo */}
      <NavLink to="/" className="navbar-brand d-flex align-items-center gap-2">
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100px", height: "60px", objectFit: "contain" }}
        />
        <span
          className="dev-badge"
          style={{
            background: "linear-gradient(135deg, #0d6efd, #6610f2)",
            color: "#fff",
            fontSize: "12px",
            padding: "3px 10px",
            borderRadius: "20px",
            marginLeft: "12px",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            letterSpacing: "0.5px",
          }}
        >
          DEV MODE
        </span>
      </NavLink>

      {/* Toggler */}
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>


      {/* Collapsible Links */}
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/product" className="nav-link">
              Shop
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/about" className="nav-link">
              About
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/contact" className="nav-link">
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Auth / Cart Section */}
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
                Hi, <strong>{user.full_name}</strong>
              </span>
              <NavLink to="/cart" className="me-2">
                <Badge
                  badgeContent={cart.length || "0"}
                  color="primary"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                >
                  <RiShoppingBagLine size={22} color="black" />
                </Badge>
              </NavLink>
              <button onClick={logout} className="btn btn-outline-dark btn-sm">
                <i className="fa fa-sign-out-alt me-1"></i> Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
