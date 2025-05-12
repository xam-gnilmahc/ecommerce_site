import React, { useState } from "react";
import "./AdditionalInfo.css";

import user1 from "../components/assets/user-1.jpg";
import user2 from "../components/assets/user-2.jpg";

import { FaStar } from "react-icons/fa";
import Rating from "@mui/material/Rating";

const AdditionalInfo = () => {
  const [activeTab, setActiveTab] = useState("aiTab1");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
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
                      <h5>Be the first to review “SuperPhone X Pro”</h5>
                      <p>
                        Your email address will not be published. Required
                        fields are marked *
                      </p>
                    </div>
                    <div className="userNewReviewRating">
                      <label>Your rating *</label>
                      <Rating name="simple-controlled" size="small" />
                    </div>
                    <div className="userNewReviewForm">
                      <form>
                        <textarea
                          cols={30}
                          rows={8}
                          placeholder="Your Review"
                        />
                        <input
                          type="text"
                          placeholder="Name *"
                          required
                          className="userNewReviewFormInput"
                        />
                        <input
                          type="email"
                          placeholder="Email address *"
                          required
                          className="userNewReviewFormInput"
                        />
                        <div className="userNewReviewFormCheck">
                          <label>
                            <input type="checkbox" />
                            Save my name, email, and website in this browser for
                            the next time I comment.
                          </label>
                        </div>

                        <button type="submit">Submit</button>
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
