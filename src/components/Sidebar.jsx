import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { BsHouseDoorFill } from "react-icons/bs";
import { FaBars } from "react-icons/fa";
import logo from "./assets/logo.png";

const activeStyle = {
  backgroundColor: "#d1e7dd",
  color: "#0f5132",
  fontWeight: "600",
  borderRadius: "0.375rem",
  borderLeft: "4px solid #198754",
};

const links = [
  { to: "/profile", label: "Profile" },
  { to: "/order", label: "Orders"},
  { to: "/notification", label: "Notifications" },
  { to: "/settings", label: "Settings" },
];

const Sidebar = () => {
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
  >
    <FaBars />
  </button>
)}

      {/* Sidebar */}
      <aside
        className={`bg-light p-3 flex-column position-fixed top-0 start-0 ${
          isOpen ? "d-flex" : "d-none"
        } d-md-flex`}
        style={{
          width: 280,
          height: "100vh",
          overflowY: "auto",
          zIndex: 1040,
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4">
          <img
            src={logo}
            alt="Logo"
            style={{ width: 100, height: 60, objectFit: "contain" }}
          />
          <Link
            to="/"
            title="Go to Home"
            style={{ color: "#0f5132", fontSize: "1.5rem" }}
          >
            <BsHouseDoorFill style={{ cursor: "pointer" }} />
          </Link>
          {/* Close button on mobile */}
          <button
            className="btn-close d-md-none"
            onClick={() => setIsOpen(false)}
          ></button>
        </div>

        <nav className="nav nav-pills flex-column gap-2">
          {links.map(({ to, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
              className="nav-link text-dark d-flex justify-content-between align-items-center"
              onClick={() => setIsOpen(false)} // close on click (mobile)
            >
              <span>{label}</span>
              {badge ? (
                <span className="badge bg-danger rounded-pill">{badge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
