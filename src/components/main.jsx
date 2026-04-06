import { Link } from "react-router-dom";
import "./Main.css";

const Home = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="heroMain">
      <div className="sectionleft">
        <p>New Season Arrivals</p>
        <h1>
          Google
          <br />
          Pixel 7 Pro
        </h1>
        <span className="hero-subtitle">
          Discover our latest collection and best deals of the season.
        </span>
        <div className="heroLink">
          <Link to="/product" onClick={scrollToTop}>
            <h5>Discover More</h5>
          </Link>
        </div>
      </div>
      <div className="sectionright" />
    </div>
  );
};

export default Home;
