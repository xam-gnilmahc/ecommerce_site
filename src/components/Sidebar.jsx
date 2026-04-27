import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  BsHouseDoorFill,
  BsBagCheck,
} from "react-icons/bs";

import {
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";

import { MdCancel } from "react-icons/md";

import logo from "./assets/logo.png";

import { useAuth } from "../context/authContext";

import "./Sidebar.css";

const links = [
  {
    to: "/order",
    label: "My Orders",
    icon: <BsBagCheck />,
  },

  {
    to: "/return-cancel",
    label: "Cancelled Orders",
    icon: <MdCancel />,
  },
];

const Sidebar = () => {
  const { logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* mobile toggle */}

      {!isOpen && (
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setIsOpen(true)}
        >
          <FaBars />
        </button>
      )}

      {/* overlay */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* sidebar */}

      <aside
        className={`modern-sidebar ${
          isOpen ? "open" : ""
        }`}
      >
        {/* top */}

        <div className="sidebar-top">
          <div className="sidebar-logo-wrap">
            <img
              src={logo}
              alt="Logo"
              className="sidebar-logo"
            />

            <Link to="/" className="home-btn">
              <BsHouseDoorFill />
            </Link>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* nav */}

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="sidebar-icon">
                {icon}
              </span>

              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* bottom */}

        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            onClick={logout}
          >
            <FaSignOutAlt />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;