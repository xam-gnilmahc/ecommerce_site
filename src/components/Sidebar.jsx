import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { BsHouseDoorFill, BsBagCheck } from "react-icons/bs";
import { FaBars, FaSignOutAlt, FaCreditCard } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import logo from "./assets/logo.png";
import { useAuth } from "../context/authContext";

const activeStyle = {
  backgroundColor: "#d1e7dd", // light green (Bootstrap's success bg light)
  color: "#0f5132",           // dark green text
  fontWeight: "600",
  borderRadius: "0.375rem",
  borderLeft: "4px solid #198754", // green border
};


const defaultLinkStyle = {
  color: "#6c757d", // medium gray text for default links
  textDecoration: "none",
};

const links = [
  { to: "/profile", label: "Profile", icon: <BsHouseDoorFill size={20} /> },
  { to: "/order", label: "My Orders", icon: <BsBagCheck size={20} /> },
  { to: "/return-cancel", label: "Return/Cancel", icon: <MdCancel size={20} /> },
  { to: "/payments", label: "Payments", icon: <FaCreditCard size={20} /> },
  { to: "/password-change", label: "Password Change", icon: <RiLockPasswordFill size={20} /> },
  { to: "/notification", label: "Settings", icon: <FiSettings size={20} /> },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          className="d-md-none position-fixed top-0 end-0 m-3 btn btn-success"
          onClick={toggleSidebar}
          style={{ zIndex: 1051 }}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-light p-3 flex-column position-fixed top-0 start-0 ${
          isOpen ? "d-flex" : "d-none"
        } d-md-flex justify-between`}
        style={{
          width: 280,
          height: "100%",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="flex-grow-1">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <img
              src={logo}
              alt="Logo"
              style={{ width: 100, height: 60, objectFit: "contain" }}
            />
            <Link
              to="/"
              title="Go to Home"
              style={{ color: "#198754", fontSize: "1.5rem" }}
            >
              <BsHouseDoorFill style={{ cursor: "pointer" }} />
            </Link>
            <button
              className="btn-close d-md-none"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            ></button>
          </div>

          <nav className="nav nav-pills flex-column gap-2">
            {links.map(({ to, label, icon, badge }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) =>
                  isActive ? activeStyle : defaultLinkStyle
                }
                className="nav-link d-flex align-items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                {icon && (
                  <span style={{ color: "inherit", display: "flex" }}>{icon}</span>
                )}
                <span>{label}</span>
                {badge && (
                  <span className="badge bg-danger rounded-pill ms-auto">{badge}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout link */}
        <div
          onClick={logout}
          className="mt-4 p-2 text-center text-dark border border-secondary rounded d-flex align-items-center justify-content-center"
          style={{ cursor: "pointer", userSelect: "none" }}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") logout();
          }}
          aria-label="Logout"
        >
          <FaSignOutAlt className="me-2" style={{ color: "#6c757d" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#6c757d" }}>
            Logout
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
 