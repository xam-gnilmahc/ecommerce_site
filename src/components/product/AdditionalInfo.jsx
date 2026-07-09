import React, { useState, useRef, useEffect } from 'react';
import './AdditionalInfo.css';
import toast from 'react-hot-toast';

import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import Rating from '@mui/material/Rating';
import DeleteIcon from '@mui/icons-material/Delete';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import IconButton from '@mui/material/IconButton';

const AdditionalInfo = ({ product_reviews }) => {
  const DEFAULT_AVATAR =
    'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg';

  // Reviews state: use reviews passed from Product.jsx (no localStorage persistence)
  const [activeTab, setActiveTab] = useState('aiTab1');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const videoRefs = useRef([]);
  const [showModal, setShowModal] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerMedia, setViewerMedia] = useState([]);

  // Use reviews passed from Product.jsx. Do NOT persist to localStorage here.
  const [reviews, setReviews] = useState(product_reviews || []);

  // Keep in-sync when parent prop changes (Product.jsx may fetch for each product)
  useEffect(() => {
    setReviews(product_reviews || []);
  }, [product_reviews]);

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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // basic validation
    if (!rating || rating <= 0) {
      toast.error('Please provide a rating.');
      return;
    }
    if (!review || review.trim().length < 5) {
      toast.error('Please write a short review (min 5 characters).');
      return;
    }

    const newReview = {
      id: Date.now(),
      name: 'Anonymous',
      picture: DEFAULT_AVATAR,
      comment: review,
      rating: rating,
      created_at: new Date().toISOString(),
      media: mediaFiles.map((m) => m.preview),
    };

    const updated = [newReview, ...(reviews || [])];
    // Update in-memory reviews so the UI shows the new review immediately.
    setReviews(updated);
    setRating(0);
    setReview('');
    setMediaFiles([]);
    toast.success('Review submitted.');
  };

  const openViewer = (mediaArray, index = 0) => {
    if (!mediaArray || mediaArray.length === 0) return;
    setViewerMedia(mediaArray);
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const viewerNext = () => {
    setViewerIndex((i) => (i + 1) % viewerMedia.length);
  };

  const viewerPrev = () => {
    setViewerIndex((i) => (i - 1 + viewerMedia.length) % viewerMedia.length);
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const fixed = value.replace(' ', 'T');
    const date = new Date(fixed);
    if (isNaN(date)) return 'Invalid date';

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
    5: 'bg-success',
    4: 'bg-primary',
    3: 'bg-warning',
    2: 'bg-info',
    1: 'bg-danger',
  };

  const total = reviews?.length || 0;

  const ratingCounts = [1, 2, 3, 4, 5]
    .map((star) => {
      const count = (reviews || []).filter((r) => r.rating === star).length;
      return {
        stars: star,
        count,
        color: ratingColors[star],
      };
    })
    .reverse(); // So that 5★ appears on top

  const avg =
    total > 0 ? ((reviews || []).reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;

  return (
    <>
      <div className="productAdditionalInfo">
        <div className="productAdditonalInfoContainer">
          <div className="productAdditionalInfoTabs">
            <div className="aiTabs">
              <p
                onClick={() => handleTabClick('aiTab1')}
                className={activeTab === 'aiTab1' ? 'aiActive' : ''}
              >
                Description
              </p>
              <p
                onClick={() => handleTabClick('aiTab2')}
                className={activeTab === 'aiTab2' ? 'aiActive' : ''}
              >
                Additional Information
              </p>
              <p
                onClick={() => handleTabClick('aiTab3')}
                className={activeTab === 'aiTab3' ? 'aiActive' : ''}
              >
                Reviews {reviews?.length}
              </p>
            </div>
          </div>
          <div className="productAdditionalInfoContent">
            {/* Tab1 - Description */}
            {activeTab === 'aiTab1' && (
              <div className="aiTabDescription">
                <div className="descriptionPara">
                  <h3>Experience the Power of Innovation</h3>
                  <p>
                    Discover the next-gen smartphone built for speed, performance, and style.
                    Equipped with the latest processor, high-resolution display, and long-lasting
                    battery, this device keeps you connected, productive, and entertained.
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
                  <p style={{ marginTop: '-10px' }}>
                    Premium aluminum frame with Gorilla Glass Victus+ protection.
                  </p>
                </div>
              </div>
            )}

            {/* Tab2 - Additional Info */}
            {activeTab === 'aiTab2' && (
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
          </div>

          {/* Tab3 - Reviews */}
          {activeTab === 'aiTab3' && (
            <div className="aiTabReview">
              <div className="aiTabReviewContainer">
                <div className="userReviews">
                  {reviews?.map((review, index) => (
                    <div key={index} className="d-flex gap-3 border-bottom pb-4 mb-4">
                      {/* User Image */}
                      <div className="userReviewImg">
                        <img src={review.users?.profile || DEFAULT_AVATAR} alt="User" />
                      </div>
                      {/* Review Content */}
                      <div className="flex-grow-1 position-relative">
                        {/* Name, Rating, Date */}
                        <div className="d-flex justify-content-between flex-wrap mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="mb-0">{review.users?.name || 'Anonymous'}</h6>
                            <div className="d-flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  size={14}
                                  color={i < review.rating ? '#FEC78A' : '#E5E7EB'}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted small mb-0">{formatDate(review.created_at)}</p>
                        </div>

                        {/* Comment */}
                        <div className="userReviewBottomContent" style={{ marginBottom: '18px' }}>
                          <p>{review.comment}</p>
                        </div>

                        {/* Review media thumbnails (click to open viewer) */}
                        {review.picture && (
                          <div className="review-media-grid">
                            {(() => {
                              const url = String(review.picture).startsWith('http')
                                ? review.picture
                                : `${SUPABASE_STORAGE_URL}lol/${review.picture}`;
                              return (
                                <button
                                  type="button"
                                  className="review-media-thumb"
                                  onClick={() => openViewer([url], 0)}
                                >
                                  <img src={url} alt="Sticker" loading="lazy" />
                                </button>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="userNewReview">
                  {showModal && (
                    <div className="review-modal-overlay" onClick={() => setShowModal(false)}>
                      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="modal-close"
                          onClick={() => setShowModal(false)}
                          aria-label="Close"
                        >
                          ×
                        </button>
                        <h5>Add your review</h5>
                        <div className="modal-body">
                          <div className="modal-row">
                            <label>Your rating</label>
                            <Rating
                              name="rating-modal"
                              size="small"
                              value={rating}
                              onChange={(event, newValue) => setRating(newValue)}
                            />
                          </div>

                          <div className="modal-row">
                            <textarea
                              className="form-control"
                              cols={40}
                              rows={6}
                              placeholder="Write your review..."
                              value={review}
                              onChange={(e) => setReview(e.target.value)}
                            />
                          </div>

                          <div
                            className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <input
                              type="file"
                              accept="image/*,video/*"
                              id="uploadInput"
                              multiple
                              onChange={(e) => handleFileChange(e.target.files)}
                            />
                            <label htmlFor="uploadInput">
                              <p>
                                Drag & drop an image or video here, or <span>click to browse</span>
                              </p>
                            </label>
                          </div>

                          {mediaFiles.length > 0 && (
                            <div className="file-preview-grid">
                              {mediaFiles.map((media, index) => (
                                <div key={index} className="file-preview-item">
                                  <div
                                    className="file-delete-btn"
                                    onClick={() => handleDeleteFile(index)}
                                    title="Delete file"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </div>
                                  {media.file.type.startsWith('image/') ? (
                                    <img src={media.preview} alt="preview" />
                                  ) : (
                                    <video
                                      ref={(el) => (videoRefs.current[index] = el)}
                                      src={media.preview}
                                      controls
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="modal-actions">
                            <button
                              className="modal-submit"
                              onClick={(e) => {
                                handleSubmit({ preventDefault: () => {} });
                                setShowModal(false);
                              }}
                            >
                              Submit
                            </button>
                            <button className="modal-cancel" onClick={() => setShowModal(false)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Media viewer modal (for review images/videos) */}
                  {viewerOpen && (
                    <div className="media-viewer-overlay" onClick={() => setViewerOpen(false)}>
                      <div className="media-viewer" onClick={(e) => e.stopPropagation()}>
                        <button className="viewer-close" onClick={() => setViewerOpen(false)}>
                          ×
                        </button>
                        <div className="viewer-content">
                          {viewerMedia[viewerIndex] &&
                          viewerMedia[viewerIndex].match(/\.(mp4|webm|ogg)$/i) ? (
                            <video
                              className="viewer-video"
                              src={viewerMedia[viewerIndex]}
                              controls
                            />
                          ) : (
                            <img
                              className="viewer-img"
                              src={viewerMedia[viewerIndex]}
                              alt="review-media"
                            />
                          )}
                        </div>
                        {viewerMedia.length > 1 && (
                          <div className="viewer-controls">
                            <button
                              className="viewer-prev"
                              onClick={viewerPrev}
                              aria-label="Previous"
                            >
                              ‹
                            </button>
                            <button className="viewer-next" onClick={viewerNext} aria-label="Next">
                              ›
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdditionalInfo;
