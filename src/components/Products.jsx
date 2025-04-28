import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { supabase } from "../supaBaseClient";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from '../context/authContext'; // adjust path if needed
import { useNavigate , useLocation} from "react-router-dom";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(data);
  const [loading, setLoading] = useState(false);
  let componentMounted = true;
  const { user, addToCart} = useAuth(); // get user from context
  const navigate = useNavigate();
  
  const location = useLocation();


  const dispatch = useDispatch();

  const addProduct = async (product) => {
    await addToCart(product);
  };

  useEffect(() => {
    let componentMounted = true;

    const getProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .range(0, 20);

      if (error) {
        console.error("Error fetching products:", error.message);
        toast.error("Failed to load products.");
      } else if (componentMounted) {
        setData(data);
        setFilter(data);
      }

      setLoading(false);
    };

    getProducts();

    return () => {
      componentMounted = false;
    };
  }, []);

  const Loading = () => {toast
    return (
      <>
        <div className="col-12 py-5 text-center">
          <Skeleton height={40} width={560} />
        </div>
        {[...Array(7)].map((_, idx) => (
          <div key={idx} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
            <Skeleton height={592} />
          </div>
        ))}
      </>
    );
  };

  const filterProduct = (cat) => {
    const updatedList = data.filter((item) => item.category === cat);
    setFilter(updatedList);
  };
  

  const ShowProducts = () => {
    return (
      <>
        {/* <div className="buttons text-center py-5">
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => setFilter(data)}
          >
            All
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("Mobile")}
          >
            Mobile
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("Tablet")}
          >
            Tablet
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("Watch")}
          >
            Watch
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("Laptop")}
          >
            Laptop
          </button>
        </div> */}
        <div className="row">
          {filter.map((product) => (
            <div
              id={product.id}
              key={product.id}
              className="col-lg-4 col-md-6 col-sm-12 mb-4"
            >
              <div className=" text-center h-100">
                <img
                  className="card-img-top p-3 mx-auto d-block img-fluid"
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                  alt="Product"
                  style={{
                    width:"auto",
                    maxHeight: "250px",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.transform = "scale(1.10)")}
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name.substring(0, 12)}</h5>
                  <p className="card-text">{product.description.substring(0, 90)}...</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item lead">$ {product.amount}</li>
                </ul>
                <div className="card-body">
                  <Link to={"/product/" + product.id} className="btn btn-dark m-1">
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
                      addProduct(product);
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


      </>
    );
  };

  return (
    <>
      <div className="container py-3"> {/* Increased padding to p-6 */}
        <div className="row">
        {location.pathname !== '/product' && (
        <div>
          <h2 className="display-5 text-center">Latest Products</h2>
          <hr />
        </div>
      )}
        </div>
        <div className="row">
          {loading ? <Loading /> : <ShowProducts />}
        </div>
      </div>
    </>
  );
};

export default Products;
