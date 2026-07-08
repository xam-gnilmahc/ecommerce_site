import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

import { FaStar, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import Rating from '@mui/material/Rating';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

const AdditionalInfo = ({ product_reviews }) => {
  const DEFAULT_AVATAR =
    'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg';

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

  const [reviews, setReviews] = useState(product_reviews || []);

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
    .reverse();

  const avg =
    total > 0 ? ((reviews || []).reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;

  return (
    <>
      <style>{`
        .ai-tab-active::after {
          content: '';
          position: absolute;
          bottom: -22px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: #111827;
          transition: background-color 0.3s ease;
        }
        .ai-tab-inactive::after {
          content: '';
          position: absolute;
          bottom: -22px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #111827;
          transition: width 0.3s ease;
        }
        .ai-tab-inactive:hover::after {
          width: 100%;
        }
        .ai-tab-inactive:hover {
          color: #111827;
        }
        .user-reviews::-webkit-scrollbar {
          width: 0;
        }
        .drag-drop-active {
          border-color: #111827 !important;
        }
        .file-delete-btn:hover {
          background-color: #dc2626;
        }
        @media (max-width: 768px) {
          .ai-main-wrapper {
            padding-left: 40px !important;
            padding-right: 40px !important;
            margin-top: 60px !important;
            margin-bottom: 60px !important;
          }
        }
        @media (max-width: 480px) {
          .ai-main-wrapper {
            padding-left: 16px !important;
            padding-right: 16px !important;
            margin-top: 40px !important;
            margin-bottom: 40px !important;
          }
        }
        @media (min-width: 1600px) {
          .ai-main-wrapper {
            padding-left: 250px !important;
            padding-right: 250px !important;
            margin-top: 85px !important;
            margin-bottom: 85px !important;
          }
        }
      `}</style>

      <div
        className="ai-main-wrapper mx-auto py-2 px-4 md:px-8 lg:px-12 xl:px-[120px] my-[8px]"
        style={{ maxWidth: '100%' }}
      >
        <div className="flex flex-col gap-3">
          {/* Tabs */}
          <div
            className="flex flex-wrap items-center justify-center gap-12 border-b-2 pb-5"
            style={{ borderColor: '#e5e7eb' }}
          >
            <p
              onClick={() => handleTabClick('aiTab1')}
              className={`relative cursor-pointer uppercase font-semibold text-[15px] py-2 transition-colors duration-300 ${
                activeTab === 'aiTab1'
                  ? 'ai-tab-active text-[#111827]'
                  : 'ai-tab-inactive text-gray-500'
              }`}
            >
              Description
            </p>
            <p
              onClick={() => handleTabClick('aiTab2')}
              className={`relative cursor-pointer uppercase font-semibold text-[15px] py-2 transition-colors duration-300 ${
                activeTab === 'aiTab2'
                  ? 'ai-tab-active text-[#111827]'
                  : 'ai-tab-inactive text-gray-500'
              }`}
            >
              Additional Information
            </p>
            <p
              onClick={() => handleTabClick('aiTab3')}
              className={`relative cursor-pointer uppercase font-semibold text-[15px] py-2 transition-colors duration-300 ${
                activeTab === 'aiTab3'
                  ? 'ai-tab-active text-[#111827]'
                  : 'ai-tab-inactive text-gray-500'
              }`}
            >
              Reviews {reviews?.length}
            </p>
          </div>

          {/* Tab Content */}
          <div>
            {/* Tab1 - Description */}
            {activeTab === 'aiTab1' && (
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                  <h3 className="text-[17px] font-semibold text-gray-900 m-0">
                    Experience the Power of Innovation
                  </h3>
                  <p className="text-[15px] font-normal leading-7 text-gray-900 m-0">
                    Discover the next-gen smartphone built for speed, performance, and style.
                    Equipped with the latest processor, high-resolution display, and long-lasting
                    battery, this device keeps you connected, productive, and entertained.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-4">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[17px] font-semibold text-gray-900 m-0">
                      Why choose this phone?
                    </h3>
                    <ul className="my-3 pl-6">
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        Powered by Octa-core 5nm Processor
                      </li>
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        AMOLED 120Hz Ultra HD Display
                      </li>
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        5G Connectivity & Dual SIM support
                      </li>
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        AI-Powered Quad Camera System
                      </li>
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        Fast Charging with 5000mAh Battery
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[17px] font-semibold text-gray-900 m-0">Top Features</h3>
                    <ol className="my-3 pl-6">
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        Face Unlock & In-display Fingerprint Sensor
                      </li>
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        Wireless Charging & Reverse Charging
                      </li>
                      <li className="text-[15px] leading-6 text-gray-900 mb-2">
                        Water & Dust Resistant (IP68 Certified)
                      </li>
                    </ol>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[17px] font-semibold text-gray-900 m-0">Material & Build</h3>
                  <p
                    className="text-[15px] font-normal leading-7 text-gray-900 m-0"
                    style={{ marginTop: '-10px' }}
                  >
                    Premium aluminum frame with Gorilla Glass Victus+ protection.
                  </p>
                </div>
              </div>
            )}

            {/* Tab2 - Additional Info */}
            {activeTab === 'aiTab2' && (
              <div className="flex flex-col gap-6">
                {[
                  { label: 'Weight', value: '198 grams' },
                  { label: 'Dimensions', value: '161 x 75 x 7.8 mm' },
                  { label: 'Storage', value: '128GB, 256GB, 512GB' },
                  { label: 'Colors', value: 'Midnight Black, Sky Blue, Silver' },
                  { label: 'Battery', value: '5000mAh Li-Po (non-removable)' },
                ].map((item, idx, arr) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 items-center gap-6 py-4 ${
                      idx < arr.length - 1 ? 'border-b' : ''
                    }`}
                    style={{
                      borderColor: idx < arr.length - 1 ? '#e5e7eb' : 'transparent',
                    }}
                  >
                    <h6 className="text-[15px] font-semibold text-gray-900 m-0">{item.label}</h6>
                    <p className="text-[15px] font-normal text-gray-500 m-0">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab3 - Reviews */}
            {activeTab === 'aiTab3' && (
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-10">
                  {/* Reviews List */}
                  <div className="user-reviews flex flex-col mb-[5px] max-h-[450px] overflow-y-auto pr-1.5 snap-y snap-mandatory">
                    {reviews?.map((reviewItem, index) => (
                      <div
                        key={index}
                        className="flex gap-3 border-b pb-4 mb-4 snap-start py-2.5 transition-colors duration-[0.18s] hover:bg-gray-50"
                        style={{ borderColor: '#e5e7eb' }}
                      >
                        {/* User Image */}
                        <div className="flex items-center">
                          <img
                            className="w-12 h-12 rounded-full object-cover border"
                            src={reviewItem.users?.profile || DEFAULT_AVATAR}
                            alt="User"
                            style={{ borderColor: '#e5e7eb' }}
                          />
                        </div>
                        {/* Review Content */}
                        <div className="flex-1 relative">
                          {/* Name, Rating, Date */}
                          <div className="flex justify-between flex-wrap mb-1">
                            <div className="flex items-center gap-2">
                              <h6 className="text-[15px] font-semibold text-gray-900 mb-0">
                                {reviewItem.users?.name || 'Anonymous'}
                              </h6>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    size={14}
                                    color={i < reviewItem.rating ? '#FEC78A' : '#E5E7EB'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted text-sm mb-0">
                              {formatDate(reviewItem.created_at)}
                            </p>
                          </div>

                          {/* Comment */}
                          <div className="mb-[18px]">
                            <p className="text-[15px] font-normal text-gray-900 leading-[26px] m-0">
                              {reviewItem.comment}
                            </p>
                          </div>

                          {/* Review media thumbnails */}
                          {reviewItem.picture && (
                            <div className="flex gap-2 flex-wrap mb-3">
                              {(() => {
                                const url = String(reviewItem.picture).startsWith('http')
                                  ? reviewItem.picture
                                  : `https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/lol/${reviewItem.picture}`;
                                return (
                                  <button
                                    type="button"
                                    className="w-16 h-16 p-0 border rounded-lg overflow-hidden inline-flex items-center justify-center cursor-pointer bg-white"
                                    style={{ borderColor: '#e5e7eb' }}
                                    onClick={() => openViewer([url], 0)}
                                  >
                                    <img
                                      className="w-full h-full object-contain block"
                                      src={url}
                                      alt="Sticker"
                                      loading="lazy"
                                    />
                                  </button>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* New Review Section */}
                  <div className="flex flex-col gap-2 py-2.5">
                    {showModal && (
                      <div
                        className="fixed inset-0 flex items-start justify-center z-[1200] p-5"
                        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
                        onClick={() => setShowModal(false)}
                      >
                        <div
                          className="w-full max-w-[680px] bg-white rounded-[10px] px-4 py-3.5 relative mt-[6vh]"
                          style={{ border: '1px solid #e5e7eb' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="absolute right-3 top-2 bg-transparent border-none text-[20px] cursor-pointer"
                            onClick={() => setShowModal(false)}
                            aria-label="Close"
                          >
                            ×
                          </button>
                          <h5 className="m-0 mb-3 text-[17px]">Add your review</h5>
                          <div className="flex flex-col gap-3">
                            <div>
                              <label className="font-semibold text-[13px] mb-1.5 block">
                                Your rating
                              </label>
                              <Rating
                                name="rating-modal"
                                size="small"
                                value={rating}
                                onChange={(event, newValue) => setRating(newValue)}
                              />
                            </div>

                            <div>
                              <textarea
                                className="w-full p-2.5 rounded-lg resize-y border"
                                style={{
                                  borderColor: '#e5e7eb',
                                }}
                                cols={40}
                                rows={6}
                                placeholder="Write your review..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                              />
                            </div>

                            <div
                              className={`border-2 border-dashed rounded-lg px-3.5 py-4 text-center cursor-pointer transition-all duration-[0.16s] ${
                                dragActive ? 'drag-drop-active' : ''
                              }`}
                              style={{
                                borderColor: dragActive ? '#111827' : '#e5e7eb',
                                backgroundColor: '#f9fafb',
                              }}
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
                                className="hidden"
                                onChange={(e) => handleFileChange(e.target.files)}
                              />
                              <label htmlFor="uploadInput" className="cursor-pointer">
                                <p className="m-0 text-[15px] leading-relaxed text-gray-500">
                                  Drag & drop an image or video here, or{' '}
                                  <span className="text-[#111827] font-semibold">
                                    click to browse
                                  </span>
                                </p>
                              </label>
                            </div>

                            {mediaFiles.length > 0 && (
                              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 mt-3">
                                {mediaFiles.map((media, index) => (
                                  <div
                                    key={index}
                                    className="relative rounded-lg overflow-hidden bg-gray-50 aspect-square transition-all duration-[0.16s]"
                                  >
                                    <div
                                      className="file-delete-btn absolute top-1.5 right-1.5 bg-white/90 rounded-full p-1 cursor-pointer flex items-center justify-center transition-all duration-[0.12s]"
                                      style={{ boxShadow: 'none' }}
                                      onClick={() => handleDeleteFile(index)}
                                      title="Delete file"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </div>
                                    {media.file.type.startsWith('image/') ? (
                                      <img
                                        className="w-full h-full object-cover rounded-xl"
                                        src={media.preview}
                                        alt="preview"
                                      />
                                    ) : (
                                      <video
                                        ref={(el) => (videoRefs.current[index] = el)}
                                        className="w-full h-full object-cover rounded-xl"
                                        src={media.preview}
                                        controls
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2.5 justify-end mt-2">
                              <button
                                className="bg-[#111827] text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-bold"
                                onClick={(e) => {
                                  handleSubmit({ preventDefault: () => {} });
                                  setShowModal(false);
                                }}
                              >
                                Submit
                              </button>
                              <button
                                className="bg-transparent border px-3.5 py-2.5 rounded-lg cursor-pointer"
                                style={{ borderColor: '#e5e7eb' }}
                                onClick={() => setShowModal(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Media viewer modal */}
                    {viewerOpen && (
                      <div
                        className="fixed inset-0 flex items-center justify-center z-[1600] p-4"
                        style={{ background: 'rgba(0, 0, 0, 0.65)' }}
                        onClick={() => setViewerOpen(false)}
                      >
                        <div
                          className="w-full max-w-[1000px] max-h-[90vh] relative flex items-center justify-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="absolute top-2 right-2 bg-white/90 border-none text-[20px] px-2.5 py-1.5 rounded-md cursor-pointer"
                            onClick={() => setViewerOpen(false)}
                          >
                            ×
                          </button>
                          <div className="max-w-full max-h-[80vh] flex items-center justify-center">
                            {viewerMedia[viewerIndex] &&
                            viewerMedia[viewerIndex].match(/\.(mp4|webm|ogg)$/i) ? (
                              <video
                                className="max-w-[clamp(320px,80vw,900px)] max-h-[clamp(240px,75vh,700px)] rounded-lg"
                                src={viewerMedia[viewerIndex]}
                                controls
                              />
                            ) : (
                              <img
                                className="max-w-[clamp(320px,80vw,900px)] max-h-[clamp(240px,75vh,700px)] w-auto h-auto object-contain rounded-lg"
                                src={viewerMedia[viewerIndex]}
                                alt="review-media"
                              />
                            )}
                          </div>
                          {viewerMedia.length > 1 && (
                            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                              <button
                                className="pointer-events-auto bg-white/90 border-none text-[24px] px-3 py-2 rounded-md cursor-pointer"
                                onClick={viewerPrev}
                                aria-label="Previous"
                              >
                                ‹
                              </button>
                              <button
                                className="pointer-events-auto bg-white/90 border-none text-[24px] px-3 py-2 rounded-md cursor-pointer"
                                onClick={viewerNext}
                                aria-label="Next"
                              >
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
      </div>
    </>
  );
};

export default AdditionalInfo;
