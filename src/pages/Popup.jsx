import React, { useState, useEffect } from "react";
import popupImg from "../components/assets/ipad.webp";

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
 
  useEffect(() => {
    if (window.innerWidth < 576) {
      setShowPopup(false);
    }else{
    setShowPopup(true);
    };
  }, []);

  const handleClose = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 300);
  };

  return (
    showPopup && (
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50 ${
          fadeOut ? "fade" : ""
        }`}
        style={{ zIndex: 1050 }}
      >
        <div
          className="bg-white rounded shadow-lg p-4 container position-relative"
          style={{
            maxWidth: "800px",
            transition: "opacity 0.3s",
          }}
        >
          <button
            className="btn-close position-absolute top-0 end-0 m-1"
            onClick={handleClose}
          ></button>

          <div className="row g-4 align-items-center">
            {/* Image Section */}
            <div className="col-md-6 text-center">
              <img
                src={popupImg}
                alt="Newsletter"
                className="img-fluid rounded"
              />
            </div>

            {/* Text Section */}
            <div className="col-md-6">
              <div className="alert alert-warning d-flex align-items-center">
                🚧 This site is running in <strong className="ms-1">development mode</strong>.
              </div>
              <h4>Get the Best Deals on Mobile & Tablet Devices</h4>
              <p>
                Stay ahead with exclusive offers and latest arrivals in
                smartphones, tablets, smartwatches, and more!
              </p>
              <form className="d-flex flex-column gap-2">
                <input
                  type="email"
                  placeholder="Enter your email for offers"
                  className="form-control"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  GET OFFERS
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Popup;
