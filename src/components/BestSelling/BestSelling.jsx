import React, { useState, useEffect } from "react";
import "./BestSelling.css";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { FiHeart } from "react-icons/fi";
import { FaStar, FaCartPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { addToCart } from "../../redux/slice/userCart.ts";
import { useAppDispatch } from "../../redux/index.ts";

import { supabase } from "../../supaBaseClient";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BestSelling = () => {
  const { bestSellingProduct, user } = useAuth();
  const [wishList, setWishList] = useState({});
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const addProduct = async (product) => {
    dispatch(addToCart({ userId: user.id, product }));
  };

  const handleWishlistClick = (productID) => {
    setWishList((prevWishlist) => ({
      ...prevWishlist,
      [productID]: !prevWishlist[productID],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let componentMounted = true;

    const getProducts = async () => {
      setLoading(true);
      try {
        const result = await bestSellingProduct();
        if (componentMounted) {
          setData(result);
          setFilter(result);
        }
      } catch (error) {
        console.error("Error fetching best-selling products:", error.message);
        toast.error("Failed to load products.");
      }
      setLoading(false);
    };

    getProducts();
    return () => {
      componentMounted = false;
    };
  }, []);

 const LoadingSkeleton = () => (
    <>
    <div className="row">
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="col-6 col-md-4 col-lg-3">
          <Skeleton height={350} />
        </div>
      ))}
      </div>
    </>
  );

  return (
    <div className="limitedProductSection">
      <h5 className="text-left mb-3">
        Best Selling <span>Product</span>
      </h5>
      <div className="limitedProductSlider">
        <div className="swiper-button image-swiper-button-next">
          <IoIosArrowForward />
        </div>
        <div className="swiper-button image-swiper-button-prev">
          <IoIosArrowBack />
        </div>

        <Swiper
          slidesPerView={4}
          slidesPerGroup={4}
          spaceBetween={30}
          loop={true}
          navigation={{
            nextEl: ".image-swiper-button-next",
            prevEl: ".image-swiper-button-prev",
          }}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          modules={[Navigation, Autoplay]}
          breakpoints={{
            320: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 14 },
            768: { slidesPerView: 3, slidesPerGroup: 1, spaceBetween: 24 },
            1024: { slidesPerView: 4, slidesPerGroup: 1, spaceBetween: 30 },
          }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : (
            data.slice(0, 10).map((item) => {
              const product = item.products;
              return (
                <SwiperSlide key={product.id}>
                  <div className="lpContainer">
                    <div className="lpImageContainer">
                      <Link to="/Product" onClick={scrollToTop}>
                        <img
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                          alt={product.name}
                          className="lpImage"
                        />
                      </Link>
                      <h4
                        onClick={() => {
                          if (!user) {
                            toast.error("Please login to add products to cart.");
                            navigate("/login");
                            return;
                          }         
                          addProduct(product);
                        }}
                      >
                        Add to Cart
                      </h4>
                    </div>

                    <div className="lpProductImagesCart">
                      <FaCartPlus />
                    </div>

                    <div className="limitedProductInfo">
                      <div className="lpCategoryWishlist">
                        <p>Dresses</p>
                        <FiHeart
                          onClick={() => handleWishlistClick(product.id)}
                          style={{
                            color: wishList[product.id] ? "red" : "#767676",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <div className="productNameInfo">
                        <Link to="/Product" onClick={scrollToTop}>
                          <h5>{product.name}</h5>
                        </Link>
                        <p>${product.amount}</p>
                        <div className="productRatingReviews">
                          <div className="productRatingStar">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FaStar
                                key={i}
                                color={
                                  i < product.rating ? "#FEC78A" : "#e4e5e9"
                                }
                                size={10}
                              />
                            ))}
                          </div>
                          <span>{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default BestSelling;
