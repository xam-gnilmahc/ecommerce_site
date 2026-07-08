import React, { useState, useRef, useEffect } from 'react';
import Filters from './Filter';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating-high', label: 'Rating: High to Low' },
  { value: 'rating-low', label: 'Rating: Low to High' },
  { value: 'name-az', label: 'Name: A to Z' },
  { value: 'name-za', label: 'Name: Z to A' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const SortBar = ({ sortBy, onSortChange, onApplyFilters, searchQuery, totalProducts }) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between py-3 mb-2 border-b border-gray-100 max-md:flex-col max-md:gap-3 max-md:items-stretch">
      <span className="text-sm text-gray-400 font-medium">
        Showing <span className="text-gray-900 font-semibold">{totalProducts}</span> products
      </span>

      <div className="flex items-center gap-3 max-md:justify-between">
        <div className="flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 3h10v2H11z" />
            <path d="M11 7h7v2h-7z" />
            <path d="M11 11h4v2h-4z" />
            <rect x="3" y="3" width="5" height="5" rx="1" />
            <rect x="3" y="11" width="5" height="5" rx="1" />
            <rect x="3" y="19" width="5" height="5" rx="1" />
          </svg>
          <select
            className="py-1.5 px-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white cursor-pointer outline-none transition-all duration-200 focus:border-gray-400 hover:border-gray-400 min-w-[150px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%226%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat pr-7"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 py-1.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white cursor-pointer outline-none transition-all duration-200 hover:border-gray-400 hover:text-gray-900"
            onClick={() => setFilterOpen((prev) => !prev)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="18" y2="12" />
              <line x1="10" y1="18" x2="16" y2="18" />
            </svg>
            Filters
          </button>

          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 z-50"
              style={{ opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.15s ease, transform 0.15s ease' }}
            >
              <div className="bg-white border border-gray-100 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.12)] p-3 w-[270px] max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <h4 className="m-0 text-xs font-semibold text-gray-900">Filters</h4>
                  <button
                    className="text-[11px] text-gray-400 hover:text-gray-900 bg-transparent border-none cursor-pointer transition-colors duration-150 p-0"
                    onClick={() => setFilterOpen(false)}
                  >
                    Done
                  </button>
                </div>
                <Filters onApplyFilters={(filters) => { onApplyFilters(filters); setFilterOpen(false); }} searchQuery={searchQuery} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SortBar;
