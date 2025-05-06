import React, { useState } from "react";
import "./Popup.css";

import popupImg from "../components/assets/ipad.webp";

const Popup = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 300);
  };

  return (
    showPopup && (
      <div className="popup-overlay">
        <div className={`popup-content ${fadeOut ? "fade-out" : ""}`}>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
          <div className="popup-left">
            <img src={popupImg} alt="Newsletter" />
          </div>
          <div className="popup-right">
            <h2>Get the Best Deals on Mobile & Tablet Devices</h2>
            <p>
              Stay ahead with exclusive offers and latest arrivals in
              smartphones, tablets, smartwatches, and more!
            </p>
            <form>
              <input
                type="email"
                placeholder="Enter your email for offers"
                required
              />
              <button type="submit">GET OFFERS</button>
            </form>
          </div>
        </div>
      </div>
    )
  );
};

export default Popup;
