import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAuth } from '../../context/authContext';
import {
  useCartTotal,
  useCartItems,
  useRemoveFromCart,
  useUpdateCartQuantity,
} from '../../tanstack/cart.ts';
import { useProducts, useRecentlyViewedProducts } from '../../tanstack/products.ts';
import { useSearchProducts } from '../../tanstack/search.ts';
import { useBrandOptions } from '../../tanstack/filters.ts';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';

import { FaChevronDown, FaBoxOpen, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { FiSearch, FiX, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

import logo from '../cart/assets/logo.png';
import NavbarBell from './NavbarBell';
import './Navbar.css';

const VISITOR_COOKIE_OPTIONS = {
  path: '/',
  maxAge: 365 * 24 * 60 * 60,
  sameSite: 'lax' as const,
  secure: window.location.protocol === 'https:',
};

const formatUsd = (amount) => {
  const value = Number(amount);
  if (Number.isNaN(value)) return '';
  return `$${value.toFixed(2)} USD`;
};

const NAV_LINKS = [
  { label: 'Shop All', to: '/search' },
  { label: 'Mobile', to: '/search?q=mobile' },
  { label: 'Laptop', to: '/search?q=laptop' },
  { label: 'Tablet', to: '/search?q=tablet' },
  { label: 'Watch', to: '/search?q=watch' },
];

const NAV_MORE = [
  { label: 'Earbuds', to: '/search?q=earbuds' },
  { label: 'Monitor', to: '/search?q=monitor' },
  { label: 'Keyboard', to: '/search?q=keyboard' },
  { label: 'Drones', to: '/search?q=drones' },
];

const ALL_MENU = [...NAV_LINKS, ...NAV_MORE];

// categories offered as radio choices in the Shop All filter panel
const FILTER_CATEGORIES = [
  'Mobile',
  'Phone',
  'Laptop',
  'MacBook',
  'Tablet',
  'Watch',
  'Earbuds',
  'Monitor',
  'Keyboard',
  'Drones',
  'Dslr',
  'Gaming console',
  'Gpu',
];

// fallback brand list until the API returns the real distinct brands
const FALLBACK_BRANDS = [
  'Acer',
  'Amazon',
  'Antman',
  'Apple',
  'Asus',
  'Beats',
  'Bose',
  'Cannon',
  'Dell',
  'Google',
  'HP',
  'Honner',
  'Huawei',
  'Lenovo',
  'MSI',
  'Microsoft',
  'Nikon',
  'Nothing',
  'Nvidia',
  'One Plus',
  'Oneplus',
  'Redmi',
  'Samsung',
  'Sony',
  'Vivo',
  'Xiaomi',
  'xbox',
];

const Navbar = () => {
  const { user, visitor, trackProduct, logout } = useAuth();
  const [cookies, setCookie] = useCookies(['visitor_tracking']);

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [navHeight, setNavHeight] = useState(0);

  // navbar category hover → left-side filter popup
  const [catPopup, setCatPopup] = useState(null);
  const [catFacets, setCatFacets] = useState({ cat: '', brands: [], min: '', max: '', avail: [] });
  const catCloseTimer = useRef(null);

  // brands for the hovered category (or the radio-chosen one in Shop All) —
  // only brands that really have products in it
  const activeBrandTerm =
    catPopup && catPopup !== 'Shop All'
      ? catPopup.toLowerCase()
      : catFacets.cat
        ? catFacets.cat.toLowerCase()
        : '';
  const { data: apiBrands, isPending: brandsPending } = useBrandOptions(activeBrandTerm);
  const brandOptions = brandsPending ? FALLBACK_BRANDS : apiBrands || [];

  // search modal data — all products grid + recently viewed + live results
  const { data: allProducts = [] } = useProducts();
  const { data: recentProducts = [] } = useRecentlyViewedProducts(visitor?.product_ids);
  const { data: liveResults = [], status: liveStatus } = useSearchProducts(debouncedSearch);

  // cart drawer data
  const { data: cartItems = [], isLoading: cartLoading } = useCartItems(user?.id);
  const removeCartMutation = useRemoveFromCart();
  const updateQtyMutation = useUpdateCartQuantity();

  const changeQty = (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    updateQtyMutation.mutate({
      userId: user.id,
      productId: item.product_id,
      quantity: newQty,
    });
  };

  const navRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchPanelRef = useRef(null);
  const searchInputRef = useRef(null);

  const { data: totalCart } = useCartTotal(user?.id);

  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.amount || item.products?.amount || 0) * (item.quantity || 1),
    0
  );

  // debounce live search inside the modal
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      const inSearchButton = searchRef.current && searchRef.current.contains(e.target);
      const inSearchPanel = searchPanelRef.current && searchPanelRef.current.contains(e.target);
      const isSearchToggle = e.target.closest?.(
        '.nav-action--search, .mobile-nav__search, .nav-search-panel'
      );
      if (!inSearchButton && !inSearchPanel && !isSearchToggle) {
        setSearchOpen(false);
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

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // lock body scroll + narrow page while cart drawer is open
  useEffect(() => {
    if (searchOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';

    if (cartOpen) document.body.classList.add('cart-open');
    else document.body.classList.remove('cart-open');

    return () => {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('cart-open');
    };
  }, [searchOpen, cartOpen]);

  // close cart drawer on Escape
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setCartOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartOpen]);

  // clear hover popup timer on unmount
  useEffect(() => {
    return () => {
      if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    };
  }, []);

  const openCatPopup = (label) => {
    if (catCloseTimer.current) {
      clearTimeout(catCloseTimer.current);
      catCloseTimer.current = null;
    }
    setCatPopup((prev) => {
      if (prev !== label) {
        setCatFacets({
          cat: label === 'Shop All' ? '' : label,
          brands: [],
          min: '',
          max: '',
          avail: [],
        });
      }
      return label;
    });
  };

  const scheduleCatClose = () => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    catCloseTimer.current = setTimeout(() => {
      setCatPopup(null);
      catCloseTimer.current = null;
    }, 250);
  };

  const closeCatPopup = () => {
    if (catCloseTimer.current) {
      clearTimeout(catCloseTimer.current);
      catCloseTimer.current = null;
    }
    setCatPopup(null);
  };

  const toggleCatFacet = (key, value) => {
    setCatFacets((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));
  };

  const applyCatFilters = (item) => {
    const params = new URLSearchParams();
    const chosenCategory = catFacets.cat || (item.label === 'Shop All' ? '' : item.label);
    if (chosenCategory) params.set('q', chosenCategory.toLowerCase());
    if (catFacets.brands.length) params.set('brand', catFacets.brands.join(','));
    if (catFacets.min !== '') params.set('min', catFacets.min);
    if (catFacets.max !== '') params.set('max', catFacets.max);
    if (catFacets.avail.length) params.set('avail', catFacets.avail.join(','));
    const qs = params.toString();
    closeCatPopup();
    navigate(qs ? `/search?${qs}` : '/search');
  };

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
      setSearchOpen(false);
      setMobileMenuOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  const closeSearch = () => {
    setSearchOpen(false);
    document.body.style.overflow = 'auto';
  };

  // always open the modal with an empty search box
  const openSearch = () => {
    setSearch('');
    setDebouncedSearch('');
    setSearchOpen(true);
  };

  const toggleSearch = () => {
    if (searchOpen) closeSearch();
    else openSearch();
  };

  const openCartDrawer = () => {
    if (location.pathname === '/cart') return;
    if (!user) {
      navigate('/cart');
      return;
    }
    setSearchOpen(false);
    setCartOpen(true);
  };

  const closeCartDrawer = () => {
    setCartOpen(false);
    document.body.style.overflow = 'auto';
  };

  const openProduct = (product) => {
    trackProduct(product.id);
    closeSearch();
    navigate(`/product/${product.id}`);
  };

  const clearRecentlyViewed = () => {
    const existing = cookies['visitor_tracking'];
    if (!existing) return;
    setCookie('visitor_tracking', { ...existing, product_ids: [] }, VISITOR_COOKIE_OPTIONS);
  };

  const isTyping = search.trim().length > 0;

  const ProductCard = ({ product }) => (
    <button type="button" className="search-modal__card" onClick={() => openProduct(product)}>
      <span className="search-modal__card-img">
        <img
          src={`${SUPABASE_STORAGE_URL}productimages/${product.banner_url}`}
          alt={product.name}
          loading="lazy"
        />
      </span>
      <span className="search-modal__card-title">{product.name}</span>
      <span className="search-modal__card-price">{formatUsd(product.amount)}</span>
    </button>
  );

  // left-side filter popup — brand / price / availability (like the filter drawer)
  const renderCatPopup = (item) => (
    <>
      <div
        className="nav-filterpop-overlay"
        style={{ top: navHeight || 59 }}
        onClick={closeCatPopup}
      />
      <div
        className="nav-filterpop"
        style={{ top: navHeight || 59, height: `calc(100dvh - ${navHeight || 59}px)` }}
        onMouseEnter={() => openCatPopup(item.label)}
        onMouseLeave={scheduleCatClose}
      >
        <div className="nav-filterpop__head">
          <p className="nav-filterpop__title">{item.label}</p>
          <button type="button" className="nav-filterpop__close" onClick={closeCatPopup}>
            Close
          </button>
        </div>

        <div className="nav-filterpop__body">
          <div className="nav-filterpop__group">
            <span className="nav-filterpop__label">Category</span>
            <div className="facet__list">
              {FILTER_CATEGORIES.map((c) => (
                <label className="facet-check" key={c}>
                  <input
                    type="radio"
                    name="navfilter-category"
                    checked={catFacets.cat === c}
                    onChange={() => setCatFacets((f) => ({ ...f, cat: c }))}
                  />
                  <span className="facet-check__box" aria-hidden="true" />
                  <span className="facet-check__label">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="nav-filterpop__group">
            <span className="nav-filterpop__label">Brand</span>
            {brandOptions.length === 0 ? (
              <p className="nav-filterpop__hint">No brands for this category</p>
            ) : (
              <div className="facet__list">
                {brandOptions.map((b) => (
                  <label className="facet-check" key={b}>
                    <input
                      type="checkbox"
                      checked={catFacets.brands.includes(b)}
                      onChange={() => toggleCatFacet('brands', b)}
                    />
                    <span className="facet-check__box" aria-hidden="true" />
                    <span className="facet-check__label">{b}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="nav-filterpop__group">
            <span className="nav-filterpop__label">Price</span>
            <div className="facet-price__inputs">
              <label className="facet-price__field">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={catFacets.min}
                  onChange={(e) => setCatFacets((f) => ({ ...f, min: e.target.value }))}
                  aria-label="Min price"
                />
              </label>
              <span className="facet-price__dash">–</span>
              <label className="facet-price__field">
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={catFacets.max}
                  onChange={(e) => setCatFacets((f) => ({ ...f, max: e.target.value }))}
                  aria-label="Max price"
                />
              </label>
            </div>
          </div>

          <div className="nav-filterpop__group">
            <span className="nav-filterpop__label">Availability</span>
            <div className="facet__list">
              {[
                { value: 'in', label: 'In stock' },
                { value: 'out', label: 'Out of stock' },
              ].map((opt) => (
                <label className="facet-check" key={opt.value}>
                  <input
                    type="checkbox"
                    checked={catFacets.avail.includes(opt.value)}
                    onChange={() => toggleCatFacet('avail', opt.value)}
                  />
                  <span className="facet-check__box" aria-hidden="true" />
                  <span className="facet-check__label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="nav-filterpop__foot">
          <button
            type="button"
            className="nav-filterpop__clear"
            onClick={() => setCatFacets({ cat: '', brands: [], min: '', max: '', avail: [] })}
          >
            Clear all
          </button>
          <button
            type="button"
            className="nav-filterpop__apply"
            onClick={() => applyCatFilters(item)}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );

  /* ── Minimal checkout header (logo + bag only) ── */
  if (location.pathname === '/checkout') {
    return (
      <header className="nav-checkout">
        <Link to="/" className="nav-checkout__logo" aria-label="Home">
          <img src={logo} alt="Home" />
        </Link>
        <Link to="/cart" className="nav-checkout__bag" aria-label="Cart">
          <FiShoppingBag size={20} />
        </Link>
      </header>
    );
  }

  return (
    <>
      <div
        ref={navRef}
        className={`navBar ${isSticky ? 'fixed' : ''} ${isHome ? 'navBar--overlay' : ''}`}
      >
        <div className="nav-inner">
          {/* LEFT — primary navigation */}
          <div className="nav-left">
            <nav className="nav-menu">
              {NAV_LINKS.map((item) => (
                <div
                  key={item.label}
                  className="nav-cat"
                  onMouseEnter={() => openCatPopup(item.label)}
                  onMouseLeave={scheduleCatClose}
                >
                  <NavLink to={item.to} className="nav-menu__link" onClick={closeCatPopup}>
                    {item.label}
                  </NavLink>
                  {catPopup === item.label && renderCatPopup(item)}
                </div>
              ))}
            </nav>
          </div>

          {/* CENTER — logo */}
          <div className="nav-logo">
            <Link to="/">
              <img src={logo} alt="Home" />
            </Link>
          </div>

          {/* RIGHT — text actions */}
          <div className="nav-right">
            <div className="nav-search-wrap" ref={searchRef}>
              <button
                className="nav-action nav-action--search"
                onClick={toggleSearch}
                aria-label="Search"
              >
                <FiSearch className="nav-action__icon" />
                <span className="nav-action__text">Search</span>
              </button>
            </div>

            {user && <NavbarBell />}

            {user ? (
              <div className="profile-dropdown" ref={profileRef}>
                <button
                  className="nav-action profile-trigger"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <span className="nav-action__text">Account</span>
                  <FaChevronDown className={`nav-menu__caret ${profileOpen ? 'rotate' : ''}`} />
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
            ) : (
              <NavLink to="/login" className="nav-action nav-action--account">
                <span className="nav-action__text">Account</span>
              </NavLink>
            )}

            <button
              type="button"
              className="nav-action nav-bag"
              onClick={openCartDrawer}
              aria-label="Cart"
            >
              <FiShoppingBag className="nav-action__icon" />
              {totalCart > 0 && <span className="cart-bubble">{totalCart}</span>}
            </button>
          </div>
        </div>
      </div>

      {isSticky && <div style={{ height: navHeight }} />}

      {/* SEARCH MODAL (works on desktop + mobile) */}
      {searchOpen && (
        <div className="search-modal">
          <div className="search-modal__backdrop" onClick={closeSearch} />

          <div
            className="search-modal__dialog"
            ref={searchPanelRef}
            role="dialog"
            aria-modal="true"
          >
            <div className="search-modal__bar">
              <FiSearch className="search-modal__icon" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                autoFocus
              />
              <button
                type="button"
                className="search-modal__close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="search-modal__body">
              {!isTyping && recentProducts.length > 0 && (
                <section className="search-modal__section">
                  <div className="search-modal__head">
                    <h4>Recently Viewed</h4>
                    <button
                      type="button"
                      className="search-modal__clear"
                      onClick={clearRecentlyViewed}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="search-modal__grid">
                    {recentProducts.map((product) => (
                      <ProductCard key={`recent-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              )}

              {!isTyping ? (
                <section className="search-modal__section">
                  <div className="search-modal__head">
                    <h4>All</h4>
                  </div>
                  <div className="search-modal__grid">
                    {allProducts.slice(0, 8).map((product) => (
                      <ProductCard key={`all-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              ) : liveStatus === 'pending' ? (
                <p className="search-modal__hint">Searching…</p>
              ) : liveResults.length > 0 ? (
                <section className="search-modal__section">
                  <div className="search-modal__head">
                    <h4>Results</h4>
                  </div>
                  <div className="search-modal__grid">
                    {liveResults.slice(0, 12).map((product) => (
                      <ProductCard key={`result-${product.id}`} product={product} />
                    ))}
                  </div>
                </section>
              ) : (
                <p className="search-modal__hint">No products found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER (right-side push panel) */}
      {cartOpen && (
        <div className="cart-drawer" role="dialog" aria-modal="true" aria-label="Cart">
          <div className="cart-drawer__bar">
            <span className="cart-drawer__title">
              Bag {totalCart > 0 && <span className="cart-drawer__count">{totalCart}</span>}
            </span>
            <button
              type="button"
              className="cart-drawer__close"
              onClick={closeCartDrawer}
              aria-label="Close cart"
            >
              <FiX size={16} />
            </button>
          </div>
          <div className="cart-drawer__body">
            {cartLoading ? (
              <p className="cart-drawer__hint">Loading…</p>
            ) : cartItems.length === 0 ? (
              <div className="cart-drawer__empty">
                <p className="cart-drawer__hint">Your cart is empty</p>
                <button type="button" className="cart-drawer__continue" onClick={closeCartDrawer}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <ul className="cart-drawer__list">
                {cartItems.map((item) => {
                  const product: any = item.products || {};
                  const img = product.banner_url
                    ? `${SUPABASE_STORAGE_URL}productimages/${product.banner_url}`
                    : null;
                  return (
                    <li key={item.id} className="cart-drawer__item">
                      <Link
                        className="cart-drawer__item-img"
                        to={`/product/${item.product_id}`}
                        onClick={closeCartDrawer}
                      >
                        {img ? <img src={img} alt={product.name || ''} /> : null}
                      </Link>

                      <div className="cart-drawer__item-info">
                        <Link
                          className="cart-drawer__item-name"
                          to={`/product/${item.product_id}`}
                          onClick={closeCartDrawer}
                        >
                          {product.name}
                        </Link>
                        <p className="cart-drawer__item-price">{formatUsd(item.amount)}</p>

                        <div className="cart-drawer__item-foot">
                          <div className="cart-drawer__qty">
                            <button
                              type="button"
                              onClick={() => changeQty(item, -1)}
                              aria-label="Decrease quantity"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => changeQty(item, 1)}
                              aria-label="Increase quantity"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="cart-drawer__remove"
                            onClick={() =>
                              removeCartMutation.mutate({
                                userId: user.id as any,
                                productId: item.product_id as any,
                              })
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>{' '}
          {cartItems.length > 0 && (
            <div className="cart-drawer__foot">
              <div className="cart-drawer__subtotal">
                <span>Estimated total</span>
                <span>{formatUsd(cartSubtotal)}</span>
              </div>
              <p className="cart-drawer__note">Taxes and shipping calculated at checkout.</p>
              <Link className="cart-drawer__checkout" to="/cart" onClick={closeCartDrawer}>
                View cart &amp; checkout
              </Link>
            </div>
          )}
        </div>
      )}

      {/* MOBILE BAR */}
      <nav>
        <div
          className={`mobile-nav ${isSticky ? 'is-stuck' : ''} ${isHome ? 'navBar--overlay' : ''}`}
        >
          <button className="mobile-nav__menu" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>

          <div className="mobile-nav__logo">
            <Link to="/">
              <img src={logo} alt="logo" />
            </Link>
          </div>

          <div className="mobile-nav__actions">
            <button
              className="mobile-nav__search"
              aria-label="Search"
              onClick={() => {
                toggleSearch();
                if (mobileMenuOpen) toggleMobileMenu();
              }}
            >
              <FiSearch size={18} />
            </button>

            {user && <NavbarBell />}

            <button
              type="button"
              className="mobile-nav__bag"
              aria-label="Cart"
              onClick={openCartDrawer}
            >
              <FiShoppingBag className="nav-action__icon" />
              {totalCart > 0 && <span className="cart-bubble">{totalCart}</span>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <div className="mobile-menu-top">
              <span className="mobile-menu-title">Menu</span>
              <button className="mobile-close" onClick={toggleMobileMenu}>
                Close
              </button>
            </div>

            <nav className="mobile-menu__nav">
              {ALL_MENU.map((item) => (
                <NavLink key={item.label} to={item.to} onClick={toggleMobileMenu}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mobile-menuFooter">
              {user ? (
                <>
                  <Link to="/order" onClick={toggleMobileMenu}>
                    Orders
                  </Link>
                  <Link to="/settings" onClick={toggleMobileMenu}>
                    Settings
                  </Link>
                  <button
                    className="mobile-logout"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      document.body.style.overflow = 'auto';
                    }}
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </>
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
