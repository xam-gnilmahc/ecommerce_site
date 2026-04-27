import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useAppDispatch } from "../redux/index.ts";
import { fetchTotalCart } from "../redux/slice/userCart.ts";
import { RootState } from "../redux/index.ts";
import Badge from "@mui/material/Badge";
import { RiShoppingBagLine, RiMenu2Line } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa6";
import { MdOutlineClose } from "react-icons/md";
import logo from "./assets/logo.png";
import "./Navbar.css";
import SearchBar from "./SearchBar";
import NotificationPage from "../pages/NotificationPage";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef(null);

  const { totalCart } = useSelector((state) => state.addToCart);

  // detect route
  const isSearchPage = location.pathname === "/search";
  const searchQuery = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTotalCart(user.id));
    }
  }, [user]);

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
    setMobileMenuOpen((prev) => {
      const next = !prev;
      // prevent background scroll when mobile menu is open
      document.body.style.overflow = next ? "hidden" : "auto";
      return next;
    });
  };

  useEffect(() => {
    // measure nav height for placeholder to avoid content jump when fixed
    if (navRef.current) setNavHeight(navRef.current.offsetHeight || 0);

    const onScroll = () => {
      setIsSticky(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const value = search.trim();
      if (!value) return;

      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };


  return (
    <>
  <div ref={navRef} className={`navBar ${isSticky ? 'fixed' : ''}`}>
        <div className="logoLinkContainer">
          <div className="logoContainer">
            <NavLink to="/" className="d-flex align-items-center gap-2">
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: "100px",
                  height: "60px",
                  objectFit: "contain",
                }}
              />
            </NavLink>
          </div>

        </div>

        {isSearchPage && (
          <div className="navbar-search">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
        )}

        <div className="d-flex align-items-center gap-2">
          {!user ? (
            <>
              <NavLink to="/login" className="btn btn-outline-dark btn-sm">
                Login
              </NavLink>
              <NavLink to="/register" className="btn btn-outline-dark btn-sm">
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NotificationPage embedded={true} />

              <NavLink to="/order" className="me-2 d-flex align-items-center">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt="Profile"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FaRegUser size={20} />
                )}
              </NavLink>

              <NavLink to="/cart" className="me-2">
                <Badge badgeContent={totalCart || "0"} color="primary">
                  <RiShoppingBagLine size={22} />
                </Badge>
              </NavLink>
            </>
          )}
        </div>
      </div>

  {/* placeholder to prevent content jump when navbar becomes fixed */}
  {isSticky && <div style={{ height: navHeight }} aria-hidden />}

      {/* MOBILE NAV */}
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
            <Badge badgeContent={totalCart || "0"} color="primary">
              <RiShoppingBagLine size={22} />
            </Badge>
          </Link>
        </div>

        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menuTop">

            {/* ✅ MOBILE SEARCH ONLY ON /search */}
            {isSearchPage && (
              <div className="mobile-search">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            )}
          </div>

          <div className="mobile-menuFooter">
            <div className="mobile-menuFooterLogin">
              <Link to="/order" onClick={toggleMobileMenu}>
                <FaRegUser />
                <p>My Account</p>
              </Link>
            </div>

            {!user ? (
              <div className="d-flex gap-2">
                <NavLink to="/login" className="btn btn-outline-dark btn-sm">
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline-dark btn-sm">
                  Register
                </NavLink>
              </div>
            ) : (
              <button onClick={logout} className="btn btn-dark btn-sm">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;