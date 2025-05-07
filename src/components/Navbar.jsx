import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Navbar.css";
import logo from "./assets/logo.png";
import { RiShoppingBagLine } from "react-icons/ri";
import Badge from "@mui/material/Badge";

const Navbar = () => {
  const { user, logout, cart } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      <nav className="navBar">
        {/* Hamburger */}
        <div
          onClick={toggleModal}
          className={`menu-toggle-icon ${isModalOpen ? "rotate" : ""}`}
          style={{ cursor: "pointer", transition: "transform 0.3s ease" }}
        >
          <i className="fa-solid fa-bars-staggered fs-4 text-dark"></i>
        </div>

        {/* Logo */}
        <NavLink
          to="/"
          className="text-decoration-none d-flex align-items-center gap-2"
        >
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

        {/* Right Auth/Cart */}
        <div className="d-flex align-items-center gap-3">
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
              <span className="text-muted small">
                Hi, <strong>{user.full_name}</strong>
              </span>
              <NavLink to="/cart">
                <Badge
                  badgeContent={cart.length === 0 ? "0" : cart.length}
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

        {/* Animated Menu (with ref) */}
        {isModalOpen && (
          <div ref={modalRef} className="custom-modal animate-slide-down p-3">
            <h5 className="text-dark mb-3">Menu</h5>
            <NavLink
              to="/"
              className="nav-item-link"
              onClick={toggleModal}
              style={{ textDecoration: "none" }}
            >
              Home
            </NavLink>
            <NavLink
              to="/product"
              className="nav-item-link"
              onClick={toggleModal}
              style={{ textDecoration: "none" }}
            >
              Products
            </NavLink>
            <NavLink
              to="/about"
              className="nav-item-link"
              onClick={toggleModal}
              style={{ textDecoration: "none" }}
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className="nav-item-link"
              onClick={toggleModal}
              style={{ textDecoration: "none" }}
            >
              Contact
            </NavLink>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
