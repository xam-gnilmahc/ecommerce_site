import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

const Home = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (!search.trim()) return;
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="heroSearchFull">
      
      {/* 🎬 VIDEO BACKGROUND */}
      <video className="bgVideo" autoPlay loop muted playsInline  poster="/video/preview.jpg">
        <source src="/video/lol.mp4" type="video/mp4" />
      </video>

      {/* overlay */}
      <div className="overlay" />

      {/* content */}
      <div className="heroContent">
        <h1>Find Your Perfect Tech</h1>
        <p>Mobiles • Laptops • Accessories • Deals</p>

        <div className="heroSearchBox">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;