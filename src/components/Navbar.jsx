import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useAppDispatch } from "../redux/index.ts";
import { fetchCartItems } from "../redux/slice/userCart.ts";
import { RootState } from "../redux/index.ts";
import Badge from "@mui/material/Badge";
import { RiShoppingBagLine, RiMenu2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineClose } from "react-icons/md";
import logo from "./assets/logo.png";
import "./Navbar.css";
import SearchBar from "./SearchBar";
import NotificationPage from "../pages/NotificationPage";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { items } = useSelector((state: RootState) => state.addToCart);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [user, dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const togglePopup = () => setIsOpen((prev) => !prev);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? "auto" : "hidden";
  };

  return (
    <>
      <div className="navBar">
        <div className="logoLinkContainer">
          <div className="logoContainer">
            <NavLink to="/" className="d-flex align-items-center gap-2">
              <img src={logo} alt="Logo" style={{ width: "100px", height: "60px", objectFit: "contain" }} />
              <span className="dev-badge" style={{
                background: "linear-gradient(135deg, #0d6efd, #6610f2)",
                color: "#fff", fontSize: "12px", padding: "3px 10px",
                borderRadius: "20px", marginLeft: "12px", fontWeight: "600",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)", letterSpacing: "0.5px"
              }}>
                DEV MODE
              </span>
            </NavLink>
          </div>

          <div className="linkContainer">
            <ul className="mb-2">
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/shop">Shop</NavLink></li>
              <li
                className={`nav-item category-dropdown ${isOpen ? 'open' : ''}`}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onClick={togglePopup}>
                <Link className="nav-item">Categories</Link>
                <div className="category-popup">
                  <div className="content pe-5">
                    <ul>
                      {[
                        'Mobile', 'Laptop', 'Tablet', 'Smartwatch', 'Earbuds', 'Headphones',
                        'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Charger', 'Power Bank',
                        'Camera', 'Tripod', 'Drone', 'Printer', 'Scanner', 'Speaker', 'Projector',
                        'USB Cable', 'SD Card', 'Router', 'VR Headset', 'Game Console', 'TV'
                      ].map((item, index) => (
                        <li key={index}><Link to="/">{item}</Link></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {!user ? (
            <>
              <NavLink to="/login" className="btn btn-outline-dark btn-sm">
                <i className="fa fa-sign-in-alt me-1" /> Login
              </NavLink>
              <NavLink to="/register" className="btn btn-outline-dark btn-sm">
                <i className="fa fa-user-plus me-1" /> Register
              </NavLink>
            </>
          ) : (
            <>
              <NotificationPage embedded={true} />
              <span className="text-muted small me-2">Hi, <strong>{user?.full_name}</strong></span>
              <NavLink to="/profile" className="me-2 d-flex align-items-center">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" style={{
                    width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover"
                  }} title={user.picture} />
                ) : <FaRegUser size={20} color="black" />}
              </NavLink>
              <NavLink to="/cart" className="me-2">
                <Badge
                  badgeContent={items.length || "0"}
                  color="primary"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                  <RiShoppingBagLine size={22} color="black" />
                </Badge>
              </NavLink>
            </>
          )}
        </div>
      </div>

      <nav>
        <div className="mobile-nav">
          {mobileMenuOpen ? (
            <MdOutlineClose size={22} onClick={toggleMobileMenu} />
          ) : (
            <RiMenu2Line size={22} onClick={toggleMobileMenu} />
          )}
          <div className="logoContainer">
            <Link to="/"><img src={logo} alt="Logo" /></Link>
          </div>
          <Link to="/cart">
            <Badge
              badgeContent={user && items.length === 0 ? "0" : items.length}
              color="primary"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
              <RiShoppingBagLine size={22} color="black" />
            </Badge>
          </Link>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menuTop">
            <div className="mobile-menuSearchBar">
              <SearchBar onSearch={() => {}} />
            </div>
            <div className="mobile-menuList">
              <ul>
                <li><Link to="/" onClick={toggleMobileMenu}>HOME</Link></li>
                <li><Link to="/shop" onClick={toggleMobileMenu}>SHOP</Link></li>
              </ul>
            </div>
          </div>
          <div className="mobile-menuFooter">
            <div className="mobile-menuFooterLogin">
              <Link to="/profile" onClick={toggleMobileMenu}>
                <FaRegUser style={{ margin: 0 }} />
                <p style={{ margin: 0 }}>My Account</p>
              </Link>
            </div>

            {!user ? (
              <div className="d-flex gap-2">
                <NavLink to="/login" className="btn btn-outline-dark btn-sm">
                  <i className="fa fa-sign-in-alt me-1" /> Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-dark btn-sm">
                  <i className="fa fa-user-plus me-1" /> Register
                </NavLink>
              </div>
            ) : (
              <>
                <span className="text-muted small me-2">
                  Hi, <strong>{user?.full_name}</strong>
                </span>
                <button onClick={logout} className="btn btn-sm rounded-pill p-2"
                  style={{ backgroundColor: "#333", color: "#fff", maxWidth: '120px' }}>
                  <i className="fa fa-sign-out-alt me-1" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
