import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useAppDispatch } from '../../redux/index.ts';
import { fetchTotalCart } from '../../redux/slice/userCart.ts';
import Badge from '@mui/material/Badge';

import { RiShoppingBagLine, RiMenu2Line } from 'react-icons/ri';

import { FaRegUser, FaChevronDown, FaBoxOpen, FaCog, FaSignOutAlt } from 'react-icons/fa';

import { MdOutlineClose } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

import logo from '../cart/assets/logo.png';

import NotificationPage from '../../pages/profile/NotificationPage';

const Navbar = () => {
  const { user, logout } = useAuth();

  const dispatch = useAppDispatch();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
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
      <div
        ref={navRef}
        className="h-nav items-center justify-between px-12 bg-white/85 backdrop-blur-xl border-b border-gray-200 z-[1000] hidden md:flex fixed left-0 right-0 top-0"
      >
        {/* LEFT */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img src={logo} alt="Logo" className="w-[100px] h-12 object-contain" />
          </Link>
        </div>

        {/* SEARCH */}
        {isSearchPage && (
          <div className="flex-1 flex justify-center px-8">
            <div className="w-full max-w-[480px] h-[42px] flex items-center gap-2 px-4 rounded-full bg-gray-100 border border-transparent transition-all duration-200 focus-within:border-gray-300 focus-within:bg-white">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search for products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className="flex-1 border-none outline-none bg-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <NavLink
                to="/login"
                className="h-[38px] px-4 rounded-full border-[1.5px] border-gray-200 flex items-center justify-center text-gray-900 text-sm font-medium bg-transparent transition-all duration-200 hover:bg-gray-100 hover:border-gray-300"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="h-[38px] px-4 rounded-full border-[1.5px] border-gray-200 flex items-center justify-center text-gray-900 text-sm font-medium bg-transparent transition-all duration-200 hover:bg-gray-100 hover:border-gray-300"
              >
                Register
              </NavLink>
            </>
          ) : (
            <>
              <NotificationPage embedded />

              {/* PROFILE DROPDOWN */}
              <div className="relative" ref={profileRef}>
                <button
                  className="h-[38px] px-2 rounded-full border border-gray-200 bg-white flex items-center gap-2 cursor-pointer transition-all duration-200 hover:border-gray-300"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  {user.picture ? (
                    <img src={user.picture} alt="profile" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <FaRegUser size={18} />
                  )}
                  <FaChevronDown
                    className={`text-xs text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute top-[46px] right-0 w-[200px] bg-white rounded-[10px] border border-gray-200 p-1 z-[4000]">
                    <button
                      className="w-full h-10 border-none bg-transparent rounded-md flex items-center gap-2 px-4 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-100"
                      onClick={() => {
                        navigate('/order');
                        setProfileOpen(false);
                      }}
                    >
                      <FaBoxOpen />
                      Orders
                    </button>

                    <button
                      className="w-full h-10 border-none bg-transparent rounded-md flex items-center gap-2 px-4 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-100"
                      onClick={() => {
                        navigate('/settings');
                        setProfileOpen(false);
                      }}
                    >
                      <FaCog />
                      Settings
                    </button>

                    <button
                      className="w-full h-10 border-none bg-transparent rounded-md flex items-center gap-2 px-4 cursor-pointer text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-red-600"
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

      {/* MOBILE NAV */}
      <nav className="md:hidden">
        <div className="h-14 items-center justify-between px-4 bg-white border-b border-gray-200 sticky top-0 z-[3000]">
          {mobileMenuOpen ? (
            <MdOutlineClose size={22} onClick={toggleMobileMenu} />
          ) : (
            <RiMenu2Line size={22} onClick={toggleMobileMenu} />
          )}

          <div className="flex-shrink-0">
            <Link to="/">
              <img src={logo} alt="logo" className="w-20 h-10 object-contain" />
            </Link>
          </div>

          <Link to="/cart">
            <Badge badgeContent={totalCart || '0'} color="primary">
              <RiShoppingBagLine size={22} />
            </Badge>
          </Link>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 z-[3000]" onClick={() => setMobileMenuOpen(false)} />
        )}

        <div
          className={`fixed top-0 left-0 w-[80%] max-w-[320px] h-screen bg-white border-r border-gray-200 z-[4000] transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-end mb-6" onClick={() => setMobileMenuOpen(false)}>
                <MdOutlineClose size={28} />
              </div>

              {isSearchPage && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm bg-gray-100"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to="/order"
                onClick={toggleMobileMenu}
                className="h-11 rounded-[10px] bg-gray-100 flex items-center px-4 no-underline text-gray-900 border-none text-[13px] font-medium transition-colors duration-150 hover:bg-gray-200"
              >
                Orders
              </Link>

              <Link
                to="/settings"
                onClick={toggleMobileMenu}
                className="h-11 rounded-[10px] bg-gray-100 flex items-center px-4 no-underline text-gray-900 border-none text-[13px] font-medium transition-colors duration-150 hover:bg-gray-200"
              >
                Settings
              </Link>

              {user ? (
                <button
                  className="h-11 rounded-[10px] bg-gray-100 flex items-center px-4 no-underline text-gray-900 border-none text-[13px] font-medium transition-colors duration-150 hover:bg-gray-200"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/login"
                    onClick={toggleMobileMenu}
                    className="h-11 rounded-[10px] bg-gray-100 flex items-center px-4 no-underline text-gray-900 border-none text-[13px] font-medium transition-colors duration-150 hover:bg-gray-200"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={toggleMobileMenu}
                    className="h-11 rounded-[10px] bg-gray-100 flex items-center px-4 no-underline text-gray-900 border-none text-[13px] font-medium transition-colors duration-150 hover:bg-gray-200"
                  >
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
