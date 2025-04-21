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
  const { user} = useAuth(); // get user from context
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
            <div className="col-md-4 col-12 py-5 d-flex flex-md-row flex-column">
              {/* Main Image */}
              <div style={{ flex: "1 1 75%", maxWidth: "75%" }}>
                <img
                  className="img-fluid"
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${activeImage}`}
                  alt={product.title}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Thumbnails */}
              <div
                className="d-flex flex-md-column flex-row ms-md-3 mt-3 mt-md-0"
                style={{ flex: "0 0 25%", maxWidth: "25%" }}
              >
                {product.product_images &&
                  product.product_images.map((img) => (
                    <img
                      key={img.id}
                      src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${img.image_url}`}
                      alt="Thumbnail"
                      onClick={() => setActiveImage(img.image_url)}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "contain",
                        marginRight: "10px",
                        marginBottom: "10px",
                        border:
                          activeImage === img.image_url ? "2px solid #000" : "1px solid #ccc",
                        cursor: "pointer",
                        borderRadius: "4px",
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="col-md-6 col-12 py-5 text-center text-md-start">
              <h4 className="text-uppercase text-muted">{product.category}</h4>
              <h1 className="display-5">{product.title}</h1>
              <p className="lead">
                {product.rating && product.rating.rate} <i className="fa fa-star"></i>
              </p>
              <h3 className="display-6 my-4">${product.amount}</h3>
              <p className="lead">{product.description}</p>
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
                <div key={item.id} className="card mx-4 text-center">
                  <img
                    className="card-img-top p-3"
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                    alt="Card"
                    height={200}
                    width={200}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {item.name.substring(0, 15)}
                    </h5>
                  </div>
                  {/* <ul className="list-group list-group-flush">
                    <li className="list-group-item lead">${product.price}</li>
                  </ul> */}
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
            {similarProducts.length > 3 ? (
            <Marquee
              pauseOnHover={true}
              pauseOnClick={true}
              speed={100}
            >
              {loading2 ? <Loading2 /> : <ShowSimilarProduct />}
            </Marquee>
            ):(
              <>
             <div className="d-flex flex-wrap justify-content-start">
             {similarProducts.map((item) => {
              return (
                <div key={item.id} className="card mx-4 text-center">
                  <img
                    className="card-img-top p-3"
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.banner_url}`}
                    alt="Card"
                    height={200}
                    width={200}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {item.name.substring(0, 15)}
                    </h5>
                  </div>
                  {/* <ul className="list-group list-group-flush">
                    <li className="list-group-item lead">${product.price}</li>
                  </ul> */}
                  <div className="card-body">
                    <Link
                      to={"/product/" + item.id}
                      className="btn btn-dark m-1"
                    >
                      Buy Now
                    </Link>
                    <button
                      className="btn btn-dark m-1"
                      onClick={() => {
                        if (!user) {
                          toast.error("Please login to add products to cart.");
                          navigate("/login");
                          return;
                        }
                        toast.success("Added to cart");
                        addProduct(item)
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
           
            })}
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
