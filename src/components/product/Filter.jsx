import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import { IoIosFunnel, IoIosArrowForward } from 'react-icons/io';

const Filter = ({ onApplyFilters }) => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
        setHoveredBrand(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const brandsData = {
    Apple: ['Mobile', 'Laptop', 'Watch', 'Tablet'],
    Google: ['Mobile', 'Tablet', 'Earbuds'],
    Samsung: ['Mobile', 'Laptop', 'Watch', 'Tablet', 'Monitor'],
    Redmi: ['Mobile', 'Laptop', 'Watch', 'Earbuds'],
    Nothing: ['Mobile', 'Earbuds'],
    Acer: ['Laptop', 'Monitor', 'Keyboard'],
    Bose: ['Earbuds'],
    Sony: ['Mobile', 'Watch', 'Earbuds', 'Monitor'],
    Nikon: ['Drones'],
    Nvidia: ['Monitor'],
    Amazon: ['Mobile', 'Tablet', 'Watch', 'Earbuds'],
  };

  const handleBrandHover = (brand) => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredBrand(brand);
    }, 80);
  };

  const handleBrandLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredBrand(null);
    }, 150);
  };

  const handleFlyoutEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  const handleFlyoutLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredBrand(null);
    }, 150);
  };

  const handleCategoryClick = (category) => {
    if (selectedBrand === hoveredBrand && selectedCategory === category) {
      setSelectedBrand(null);
      setSelectedCategory(null);
      onApplyFilters({ brands: [], category: [], priceRange: null });
    } else {
      setSelectedBrand(hoveredBrand);
      setSelectedCategory(category);
      onApplyFilters({ brands: [hoveredBrand], category: [category], priceRange: null });
    }
  };

  const categories = hoveredBrand ? brandsData[hoveredBrand] || [] : [];
  const activeCount = selectedCategory ? 1 : 0;

  return (
    <div className="filterContainer" ref={wrapRef}>
      <button
        className={`filterToggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IoIosFunnel size={16} />
        <span>Filters</span>
        {activeCount > 0 && <span className="filterCount">{activeCount}</span>}
      </button>

      {isOpen && (
        <div className="filterPanel">
          <div className="filterBrandsList">
            {Object.keys(brandsData).map((brand) => (
              <div
                key={brand}
                className={`filterBrandItem ${selectedBrand === brand ? 'selected' : ''} ${hoveredBrand === brand ? 'hovered' : ''}`}
                onMouseEnter={() => handleBrandHover(brand)}
                onMouseLeave={handleBrandLeave}
              >
                <span className="filterBrandName">{brand}</span>
                <IoIosArrowForward className="filterBrandArrow" />
              </div>
            ))}
          </div>

          {hoveredBrand && (
            <div
              className="filterCategoriesFlyout"
              onMouseEnter={handleFlyoutEnter}
              onMouseLeave={handleFlyoutLeave}
            >
              <h4 className="filterCategoriesTitle">{hoveredBrand}</h4>
              <div className="filterCategoriesList">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`filterCategoryItem ${selectedBrand === hoveredBrand && selectedCategory === category ? 'selected' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filter;
