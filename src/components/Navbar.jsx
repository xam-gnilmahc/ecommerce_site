import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "./assets/logo.png";
import { RiShoppingBagLine } from "react-icons/ri";
import Badge from "@mui/material/Badge";
import { RiMenu2Line } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineClose } from "react-icons/md";
import { FiHeart } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaPinterest } from "react-icons/fa";
import SearchBar from "./SearchBar";

const Navbar = () => {
  const { user, logout, cart } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? "auto" : "hidden";
  };

  const handleSearch = (searchValue) => {
    const search = searchValue.toLowerCase().trim();
    console.log(search);

    //   if (search === '') {
    //     setFilter(data); // reset to original list if input is empty
    //   } else {
    //     const filtered = data.filter((item) =>
    //       item.name.toLowerCase().includes(search) ||
    //       item.brand?.toLowerCase().includes(search) ||
    //       item.type?.toLowerCase().includes(search) ||
    //       item.category?.toLowerCase().includes(search)
    //     );
    //     setFilter(filtered);
    //   }

    //   setCurrentPage(1); // Reset pagination
  };

  return (
    <>
      <div className="navBar">
        {/* Logo */}
        <div className="logoLinkContainer">
          <div className="logoContainer">
            <NavLink to="/" className=" d-flex align-items-center gap-2">
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
          </div>

          {/* Toggler */}

          {/* Collapsible Links */}
          <div class="linkContainer">
            <ul className="mb-2">
              <li>
                <NavLink to="/" end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/product">Shop</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about">About</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact">Contact</NavLink>
              </li>
            </ul>
          </div>
        </div>

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
              <NavLink to="/profile" className="me-2">
                <FaRegUser size={20} color="black" />
              </NavLink>
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
      <nav>
        <div className="mobile-nav">
          {mobileMenuOpen ? (
            <MdOutlineClose size={22} onClick={toggleMobileMenu} />
          ) : (
            <RiMenu2Line size={22} onClick={toggleMobileMenu} />
          )}
          <div className="logoContainer">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </div>
          <Link to="/cart">
            <Badge
              badgeContent={user && cart.length === 0 ? "0" : cart.length}
              color="primary"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <RiShoppingBagLine size={22} color="black" />
            </Badge>
          </Link>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menuTop">
            <div className="mobile-menuSearchBar">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="mobile-menuList">
              <ul>
                <li>
                  <Link to="/" onClick={toggleMobileMenu}>
                    HOME
                  </Link>
                </li>
                <li>
                  <Link to="/product" onClick={toggleMobileMenu}>
                    SHOP
                  </Link>
                </li>
                <li>
                  <Link to="/about" onClick={toggleMobileMenu}>
                    ABOUT
                  </Link>
                </li>
                <li>
                  <Link to="/contact" onClick={toggleMobileMenu}>
                    CONTACT
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mobile-menuFooter">
            <div className="mobile-menuFooterLogin">
              <Link to="/loginSignUp" onClick={toggleMobileMenu}>
                <FaRegUser style={{ margin: 0 }} />
                <p style={{ margin: 0 }}>My Account</p>
              </Link>
            </div>
            {!user ? (
              <>
                <div className="d-flex gap-2">
                  <NavLink to="/login" className="btn btn-outline-dark btn-sm">
                    <i className="fa fa-sign-in-alt me-1"></i> Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="btn btn-outline-dark btn-sm"
                  >
                    <i className="fa fa-user-plus me-1"></i> Register
                  </NavLink>
                </div>
              </>
            ) : (
              <>
                <span className="text-muted small me-2">
                  Hi, <strong>{user.full_name}</strong>
                </span>
                <button
                  onClick={logout}
                  className="btn btn-outline-dark btn-sm"
                >
                  <i className="fa fa-sign-out-alt me-1"></i> Logout
                </button>
              </>
            )}

            <div className="mobile-menuSocial_links"></div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
