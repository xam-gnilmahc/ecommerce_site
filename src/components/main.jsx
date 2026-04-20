import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

const videos = [
  "/video/lol.mp4",
  "/video/tablet.mp4",
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const navigate = useNavigate();

  // pick random ONLY once (on refresh)
  useEffect(() => {
    const randomVideo =
      videos[Math.floor(Math.random() * videos.length)];
    setCurrentVideo(randomVideo);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      if (!search.trim()) return;
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="heroSearchFull">
      {currentVideo && (
        <video
          className={`bgVideo ${loaded ? "show" : ""}`}
          autoPlay
          loop
          muted
          playsInline
          preload="none" 
          onLoadedData={() => setLoaded(true)}
        >
          <source src={currentVideo} type="video/mp4" />
        </video>
      )}

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