import React from "react";
import "./CollectionBox.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CollectionBox = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 60, scale: 1.05 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="collection">
      {/* iPhone */}
      <motion.div
        className="collectionLeft"
        custom={0}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="col-p">Hot List</p>
        <h3 className="col-h3">
          <span>Iphone</span> Collection
        </h3>

        <div className="col-link">
          <Link to="/search?q=iphone" onClick={scrollToTop}>
            <span className="shop-link">Shop Now</span>
          </Link>
        </div>
      </motion.div>

      {/* iPad */}
      <motion.div
        className="collectionTop"
        custom={1}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="col-p">Hot List</p>
        <h3 className="col-h3">
          <span>Ipad</span> Collection
        </h3>

        <div className="col-link">
          <Link to="/search?q=ipad" onClick={scrollToTop}>
            <span className="shop-link">Shop Now</span>
          </Link>
        </div>
      </motion.div>

      {/* Watch */}
      <motion.div
        className="box1"
        custom={2}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <p className="col-p">Hot List</p>
        <h3 className="col-h3">
          <span>Watch</span> Collection
        </h3>

        <div className="col-link">
          <Link to="/search?q=watch" onClick={scrollToTop}>
            <span className="shop-link">Shop Now</span>
          </Link>
        </div>
      </motion.div>

      {/* Gift */}
      <motion.div
        className="box2"
        custom={3}
        variants={cardVariant}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h3 className="col-h3">
          <span>Ear bud</span> Collection
        </h3>
        <p className="col-p">Surprise someone with the gift they really want.</p>

        <div className="col-link">
          <Link to="/search?q=earbud" onClick={scrollToTop}>
            <span className="shop-link">Shop Now</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CollectionBox;