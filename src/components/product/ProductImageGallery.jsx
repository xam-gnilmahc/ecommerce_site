import React, { useState, useEffect, useRef, useMemo } from 'react';
import './ProductImageGallery.css';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';

const SUPABASE_IMG_BASE = `${SUPABASE_STORAGE_URL}productimages/`;

const ProductImageGallery = ({ images = [], productName = '', bannerUrl = '' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const thumbListRef = useRef(null);
  const mainImageRef = useRef(null);

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

  const handleThumbClick = (index) => {
    setActiveIndex(index);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);

  useEffect(() => {
    if (thumbListRef.current) {
      const activeThumb = thumbListRef.current.children[activeIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  if (allImages.length === 0) return null;

  const currentSrc = getUrl(allImages[activeIndex]);

  return (
    <div className="pig-gallery">
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="pig-thumbs" ref={thumbListRef}>
          {allImages.map((img, idx) => (
            <button
              key={getImageKey(img, idx)}
              className={`pig-thumb ${idx === activeIndex ? 'pig-thumb--active' : ''}`}
              onClick={() => handleThumbClick(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={getUrl(img)}
                alt={`${productName} thumbnail ${idx + 1}`}
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image with Zoom */}
      <div className={`pig-main ${allImages.length <= 1 ? 'pig-main--full' : ''}`}>
        <div
          className="pig-main-image"
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            className={`pig-zoom-img ${isZoomed ? 'pig-zoom-img--zoomed' : ''}`}
            src={currentSrc}
            alt={productName}
            draggable={false}
            style={{
              '--zoom-x': `${zoomPos.x}%`,
              '--zoom-y': `${zoomPos.y}%`,
            }}
          />
          {!isZoomed && (
            <div className="pig-zoom-hint">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span>Hover to zoom</span>
            </div>
          )}
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
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="pig-nav pig-nav--next" onClick={handleNext} aria-label="Next image">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="pig-counter">
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
