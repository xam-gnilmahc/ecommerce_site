import React from 'react';
import './SortBar.css';

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

const SortBar = ({ sortBy, onSortChange, totalProducts }) => {
  return (
    <div className="sort-bar">
      <div className="sort-bar-left">
        <span className="sort-bar-count">{totalProducts} products</span>
      </div>
      <div className="sort-bar-right">
        <select
          className="sort-bar-select"
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
    </div>
  );
};

export default SortBar;
