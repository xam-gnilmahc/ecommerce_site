import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useCartTotal } from '../../tanstack/cart';
import Badge from '@mui/material/Badge';

import { RiShoppingBagLine, RiMenu2Line } from 'react-icons/ri';

import { FaChevronDown, FaBoxOpen, FaCog, FaSignOutAlt } from 'react-icons/fa';

import { MdOutlineClose } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

import logo from '../cart/assets/logo.png';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);

  const navRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: totalCart } = useCartTotal(user?.id);

  const isSearchPage = location.pathname === '/search';

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const searchQuery = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
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

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = search.trim();
      if (!value) return;
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <>
      <div ref={navRef} className={`navBar ${isSticky ? 'fixed' : ''}`}>
        <div className="nav-inner">
          <div className="logoContainer">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
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

          <div className="nav-right">
            {!user ? (
              !isAuthPage && (
                <>
                  <NavLink to="/login" className="nav-login">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="nav-register">
                    Register
                  </NavLink>
                </>
              )
            ) : (
              <>
                <div className="profile-dropdown" ref={profileRef}>
                  <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}>
                    {user.picture ? (
                      <img src={user.picture} alt="profile" className="profile-avatar" />
                    ) : (
                      <span className="profile-avatar profile-initial">
                        {(user.name || user.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="profile-name">{user.name || user.full_name || 'Account'}</span>
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

                <NavLink to="/cart" className="cart-link">
                  <Badge badgeContent={totalCart || '0'} color="primary">
                    <RiShoppingBagLine size={21} />
                  </Badge>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      {isSticky && <div style={{ height: navHeight }} />}

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
                  <FaSignOutAlt />
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
