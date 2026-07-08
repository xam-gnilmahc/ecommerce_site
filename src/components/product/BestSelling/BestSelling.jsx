import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/authContext';
import { FiHeart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { addToCart } from '../../../redux/slice/userCart.ts';
import { useAppDispatch } from '../../../redux/index.ts';
import { trackAddToCart } from '../../../utils/tracking.ts';
import { supabase } from '../../../supaBaseClient';

import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BestSelling = () => {
  const { bestSellingProduct, user, visitor, trackProduct } = useAuth();
  const [wishList, setWishList] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Recently visited state
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const addProduct = (product) => {
    dispatch(addToCart({ userId: user.id, product }));
    trackAddToCart(dispatch, user?.id, product);
  };

  const handleWishlistClick = (id) => {
    setWishList((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch best selling
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const result = await bestSellingProduct();
      setData(result);
      setLoading(false);
    };
    fetch();
  }, []);

  // Fetch recently visited products from cookie IDs
  // product_ids are stored oldest→newest, so we reverse to show newest first
  useEffect(() => {
    const ids = visitor?.product_ids;
    if (!ids || ids.length === 0) return; // no cookie data → don't fetch

    const fetchRecent = async () => {
      setRecentLoading(true);
      const { data, error } = await supabase.from('products').select('*').in('id', ids);

      if (!error && data) {
        // sort by the order in cookie (reversed — most recent first)
        const reversed = [...ids].reverse();
        const sorted = reversed.map((id) => data.find((p) => p.id === id)).filter(Boolean); // remove any not found
        setRecentProducts(sorted);
      }
      setRecentLoading(false);
    };

    fetchRecent();
  }, [visitor?.product_ids]);

  const recentSwiperConfig = {
    loop: true,
    navigation: {
      nextEl: '.recent-swiper-button-next',
      prevEl: '.recent-swiper-button-prev',
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

  const bestSellingSwiperConfig = {
    loop: true,
    navigation: {
      nextEl: '.bestselling-swiper-button-next',
      prevEl: '.bestselling-swiper-button-prev',
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
    <div className="flex flex-col cursor-pointer">
      <div className="relative w-full h-[220px] flex items-center justify-center overflow-hidden max-md:h-[210px] max-sm:h-[180px]">
        <Link to={`/product/${product.id}`} onClick={() => trackProduct(product.id)}>
          <img
            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
            className="w-[90%] h-[190px] object-contain block mx-auto"
            alt={product.name}
          />
        </Link>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-[11px] uppercase text-[#9ca3af]">Product</p>
          <FiHeart
            onClick={() => handleWishlistClick(product.id)}
            style={{
              color: wishList[product.id] ? 'red' : '#888',
              cursor: 'pointer',
            }}
          />
        </div>

        <div className="text-[15px] font-semibold text-[#111827] leading-[1.3] line-clamp-2">
          <Link to={`/product/${product.id}`} onClick={() => trackProduct(product.id)}>
            {product.name}
          </Link>
        </div>

        <p className="text-[17px] font-bold text-[#111827]">${product.amount}</p>

        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} size={10} color={i < product.rating ? '#FEC78A' : '#ddd'} />
          ))}
          <span className="text-[13px] text-[#6b7280]">{product.rating}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Recently Visited — only shows if cookie has product IDs ── */}
      {(recentLoading || recentProducts.length > 0) && (
        <div className="my-[30px] px-[clamp(10px,4.3vw,120px)]">
          <h5 className="text-[30px] font-bold mb-[35px] text-[#111827] max-md:text-[20px]">
            Recently <span className="text-[#6b7280]">Visited</span>
          </h5>

          <div className="relative">
            <div className="swiper-button recent-swiper-button-prev absolute top-[45%] -left-[20px] z-20 cursor-pointer max-md:hidden">
              <div className="w-[42px] h-[42px] p-2.5 rounded-full bg-white border border-[#e5e7eb] shadow-none">
                <IoIosArrowBack />
              </div>
            </div>
            <div className="swiper-button recent-swiper-button-next absolute top-[45%] -right-[20px] z-20 cursor-pointer max-md:hidden">
              <div className="w-[42px] h-[42px] p-2.5 rounded-full bg-white border border-[#e5e7eb] shadow-none">
                <IoIosArrowForward />
              </div>
            </div>

            <Swiper {...recentSwiperConfig} slidesPerView={5} spaceBetween={20}>
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
      <div className="my-[30px] px-[clamp(10px,4.3vw,120px)]">
        <h5 className="text-[30px] font-bold mb-[35px] text-[#111827] max-md:text-[20px]">
          Best Selling <span className="text-[#6b7280]">Product</span>
        </h5>

        <div className="relative">
          <div className="swiper-button bestselling-swiper-button-prev absolute top-[45%] -left-[20px] z-20 cursor-pointer max-md:hidden">
            <div className="w-[42px] h-[42px] p-2.5 rounded-full bg-white border border-[#e5e7eb] shadow-none">
              <IoIosArrowBack />
            </div>
          </div>
          <div className="swiper-button bestselling-swiper-button-next absolute top-[45%] -right-[20px] z-20 cursor-pointer max-md:hidden">
            <div className="w-[42px] h-[42px] p-2.5 rounded-full bg-white border border-[#e5e7eb] shadow-none">
              <IoIosArrowForward />
            </div>
          </div>

          <Swiper {...bestSellingSwiperConfig} slidesPerView={5} spaceBetween={20}>
            {loading
              ? [...Array(5)].map((_, i) => (
                  <SwiperSlide key={i}>
                    <Skeleton height={300} />
                  </SwiperSlide>
                ))
              : data.slice(0, 10).map((item) => {
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
