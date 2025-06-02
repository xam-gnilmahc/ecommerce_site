import React from "react";
import { NavLink, Link } from "react-router-dom";
import { BsHouseDoorFill } from "react-icons/bs";
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
  { to: "/order", label: "Orders" },
  { to: "/notification", label: "Notifications" },
  { to: "/settings", label: "Settings" },
];

const Sidebar = () => (
  <aside
    className="d-none d-md-flex flex-column p-3 bg-light"
    style={{
      width: 280,
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      overflowY: "auto",
      zIndex: 1000,
    }}
  >
    <div className="d-flex align-items-center justify-content-between mb-4">
      <img src={logo} alt="Logo" style={{ width: 100, height: 60, objectFit: "contain" }} />
      <Link to="/" title="Go to Home" style={{ color: "#0f5132", fontSize: "1.5rem" }}>
        <BsHouseDoorFill style={{ cursor: "pointer" }} />
      </Link>
    </div>

    <nav className="nav nav-pills flex-column gap-2">
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => (isActive ? activeStyle : undefined)}
          className="nav-link text-dark"
        >
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
