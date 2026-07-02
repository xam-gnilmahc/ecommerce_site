import React, { useState } from 'react';
import './BestSelling.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';
import { FiHeart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { useAddToCart } from '../../../hooks/useCartMutations.ts';
import { trackAddToCart } from '../../../utils/tracking.ts';
import { useBestSelling, useRecentlyVisited } from '../../../hooks/useBestSelling.ts';

import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BestSelling = () => {
  const { user, visitor, trackProduct } = useAuth();
  const [wishList, setWishList] = useState({});

  const navigate = useNavigate();
  const addToCartMutation = useAddToCart();

  // TanStack Query hooks
  const { data: bestSellingData = [], isLoading: loading } = useBestSelling();
  const { data: recentProducts = [], isLoading: recentLoading } = useRecentlyVisited(
    visitor?.product_ids
  );

  const addProduct = (product) => {
    addToCartMutation.mutate({ userId: user.id, product });
    trackAddToCart(user?.id, product);
  };

  const handleWishlistClick = (id) => {
    setWishList((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const swiperConfig = {
    loop: true,
    navigation: {
      nextEl: '.image-swiper-button-next',
      prevEl: '.image-swiper-button-prev',
    },
    autoplay: { delay: 2500 },
    modules: [Navigation, Autoplay],
    breakpoints: {
      320: { slidesPerView: 2, spaceBetween: 1 },
      640: { slidesPerView: 2, spaceBetween: 1 },
      768: { slidesPerView: 3, spaceBetween: 2 },
      1024: { slidesPerView: 4, spaceBetween: 2 },
      1280: { slidesPerView: 5, spaceBetween: 2 },
    },
  };

  const ProductCard = ({ product }) => (
    <div className="lpContainer">
      <div className="lpImageContainer">
        <Link to={`/product/${product.id}`} onClick={() => trackProduct(product.id)}>
          <img
            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
            className="lpImage"
            alt={product.name}
          />
        </Link>
      </div>

      <div className="limitedProductInfo">
        <div className="lpCategoryWishlist">
          <p>Product</p>
          <FiHeart
            onClick={() => handleWishlistClick(product.id)}
            style={{
              color: wishList[product.id] ? 'red' : '#888',
              cursor: 'pointer',
            }}
          />
        </div>

        <div className="product-title">
          <Link to={`/product/${product.id}`} onClick={() => trackProduct(product.id)}>
            {product.name}
          </Link>
        </div>

        <p className="product-price">${product.amount}</p>

        <div className="productRatingReviews">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} size={10} color={i < product.rating ? '#FEC78A' : '#ddd'} />
          ))}
          <span>{product.rating}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Recently Visited — only shows if cookie has product IDs ── */}
      {(recentLoading || recentProducts.length > 0) && (
        <div className="limitedProductSection">
          <h5>
            Recently <span>Visited</span>
          </h5>

          <div className="limitedProductSlider">
            <div className="swiper-button image-swiper-button-prev">
              <IoIosArrowBack />
            </div>
            <div className="swiper-button image-swiper-button-next">
              <IoIosArrowForward />
            </div>

            <Swiper {...swiperConfig} slidesPerView={5} spaceBetween={20}>
              {recentLoading
                ? [...Array(5)].map((_, i) => (
                    <SwiperSlide key={i}>
                      <Skeleton height={300} />
                    </SwiperSlide>
                  ))
                : recentProducts.map((product, index) => (
                    <SwiperSlide key={`recent-${index}-${product.id}`}>
                      <ProductCard product={product} />
                    </SwiperSlide>
                  ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* ── Best Selling ── */}
      <div className="limitedProductSection">
        <h5>
          Best Selling <span>Product</span>
        </h5>

        <div className="limitedProductSlider">
          <div className="swiper-button image-swiper-button-prev">
            <IoIosArrowBack />
          </div>
          <div className="swiper-button image-swiper-button-next">
            <IoIosArrowForward />
          </div>

          <Swiper {...swiperConfig} slidesPerView={5} spaceBetween={20}>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <SwiperSlide key={i}>
                    <Skeleton height={300} />
                  </SwiperSlide>
                ))
              : bestSellingData.slice(0, 10).map((item) => {
                  const product = item.products;
                  return (
                    <SwiperSlide key={product.id}>
                      <ProductCard product={product} />
                    </SwiperSlide>
                  );
                })}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default BestSelling;
