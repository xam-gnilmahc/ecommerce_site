import React, { useState, useRef } from "react";
import "./AdditionalInfo.css";

import user1 from "../components/assets/user-1.jpg";
import user2 from "../components/assets/user-2.jpg";

import { FaStar } from "react-icons/fa";
import Rating from "@mui/material/Rating";
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete icon
import IconButton from "@mui/material/IconButton";

const AdditionalInfo = () => {
  const [activeTab, setActiveTab] = useState("aiTab1");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const videoRefs = useRef([]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleFileChange = (files) => {
    const fileArray = Array.from(files);
    const updatedFiles = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setMediaFiles((prev) => [...prev, ...updatedFiles]);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(updatedFiles);
  };

  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('max');
    console.log("Submitted Review:", {
      rating,
      review,
      mediaFiles,
    });
  };
  return (
    <>
      <div className="productAdditionalInfo">
        <div className="productAdditonalInfoContainer">
          <div className="productAdditionalInfoTabs">
            <div className="aiTabs">
              <p
                onClick={() => handleTabClick("aiTab1")}
                className={activeTab === "aiTab1" ? "aiActive" : ""}
              >
                Description
              </p>
              <p
                onClick={() => handleTabClick("aiTab2")}
                className={activeTab === "aiTab2" ? "aiActive" : ""}
              >
                Additional Information
              </p>
              <p
                onClick={() => handleTabClick("aiTab3")}
                className={activeTab === "aiTab3" ? "aiActive" : ""}
              >
                Reviews (2)
              </p>
            </div>
          </div>
          <div className="productAdditionalInfoContent">
            {/* Tab1 - Description */}
            {activeTab === "aiTab1" && (
              <div className="aiTabDescription">
                <div className="descriptionPara">
                  <h3>Experience the Power of Innovation</h3>
                  <p>
                    Discover the next-gen smartphone built for speed,
                    performance, and style. Equipped with the latest processor,
                    high-resolution display, and long-lasting battery, this
                    device keeps you connected, productive, and entertained.
                  </p>
                </div>
                <div className="descriptionParaGrid">
                  <div className="descriptionPara">
                    <h3>Why choose this phone?</h3>
                    <ul>
                      <li>Powered by Octa-core 5nm Processor</li>
                      <li>AMOLED 120Hz Ultra HD Display</li>
                      <li>5G Connectivity & Dual SIM support</li>
                      <li>AI-Powered Quad Camera System</li>
                      <li>Fast Charging with 5000mAh Battery</li>
                    </ul>
                  </div>
                  <div className="descriptionPara">
                    <h3>Top Features</h3>
                    <ol>
                      <li>Face Unlock & In-display Fingerprint Sensor</li>
                      <li>Wireless Charging & Reverse Charging</li>
                      <li>Water & Dust Resistant (IP68 Certified)</li>
                    </ol>
                  </div>
                </div>
                <div className="descriptionPara">
                  <h3>Material & Build</h3>
                  <p style={{ marginTop: "-10px" }}>
                    Premium aluminum frame with Gorilla Glass Victus+
                    protection.
                  </p>
                </div>
              </div>
            )}

            {/* Tab2 - Additional Info */}
            {activeTab === "aiTab2" && (
              <div className="aiTabAdditionalInfo">
                <div className="additionalInfoContainer">
                  <h6>Weight</h6>
                  <p> 198 grams</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Dimensions</h6>
                  <p> 161 x 75 x 7.8 mm</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Storage</h6>
                  <p> 128GB, 256GB, 512GB</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Colors</h6>
                  <p> Midnight Black, Sky Blue, Silver</p>
                </div>
                <div className="additionalInfoContainer">
                  <h6>Battery</h6>
                  <p> 5000mAh Li-Po (non-removable)</p>
                </div>
              </div>
            )}

            {/* Tab3 - Reviews */}
            {activeTab === "aiTab3" && (
              <div className="aiTabReview">
                <div className="aiTabReviewContainer">
                  <h3>Reviews</h3>
                  <div className="userReviews">
                    <div
                      className="userReview"
                      style={{ borderBottom: "1px solid #e4e4e4" }}
                    >
                      <div className="userReviewImg">
                        <img src={user1} alt="" />
                      </div>
                      <div className="userReviewContent">
                        <div className="userReviewTopContent">
                          <div className="userNameRating">
                            <h6>Max chamling</h6>
                            <div className="userRating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color="#FEC78A" size={10} />
                              ))}
                            </div>
                          </div>
                          <div className="userDate">
                            <p>April 06, 2023</p>
                          </div>
                        </div>
                        <div
                          className="userReviewBottomContent"
                          style={{ marginBottom: "30px" }}
                        >
                          <p>
                            Great camera quality, stunning display, and super
                            fast. Easily lasts all day even with heavy use.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="userReview">
                      <div className="userReviewImg">
                        <img src={user2} alt="" />
                      </div>
                      <div className="userReviewContent">
                        <div className="userReviewTopContent">
                          <div className="userNameRating">
                            <h6>Benjam Porter</h6>
                            <div className="userRating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} color="#FEC78A" size={10} />
                              ))}
                            </div>
                          </div>
                          <div className="userDate">
                            <p>April 12, 2023</p>
                          </div>
                        </div>
                        <div className="userReviewBottomContent">
                          <p>
                            Sleek design, blazing-fast performance. Definitely
                            worth the price!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="userNewReview">
                    <div className="userNewReviewMessage">
                      <h5>Be the first to review</h5>
                      <p>
                        Your email address will not be published. Required
                        fields are marked *
                      </p>
                    </div>
                    <div className="userNewReviewRating">
                      <label>Your rating *</label>
                      <Rating
                        name="rating"
                        size="small"
                        value={rating}
                        onChange={(event, newValue) => setRating(newValue)}
                      />
                    </div>
                    <div className="userNewReviewForm">
                      <form onSubmit={handleSubmit}>
                        <textarea
                          cols={30}
                          rows={8}
                          placeholder="Your Review *"
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                        />
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          style={{
                            border: dragActive
                              ? "2px dashed #4f46e5"
                              : "2px dashed #ccc",
                            borderRadius: "10px",
                            padding: "20px",
                            textAlign: "center",
                            backgroundColor: dragActive ? "#f0f4ff" : "#fafafa",
                            marginTop: "10px",
                            position: "relative",
                            transition: "0.3s ease",
                          }}
                        >
                        <input
                          type="file"
                          accept="image/*,video/*"
                          id="uploadInput"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => handleFileChange(e.target.files)}
                        />

                          <label
                            htmlFor="uploadInput"
                            style={{ cursor: "pointer" }}
                          >
                            <p
                              style={{
                                margin: 0,
                                color: "#555",
                                fontSize: "14px",
                              }}
                            >
                              Drag & drop an image or video here, or{" "}
                              <span
                                style={{ color: "#4f46e5", fontWeight: 500 }}
                              >
                                click to browse
                              </span>
                            </p>
                          </label>
                        </div>
                        {mediaFiles.length > 0 && (
  <div
    style={{
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginTop: "15px",
    }}
  >
    {mediaFiles.map((media, index) => (
    <div
    key={index}
    style={{
      
      position: "relative",
      borderRadius: "10px",
      overflow: "hidden",
    }}
  >
    <div
      onClick={() => handleDeleteFile(index)}
      style={{
        position: "absolute",
        top: "5px",
        right: "0px",
        cursor: "pointer",
      }}
    >
      <DeleteIcon fontSize="small" />
    </div>
        {media.file.type.startsWith("image/") ? (
          <img
            src={media.preview}
            alt="preview"
            style={{
              maxWidth: "150px",
              maxHeight: "150px",
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
        ) : (
          <video
           ref={(el) => (videoRefs.current[index] = el)}
           
            src={media.preview}
            style={{ maxWidth: "150px", maxHeight: "150px" }}
          />
        )}
      </div>
    ))}
  </div>
)}

                        <button type="submit" >Submit</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdditionalInfo;
