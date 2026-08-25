import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import { IoIosArrowForward } from 'react-icons/io';

const Filter = ({ onApplyFilters }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [value, setValue] = useState([0, 2000]);
  const wrapRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterMenu = [
    {
      id: 'brands',
      label: 'Shop By Brands',
      icon: '🏷️',
      items: [
        'Apple',
        'Samsung',
        'Google',
        'Sony',
        'Xiaomi',
        'OnePlus',
        'Huawei',
        'LG',
        'Dell',
        'HP',
        'Lenovo',
        'Asus',
        'Acer',
        'MSI',
        'Razer',
        'Microsoft',
        'JBL',
        'Bose',
        'Sennheiser',
        'Audio-Technica',
        'Marshall',
        'Nothing',
        'Realme',
        'Vivo',
        'Oppo',
        'Honor',
        'Motorola',
        'Nokia',
      ],
    },
    {
      id: 'laptops',
      label: 'Laptops & Computers',
      icon: '💻',
      items: [
        'MacBook',
        'ThinkPad',
        'Dell XPS',
        'HP Spectre',
        'Asus ROG',
        'MSI Gaming',
        'Surface',
        'Chromebook',
        'Mac Mini',
        'iMac',
      ],
    },
    {
      id: 'audio',
      label: 'Audio | Headphones',
      icon: '🎧',
      items: [
        'AirPods',
        'Galaxy Buds',
        'Sony WH',
        'Bose QC',
        'JBL Tune',
        'Sennheiser',
        'Marshall',
        'Beats',
        'Pixel Buds',
        'Nothing Ear',
      ],
    },
    {
      id: 'mobiles',
      label: 'Mobiles | Tablets',
      icon: '📱',
      items: [
        'iPhone',
        'Samsung Galaxy',
        'Pixel',
        'OnePlus',
        'Xiaomi',
        'iPad',
        'Galaxy Tab',
        'Surface Pro',
        'Lenovo Tab',
        'Realme',
      ],
    },
    {
      id: 'cameras',
      label: 'Cameras',
      icon: '📷',
      items: [
        'Canon',
        'Nikon',
        'Sony Alpha',
        'Fujifilm',
        'GoPro',
        'DJI',
        'Panasonic',
        'Leica',
        'Olympus',
        'Insta360',
      ],
    },
    {
      id: 'home',
      label: 'Home | Kitchen',
      icon: '🏠',
      items: [
        'Dyson',
        'iRobot',
        'Philips',
        'Braun',
        'Kenwood',
        'Ninja',
        'Instant Pot',
        'Ring',
        'Nest',
        'Alexa',
      ],
    },
    {
      id: 'fitness',
      label: 'Fitness | Health Care',
      icon: '⌚',
      items: [
        'Apple Watch',
        'Galaxy Watch',
        'Fitbit',
        'Garmin',
        'Whoop',
        'Oura',
        'Mi Band',
        'Amazfit',
        'Polar',
        'Withings',
      ],
    },
    {
      id: 'car',
      label: 'Car Accessories',
      icon: '🚗',
      items: [
        'Dash Cam',
        'Car Charger',
        'Phone Mount',
        'Bluetooth Adapter',
        'OBD Scanner',
        'GPS Tracker',
        'Seat Cover',
        'Floor Mats',
      ],
    },
    {
      id: 'gaming',
      label: 'Gaming',
      icon: '🎮',
      items: [
        'PS5',
        'Xbox',
        'Nintendo Switch',
        'Steam Deck',
        'Gaming Chair',
        'Controllers',
        'Headsets',
        'Keyboards',
        'Mouse',
        'Monitors',
      ],
    },
    {
      id: 'accessories',
      label: 'Computer Peripherals',
      icon: '🖱️',
      items: [
        'Keyboard',
        'Mouse',
        'Monitor',
        'Webcam',
        'Printer',
        'Scanner',
        'External SSD',
        'USB Hub',
        'Cable',
        'Adapter',
      ],
    },
  ];

  const handleMouseEnter = (menuId) => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(menuId);
    }, 100);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  const handleFlyoutMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  const handleItemClick = (item) => {
    const newCategory = selectedCategory.includes(item)
      ? selectedCategory.filter((c) => c !== item)
      : [...selectedCategory, item];
    setSelectedCategory(newCategory);
    onApplyFilters({
      brands: selectedBrands,
      priceRange: value,
      category: newCategory,
      colors: selectedColors,
    });
  };

  const activeMenu = filterMenu.find((m) => m.id === activeCategory);

  return (
    <div className="filterSidebarWrap" ref={wrapRef}>
      <div className="filterSidebar">
        {filterMenu.map((menu) => (
          <div
            key={menu.id}
            className={`filterSidebarItem ${activeCategory === menu.id ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(menu.id)}
            onMouseLeave={handleMouseLeave}
          >
            <span className="filterSidebarIcon">{menu.icon}</span>
            <span className="filterSidebarLabel">{menu.label}</span>
            <IoIosArrowForward className="filterSidebarArrow" />
          </div>
        ))}
      </div>

      {activeMenu && (
        <div
          className="filterFlyout"
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          <h4 className="filterFlyoutTitle">{activeMenu.label}</h4>
          <div className="filterFlyoutGrid">
            {activeMenu.items.map((item) => (
              <button
                key={item}
                className={`filterFlyoutItem ${selectedCategory.includes(item) ? 'selected' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
