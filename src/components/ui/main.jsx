import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiTrendingUp, FiZap } from 'react-icons/fi';
import './Main.css';

const CATEGORIES = [
  { label: 'Mobiles', emoji: '📱', q: 'mobile', color: '#FF6B35', bg: '#FFF0EB' },
  { label: 'Laptops', emoji: '💻', q: 'laptop', color: '#0066FF', bg: '#EBF0FF' },
  { label: 'Tablets', emoji: '⬜', q: 'tablet', color: '#9333EA', bg: '#F3EBFF' },
  { label: 'Watches', emoji: '⌚', q: 'watch', color: '#059669', bg: '#EBFFF6' },
  { label: 'Audio', emoji: '🎧', q: 'earbuds', color: '#DC2626', bg: '#FFEBEB' },
  { label: 'Keyboards', emoji: '⌨️', q: 'keyboard', color: '#D97706', bg: '#FFF8EB' },
  { label: 'Cameras', emoji: '📷', q: 'camera', color: '#0891B2', bg: '#EBF9FF' },
  { label: 'Gaming', emoji: '🎮', q: 'gaming', color: '#7C3AED', bg: '#F0EBFF' },
];

const HOT_SEARCHES = ['iPhone 17 Pro', 'MacBook Pro', 'Galaxy S26', 'Apple AirPods', 'Imac'];

const stagger = (i) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

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
          HERO — clean white, just search
      ══════════════════════════════════════ */}
      <section className="hp-hero">
        <motion.p className="hp-eyebrow" {...stagger(0)}>
          <FiZap /> Shop the latest tech
        </motion.p>

        <motion.h1 className="hp-headline" {...stagger(1)}>
          What are you
          <br />
          <span className="hp-headline-em">looking for?</span>
        </motion.h1>

        {/* BIG SEARCH */}
        <motion.div
          className={`hp-search-wrap ${focused ? 'hp-search-wrap--on' : ''}`}
          {...stagger(2)}
        >
          <FiSearch className="hp-search-ico" />
          <input
            className="hp-search-input"
            type="text"
            placeholder="Search mobiles, laptops, watches…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <motion.button
            className="hp-search-btn"
            onClick={() => go(search)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Search <FiArrowRight />
          </motion.button>
        </motion.div>

        {/* hot searches */}
        <motion.div className="hp-hot" {...stagger(3)}>
          <span className="hp-hot-label">
            <FiTrendingUp /> Trending:
          </span>
          {HOT_SEARCHES.map((h) => (
            <button key={h} className="hp-hot-chip" onClick={() => go(h)}>
              {h}
            </button>
          ))}
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
              <span className="hp-cat-emoji">{cat.emoji}</span>
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
            <div className="hp-deal-deco">💻</div>
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
              <div className="hp-deal-deco">📱</div>
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
              <div className="hp-deal-deco">⌚</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
