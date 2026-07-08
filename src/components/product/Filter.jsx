import React, { useState, useEffect } from 'react';
import { BiSearch } from 'react-icons/bi';

const FILTER_CATEGORIES = ['Mobile', 'Laptop', 'Watch', 'Earbuds', 'Tablet', 'Monitor', 'Keyboard'];

const FILTER_COLORS = [
  { name: 'Navy', hex: '#0B2472' },
  { name: 'Gold', hex: '#D6BB4F' },
  { name: 'Black', hex: '#282828' },
  { name: 'Sky', hex: '#B0D6E8' },
  { name: 'Bronze', hex: '#9C7539' },
  { name: 'Amber', hex: '#D29B47' },
  { name: 'Rose', hex: '#E5AE95' },
  { name: 'Coral', hex: '#D76B67' },
  { name: 'Grey', hex: '#BABABA' },
  { name: 'Mint', hex: '#BFDCC4' },
];

const BRANDS_DATA = [
  { name: 'Apple', count: 24 },
  { name: 'Google', count: 3 },
  { name: 'Vivo', count: 1 },
  { name: 'Samsung', count: 12 },
  { name: 'Redmi', count: 14 },
  { name: 'Huawei', count: 5 },
];

const Filter = ({ onApplyFilters, searchQuery }) => {
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);

  useEffect(() => {
    if (searchQuery) {
      setSelectedBrands([]);
      setSelectedCategory([]);
      setSelectedColors([]);
      setBrandSearch('');
      setPriceRange([0, 2000]);
    }
  }, [searchQuery]);

  const toggleColor = (hex) => {
    setSelectedColors((prev) =>
      prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategory((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (name) => {
    setSelectedBrands((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  const filteredBrands = BRANDS_DATA.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const hasFilters =
    selectedColors.length > 0 ||
    selectedCategory.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 2000;

  const clearAll = () => {
    setSelectedColors([]);
    setSelectedCategory([]);
    setSelectedBrands([]);
    setBrandSearch('');
    setPriceRange([0, 2000]);
    onApplyFilters({ brands: [], priceRange: [0, 2000], category: [], colors: [] });
  };

  const applyFilters = () => {
    onApplyFilters({
      brands: selectedBrands,
      priceRange,
      category: selectedCategory,
      colors: selectedColors,
    });
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Colors */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          Color
        </p>
        <div className="flex flex-wrap gap-1">
          {FILTER_COLORS.map(({ name, hex }) => {
            const isSelected = selectedColors.includes(hex);
            return (
              <button
                key={hex}
                onClick={() => toggleColor(hex)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] transition-all duration-150 hover:border-gray-300 cursor-pointer"
                style={{
                  backgroundColor: isSelected ? '#f5f5f7' : '#fff',
                  borderColor: isSelected ? '#1d1d1f' : '#e5e5ea',
                }}
              >
                <span
                  className="w-3 h-3 rounded-full block shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span style={{ color: isSelected ? '#1d1d1f' : '#86868b' }}>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          Category
        </p>
        <div className="flex flex-wrap gap-1">
          {FILTER_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer"
                style={{
                  backgroundColor: isSelected ? '#1d1d1f' : '#f5f5f7',
                  color: isSelected ? '#fff' : '#86868b',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          Brand
        </p>
        <div className="relative mb-1.5">
          <BiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
          <input
            placeholder="Search brands"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full py-1 pl-7 pr-2.5 border border-gray-200 rounded-md bg-gray-50 text-[11px] outline-none transition-colors focus:border-gray-300 focus:bg-white placeholder:text-gray-300"
          />
        </div>
        <div className="flex flex-col max-h-[130px] overflow-y-auto">
          {filteredBrands.map((brand) => {
            const isSelected = selectedBrands.includes(brand.name);
            return (
              <label
                key={brand.name}
                className="flex items-center gap-2 py-1 px-1.5 rounded cursor-pointer transition-colors hover:bg-gray-50"
              >
                <span
                  onClick={() => toggleBrand(brand.name)}
                  className="w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? '#1d1d1f' : '#fff',
                    borderColor: isSelected ? '#1d1d1f' : '#d1d1d6',
                  }}
                >
                  {isSelected && (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="text-xs text-gray-700">{brand.name}</span>
                <span className="text-[10px] text-gray-300 ml-auto">{brand.count}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          Price
        </p>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-medium text-gray-900 min-w-[50px]">${priceRange[0]}</span>
          <span className="text-[10px] text-gray-300">—</span>
          <span className="text-xs font-medium text-gray-900 min-w-[50px]">${priceRange[1]}</span>
        </div>
        <div className="px-0.5">
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), priceRange[1] - 100);
              setPriceRange([val, priceRange[1]]);
            }}
            className="w-full h-0.5 rounded-full appearance-none cursor-pointer bg-gray-200 accent-gray-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), priceRange[0] + 100);
              setPriceRange([priceRange[0], val]);
            }}
            className="w-full h-0.5 rounded-full appearance-none cursor-pointer bg-gray-200 accent-gray-900 mt-[-2px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex-1 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-500 bg-white cursor-pointer transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            Clear
          </button>
        )}
        <button
          onClick={applyFilters}
          className="flex-1 py-1.5 rounded-md text-[11px] font-semibold text-white bg-gray-900 cursor-pointer transition-opacity hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default Filter;
