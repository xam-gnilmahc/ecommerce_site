import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaCheck, FaCamera, FaPaperPlane } from 'react-icons/fa';
import { getReviewsForProduct, saveReviewForProduct, getAverageRating, getRatingDistribution } from '../../utils/reviewStorage';
import './ReviewsSection.css';

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random&color=fff';

const ReviewsSection = ({ productId, productName, initialReviews = [], user }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedReviews = getReviewsForProduct(productId);
    const merged = [...storedReviews, ...initialReviews.filter(r => !storedReviews.some(sr => sr.id === r.id))];
    setReviews(merged);
  }, [productId, initialReviews]);

  const avgRating = getAverageRating(reviews);
  const ratingDist = getRatingDistribution(reviews);
  const totalReviews = reviews.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return alert('Please select a rating');
    if (!reviewText.trim() || reviewText.trim().length < 10) return alert('Review must be at least 10 characters');

    const newReview = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      name: user?.name || user?.full_name || 'Verified Buyer',
      avatar: user?.picture || DEFAULT_AVATAR,
      rating,
      comment: reviewText,
      created_at: new Date().toISOString(),
      media: mediaFiles.map(m => m.preview),
      verified: !!user,
      helpful: 0,
      notHelpful: 0,
    };

    const saved = saveReviewForProduct(productId, newReview);
    if (saved) {
      setReviews(prev => [newReview, ...prev]);
      setRating(0);
      setReviewText('');
      setMediaFiles([]);
      alert('Review submitted successfully!');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - mediaFiles.length);
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setMediaFiles(prev => [...prev, ...previews]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStarArray = (val) => {
    const full = Math.floor(val);
    const half = val % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return { full, half, empty };
  };

  const ratingLabels = { 5: 'Excellent', 4: 'Good', 3: 'Average', 2: 'Poor', 1: 'Terrible' };

  return (
    <div className="reviews-section">
      <div className="reviews-section-header">
        <h2>Ratings & Reviews</h2>
      </div>

      <div className="reviews-body">
        {/* Left: Rating Summary Card */}
        <div className="rating-card">
          <div className="rating-card-top">
            <span className="rating-big">{avgRating}</span>
            <div className="rating-big-stars">
              {getStarArray(parseFloat(avgRating)).full > 0 && [...Array(getStarArray(parseFloat(avgRating)).full)].map((_, i) => <FaStar key={i} className="filled" />)}
              {getStarArray(parseFloat(avgRating)).half && <FaStarHalfAlt key="half" className="filled" />}
              {getStarArray(parseFloat(avgRating)).empty > 0 && [...Array(getStarArray(parseFloat(avgRating)).empty)].map((_, i) => <FaStar key={i} className="empty" />)}
            </div>
            <span className="rating-total">{totalReviews} ratings</span>
          </div>

          <div className="rating-bars">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingDist[star] || 0;
              const pct = totalReviews ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="bar-row">
                  <span className="bar-label">{star} ★</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${pct}%` }}
                      data-rating={star}
                    />
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Write Review Card */}
        <div className="write-card">
          <div className="write-card-header">
            <h3>Write a Review</h3>
            <p>Share your experience with this product</p>
          </div>

          <form onSubmit={handleSubmit} className="write-form">
            <div className="write-form-group">
              <label>Your Rating</label>
              <div className="star-picker">
                {[5, 4, 3, 2, 1].map(star => (
                  <FaStar
                    key={star}
                    className={`star-pick ${(hoverRating || rating) >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
                {(hoverRating || rating) > 0 && (
                  <span className="rating-label">{ratingLabels[hoverRating || rating]}</span>
                )}
              </div>
            </div>

            <div className="write-form-group">
              <label>Your Review</label>
              <div className="textarea-wrap">
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="What did you like or dislike? How do you use this product?"
                  rows={4}
                  minLength={10}
                  maxLength={2000}
                />
                <span className="textarea-count">{reviewText.length}/2000</span>
              </div>
            </div>

            <div className="write-form-group">
              <label>Add Photos/Videos <span className="optional">(optional, max 5)</span></label>
              <label className="file-upload-label">
                <FaCamera className="upload-icon" />
                <span>Choose files</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  hidden
                />
              </label>
              {mediaFiles.length > 0 && (
                <div className="media-chips">
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="media-chip">
                      {media.type === 'image' ? (
                        <img src={media.preview} alt={`Preview ${index}`} />
                      ) : (
                        <video src={media.preview} />
                      )}
                      <button type="button" className="chip-remove" onClick={() => removeMedia(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              <FaPaperPlane />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
