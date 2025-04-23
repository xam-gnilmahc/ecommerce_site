import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { supabase } from "../supaBaseClient";
import { Footer, Navbar } from "../components";
import toast from "react-hot-toast";
import { useAuth } from '../context/authContext'; // adjust path if needed
import { useNavigate } from "react-router-dom";


const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const { user } = useAuth(); // get user from context
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
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
      } else if (product.product_images.length > 0) {
        setActiveImage(product.product_images[0].image_url);
      }
    }
  }, [product]);

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
        <div className="container my-5 py-2">
          <div className="row">
            {/* Product Image + Thumbnails */}
            <div className="col-md-6 col-12 py-5">
              <div className="w-full text-center">
                <img
                  className="img-fluid rounded "
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${activeImage}`}
                  alt={product.title}
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              </div>
              <div className="d-flex flex-wrap justify-content-center mt-3">
                {product.product_images?.map((img) => (
                  <img
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${img.image_url}`}
                    alt="thumb"
                    style={{ width: 80, height: 80, margin: 5, border: activeImage === img.image_url ? "2px solid black" : "1px solid gray", borderRadius: 4, cursor: "pointer", objectFit: "contain" }}
                  />
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="col-md-6 col-12 py-5 text-center text-md-start">
              <h4 className="text-muted mb-2">{product.name}</h4>
              <p className="lead mb-3 d-flex align-items-center justify-content-center justify-content-md-start gap-1">
                {Array.from({ length: 5 }, (_, i) => {
                  const rating = product?.rating || 0;
                  if (rating >= i + 1) {
                    return <i key={i} className="fa fa-star text-warning"></i>; // full star
                  } else if (rating >= i + 0.5) {
                    return <i key={i} className="fa fa-star-half-o text-warning"></i>; // half star
                  } else {
                    return <i key={i} className="fa fa-star-o text-warning"></i>; // empty star
                  }
                })}
                <span className="ms-2 text-muted">({product?.rating || 0} / 5)</span>
              </p>
              <h2 className="text-success">${product.amount}</h2>
              <p className="text-muted my-3">{product.description?.substring(0, 200)}</p>

              <button
                className="btn btn-outline-dark"
                onClick={() => addProduct(product)}
              >
                Add to Cart
              </button>
              <Link to="/cart" className="btn btn-dark mx-3">
                Go to Cart
              </Link>
            </div>
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
                        return <i key={i} className="fa fa-star text-warning"></i>; // full star
                      } else if (rating >= i + 0.5) {
                        return <i key={i} className="fa fa-star-half-o text-warning"></i>; // half star
                      } else {
                        return <i key={i} className="fa fa-star-o text-warning"></i>; // empty star
                      }
                    })}
                    <span className="ms-2 text-muted">({item?.rating || 0} / 5)</span>
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
    );
  };
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">{loading ? <Loading /> : <ShowProduct />}</div>
        <div className="row my-5 py-5">
          <div className="d-none d-md-block">
            <h2 className="">You may also Like</h2>
            {similarProducts.length > 2 ? (
              <Marquee
                pauseOnHover={true}
                pauseOnClick={true}
                speed={100}
              >
                {loading2 ? <Loading2 /> : <ShowSimilarProduct />}
              </Marquee>
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
                              return <i key={i} className="fa fa-star text-warning"></i>; // full star
                            } else if (rating >= i + 0.5) {
                              return <i key={i} className="fa fa-star-half-o text-warning"></i>; // half star
                            } else {
                              return <i key={i} className="fa fa-star-o text-warning"></i>; // empty star
                            }
                          })}
                          <span className="ms-2 text-muted">({item?.rating || 0} / 5)</span>
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
