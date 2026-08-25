import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { BiSearch } from 'react-icons/bi';
import { FiFilter } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import Slider from '@mui/material/Slider';

const Filter = ({ onApplyFilters, searchQuery }) => {
  const [value, setValue] = useState([0, 2000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [openSections, setOpenSections] = useState({
    category: true,
    brands: true,
    price: true,
    colors: true,
  });
  const [showAllBrands, setShowAllBrands] = useState(false);

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (searchQuery) {
      setSelectedBrands([]);
      setSelectedCategory([]);
      setSelectedColors([]);
      setSearchTerm('');
      setValue([0, 2000]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    setActiveCount(selectedBrands.length + selectedCategory.length + selectedColors.length);
  }, [selectedBrands, selectedCategory, selectedColors]);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const brandsData = [
    { name: 'Apple', count: 24 },
    { name: 'Google', count: 3 },
    { name: 'Vivo', count: 1 },
    { name: 'Samsung', count: 12 },
    { name: 'Redmi', count: 14 },
    { name: 'Huawei', count: 5 },
  ];

  const filterCategories = [
    { name: 'Mobile', subcategories: ['iPhone', 'Samsung Galaxy', 'Pixel'] },
    { name: 'Laptop', subcategories: ['MacBook', 'ThinkPad', 'Chromebook'] },
    { name: 'Watch', subcategories: ['Apple Watch', 'Galaxy Watch', 'Fitbit'] },
    { name: 'Earbuds', subcategories: ['AirPods', 'Galaxy Buds', 'Pixel Buds'] },
    { name: 'Tablet', subcategories: ['iPad', 'Galaxy Tab', 'Pixel Tablet'] },
    { name: 'Monitor', subcategories: ['4K', 'Ultrawide', 'Portable'] },
    { name: 'Keyboard', subcategories: ['Mechanical', 'Wireless', 'Gaming'] },
  ];

  const filterColors = [
    '#0B2472',
    '#D6BB4F',
    '#282828',
    '#B0D6E8',
    '#9C7539',
    '#D29B47',
    '#E5AE95',
    '#D76B67',
    '#BABABA',
    '#BFDCC4',
  ];

  const handleApplyFilters = () => {
    onApplyFilters({
      brands: selectedBrands,
      priceRange: value,
      category: selectedCategory,
      colors: selectedColors,
    });
    setOpen(false);
  };

  const filteredBrands = brandsData.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 5);

  return (
    <div className="filterWrap" ref={wrapRef}>
      <button
        className={`filterToggleBtn ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <FiFilter size={15} />
        Filters
        {activeCount > 0 && <span className="filterBadge">{activeCount}</span>}
      </button>

      <div className={`filterPopup ${open ? 'open' : ''}`}>
        <div className="filterHeader">
          <h4>
            Filters
            {activeCount > 0 && <span className="filterHeaderCount">{activeCount}</span>}
          </h4>
          <button className="closeBtn" onClick={() => setOpen(false)} aria-label="Close filters">
            <IoClose />
          </button>
        </div>

        <div className="filterPopupBody">
          {/* CATEGORY */}
          <div className="filterSection">
            <button className="filterSectionHeader" onClick={() => toggleSection('category')}>
              <h5 className="filterHeading">Category</h5>
              {openSections.category ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openSections.category && (
              <div className="filterSectionContent">
                {filterCategories.map((cat) => (
                  <div key={cat.name} className="categoryItem">
                    <button
                      className={`categoryBtn ${selectedCategory.includes(cat.name) ? 'selected' : ''}`}
                      onClick={() =>
                        setSelectedCategory((prev) =>
                          prev.includes(cat.name)
                            ? prev.filter((c) => c !== cat.name)
                            : [...prev, cat.name]
                        )
                      }
                    >
                      {cat.name}
                    </button>
                    {cat.subcategories && (
                      <div className="subcategoryList">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub}
                            className={`subcategoryBtn ${selectedCategory.includes(sub) ? 'selected' : ''}`}
                            onClick={() =>
                              setSelectedCategory((prev) =>
                                prev.includes(sub) ? prev.filter((c) => c !== sub) : [...prev, sub]
                              )
                            }
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BRANDS */}
          <div className="filterSection">
            <button className="filterSectionHeader" onClick={() => toggleSection('brands')}>
              <h5 className="filterHeading">Brands</h5>
              {openSections.brands ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openSections.brands && (
              <div className="filterSectionContent">
                <div className="searchBar">
                  <BiSearch className="searchIcon" />
                  <input
                    placeholder="Search brands"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="brandList">
                  {displayedBrands.map((brand) => (
                    <label className="brandItem" key={brand.name}>
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.name)}
                        onChange={() =>
                          setSelectedBrands((prev) =>
                            prev.includes(brand.name)
                              ? prev.filter((b) => b !== brand.name)
                              : [...prev, brand.name]
                          )
                        }
                      />
                      <span>{brand.name}</span>
                      <small>{brand.count}</small>
                    </label>
                  ))}
                </div>
                {filteredBrands.length > 5 && (
                  <button className="showMoreBtn" onClick={() => setShowAllBrands(!showAllBrands)}>
                    {showAllBrands ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* PRICE */}
          <div className="filterSection">
            <button className="filterSectionHeader" onClick={() => toggleSection('price')}>
              <h5 className="filterHeading">Price</h5>
              {openSections.price ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openSections.price && (
              <div className="filterSectionContent">
                <Slider
                  value={value}
                  onChange={(e, val) => setValue(val)}
                  min={0}
                  max={10000}
                  valueLabelDisplay="auto"
                />
              </div>
            )}
          </div>

          {/* COLORS */}
          <div className="filterSection">
            <button className="filterSectionHeader" onClick={() => toggleSection('colors')}>
              <h5 className="filterHeading">Colors</h5>
              {openSections.colors ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {openSections.colors && (
              <div className="filterSectionContent">
                <div className="filterColorBtn">
                  {filterColors.map((color) => (
                    <button
                      key={color}
                      style={{ backgroundColor: color }}
                      className={selectedColors.includes(color) ? 'selected' : ''}
                      onClick={() =>
                        setSelectedColors((prev) =>
                          prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="filterPopupFooter">
          <button
            className="clearFilterBtn"
            onClick={() => {
              setSelectedBrands([]);
              setSelectedCategory([]);
              setSelectedColors([]);
              setValue([0, 2000]);
              setSearchTerm('');
              setShowAllBrands(false);
            }}
          >
            Clear
          </button>
          <button className="applyFilterBtn" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
