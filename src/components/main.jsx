import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Main.css";

const videos = ["/video/lol.mp4", "/video/tablet.mp4"];

const Home = () => {
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const navigate = useNavigate();

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
      {/* VIDEO */}

      {currentVideo && (
        <video
          className={`bgVideo ${loaded ? "show" : ""}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setLoaded(true)}
        >
          <source src={currentVideo} type="video/mp4" />
        </video>
      )}

      {/* OVERLAY */}

      <div className="overlay"></div>

      {/* CONTENT */}

      <motion.div
        className="heroContent"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <motion.p
          className="heroTag"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Premium Tech Collection
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Find Your Perfect Tech
        </motion.h1>

        <motion.p
          className="heroSubText"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Mobiles • Laptops • Accessories • Smart Deals
        </motion.p>

        <motion.div
          className="heroSearchBox"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <input
            type="text"
            placeholder="Search premium products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;