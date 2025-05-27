import React from "react";
import { NavLink, Link } from "react-router-dom";
import { BsHouseDoorFill } from "react-icons/bs"; // house icon

const activeStyle = {
  backgroundColor: "#d1e7dd",
  color: "#0f5132",
  fontWeight: "600",
  borderRadius: "0.375rem",
  borderLeft: "4px solid #198754",
};

const Sidebar = () => {
  return (
    <aside
      className="d-flex flex-column p-3 bg-light"
      style={{
        width: "280px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        overflowY: "auto",
      }}
    >
      {/* Flex container for title + icon */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h5 className="m-0">My Account</h5>
        <Link to="/" title="Go to Home" style={{ color: "#0f5132", fontSize: "1.5rem" }}>
          <BsHouseDoorFill style={{ cursor: "pointer" }} />
        </Link>
      </div>

      <nav className="nav nav-pills flex-column gap-2">
        {[
          { to: "/profile", label: "Profile" },
          { to: "/order", label: "Orders" },
          { to: "/notifications", label: "Notifications" },
          { to: "/settings", label: "Settings" },
        ].map(({ to, label }) => (
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
};

export default Sidebar;
