import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { IoIosArrowDown } from 'react-icons/io';
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

  // close on outside click
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

  const brandsData = [
    { name: 'Apple', count: 24 },
    { name: 'Google', count: 3 },
    { name: 'Vivo', count: 1 },
    { name: 'Samsung', count: 12 },
    { name: 'Redmi', count: 14 },
    { name: 'Huawei', count: 5 },
  ];

  const filterCategories = [
    'Mobile',
    'Laptop',
    'Watch',
    'Earbuds',
    'Tablet',
    'Monitor',
    'Keyboard',
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

  const accordionProps = {
    defaultExpanded: true,
    disableGutters: true,
    elevation: 0,
    square: true,
    sx: {
      boxShadow: 'none',
      border: 'none',
      '&:before': { display: 'none' },
    },
  };

  const accordionSummarySX = {
    padding: 0,
    margin: 0,
    minHeight: 0,
    '& .MuiAccordionSummary-content': { margin: 0 },
  };

  const accordionDetailsSX = { padding: 0, margin: 0 };

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
          {/* COLORS */}
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<IoIosArrowDown />} sx={accordionSummarySX}>
              <h5 className="filterHeading">Colors</h5>
            </AccordionSummary>
            <AccordionDetails sx={accordionDetailsSX}>
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
            </AccordionDetails>
          </Accordion>

          {/* CATEGORY */}
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<IoIosArrowDown />} sx={accordionSummarySX}>
              <h5 className="filterHeading">Category</h5>
            </AccordionSummary>
            <AccordionDetails sx={accordionDetailsSX}>
              <div className="sizeButtons">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`sizeButton ${selectedCategory.includes(cat) ? 'selected' : ''}`}
                    onClick={() =>
                      setSelectedCategory((prev) =>
                        prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </AccordionDetails>
          </Accordion>

          {/* BRANDS */}
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<IoIosArrowDown />} sx={accordionSummarySX}>
              <h5 className="filterHeading">Brands</h5>
            </AccordionSummary>
            <AccordionDetails sx={accordionDetailsSX}>
              <div className="searchBar">
                <BiSearch className="searchIcon" />
                <input
                  placeholder="Search brands"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="brandList">
                {filteredBrands.map((brand) => (
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
            </AccordionDetails>
          </Accordion>

          {/* PRICE */}
          <Accordion {...accordionProps}>
            <AccordionSummary expandIcon={<IoIosArrowDown />} sx={accordionSummarySX}>
              <h5 className="filterHeading">Price</h5>
            </AccordionSummary>
            <AccordionDetails sx={accordionDetailsSX}>
              <Slider
                value={value}
                onChange={(e, val) => setValue(val)}
                min={0}
                max={10000}
                valueLabelDisplay="auto"
              />
            </AccordionDetails>
          </Accordion>
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
