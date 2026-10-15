import React, { useState, useEffect, useMemo } from 'react';
import './ProductImageGallery.css';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';

const SUPABASE_IMG_BASE = `${SUPABASE_STORAGE_URL}productimages/`;

const ProductImageGallery = ({ images = [], productName = '', bannerUrl = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const getUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return `${SUPABASE_IMG_BASE}${img}`;
    return `${SUPABASE_IMG_BASE}${img.image_url}`;
  };

  const getImageKey = (img, idx) => {
    if (!img) return idx;
    if (typeof img === 'string') return img;
    return img.id || img.image_url || idx;
  };

  // Merge banner_url as first image if it exists and isn't already in product_images
  const allImages = useMemo(() => {
    const list = [];
    if (bannerUrl) {
      const bannerAlreadyInList = images.some(
        (img) => (typeof img === 'string' ? img : img.image_url) === bannerUrl
      );
      if (!bannerAlreadyInList) {
        list.push({ id: 'banner', image_url: bannerUrl, is_primary: true });
      }
    }
    images.forEach((img) => list.push(img));
    return list;
  }, [images, bannerUrl]);

  // Find primary image or default to first
  useEffect(() => {
    if (allImages.length > 0) {
      const primaryIdx = allImages.findIndex((img) => typeof img === 'object' && img.is_primary);
      setActiveIndex(primaryIdx >= 0 ? primaryIdx : 0);
    }
  }, [allImages]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  if (allImages.length === 0) return null;

  const currentSrc = getUrl(allImages[activeIndex]);

  return (
    <div className="pig-gallery">
      {/* Main Image */}
      <div className={`pig-main ${allImages.length <= 1 ? 'pig-main--full' : ''}`}>
        <div className="pig-main-image">
          <img src={currentSrc} alt={productName} draggable={false} className="pig-img" />
        </div>

        {/* Nav Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              className="pig-nav pig-nav--prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="11 18 5 12 11 6" />
              </svg>
            </button>
            <button className="pig-nav pig-nav--next" onClick={handleNext} aria-label="Next image">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 18 19 12 13 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {allImages.length > 1 && (
        <div className="pig-dots">
          {allImages.map((img, idx) => (
            <button
              key={getImageKey(img, idx)}
              className={`pig-dot ${idx === activeIndex ? 'pig-dot--active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
