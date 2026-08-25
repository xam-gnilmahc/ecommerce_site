import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import { IoIosFunnel } from 'react-icons/io';

const Filter = ({ onApplyFilters }) => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const brands = [
    'Apple',
    'Google',
    'Samsung',
    'Redmi',
    'Nothing',
    'Acer',
    'Bose',
    'Sony',
    'Nikon',
    'Nvidia',
    'Amazon',
  ];

  const categories = [
    'Mobile',
    'Drones',
    'Watch',
    'Earbuds',
    'Laptop',
    'Tablet',
    'Monitor',
    'Keyboard',
  ];

  const handleBrandClick = (brand) => {
    const newBrand = selectedBrand === brand ? null : brand;
    setSelectedBrand(newBrand);
    onApplyFilters({
      brand: newBrand,
      category: selectedCategory,
    });
  };

  const handleCategoryClick = (category) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    onApplyFilters({
      brand: selectedBrand,
      category: newCategory,
    });
  };

  const activeFilters = (selectedBrand ? 1 : 0) + (selectedCategory ? 1 : 0);

  return (
    <div className="filterContainer" ref={wrapRef}>
      <button
        className={`filterToggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IoIosFunnel size={16} />
        <span>Filters</span>
        {activeFilters > 0 && <span className="filterCount">{activeFilters}</span>}
      </button>

      {isOpen && (
        <div className="filterPanel">
          <div className="filterColumns">
            {/* BRANDS COLUMN */}
            <div className="filterColumn">
              <h4 className="filterColumnTitle">Brands</h4>
              <div className="filterItemList">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    className={`filterItem ${selectedBrand === brand ? 'selected' : ''}`}
                    onClick={() => handleBrandClick(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORIES COLUMN */}
            <div className="filterColumn">
              <h4 className="filterColumnTitle">Categories</h4>
              <div className="filterItemList">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filterItem ${selectedCategory === category ? 'selected' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
