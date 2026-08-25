import React, { useState, useEffect, useRef } from 'react';
import './Filter.css';

import { IoIosArrowForward, IoIosArrowDown, IoClose } from 'react-icons/io';
import { FiFilter } from 'react-icons/fi';

const Filter = ({ onApplyFilters }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setExpandedCategory(null);
        setIsOpen(false);
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

  const handleCategoryClick = (menuId) => {
    setExpandedCategory(expandedCategory === menuId ? null : menuId);
  };

  const handleItemClick = (item) => {
    const newSelected = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];
    setSelectedItems(newSelected);
    onApplyFilters({ category: newSelected });
  };

  const activeMenu = filterMenu.find((m) => m.id === expandedCategory);

  return (
    <div className="filterContainer" ref={wrapRef}>
      <button
        className={`filterToggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiFilter size={16} />
        <span>Filters</span>
        {selectedItems.length > 0 && <span className="filterCount">{selectedItems.length}</span>}
      </button>

      {isOpen && (
        <div className="filterPanel">
          <div className="filterPanelHeader">
            <h3>Categories</h3>
            <button
              className="filterClose"
              onClick={() => {
                setIsOpen(false);
                setExpandedCategory(null);
              }}
            >
              <IoClose size={18} />
            </button>
          </div>

          <div className="filterPanelBody">
            <div className="filterCategoryList">
              {filterMenu.map((menu) => (
                <button
                  key={menu.id}
                  className={`filterCategoryItem ${expandedCategory === menu.id ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick(menu.id)}
                >
                  <span className="filterCategoryIcon">{menu.icon}</span>
                  <span className="filterCategoryLabel">{menu.label}</span>
                  {expandedCategory === menu.id ? (
                    <IoIosArrowDown className="filterCategoryArrow" />
                  ) : (
                    <IoIosArrowForward className="filterCategoryArrow" />
                  )}
                </button>
              ))}
            </div>

            {activeMenu && (
              <div className="filterSubPanel">
                <div className="filterSubPanelHeader">
                  <span className="filterSubPanelIcon">{activeMenu.icon}</span>
                  <h4>{activeMenu.label}</h4>
                </div>
                <div className="filterSubPanelGrid">
                  {activeMenu.items.map((item) => (
                    <button
                      key={item}
                      className={`filterSubItem ${selectedItems.includes(item) ? 'selected' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
