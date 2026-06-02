import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useAppDispatch } from '../redux/index.ts';
import { fetchTotalCart } from '../redux/slice/userCart.ts';
import Badge from '@mui/material/Badge';

import { RiShoppingBagLine, RiMenu2Line } from 'react-icons/ri';

import { FaRegUser, FaChevronDown, FaBoxOpen, FaCog, FaSignOutAlt } from 'react-icons/fa';

import { MdOutlineClose } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';
import { MdConfirmationNumber } from 'react-icons/md'; // 🎟️ raffle icon

import logo from './assets/logo.png';

import './Navbar.css';

import NotificationPage from '../pages/NotificationPage';

const Navbar = () => {
  const { user, logout } = useAuth();

  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  const navRef = useRef(null);
  const profileRef = useRef(null);

  const { totalCart } = useSelector((state) => state.addToCart);

  const isSearchPage = location.pathname === '/search';

  const searchQuery = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTotalCart(user.id));
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    const onScroll = () => {
      setIsSticky(window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      document.body.style.overflow = next ? 'hidden' : 'auto';
      return next;
    });
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const value = search.trim();
      if (!value) return;
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <>
      <div ref={navRef} className={`navBar ${isSticky ? 'fixed' : ''}`}>
        {/* LEFT */}
        <div className="logoContainer">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        {/* SEARCH */}
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

        {/* RIGHT */}
        <div className="nav-right">
          {/* 🎟️ RAFFLES LINK — always visible */}
          <NavLink
            to="/raffles"
            className="nav-raffle-link"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '100px',
              border: '1.5px solid',
              borderColor: isActive ? '#1a1a2e' : '#e0ddd6',
              background: isActive ? '#1a1a2e' : 'transparent',
              color: isActive ? '#ffffff' : '#1a1a2e',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            })}
          >
            <MdConfirmationNumber size={15} />
            Raffles
          </NavLink>

          {!user ? (
            <>
              <NavLink to="/login" className="nav-btn">
                Login
              </NavLink>
              <NavLink to="/register" className="nav-btn">
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NotificationPage embedded />

              {/* PROFILE DROPDOWN */}
              <div className="profile-dropdown" ref={profileRef}>
                <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                  {user.picture ? (
                    <img src={user.picture} alt="profile" className="profile-avatar" />
                  ) : (
                    <FaRegUser size={18} />
                  )}
                  <FaChevronDown className={`arrow ${profileOpen ? 'rotate' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="profile-menu">
                    <button
                      onClick={() => {
                        navigate('/order');
                        setProfileOpen(false);
                      }}
                    >
                      <FaBoxOpen />
                      Orders
                    </button>

                    <button
                      onClick={() => {
                        navigate('/settings');
                        setProfileOpen(false);
                      }}
                    >
                      <FaCog />
                      Settings
                    </button>

                    <button
                      className="logout-btn"
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* CART */}
              <NavLink to="/cart">
                <Badge badgeContent={totalCart || '0'} color="primary">
                  <RiShoppingBagLine size={22} />
                </Badge>
              </NavLink>
            </>
          )}
        </div>
      </div>

      {isSticky && <div style={{ height: navHeight }} />}

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
              <img src={logo} alt="logo" />
            </Link>
          </div>

          <Link to="/cart">
            <Badge badgeContent={totalCart || '0'} color="primary">
              <RiShoppingBagLine size={22} />
            </Badge>
          </Link>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <div>
              <div className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
                <MdOutlineClose size={28} />
              </div>

              {isSearchPage && (
                <div className="mobile-search">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                </div>
              )}
            </div>

            <div className="mobile-menuFooter">
              {/* 🎟️ Raffles in mobile menu */}
              <Link to="/raffles" onClick={toggleMobileMenu}>
                🎟️ Raffles
              </Link>

              <Link to="/order" onClick={toggleMobileMenu}>
                Orders
              </Link>

              <Link to="/settings" onClick={toggleMobileMenu}>
                Settings
              </Link>

              {user ? (
                <button
                  className="mobile-logout"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <div className="mobile-auth">
                  <NavLink to="/login" onClick={toggleMobileMenu}>
                    Login
                  </NavLink>
                  <NavLink to="/register" onClick={toggleMobileMenu}>
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
