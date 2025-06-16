import React , {useEffect,useState,useRef} from "react";
import "./Banner.css";

import { Link } from "react-router-dom";

const Banner = () => {
    const timerRef = useRef(null);
    const [inView, setInView] = useState(false);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


   useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
  
    if (timerRef.current) observer.observe(timerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
           ref={timerRef}
      className={`banner bg-slide ${inView ? "in-view" : ""}`}
      >
        <div className="bannerLeft">
          <h6 className="bannerh6"  style={{ color: "black" }}>Starting At $1999</h6>
          <h3 className="bannerh3" style={{ color: "black" }}>Samsung Zfold series</h3>
          <h5 className="bannerh5"  style={{ color: "black" }}>
            <Link to="/shop" onClick={scrollToTop} style={{ color: "black" }}>
              Shop Now
            </Link>
          </h5>
        </div>
        <div className="bannerRight">
          <h6 className="bannerh6" style={{ color: "black" }}>
            Starting At $1499
          </h6>
          <h3 className="bannerh3" style={{ color: "black" }}>
            Microsoft Surface Duo
          </h3>
          <h5 className="bannerh5">
            <Link to="/shop" onClick={scrollToTop} style={{ color: "black" }}>
              Shop Now
            </Link>
          </h5>
        </div>
      </div>
    </>
  );
};

export default Banner;