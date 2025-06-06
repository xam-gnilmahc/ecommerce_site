import React, { useState, useEffect } from "react";

const Popup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleResize = () => setShowPopup(window.innerWidth >= 576);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => { setFadeOut(true); setTimeout(() => setShowPopup(false), 300); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  return showPopup && (
    <div className={`position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-start ${fadeOut ? "opacity-0" : "opacity-100"}`} style={{ zIndex: 1050, paddingTop: "10px", transition: "opacity 0.3s ease" }}>
      <div className="bg-white rounded shadow-lg p-2 position-relative text-center" style={{ maxWidth: "600px", width: "90%", transition: "opacity 0.3s ease" }}>
        <button className="btn-close position-absolute top-0 end-0 m-2" onClick={() => { setFadeOut(true); setTimeout(() => setShowPopup(false), 300); }} aria-label="Close"></button>
        <h5 className="fw-bold text-danger mb-3">🚧 Ongoing Development</h5>
        <p className="text-muted mb-3">This application is currently under development and is not yet live.</p>
      </div>
    </div>
  );
};

export default Popup;
