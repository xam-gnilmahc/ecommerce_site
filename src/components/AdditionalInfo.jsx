import React, { useState, useRef } from "react";
import "./AdditionalInfo.css";

import user1 from "../components/assets/user-1.jpg";
import user2 from "../components/assets/user-2.jpg";

import { FaStar,FaThumbsUp, FaThumbsDown  } from "react-icons/fa";
import Rating from "@mui/material/Rating";
import DeleteIcon from "@mui/icons-material/Delete"; // Import Delete icon
import IconButton from "@mui/material/IconButton";


const AdditionalInfo = ({product_reviews}) => {

  console.log('mm',product_reviews);
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

  const formatDate = (value) => {
  if (!value) return "N/A";
  const fixed = value.replace(" ", "T");
  const date = new Date(fixed);
  if (isNaN(date)) return "Invalid date";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
//  const ratings = [
//     { stars: 5, count: 2000, color: "bg-teal-500" },
//     { stars: 4, count: 1000, color: "bg-pink-500" },
//     { stars: 3, count: 500, color: "bg-cyan-500" },
//     { stars: 2, count: 200, color: "bg-orange-500" },
//     { stars: 1, count: 0, color: "bg-red-500" },
//   ];


const ratingColors = {
  5: "bg-success",
  4: "bg-primary",
  3: "bg-warning",
  2: "bg-info",
  1: "bg-danger",
};


  const total = product_reviews?.length;

  const ratingCounts = [1, 2, 3, 4, 5].map((star) => {
    const count = product_reviews?.filter((r) => r.rating === star).length;
    return {
      stars: star,
      count,
      color: ratingColors[star],
    };
  }).reverse(); // So that 5★ appears on top

  const avg = total > 0
    ? (product_reviews?.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
    : 0;


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
                Reviews {product_reviews?.length}
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
                  <h2>Reviews</h2>
   <div className="row g-4">
  {/* Total Reviews */}
  <div className="col-md-4 d-flex align-items-stretch">
    <div className="border rounded p-3 w-100 d-flex flex-column justify-content-between" style={{ minHeight: "150px" }}>
      <p className="text-black mb-1 fw-bold">Total Reviews</p>
      <div className="d-flex gap-2 align-items-center">
        <h2 className="h2 fw-bold mb-0">{product_reviews.length}</h2>
        <span className="badge bg-success text-uppercase small">21% ↑</span>
      </div>
      <p className="text-muted small mt-2 mb-0">Growth in reviews on this year</p>
    </div>
  </div>

  {/* Average Rating */}
  <div className="col-md-4 d-flex align-items-stretch">
    <div className="border rounded p-3 w-100 d-flex flex-column justify-content-between" style={{ minHeight: "150px" }}>
      <p className="text-black mb-1 fw-bold">Average Rating</p>
      <div className="d-flex align-items-center gap-2">
        <span className="h2 fw-bold mb-0">{avg}</span>
        <div>
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              size={20}
              color={i < Math.round(avg) ? "#FEC78A" : "#E5E7EB"}
            />
          ))}
        </div>
      </div>
      <p className="text-muted small mt-2 mb-0">Average rating on this year</p>
    </div>
  </div>

  {/* Rating Distribution */}
  <div className="col-md-4 d-flex align-items-stretch">
    <div className="border rounded p-3 w-100 d-flex flex-column justify-content-between" style={{ minHeight: "150px" }}>
      <p className="text-black mb-1 fw-bold">Rating Distribution</p>
      <div className="flex-grow-1">
        {ratingCounts.map((r, idx) => (
          <div
            key={idx}
            className="d-flex align-items-center justify-content-between mb-1 small"
          >
            <div className="d-flex align-items-center" style={{ minWidth: "100px" }}>
              <span className="text-secondary fw-bold">★ {r.stars}</span>
              <div className="progress flex-grow-1 ms-2" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${r.color}`}
                  role="progressbar"
                  style={{
                    width: total ? `${(r.count / total) * 100}%` : "0%",
                  }}
                  aria-valuenow={total ? (r.count / total) * 100 : 0}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
            <span
              className="text-dark fw-bold"
              style={{ minWidth: "40px", textAlign: "right" }}
            >
              {r.count >= 1000 ? `${(r.count / 1000).toFixed(1)}k` : r.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>

</div>



                 <div className="userReviews">
  {product_reviews?.map((review, index) => (
    <div
      key={index}
      className="d-flex gap-3 border-bottom pb-4 mb-4"
    >
      {/* User Image */}
     <div className="userReviewImg">
                        <img src={review?.picture || "https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg"} alt="User" />
                      </div>

      {/* Review Content */}
      <div className="flex-grow-1 position-relative">
        {/* Name, Rating, Date */}
        <div className="d-flex justify-content-between flex-wrap mb-1">
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0">{review.name}</h6>
            <div className="d-flex gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={14}
                  color={i < review.rating ? "#FEC78A" : "#E5E7EB"}
                />
              ))}
            </div>
          </div>
          <p className="text-muted small mb-0">{formatDate(review.created_at)}</p>
        </div>

        {/* Comment */}
          <div className="userReviewBottomContent" style={{ marginBottom: "30px" }}>
                          <p>{review.comment}</p>
                        </div>
                      <div
  className="position-absolute d-flex align-items-center gap-2"
  style={{ bottom: "0", right: "0" }}
>
  <div className="p-1  me-1">
    <FaThumbsUp size={16} className="text-secondary" />
  </div>
  <div className="p-1 rounded ">
    <FaThumbsDown size={16} className="text-secondary" />
  </div>
</div>

      </div>
    </div>
  ))}
</div>


                  <div className="userNewReview">
                    { product_reviews.length < 0 && (
                    <div className="userNewReviewMessage">
                      <h5>Be the first to review</h5>
                      <p>
                        Your email address will not be published. Required
                        fields are marked *
                      </p>
                    </div>
                    )}
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
                        class="form-control"
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
          width: "150px",
          height: "150px",
          borderRadius: "10px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f8f8", // optional: subtle bg so empty spaces don't show white
        }}
      >
        <div
          onClick={() => handleDeleteFile(index)}
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            cursor: "pointer",
            zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: "50%",
            padding: "2px",
          }}
        >
          <DeleteIcon fontSize="small" />
        </div>
        {media.file.type.startsWith("image/") ? (
          <img
            src={media.preview}
            alt="preview"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
        ) : (
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            src={media.preview}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              objectFit: "contain",
            }}
            controls
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
