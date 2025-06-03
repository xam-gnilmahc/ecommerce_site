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
  const [brandsData] = useState([
    { name: "Apple", count: 24 },
    { name: "Google", count: 3 },
    { name: "Vivo", count: 1 },
    { name: "Samsung", count: 12 },
    { name: "Redmi", count: 14 },
    { name: "Huawei", count: 5 },
  ]);

  const handleColorChange = (color) => {
    setSelectedColors((prevColors) =>
      prevColors.includes(color)
        ? prevColors.filter((c) => c !== color)
        : [...prevColors, color]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands((prevBrands) =>
      prevBrands.includes(brand)
        ? prevBrands.filter((b) => b !== brand)
        : [...prevBrands, brand]
    );
  };

  const handleCategoryChange = (size) => {
    setSelectedCategory((prevSizes) =>
      prevSizes.includes(size)
        ? prevSizes.filter((s) => s !== size)
        : [...prevSizes, size]
    );
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filteredBrands = brandsData.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    const filters = {
      brands: selectedBrands,
      priceRange: value,
      category: selectedCategory,
      colors: selectedColors,
    };

    console.log(filters);
    onApplyFilters(filters);
  };

  return (
    <div className="filterSection">
      {/* Colors */}
      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<IoIosArrowDown size={20} />}
          aria-controls="colors-content"
          id="colors-header"
          sx={{ padding: 0, marginBottom: 2 }}
        >
          <h5 className="filterHeading">Colors</h5>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <div className="filterColorBtn">
            {filterColors.map((color, index) => (
              <button
                key={index}
                className={`colorButton ${
                  selectedColors.includes(color) ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Categories */}
      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<IoIosArrowDown size={20} />}
          aria-controls="category-content"
          id="category-header"
          sx={{ padding: 0, marginBottom: 2 }}
        >
          <h5 className="filterHeading">Category</h5>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <div className="sizeButtons">
            {filterCategories.map((category, index) => (
              <button
                key={index}
                className={`sizeButton ${
                  selectedCategory.includes(category) ? "selected" : ""
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Brands */}
      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<IoIosArrowDown size={20} />}
          aria-controls="brands-content"
          id="brands-header"
          sx={{ padding: 0, marginBottom: 2 }}
        >
          <h5 className="filterHeading">Brands</h5>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <div className="searchBar">
            <BiSearch className="searchIcon" size={20} color={"#767676"} />
            <input
              type="text"
              placeholder="Search brands"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="brandList">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand, index) => (
                <div className="brandItem" key={index}>
                  <input
                    type="checkbox"
                    name="brand"
                    id={`brand-${index}`}
                    className="brandRadio"
                    onChange={() => handleBrandChange(brand.name)}
                    checked={selectedBrands.includes(brand.name)}
                  />
                  <label htmlFor={`brand-${index}`} className="brandLabel">
                    {brand.name}
                  </label>
                  <span className="brandCount">{brand.count}</span>
                </div>
              ))
            ) : (
              <div className="notFoundMessage">No brands found</div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      {/* Price */}
      <Accordion defaultExpanded disableGutters elevation={0}>
        <AccordionSummary
          expandIcon={<IoIosArrowDown size={20} />}
          aria-controls="price-content"
          id="price-header"
          sx={{ padding: 0, marginBottom: 2 }}
        >
          <h5 className="filterHeading">Price</h5>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <Slider
            getAriaLabel={() => "Price range"}
            value={value}
            onChange={handleChange}
            min={0}
            max={10000}
            valueLabelDisplay="auto"
            valueLabelFormat={(val) => `$${val}`}
            sx={{
              color: "#0B2472",
              "& .MuiSlider-thumb": {
                backgroundColor: "white",
                border: "2px solid #0B2472",
                width: 18,
                height: 18,
              },
              "& .MuiSlider-rail": {
                opacity: 0.5,
                backgroundColor: "#282828",
              },
            }}
          />
          <div className="filterSliderPrice">
            <p>
              Min Price: <span>${value[0]}</span>
            </p>
            <p>
              Max Price: <span>${value[1]}</span>
            </p>
          </div>
        </AccordionDetails>
      </Accordion>

      <button onClick={handleApplyFilters} className="applyFilterBtn">
        Apply Filters
      </button>
    </div>
  );
};

export default Filter;
