import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { supabase } from "../supaBaseClient";
import { Footer, Navbar } from "../components";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext"; // adjust path if needed
import { useNavigate } from "react-router-dom";
import "./Product.css";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { FiHeart } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";
import AdditionalInfo from "../components/AdditionalInfo";
import { addToCart } from "../redux/slice/userCart.ts";
import { useAppDispatch } from "../redux/index.ts";
import { trackProductPreview, trackAddToCart } from "../utils/tracking";
import GooglePayButton from '@google-pay/button-react';
import { fetchTotalCart } from "../redux/slice/userCart.ts";
import { trackPurchase } from "../utils/tracking";

import { buildPaymentRequest, getUpdatedPaymentData } from '../components/GooglePlay.jsx';
const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const { user, placeOrderSingle } = useAuth(); // get user from context
  const [paymentRequest, setPaymentRequest] = useState(null);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const addProduct = async (product) => {
    dispatch(addToCart({ userId: user?.id, product }));
    // track add-to-cart for logged-in users
    await trackAddToCart(dispatch, user?.id, product);
  };

  async function handleLoadPaymentData(paymentData) {
    
    setOrderLoading(true);
    const parsedToken = JSON.parse(
      paymentData.paymentMethodData.tokenizationData.token
    );

    const address = {
      addressLine1: paymentData.shippingAddress.address1,
      addressLine2: paymentData.shippingAddress.address2 || null,
      country: paymentData.shippingAddress.countryCode,
      state: paymentData.shippingAddress.administrativeArea,
      city: paymentData.shippingAddress.locality,
      zipCode: paymentData.shippingAddress.postalCode,
    };

    const finalData = {
      token: parsedToken.id,
      amount: product.amount,
      name: user.name,
      email: user.email,
      address,
      comment: "Payment for order",
    };

    try {
      const response = await fetch(
        "https://fzliiwigydluhgbuvnmr.supabase.co/functions/v1/smart-handler",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bGlpd2lneWRsdWhnYnV2bm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjkxNTMsImV4cCI6MjA1NzUwNTE1M30.w3Y7W14lmnD-gu2U4dRjqIhy7JZpV9RUmv8-1ybQ92w", // Your Bearer Token
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      const result = await response.json();

      let status = "success";

      if (result.message != "Payment successful") {
        status = "failed";
        toast.error(result?.error || "Payment processing failed.");
        setOrderLoading(false);
        return;
      }

      const orderId = await placeOrderSingle(
        {
          ...finalData,
          payment_status: status,
          shippingMethod: "free",
        },
        result,
        product,
        quantity
      );

      if (orderId) {
        dispatch(fetchTotalCart(user.id)); // Update cart total
        // track purchase (order-level + per-item bulk)
        await trackPurchase(dispatch, user?.id, { id: orderId });
        toast.success("Payment processed successfully!");
      }
    } catch (err) {
      console.log(err);
      const errorMessage =
        err.response?.data?.errors?.error_message ||
        err.response?.data?.message ||
        "Payment failed";
      toast.error(`Payment error: ${errorMessage}`);
    } finally {
      setOrderLoading(false);
    }
  }

  useEffect(() => {
    if (!product || !product.amount) return;

    const newRequest = buildPaymentRequest([
      {
        label: product.name,
        price: product.amount.toString(),
        type: "LINE_ITEM",
      },
    ]);

    setPaymentRequest(newRequest);
  }, [product]);

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
            product_images(id, image_url, is_primary),
            product_reviews(id, user_id, picture, comment, rating, created_at,
            users (
              id,
              name,
              email,
              profile
            ))
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
      console.log('productData', productData);
      setProduct(productData);
      if (user) {
        // use helper which maps to 'view' type
        await trackProductPreview(dispatch, user?.id, productData);
      }

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
  }, []);

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
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <img
              src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${activeImage}`}
              alt={activeImage}
              style={{
                width: "400px",       // bigger width
                maxWidth: "70%",     // responsive
                height: "400px",      // bigger height
                objectFit: "contain",
                borderRadius: "8px",  // optional rounded corners
              }}
            />
          </div>
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

        </div>

        {/* Product Details */}
        <div className="productDetails">
          <div className="productBreadcrumb">
            <div className="breadcrumbLink">
              <Link to="/">Home</Link>&nbsp;/&nbsp;
              <Link to="/product">The Shop</Link>

            </div>
          </div>
          <div className="productName">
            <div className="product-page-title">{product.name}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "100px" }}>

            <h2 className="productPrice">${product.amount}</h2>
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
              <div>({product?.rating || 0} / 5)</div>

            </p>
          </div>

          <h3 className="product-section-title">Description</h3>
          <p className="productDescription text-muted">
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
          </div>
          {paymentRequest && user && (
            orderLoading ? (
              <div className="paymentProcessing" style={{ padding: 12, borderRadius: 6, background: '#f8f9fa', textAlign: 'center' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Processing payment…</div>
                <div style={{ fontSize: 13, color: '#666' }}>This may take a few seconds — please do not close the window.</div>
              </div>
            ) : (
              <GooglePayButton
                environment="TEST"
                buttonSizeMode="fill"
                paymentRequest={paymentRequest}
                onLoadPaymentData={handleLoadPaymentData}
                onError={(error) => console.error(error)}
                onPaymentDataChanged={(paymentData) =>
                  getUpdatedPaymentData(paymentRequest, paymentData)
                }
              />
            )
          )}
          <div className="productCartBtn">
            <button
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
            </button>
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
        {/* <div className="related-products-wrapper">
          <div className="related-products-grid">
            {similarProducts.slice(0, 4).map((item) => {
              return (
                <div key={item.id} className="rpContainer">
                  <div className="rpImages">
                    <img
                      src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                      alt="Card"
                      className="rpFrontImg"
                      style={{
                        width: "100%",
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
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                        transition: "transform 0.3s ease",
                      }}
                    />
                    <h4
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
                    </h4>
                  </div>
                  <div className="relatedProductInfo">
                    <h5>{item.name.substring(0, 20)}</h5>
                    <p className="productRatingReviews">
                      {Array.from({ length: 5 }, (_, i) => {
                        const rating = item?.rating || 0;
                        if (rating >= i + 1) {
                          return <i key={i} className="fa fa-star text-warning"></i>;
                        } else if (rating >= i + 0.5) {
                          return (
                            <i key={i} className="fa fa-star-half-o text-warning"></i>
                          );
                        } else {
                          return <i key={i} className="fa fa-star-o text-warning"></i>;
                        }
                      })}
                      <span> ({item?.rating || 0} / 5)</span>
                    </p>
                    <p>${item.amount}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}

      </>
    );
  };
  return (
    <>
      <div className="productSection">
        <div className=" productShowCase">{loading ? <Loading /> : <ShowProduct />}</div>
        <div className="row my-5 py-5">
          <div className="d-md-block">
            <AdditionalInfo product_reviews={product?.product_reviews} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
