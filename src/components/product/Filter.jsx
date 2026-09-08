import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import {
  IoIosArrowForward,
  IoIosLaptop,
  IoIosWatch,
  IoIosHeadset,
  IoIosPhonePortrait,
  IoIosTabletLandscape,
  IoIosDesktop,
  IoIosOptions,
  IoIosRadio,
  IoIosMenu,
} from 'react-icons/io';
import { FiMousePointer } from 'react-icons/fi';

const Filter = ({ onApplyFilters }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoriesData = {
    Mobile: {
      icon: <IoIosPhonePortrait />,
      brands: ['Apple', 'Samsung', 'Google', 'Redmi', 'Oneplus', 'Nothing', 'Vivo'],
    },
    Laptop: {
      icon: <IoIosLaptop />,
      brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI'],
    },
    Watch: {
      icon: <IoIosWatch />,
      brands: ['Samsung', 'Apple', 'Google', 'Redmi', 'Huawei'],
    },
    Earbuds: {
      icon: <IoIosHeadset />,
      brands: [
        'Google',
        'Samsung',
        'Apple',
        'Oneplus',
        'Redmi',
        'Huawei',
        'Bose',
        'Sony',
        'Nothing',
        'Beats',
      ],
    },
    Tablet: {
      icon: <IoIosTabletLandscape />,
      brands: ['Apple', 'Samsung', 'Redmi', 'Google', 'Huawei', 'Vivo'],
    },
    Monitor: {
      icon: <IoIosDesktop />,
      brands: ['Apple'],
    },
    Keyboard: {
      icon: <IoIosOptions />,
      brands: ['Apple', 'Redmi', 'Huawei', 'Google'],
    },
    Drones: {
      icon: <IoIosRadio />,
      brands: ['Antman'],
    },
  };

  const handleCategoryHover = (category) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(category);
    }, 80);
  };

  const handleCategoryLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  const handleBrandsEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleBrandsLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  const handleBrandClick = (brand) => {
    setSelectedCategory(hoveredCategory);
    setSelectedBrand(brand);
    onApplyFilters({
      brands: [brand],
      category: [hoveredCategory],
      priceRange: null,
    });
  };

  const brands = hoveredCategory ? categoriesData[hoveredCategory]?.brands || [] : [];
  const activeCount = selectedCategory ? 1 : 0;

  return (
    <div className="filterContainer" ref={wrapRef}>
      <button
        className={`filterMenuButton ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        <IoIosMenu className="filterMenuIcon" />
        <span className="filterMenuLabel">Categories</span>
        {activeCount > 0 && <span className="filterMenuCount">{activeCount}</span>}
      </button>

      {isOpen && (
        <div className="filterSidebar">
          <div className="filterCategoryColumn">
            {Object.entries(categoriesData).map(([category, data]) => (
              <div
                key={category}
                className={`filterCategoryRow ${hoveredCategory === category ? 'hovered' : ''} ${selectedCategory === category ? 'selected' : ''}`}
                onMouseEnter={() => handleCategoryHover(category)}
                onMouseLeave={handleCategoryLeave}
              >
                <span className="filterCatIcon">{data.icon}</span>
                <span className="filterCatName">{category}</span>
                <IoIosArrowForward className="filterCatArrow" />
              </div>
            ))}
          </div>

          {hoveredCategory && (
            <div
              className="filterBrandColumn"
              onMouseEnter={handleBrandsEnter}
              onMouseLeave={handleBrandsLeave}
            >
              {brands.map((brand) => (
                <div
                  key={brand}
                  className={`filterBrandRow ${selectedBrand === brand && selectedCategory === hoveredCategory ? 'selected' : ''}`}
                  onClick={() => handleBrandClick(brand)}
                >
                  <span className="filterBrandName">{brand}</span>
                  <FiMousePointer className="filterBrandCursor" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filter;
