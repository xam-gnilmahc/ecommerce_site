import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";
import { supabase } from "../supaBaseClient";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext"; // adjust path if needed
import { useNavigate, useLocation } from "react-router-dom";
import Filters from "./Filter";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import "./Products.css";
const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(data);
  const [loading, setLoading] = useState(false);
  let componentMounted = true;
  const { user, addToCart } = useAuth(); // get user from context
  const navigate = useNavigate();

  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const Loading = () => {
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
         <div className="shopDetailsProductsContainer">
          {filter.map((product) => (
              <div className="sdProductContainer">
                    <div className="sdProductImages">
                    <Link to={"/product/" + product.id}>
                <img
                   className="sdProduct_front"
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                  alt="Product"
                  style={{
                    width: "250px",
                    maxHeight: "250px",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                  }}

                />
                    
                <img
                   className="sdProduct_back"
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                  alt="Product"
                  style={{
                    width: "250",
                    maxHeight: "250px",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                  }}

                />
                </Link>
                 <h4  onClick={() => {
                      if (!user) {
                        toast.error("Please login to add products to cart.");
                        navigate("/login");
                        return;
                      }
                      toast.success("Added to cart");
                      addProduct(product);
                    }}>
                        Add to Cart
                      </h4>
                </div>
                <div className="sdProductNameInfo">
                  <h5 >
                    {product.name.substring(0, 12)}
                  </h5>
                </div>
                
                  <p >$ {product.amount}</p>
                  <div className="sdProductRatingReviews">
                          <div className="sdProductRatingStar">
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                          </div>
                          <span>{product.reviews_count}</span>
                        </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <div className=" shopDetails">
        {" "}
        {/* Increased padding to p-6 */}
        <div className="shopDetailMain">
          <div className="shopDetails__left">
            <Filters />
          </div>
          <div className="shopDetails__right">
            <div className="shopDetailsSorting">
              <div className="shopDetailsBreadcrumbLink">
                <Link to="/" onClick={scrollToTop}>
                  Home
                </Link>
                &nbsp;/&nbsp;
                <Link to="/shop">The Shop</Link>
              </div>
              <div className="filterLeft" onClick={toggleDrawer}>
                <IoFilterSharp />
                <p>Filter</p>
              </div>
              <div className="shopDetailsSort">
                <select name="sort" id="sort">
                  <option value="default">Default Sorting</option>
                  <option value="Featured">Featured</option>
                  <option value="bestSelling">Best Selling</option>
                  <option value="a-z">Alphabetically, A-Z</option>
                  <option value="z-a">Alphabetically, Z-A</option>
                  <option value="lowToHigh">Price, Low to high</option>
                  <option value="highToLow">Price, high to low</option>
                  <option value="oldToNew">Date, old to new</option>
                  <option value="newToOld">Date, new to old</option>
                </select>
                <div className="filterRight" onClick={toggleDrawer}>
                  <div className="filterSeprator"></div>
                  <IoFilterSharp />
                  <p>Filter</p>
                </div>
              </div>
            </div>
            <div className="row">
              {loading ? <Loading /> : <ShowProducts />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
