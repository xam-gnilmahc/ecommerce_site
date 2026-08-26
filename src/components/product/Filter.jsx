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
} from 'react-icons/io';

const Filter = ({ onApplyFilters }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredBrand, setHoveredBrand] = useState(null);
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
        setHoveredBrand(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categoriesData = {
    Mobile: {
      icon: <IoIosPhonePortrait />,
      brands: {
        Apple: ['iPhone 15', 'iPhone 14', 'iPhone SE'],
        Samsung: ['Galaxy S24', 'Galaxy A54', 'Galaxy Z Flip'],
        Google: ['Pixel 8', 'Pixel 7a'],
        Redmi: ['Note 13', '13C', '12'],
        OnePlus: ['12', '11', 'Nord'],
      },
    },
    Laptop: {
      icon: <IoIosLaptop />,
      brands: {
        Apple: ['MacBook Air', 'MacBook Pro'],
        Dell: ['XPS 15', 'Inspiron', 'Latitude'],
        HP: ['Spectre', 'Envy', 'Pavilion'],
        Lenovo: ['ThinkPad', 'IdeaPad', 'Legion'],
        Asus: ['ROG', 'ZenBook', 'VivoBook'],
      },
    },
    Watch: {
      icon: <IoIosWatch />,
      brands: {
        Apple: ['Apple Watch Ultra', 'Apple Watch SE'],
        Samsung: ['Galaxy Watch 6', 'Galaxy Watch FE'],
        Garmin: ['Venu 3', 'Forerunner'],
        Fitbit: ['Versa 4', 'Sense 2'],
      },
    },
    Earbuds: {
      icon: <IoIosHeadset />,
      brands: {
        Apple: ['AirPods Pro', 'AirPods 3'],
        Samsung: ['Galaxy Buds 3', 'Galaxy Buds FE'],
        Sony: ['WF-1000XM5', 'LinkBuds'],
        Bose: ['QuietComfort Ultra', 'Sport Earbuds'],
        JBL: ['Tour Pro 2', 'Tune 230'],
      },
    },
    Tablet: {
      icon: <IoIosTabletLandscape />,
      brands: {
        Apple: ['iPad Pro', 'iPad Air', 'iPad Mini'],
        Samsung: ['Galaxy Tab S9', 'Galaxy Tab A9'],
        Lenovo: ['Tab P12', 'Tab M10'],
      },
    },
    Monitor: {
      icon: <IoIosDesktop />,
      brands: {
        Samsung: ['Odyssey G7', 'ViewFinity'],
        LG: ['UltraGear', 'UltraWide'],
        Dell: ['UltraSharp', 'Gaming'],
        Acer: ['Predator', 'Nitro'],
      },
    },
    Keyboard: {
      icon: <IoIosOptions />,
      brands: {
        Logitech: ['MX Keys', 'G Pro'],
        Razer: ['BlackWidow', 'Huntsman'],
        Corsair: ['K100', 'K70'],
        SteelSeries: ['Apex Pro', 'Apex 3'],
      },
    },
    Drones: {
      icon: <IoIosRadio />,
      brands: {
        DJI: ['Mavic 3', 'Mini 4', 'Air 3'],
        Nikon: ['KeyMission'],
        GoPro: ['Karma'],
      },
    },
  };

  const handleCategoryHover = (category) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(category);
      setHoveredBrand(null);
    }, 80);
  };

  const handleCategoryLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setHoveredBrand(null);
    }, 150);
  };

  const handleBrandsEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleBrandsLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setHoveredBrand(null);
    }, 150);
  };

  const handleBrandHover = (brand) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredBrand(brand);
    }, 80);
  };

  const handleBrandLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setHoveredBrand(null);
    }, 150);
  };

  const handleSubCategoryEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleSubCategoryLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredBrand(null);
    }, 150);
  };

  const handleSubCategoryClick = (sub) => {
    setSelectedCategory(hoveredCategory);
    setSelectedBrand(hoveredBrand);
    onApplyFilters({
      brands: [hoveredBrand],
      category: [hoveredCategory],
      priceRange: null,
    });
    setIsOpen(false);
    setHoveredCategory(null);
    setHoveredBrand(null);
  };

  const brands = hoveredCategory ? Object.keys(categoriesData[hoveredCategory]?.brands || {}) : [];
  const subCategories =
    hoveredBrand && hoveredCategory
      ? categoriesData[hoveredCategory]?.brands[hoveredBrand] || []
      : [];
  const activeCount = selectedCategory ? 1 : 0;

  return (
    <div className="filterContainer" ref={wrapRef}>
      <div
        className={`filterMenuButton ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filterMenuIcon">☰</span>
        <span>All</span>
      </div>

      {isOpen && (
        <div className="filterSidebar">
          {/* CATEGORIES */}
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

          {/* BRANDS */}
          {hoveredCategory && (
            <div
              className="filterBrandColumn"
              onMouseEnter={handleBrandsEnter}
              onMouseLeave={handleBrandsLeave}
            >
              {brands.map((brand) => (
                <div
                  key={brand}
                  className={`filterBrandRow ${hoveredBrand === brand ? 'hovered' : ''} ${selectedBrand === brand ? 'selected' : ''}`}
                  onMouseEnter={() => handleBrandHover(brand)}
                  onMouseLeave={handleBrandLeave}
                >
                  <span className="filterBrandName">{brand}</span>
                  <IoIosArrowForward className="filterBrandArrow" />
                </div>
              ))}
            </div>
          )}

          {/* SUB CATEGORIES */}
          {hoveredBrand && subCategories.length > 0 && (
            <div
              className="filterSubCategoryColumn"
              onMouseEnter={handleSubCategoryEnter}
              onMouseLeave={handleSubCategoryLeave}
            >
              {subCategories.map((sub) => (
                <button
                  key={sub}
                  className="filterSubCategoryItem"
                  onClick={() => handleSubCategoryClick(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filter;
