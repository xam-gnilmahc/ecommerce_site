import React, { useState } from "react";
import "./Filter.css";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import Slider from "@mui/material/Slider";

const Filter = ({ onApplyFilters }) => {
  const [value, setValue] = useState([0, 2000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);

  const brandsData = [
    { name: "Apple", count: 24 },
    { name: "Google", count: 3 },
    { name: "Vivo", count: 1 },
    { name: "Samsung", count: 12 },
    { name: "Redmi", count: 14 },
    { name: "Huawei", count: 5 },
  ];

  const filterCategories = [
    "Mobile",
    "Laptop",
    "Earbuds",
    "Watch",
    "Tablet",
    "Monitor",
    "Keyboard",
  ];

  const filterColors = [
    "#0B2472",
    "#D6BB4F",
    "#282828",
    "#B0D6E8",
    "#9C7539",
    "#D29B47",
    "#E5AE95",
    "#D76B67",
    "#BABABA",
    "#BFDCC4",
  ];

  const handleApplyFilters = () => {
    onApplyFilters({
      brands: selectedBrands,
      priceRange: value,
      category: selectedCategory,
      colors: selectedColors,
    });
  };

  const filteredBrands = brandsData.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Accordion common props
  const accordionProps = {
    defaultExpanded: true,
    disableGutters: true,
    elevation: 0,
    square: true,
    sx: {
      boxShadow: "none",
      border: "none",
      "&:before": { display: "none" },
    },
  };

  const accordionSummarySX = {
    padding: 0,
    margin: 0,
    minHeight: 0,
    "& .MuiAccordionSummary-content": {
      margin: 0,
    },
  };

  const accordionDetailsSX = { padding: 0, margin: 0 };

  return (
    <aside className="filterSection">
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
                className={selectedColors.includes(color) ? "selected" : ""}
                onClick={() =>
                  setSelectedColors((prev) =>
                    prev.includes(color)
                      ? prev.filter((c) => c !== color)
                      : [...prev, color]
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
                className={`sizeButton ${
                  selectedCategory.includes(cat) ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedCategory((prev) =>
                    prev.includes(cat)
                      ? prev.filter((c) => c !== cat)
                      : [...prev, cat]
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
            {filteredBrands.length ? (
              filteredBrands.map((brand) => (
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
              ))
            ) : (
              <p className="notFoundMessage">No brands found</p>
            )}
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
          <div className="priceRange">
            <p>
              Min: <span>${value[0]}</span>
            </p>
            <p>
              Max: <span>${value[1]}</span>
            </p>
          </div>
        </AccordionDetails>
      </Accordion>

      <button className="applyFilterBtn" onClick={handleApplyFilters}>
        Apply Filters
      </button>
    </aside>
  );
};

export default Filter;
