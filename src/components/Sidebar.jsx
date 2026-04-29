import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { BsHouseDoorFill, BsBagCheck } from "react-icons/bs";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import logo from "./assets/logo.png";
import { useAuth } from "../context/authContext";
import "./Sidebar.css";

const links = [
  { to: "/order", label: "Orders", icon: <BsBagCheck /> },
  { to: "/return-cancel", label: "Cancelled", icon: <MdCancel /> },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="sb-toggle" onClick={() => setOpen(true)}>
        <FaBars />
      </button>

      {open && <div className="sb-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sb ${open ? "open" : ""}`}>
        <div className="sb-top">
          <img src={logo} className="sb-logo" />

          <Link to="/" className="sb-home">
            <BsHouseDoorFill />
          </Link>

          <button className="sb-close" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="sb-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `sb-link ${isActive ? "active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {l.icon}
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sb-logout" onClick={logout}>
          <FaSignOutAlt />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;