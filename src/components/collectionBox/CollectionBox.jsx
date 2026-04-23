import React, { useEffect, useRef, useState } from "react";
import "./CollectionBox.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CollectionBox = () => {
  const boxRef = useRef(null);
  const [inView, setInView] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 } // adjust as needed
    );
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boxRef} className={`collection ${inView ? "in-view" : ""}`}>
      {/* Row 1, Col 1 */}
      <div className="collectionLeft in-view">
        <p className="col-p">Hot List</p>
        <h3 className="col-h3">
          <span>Iphone</span> Collection
        </h3>
        <div className="col-link">
          <Link to="/shop" onClick={scrollToTop}>
            <h5>Shop Now</h5>
          </Link>
        </div>
      </div>

      {/* Row 1, Col 2 */}
      <div className="collectionTop in-view">
        <p className="col-p">Hot List</p>
        <h3 className="col-h3">
          <span>Ipad</span> Collection
        </h3>
        <div className="col-link">
          <Link to="/shop" onClick={scrollToTop}>
            <h5>Shop Now</h5>
          </Link>
        </div>
      </div>

      {/* Row 2, Col 1 */}
      <div className="box1 in-view">
        <p className="col-p">Hot List</p>
        <h3 className="col-h3">
          <span>Watch</span> Collection
        </h3>
        <div className="col-link">
          <Link to="/shop" onClick={scrollToTop}>
            <h5>Shop Now</h5>
          </Link>
        </div>
      </div>

      {/* Row 2, Col 2 */}
      <div className="box2 in-view">
        <h3 className="col-h3">
          <span>E-gift</span> Cards
        </h3>
        <p className="col-p">Surprise someone with the gift they really want.</p>
        <div className="col-link">
          <Link to="/shop" onClick={scrollToTop}>
            <h5>Shop Now</h5>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionBox;
