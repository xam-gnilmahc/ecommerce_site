import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiTrendingUp, FiZap } from 'react-icons/fi';

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
    <div className="bg-white min-h-screen">
      {/* HERO */}
      <section className="flex flex-col items-center text-center py-12 md:py-[72px] px-4 md:px-6 pb-12 md:pb-16 bg-white border-b border-gray-200 gap-5 md:gap-6">
        <motion.p
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 tracking-[0.04em] uppercase m-0"
          {...stagger(0)}
        >
          <FiZap className="text-gray-400" /> Shop the latest tech
        </motion.p>

        <motion.h1
          className="text-[clamp(36px,9vw,96px)] font-black italic leading-[0.95] text-black m-0 tracking-[-0.03em]"
          {...stagger(1)}
        >
          What are you
          <br />
          <span className="text-gray-900 not-italic">looking for?</span>
        </motion.h1>

        {/* BIG SEARCH */}
        <motion.div
          className={`w-full max-w-[600px] flex items-center bg-white border-[1.5px] border-gray-200 rounded-full py-1 px-1 pl-6 gap-2 transition-colors duration-200 mt-3 ${
            focused ? 'border-gray-400' : ''
          }`}
          {...stagger(2)}
        >
          <FiSearch className="text-lg text-gray-400 shrink-0" />
          <input
            className="flex-1 border-none outline-none text-base md:text-[17px] font-medium text-black bg-transparent placeholder:text-gray-400"
            type="text"
            placeholder="Search mobiles, laptops, watches…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <motion.button
            className="flex items-center gap-2 bg-black text-white border-none rounded-full py-2.5 px-5 md:py-3.5 md:px-7 text-sm md:text-[15px] font-bold cursor-pointer whitespace-nowrap transition-colors duration-200 hover:bg-gray-800"
            onClick={() => go(search)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Search <FiArrowRight />
          </motion.button>
        </motion.div>

        {/* hot searches */}
        <motion.div className="flex items-center gap-2 flex-wrap justify-center" {...stagger(3)}>
          <span className="flex items-center gap-[5px] text-xs font-semibold text-gray-400 uppercase tracking-[0.05em] whitespace-nowrap">
            <FiTrendingUp /> Trending:
          </span>
          {HOT_SEARCHES.map((h) => (
            <button
              key={h}
              className="bg-gray-100 border border-gray-200 rounded-full py-1.5 px-3.5 text-sm font-medium text-gray-900 cursor-pointer transition-all duration-150 hover:bg-gray-200 hover:border-gray-300"
              onClick={() => go(h)}
            >
              {h}
            </button>
          ))}
        </motion.div>
      </section>

      {/* CATEGORIES */}
      <section className="py-6 md:py-8 px-4 md:px-5 border-b border-gray-200">
        <div className="flex items-center gap-6 mb-5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gray-900 m-0 whitespace-nowrap">
            Shop by category
          </h2>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.label}
              className="flex flex-col items-center gap-2 py-3 md:py-4 px-2 pb-3 bg-gray-100 border border-transparent rounded-xl cursor-pointer transition-all duration-200 hover:border-gray-200 hover:bg-white"
              style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
              onClick={() => go(cat.q)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xl md:text-2xl leading-none">{cat.emoji}</span>
              <span className="text-[10px] md:text-xs font-bold text-[var(--cat-color)] uppercase tracking-[0.04em]">
                {cat.label}
              </span>
              <FiArrowRight className="text-xs text-gray-400 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* HOT DEALS */}
      <section className="py-6 md:py-8 px-4 md:px-5 border-b border-gray-200">
        <div className="flex items-center gap-6 mb-5">
          <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-gray-900 m-0 whitespace-nowrap">
            Hot deals
          </h2>
          <span className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* big banner */}
          <motion.div
            className="rounded-2xl p-5 relative overflow-hidden flex flex-col gap-2 bg-gray-100 min-h-[200px] md:min-h-[240px] cursor-pointer"
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.3 }}
            onClick={() => go('laptop')}
          >
            <div className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.06em] text-gray-900 bg-white rounded-full py-1 px-2.5 self-start">
              🔥 Up to 30% off
            </div>
            <div className="text-2xl md:text-[30px] font-black italic text-black leading-[1.05] uppercase tracking-[-0.02em]">
              Laptops &<br />
              MacBooks
            </div>
            <div className="text-sm text-gray-500 font-normal max-w-[240px]">
              Shop the best deals on premium laptops
            </div>
            <button className="inline-flex items-center gap-1.5 mt-2 bg-black text-white border-none rounded-full py-2.5 px-5 text-[13px] font-bold cursor-pointer self-start transition-colors duration-200 hover:bg-gray-800">
              Shop now <FiArrowRight />
            </button>
            <div className="absolute right-6 bottom-4 text-[56px] opacity-[0.15] leading-none pointer-events-none select-none hidden md:block">
              💻
            </div>
          </motion.div>

          {/* 2 stacked banners */}
          <div className="flex flex-col gap-4 max-lg:flex-row">
            <motion.div
              className="rounded-2xl p-5 relative overflow-hidden flex flex-col gap-2 bg-gray-100 flex-1 min-h-[110px] cursor-pointer"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              onClick={() => go('mobile')}
            >
              <div className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.06em] text-gray-900 bg-white rounded-full py-1 px-2.5 self-start">
                ⚡ New arrivals
              </div>
              <div className="text-lg md:text-xl font-black italic text-black leading-[1.05] uppercase tracking-[-0.02em]">
                Mobiles
              </div>
              <div className="text-sm text-gray-500 font-normal max-w-[240px]">
                iPhone, Samsung & more
              </div>
              <div className="absolute right-4 bottom-2.5 text-[40px] opacity-[0.15] leading-none pointer-events-none select-none">
                📱
              </div>
            </motion.div>

            <motion.div
              className="rounded-2xl p-5 relative overflow-hidden flex flex-col gap-2 bg-gray-100 flex-1 min-h-[110px] cursor-pointer"
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.3 }}
              onClick={() => go('watch')}
            >
              <div className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.06em] text-gray-900 bg-white rounded-full py-1 px-2.5 self-start">
                🎯 Best sellers
              </div>
              <div className="text-lg md:text-xl font-black italic text-black leading-[1.05] uppercase tracking-[-0.02em]">
                Wearables
              </div>
              <div className="text-sm text-gray-500 font-normal max-w-[240px]">
                Watches & fitness bands
              </div>
              <div className="absolute right-4 bottom-2.5 text-[40px] opacity-[0.15] leading-none pointer-events-none select-none">
                ⌚
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
