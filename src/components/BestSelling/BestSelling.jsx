import React, { useState ,useEffect} from "react";
import "./BestSelling.css";


import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";
import { Autoplay } from "swiper/modules";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext"; // adjust path if needed
import { FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaCartPlus } from "react-icons/fa";
import { supabase } from "../../supaBaseClient";

import toast from "react-hot-toast";

const BestSelling = () => {
    const { bestSellingProduct , addToCart, user} = useAuth(); // get user from context
  
  const [wishList, setWishList] = useState({});
  const navigate = useNavigate();
  
   const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);

  const addProduct = async (product) => {
    await addToCart(product);
  };

  const handleWishlistClick = (productID) => {
    setWishList((prevWishlist) => ({
      ...prevWishlist,
      [productID]: !prevWishlist[productID],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

useEffect(() => {
  let componentMounted = true;

  const getProducts = async () => {
    setLoading(true);

    try {
      const data = await bestSellingProduct();
      if (componentMounted) {
        console.log(data);
        setData(data);
        setFilter(data);
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

useEffect(() => {
  const channel = supabase
    .channel("realtime:best_sell")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "best_selling_product",
      },
      (payload) => {
        console.log("New best-sell inserted:", payload.new);
        setData((prev) => {
          const updated = [...prev.slice(1), payload.new]; // remove first, add new
          setFilter(updated); // optional, if using `filter`
          return updated;
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);


  return (
    <>
      <div className="limitedProductSection">
        <h5 className="text-left mb-3">
          Best Selling <span>Product</span>
        </h5>
        <div className="limitedProductSlider">
          <div className="swiper-button image-swiper-button-next ">
            <IoIosArrowForward  />
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
              320: {
                slidesPerView: 2,
                slidesPerGroup: 1,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 3,
                slidesPerGroup: 1,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 1,
                spaceBetween: 30,
              },
            }}
          >
            {data.slice(1, 10).map((item) => {
              return (
                <SwiperSlide key={item.products.id}>
                  <div className="lpContainer">
                    <div className="lpImageContainer">
                      <Link to="/Product" onClick={scrollToTop}>
                        <img
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                          alt={item.products.name}
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
                    toast.success("Added to cart");
                    addProduct(item.products);
                  }}
                      >
                        Add to Cart
                      </h4>
                    </div>
                    <div
                      className="lpProductImagesCart"
                     
                    >
                      <FaCartPlus />
                    </div>
                    <div className="limitedProductInfo">
                      <div className="lpCategoryWishlist">
                        <p>Dresses</p>
                        <FiHeart
                          onClick={() => handleWishlistClick(item.products.id)}
                          style={{
                            color: wishList[item.products.id]
                              ? "red"
                              : "#767676",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <div className="productNameInfo">
                        <Link to="/Product" onClick={scrollToTop}>
                          <h5>{item.products.name}</h5>
                        </Link>
                        <p>${item.products.amount}</p>
                        <div className="productRatingReviews">
                          <div className="productRatingStar">
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                          </div>

                          <span>{item.products.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
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