import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiZap, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import './Main.css';

const SUGGESTIONS = ['iPhone 17 Pro', 'MacBook Pro', 'Galaxy S26', 'Apple Watch', 'AirPods Max', 'Gaming setup'];

const PERKS = [
  { icon: <FiTruck />, label: 'Free delivery' },
  { icon: <FiShield />, label: '2-year warranty' },
  { icon: <FiRefreshCw />, label: 'Easy returns' },
];

const CATEGORIES = [
  {
    label: 'Mobiles',
    img: 'https://static0.anpoimages.com/wordpress/wp-content/uploads/2025/08/pixel-10.png?q=70&fit=contain&w=420&dpr=1',
    q: 'mobile',
    color: '#FF6B35',
    bg: '#FFF0EB',
  },
  {
    label: 'Laptops',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn8vQdgMccG_FBU1O6qew_sRa6hiU04vHWcw3HPif8bkbKUwvex9JZrWg&s=10',
    q: 'laptop',
    color: '#0066FF',
    bg: '#EBF0FF',
  },
  {
    label: 'Tablets',
    img: 'https://brother-mart.com/cdn/shop/files/buy-ipad-air-13-m4-nepal-online-ipad-air-13-m4-price-nepal-2026.png?v=1775825788&width=900',
    q: 'tablet',
    color: '#9333EA',
    bg: '#F3EBFF',
  },
  {
    label: 'Watches',
    img: 'https://img.fatafatsewa.com/products/3362/apple-watch-ultra-orange-alpine-loop-2023.jpg',
    q: 'watch',
    color: '#059669',
    bg: '#EBFFF6',
  },
  {
    label: 'Audio',
    img: 'https://www.apple.com/v/airpods/ae/images/overview/airpods_max_blue__fsfaleh1smuu_large.png',
    q: 'earbuds',
    color: '#DC2626',
    bg: '#FFEBEB',
  },
  {
    label: 'Keyboards',
    img: 'https://www.sbsupply.eu/media/amasty/webp/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/a/p/apple-magic-keyboard-with-touch-id-qwerty-white_1_1_jpg.webp',
    q: 'keyboard',
    color: '#D97706',
    bg: '#FFF8EB',
  },
  {
    label: 'Cameras',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwMhMPKgXBWitbl80BdsIWRX3gkxaKfx5A8q3QMkb0T43K0_iOePg0jBEW&s=10',
    q: 'camera',
    color: '#0891B2',
    bg: '#EBF9FF',
  },
  {
    label: 'Gaming',
    img: 'https://img.drz.lazcdn.com/static/np/p/abbc459a041c762e4844600be6e7e14a.png_720x720q80.png',
    q: 'gaming',
    color: '#7C3AED',
    bg: '#F0EBFF',
  },
];

const stagger = (i) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [typed, setTyped] = useState('');
  const navigate = useNavigate();

  // typewriter placeholder
  useEffect(() => {
    let word = 0;
    let char = 0;
    let deleting = false;
    let timer;

    const tick = () => {
      const current = SUGGESTIONS[word];
      if (!deleting) {
        char++;
        setTyped(current.slice(0, char));
        if (char === current.length) {
          deleting = true;
          timer = setTimeout(tick, 1600);
          return;
        }
      } else {
        char--;
        setTyped(current.slice(0, char));
        if (char === 0) {
          deleting = false;
          word = (word + 1) % SUGGESTIONS.length;
        }
      }
      timer = setTimeout(tick, deleting ? 35 : 75);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, []);

  const go = (q) => {
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') go(search);
  };

  return (
    <div className="hp-root">
      {/* ══════════════════════════════════════
          HERO — clean white, animated search
      ══════════════════════════════════════ */}
      <section className="hp-hero">
        {/* looping background video */}
        <video
          className="hp-hero-video"
          src={`${process.env.PUBLIC_URL}/assests/apple.mp4`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="hp-hero-overlay" />

        <motion.div
          className={`hp-search-wrap ${focused ? 'hp-search-wrap--on' : ''}`}
          {...stagger(0)}
        >
          <FiSearch className="hp-search-ico" />
          <input
            className="hp-search-input"
            type="text"
            placeholder={search ? '' : typed || 'Search…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {!search && <span className="hp-search-caret" />}
          <motion.button
            className="hp-search-btn"
            onClick={() => go(search)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Search</span> <FiArrowRight className="hp-search-arrow" />
          </motion.button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════ */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Shop by category</h2>
          <span className="hp-section-line" />
        </div>

        <div className="hp-cat-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.label}
              className="hp-cat-card"
              style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
              onClick={() => go(cat.q)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="hp-cat-emoji">
                <img src={cat.img} alt={cat.label} className="hp-cat-img" />
              </span>
              <span className="hp-cat-label">{cat.label}</span>
              <FiArrowRight className="hp-cat-arrow" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOT DEALS BANNER ROW
      ══════════════════════════════════════ */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2 className="hp-section-title">Hot deals</h2>
          <span className="hp-section-line" />
        </div>

        <div className="hp-deals-row">
          {/* big banner */}
          <motion.div
            className="hp-deal-banner hp-deal-banner--blue"
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            onClick={() => go('laptop')}
            style={{ cursor: 'pointer' }}
          >
            <div className="hp-deal-tag">🔥 Up to 30% off</div>
            <div className="hp-deal-title">
              Laptops &<br />
              MacBooks
            </div>
            <div className="hp-deal-sub">Shop the best deals on premium laptops</div>
            <button className="hp-deal-cta">
              Shop now <FiArrowRight />
            </button>
          </motion.div>

          {/* 2 stacked banners */}
          <div className="hp-deal-stack">
            <motion.div
              className="hp-deal-banner hp-deal-banner--orange"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              onClick={() => go('mobile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="hp-deal-tag">⚡ New arrivals</div>
              <div className="hp-deal-title">Mobiles</div>
              <div className="hp-deal-sub">iPhone, Samsung & more</div>
            </motion.div>

            <motion.div
              className="hp-deal-banner hp-deal-banner--green"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              onClick={() => go('watch')}
              style={{ cursor: 'pointer' }}
            >
              <div className="hp-deal-tag">🎯 Best sellers</div>
              <div className="hp-deal-title">Wearables</div>
              <div className="hp-deal-sub">Watches & fitness bands</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
