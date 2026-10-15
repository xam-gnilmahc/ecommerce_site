import React from 'react';
import './SortBar.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Featured' },
  { value: 'rating-high', label: 'Best selling' },
  { value: 'price-low', label: 'Price, low to high' },
  { value: 'price-high', label: 'Price, high to low' },
  { value: 'name-az', label: 'Alphabetically, A-Z' },
  { value: 'name-za', label: 'Alphabetically, Z-A' },
  { value: 'newest', label: 'Date, new to old' },
  { value: 'oldest', label: 'Date, old to new' },
];

const SortBar = ({ sortBy, onSortChange }) => {
  return (
    <div className="sort-options" role="radiogroup" aria-label="Sort by">
      {SORT_OPTIONS.map((opt) => (
        <label className="sort-option" key={opt.value}>
          <input
            type="radio"
            name="sort-by"
            value={opt.value}
            checked={sortBy === opt.value}
            onChange={() => onSortChange(opt.value)}
          />
          <span className="sort-option__radio" aria-hidden="true" />
          <span className="sort-option__label">{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

export default SortBar;
