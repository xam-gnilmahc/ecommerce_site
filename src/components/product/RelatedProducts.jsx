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

const SUPABASE_IMG_BASE =
  'https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/';

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
    <div className="px-[110px] pt-[20px] pb-[6px] mt-32 md:mt-[20px]">
      <div className="mb-[35px]">
        <h2 className="text-[30px] font-bold text-[#111827] m-0 md:text-[20px]">
          Related <span className="text-[#6b7280]">Products</span>
        </h2>
        {brand && (
          <p className="text-[13px] text-[#9ca3af] mt-1">
            Based on {brand}
            {category ? ` · ${category}` : ''}
          </p>
        )}
      </div>

      <div className="relative">
        <div className="rp-swiper-prev absolute top-[45%] -left-5 z-20 cursor-pointer md:hidden">
          <IoIosArrowBack className="w-[42px] h-[42px] p-2.5 rounded-full bg-white border border-[#e5e7eb] shadow-none text-[#111827]" />
        </div>
        <div className="rp-swiper-next absolute top-[45%] -right-5 z-20 cursor-pointer md:hidden">
          <IoIosArrowForward className="w-[42px] h-[42px] p-2.5 rounded-full bg-white border border-[#e5e7eb] shadow-none text-[#111827]" />
        </div>

        <Swiper {...swiperConfig}>
          {loading
            ? [...Array(5)].map((_, i) => (
                <SwiperSlide key={i}>
                  <div className="flex flex-col cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-1">
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
                  <Link
                    to={`/product/${product.id}`}
                    className="flex flex-col cursor-pointer no-underline transition-transform duration-300 ease-in-out hover:-translate-y-1"
                  >
                    <div className="relative w-full h-[220px] flex items-center justify-center overflow-hidden md:h-[210px] max-md:h-[180px]">
                      <img
                        src={`${SUPABASE_IMG_BASE}${product.banner_url}`}
                        alt={product.name}
                        draggable={false}
                        className="w-[90%] h-[190px] object-contain block mx-auto"
                      />
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                      <p className="text-[15px] font-semibold text-[#111827] m-0 leading-tight line-clamp-2">
                        {product.name}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[17px] font-bold text-[#111827]">
                          ${product.amount}
                        </span>
                        <div className="flex items-center gap-1.5">
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
