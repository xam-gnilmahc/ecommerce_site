import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import Skeleton from 'react-loading-skeleton';
import { supabase } from '../../supaBaseClient';
import { FaStar } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import './RelatedProducts.css';

const SUPABASE_IMG_BASE = `${SUPABASE_STORAGE_URL}productimages/`;

const swiperConfig = {
  navigation: {
    nextEl: '.rp-swiper-next',
    prevEl: '.rp-swiper-prev',
  },
  autoplay: { delay: 3000, disableOnInteraction: false },
  modules: [Navigation, Autoplay],
  loop: false,
  breakpoints: {
    320: { slidesPerView: 2, spaceBetween: 1 },
    480: { slidesPerView: 2, spaceBetween: 1 },
    768: { slidesPerView: 3, spaceBetween: 1 },
    1024: { slidesPerView: 4, spaceBetween: 1 },
    1280: { slidesPerView: 5, spaceBetween: 1 },
  },
};

const RelatedProducts = ({ brand, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brand && !category) {
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('brand', brand)
        .eq('category', category)
        .limit(12);

      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchRelated();
  }, [brand, category]);

  if (!loading && products.length === 0) return null;

  return (
    <div className="rp-section">
      <div className="rp-header">
        <h2 className="rp-title">
          Related <span>Products</span>
        </h2>
        {brand && (
          <p className="rp-subtitle">
            Based on {brand}
            {category ? ` · ${category}` : ''}
          </p>
        )}
      </div>

      <div className="rp-slider-wrap">
        <div className="rp-swiper-prev">
          <IoIosArrowBack />
        </div>
        <div className="rp-swiper-next">
          <IoIosArrowForward />
        </div>

        <Swiper {...swiperConfig}>
          {loading
            ? [...Array(5)].map((_, i) => (
                <SwiperSlide key={i}>
                  <div className="rp-card">
                    <Skeleton height={180} borderRadius={10} />
                    <div style={{ padding: '10px 0' }}>
                      <Skeleton height={14} width="80%" />
                      <Skeleton height={12} width="40%" style={{ marginTop: 6 }} />
                    </div>
                  </div>
                </SwiperSlide>
              ))
            : products.map((product) => (
                <SwiperSlide key={product.id}>
                  <Link to={`/product/${product.id}`} className="rp-card">
                    <div className="rp-card-img">
                      <img
                        src={`${SUPABASE_IMG_BASE}${product.banner_url}`}
                        alt={product.name}
                        draggable={false}
                      />
                    </div>
                    <div className="rp-card-info">
                      <p className="rp-card-name">{product.name}</p>
                      <div className="rp-card-bottom">
                        <span className="rp-card-price">${product.amount}</span>
                        <div className="rp-card-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={10}
                              color={i < (product.rating || 0) ? '#FEC78A' : '#ddd'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </div>
  );
};

export default RelatedProducts;
