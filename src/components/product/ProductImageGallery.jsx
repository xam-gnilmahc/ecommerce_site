import React, { useState, useEffect, useRef, useMemo } from 'react';

const SUPABASE_IMG_BASE =
  'https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/';

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
    <div className="flex gap-4 w-full max-w-full max-[991px]:flex-col-reverse max-[991px]:gap-3 max-[991px]:items-center max-[480px]:gap-2">
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div
          ref={thumbListRef}
          className="flex flex-col gap-2.5 max-h-[480px] overflow-y-auto overflow-x-hidden shrink-0 py-1 max-[991px]:flex-row max-[991px]:max-h-none max-[991px]:overflow-y-hidden max-[991px]:overflow-x-auto max-[991px]:max-w-full max-[991px]:justify-center max-[991px]:gap-2 max-[991px]:pb-1 max-[480px]:gap-1.5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
        >
          {allImages.map((img, idx) => (
            <button
              key={getImageKey(img, idx)}
              className={`w-[68px] h-[68px] shrink-0 border-2 border-transparent rounded-lg p-1 cursor-pointer bg-white transition-colors duration-200 flex items-center justify-center overflow-hidden ${
                idx === activeIndex ? 'border-[#111827]' : 'hover:border-gray-300'
              } max-[991px]:w-[60px] max-[991px]:h-[60px] max-[480px]:w-[52px] max-[480px]:h-[52px] max-[480px]:p-[3px]`}
              onClick={() => handleThumbClick(idx)}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={getUrl(img)}
                alt={`${productName} thumbnail ${idx + 1}`}
                draggable={false}
                className="w-full h-full object-contain rounded pointer-events-none select-none"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image with Zoom */}
      <div
        className={`flex-1 relative flex items-center justify-center min-h-[420px] bg-white rounded-xl overflow-hidden ${
          allImages.length <= 1 ? 'w-full max-w-[600px]' : ''
        } max-[991px]:min-h-[360px] max-[991px]:w-full max-[480px]:min-h-[280px] max-[480px]:rounded-lg`}
      >
        <div
          ref={mainImageRef}
          className="w-full h-full flex items-center justify-center overflow-hidden cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            className={`max-w-full max-h-[480px] object-contain rounded-lg transition-transform duration-[0.25s] ease-out block ${
              isZoomed ? 'scale-[2.2] cursor-zoom-out max-[991px]:scale-[2] max-[480px]:scale-[1.8]' : ''
            }`}
            src={currentSrc}
            alt={productName}
            draggable={false}
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              '--zoom-x': `${zoomPos.x}%`,
              '--zoom-y': `${zoomPos.y}%`,
            }}
          />
          {!isZoomed && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 text-white text-sm font-medium py-1.5 px-3.5 rounded-full pointer-events-none opacity-[0.85] transition-opacity duration-200 whitespace-nowrap hover:opacity-0">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <span className="max-[480px]:text-xs max-[480px]:py-[5px] max-[480px]:px-2.5">Hover to zoom</span>
            </div>
          )}
        </div>

        {/* Nav Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-none bg-white/92 cursor-pointer flex items-center justify-center text-gray-900 transition-colors duration-150 z-10 hover:bg-white left-3 max-[480px]:w-[34px] max-[480px]:h-[34px] max-[480px]:left-2"
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
            <button
              className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-none bg-white/92 cursor-pointer flex items-center justify-center text-gray-900 transition-colors duration-150 z-10 hover:bg-white right-3 max-[480px]:w-[34px] max-[480px]:h-[34px] max-[480px]:right-2"
              onClick={handleNext}
              aria-label="Next image"
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
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3.5 bg-black/55 text-white text-sm font-semibold py-[3px] px-2.5 rounded-full tracking-[0.3px] pointer-events-none max-[480px]:text-xs max-[480px]:py-0.5 max-[480px]:px-2 max-[480px]:bottom-2 max-[480px]:right-2.5">
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;
