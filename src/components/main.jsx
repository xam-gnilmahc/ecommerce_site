import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import "./Main.css";

const images = [
  "https://www.apple.com/newsroom/images/product/iphone/standard/Apple-iPhone-14-iPhone-14-Plus-5up-hero-220907_Full-Bleed-Image.jpg.large.jpg",
];

const Home = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (!search.trim()) return;
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const quickTags = ["iPhone 15", "MacBook", "AirPods", "Samsung", "Gaming"];

  return (
    <div className="heroWrap">
      <div className="heroBg" />
      <div className="heroGrid" />
      <div className="heroGlow" />

      <div className="heroContent">
        <div className="heroBadge">
          <span className="heroDot" />
          Premium tech collection
        </div>

        <h1 className="heroTitle">
          Find your perfect <em>tech</em>
        </h1>

        <p className="heroSub">Mobiles · Laptops · Accessories · Smart deals</p>

        <div className="searchWrap">
          <FiSearch className="searchIcon" />
          <input
            type="text"
            placeholder="Search premium products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button className="searchBtn" onClick={handleSearchClick}>
            Search
          </button>
        </div>

        <div className="heroTags">
          {quickTags.map((tag) => (
            <div
              key={tag}
              className="heroTag"
              onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Home;