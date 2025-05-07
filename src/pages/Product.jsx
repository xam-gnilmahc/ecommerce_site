import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { supabase } from "../supaBaseClient";
import { Footer, Navbar } from "../components";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import "./Product.css";
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { FiHeart } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";
import AdditionalInfo from "../components/AdditionalInfo";
const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const { user, addToCart } = useAuth(); // get user from context
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const addProduct = async (product) => {
    await addToCart({...product, qty:quantity});
  };

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setLoading2(true);

      const fetchProductById = async (id) => {
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            product_items(id, size, sku_number, color),
            product_images(id, image_url, is_primary)
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching product by ID:", error);
          return null;
        }
        return data;
      };

      const productData = await fetchProductById(id);
      setProduct(productData);
      setLoading(false);

      if (productData) {
        const fetchProductByCategory = async () => {
          const { data, error } = await supabase
            .from("products")
            .select(
              `
              *
            `
            )
            .eq("category", productData.category)
            .range(0, 20);

          if (error) {
            console.error("Error fetching product by ID:", error);
            return null;
          }
          return data;
        };
        const data = await fetchProductByCategory();
        setSimilarProducts(data);
      }

      setLoading2(false);
    };

    getProduct();
  }, [id]);

  const [activeImage, setActiveImage] = useState("");

  // Set initial active image after product loads
  useEffect(() => {
    if (product && product.product_images) {
      const primary = product.product_images.find((img) => img.is_primary);
      if (primary) {
        setActiveImage(primary.image_url);
      } else {
        setActiveImage(product.banner_url);
      }
    }
  }, [product]);

  const sizes = ["XS", "S", "M", "L", "XL"];
  const sizesFullName = [
    "Extra Small",
    "Small",
    "Medium",
    "Large",
    "Extra Large",
  ];
  const [selectSize, setSelectSize] = useState("S");

  const [highlightedColor, setHighlightedColor] = useState("#C8393D");
  const colors = ["#222222", "#C8393D", "#E4E4E4"];
  const colorsName = ["Black", "Red", "Grey"];

  const [quantity, setQuantity] = useState(1);

  const increment = () => {
    setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const [clicked, setClicked] = useState(false);

  const handleWishClick = () => {
    setClicked(!clicked);
  };

  const Loading = () => {
    return (
      <>
        <div className="container my-5 py-2">
          <div className="row">
            <div className="col-md-6 py-3">
              <Skeleton height={400} width={400} />
            </div>
            <div className="col-md-6 py-5">
              <Skeleton height={30} width={250} />
              <Skeleton height={90} />
              <Skeleton height={40} width={70} />
              <Skeleton height={50} width={110} />
              <Skeleton height={120} />
              <Skeleton height={40} width={110} inline={true} />
              <Skeleton className="mx-3" height={40} width={110} />
            </div>
          </div>
        </div>
      </>
    );
  };

  const ShowProduct = () => {
    return (
      <>
     
            {/* Product Image + Thumbnails */}
            <div className="productGallery">
              <div className="productThumb">
                {product.product_images?.map((img) => (
                  <img
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${img.image_url}`}
                    alt="thumb"
                    style={{
                      width: 80,
                      height: 80,
                      margin: 5,
                      padding: 3,
                      border:
                        activeImage === img.image_url
                          ? "2px solid black"
                          : "1px solid gray",
                      borderRadius: 4,
                      cursor: "pointer",
                      objectFit: "contain",
                    }}
                  />
                ))}
              </div>
              <div className="productFullImg">
                <img
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${activeImage}`}
                  alt={activeImage}
                  style={{ maxHeight: "350px", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="productDetails">
              <div className="productBreadcrumb">
                <div className="breadcrumbLink">
                  <Link to="/">Home</Link>&nbsp;/&nbsp;
                  <Link to="/product">The Shop</Link>
                </div>
                <div className="prevNextLink">
                  <Link to="/product">
                    <GoChevronLeft />
                    <p style={{ margin: 0 }}>Prev</p>
                  </Link>
                  <Link to="/product">
                    <p style={{ margin: 0 }}>Next</p>
                    <GoChevronRight />
                  </Link>
                </div>
              </div>
              <div className="productName">
                <h1>{product.name}</h1>
              </div>

              <p className="productRating">
                {Array.from({ length: 5 }, (_, i) => {
                  const rating = product?.rating || 0;
                  if (rating >= i + 1) {
                    return <i key={i} className="fa fa-star text-warning"></i>; // full star
                  } else if (rating >= i + 0.5) {
                    return (
                      <i key={i} className="fa fa-star-half-o text-warning"></i>
                    ); // half star
                  } else {
                    return (
                      <i key={i} className="fa fa-star-o text-warning"></i>
                    ); // empty star
                  }
                })}
                <p>({product?.rating || 0} / 5)</p>
              </p>
              <h2 className="productPrice">${product.amount}</h2>
              <p className="productDescription">
                {product.description?.substring(0, 200)}
              </p>

              <div className="productSizeColor">
                <div className="productSize">
                  <p style={{ margin: 0 }}>Sizes</p>
                  <div className="sizeBtn">
                    {sizes.map((size, index) => (
                      <Tooltip
                        key={size}
                        title={sizesFullName[index]}
                        placement="top"
                        TransitionComponent={Zoom}
                        enterTouchDelay={0}
                        arrow
                      >
                        <button
                          style={{
                            borderColor:
                              selectSize === size ? "#000" : "#e0e0e0",
                          }}
                          onClick={() => setSelectSize(size)}
                        >
                          {size}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                <div className="productColor">
                  <p style={{ margin: 0 }}>Color</p>
                  <div className="colorBtn">
                    {colors.map((color, index) => (
                      <Tooltip
                        key={color}
                        title={colorsName[index]}
                        placement="top"
                        enterTouchDelay={0}
                        TransitionComponent={Zoom}
                        arrow
                      >
                        <button
                          className={
                            highlightedColor === color ? "highlighted" : ""
                          }
                          style={{
                            backgroundColor: color.toLowerCase(),
                            border:
                              highlightedColor === color
                                ? "0px solid #000"
                                : "0px solid white",
                            padding: "8px",
                            margin: "5px",
                            cursor: "pointer",
                          }}
                          onClick={() => setHighlightedColor(color)}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
              <div className="productCartQuantity">
                <div className="productQuantity">
                  <button onClick={decrement}>-</button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={handleInputChange}
                  />
                  <button onClick={increment}>+</button>
                </div>
                <div className="productCartBtn">
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login to add products to cart.");
                        navigate("/login");
                        return;
                      }
                      toast.success("Added to cart");
                      addProduct(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="productWishShare">
                <div className="productWishList">
                  <button onClick={handleWishClick}>
                    <FiHeart color={clicked ? "red" : ""} size={17} />
                    <p style={{ margin: 0 }}>Add to Wishlist</p>
                  </button>
                </div>
                <div className="productShare">
                  <PiShareNetworkLight size={22} />
                  <p style={{ margin: 0 }}>Share</p>
                </div>
              </div>
              <div className="productTags">
                <p>
                  <span>SKU: </span>N/A
                </p>
                <p>
                  <span>CATEGORIES: </span>Mobile , Tablet , Laptop
                </p>
                <p>
                  <span>TAGS: </span>Electronics, Gadgets, Smartphone
                </p>
              </div>
            </div>
        
      </>
    );
  };

  const Loading2 = () => {
    return (
      <>
        <div className="my-4 py-4">
          <div className="d-flex">
            <div className="mx-4">
              <Skeleton height={400} width={250} />
            </div>
            <div className="mx-4">
              <Skeleton height={400} width={250} />
            </div>
            <div className="mx-4">
              <Skeleton height={400} width={250} />
            </div>
            <div className="mx-4">
              <Skeleton height={400} width={250} />
            </div>
          </div>
        </div>
      </>
    );
  };

  const ShowSimilarProduct = () => {
    return (
      <>
        <div className="">
          <div className="d-flex gap-5 ">
            {similarProducts.map((item) => {
              return (
                <div key={item.id} className="rpContainer">
                     <div className="rpImages" >
                  <img
                    
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                    alt="Card"
                     className="rpFrontImg"
                     style={{
                      width: "250px",
                      maxHeight: "300px",
                      objectFit: "contain",
                      transition: "transform 0.3s ease",
                    }}
                  />
                   <img
                    
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                    alt="Card"
                     className="rpBackImg"
                     style={{
                      width: "250px",
                      maxHeight: "300px",
                      objectFit: "contain",
                      transition: "transform 0.3s ease",
                    }}
                  />
                  
                    <h4  onClick={() => {
                      if (!user) {
                        toast.error("Please login to add products to cart.");
                        navigate("/login");
                        return;
                      }
                      toast.success("Added to cart");
                      addProduct(product);
                    }}>Add to Cart</h4>
                    </div>
                    <div className="relatedProductInfo">
                  <h5 >
                    {item.name.substring(0, 20)}
                  </h5>

                  {/* Centered Rating */}
                  <p className="productRatingReviews">
                    {Array.from({ length: 5 }, (_, i) => {
                      const rating = item?.rating || 0;
                      if (rating >= i + 1) {
                        return (
                          <i key={i} className="fa fa-star text-warning"></i>
                        ); // full star
                      } else if (rating >= i + 0.5) {
                        return (
                          <i
                            key={i}
                            className="fa fa-star-half-o text-warning"
                          ></i>
                        ); // half star
                      } else {
                        return (
                          <i key={i} className="fa fa-star-o text-warning"></i>
                        ); // empty star
                      }
                    })}
                    <span>
                      ({item?.rating || 0} / 5)
                    </span>
                  </p>

                  <p>
                    ${item.amount}
                  </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };
  return (
    <>
      <Navbar />
      <div className="productSection">
        <div className="productShowCase">{loading ? <Loading /> : <ShowProduct />}</div>
        <div className="row my-5 py-5">
          <div className="d-none d-md-block">
            <AdditionalInfo/>
            <div className="relatedProducts">
          <h2>
            RELATED <span>PRODUCTS</span>
          </h2>
        </div>
            {similarProducts.length > 0 ? (
          <>
                {loading2 ? <Loading2 /> : <ShowSimilarProduct />}
                </>
              
            ) : (
              <>
                <div className="py-4 my-4">
                  <div className="d-flex">
                    {similarProducts.map((item) => {
                      return (
                        <div key={item.id} className="m-4 text-center">
                          <img
                            className="card-img-top p-3"
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                            alt="Card"
                            style={{
                              width: "auto",
                              maxHeight: "250px",
                              objectFit: "contain",
                            }}
                          />
                          <h5 className="text-lg font-semibold mb-1">
                            {item.name.substring(0, 20)}
                          </h5>

                          {/* Centered Rating */}
                          <p className="mb-1 lead mb-3 d-flex align-items-center justify-content-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => {
                              const rating = item?.rating || 0;
                              if (rating >= i + 1) {
                                return (
                                  <i
                                    key={i}
                                    className="fa fa-star text-warning"
                                  ></i>
                                ); // full star
                              } else if (rating >= i + 0.5) {
                                return (
                                  <i
                                    key={i}
                                    className="fa fa-star-half-o text-warning"
                                  ></i>
                                ); // half star
                              } else {
                                return (
                                  <i
                                    key={i}
                                    className="fa fa-star-o text-warning"
                                  ></i>
                                ); // empty star
                              }
                            })}
                            <span className="ms-2 text-muted">
                              ({item?.rating || 0} / 5)
                            </span>
                          </p>

                          <p className="text-xl font-bold my-2 text-gray-800">
                            ${item.amount}
                          </p>

                          <div className="card-body">
                            <Link
                              to={"/product/" + item.id}
                              className="btn btn-dark m-1"
                            >
                              Buy Now
                            </Link>
                            <button
                              className="btn btn-dark m-1"
                              onClick={() => addProduct(item)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
