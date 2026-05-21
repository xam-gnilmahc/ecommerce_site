import React, { useState, useEffect, useRef} from "react";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import Filters from "./Filter";
import Pagination from "./Pagination";
import { IoClose } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useAppDispatch } from "../redux/index.ts";
import { fetchProducts } from "../redux/slice/Product.ts";
import { fetchUserRecommendations } from "../redux/slice/userRecommendation.ts";
import { searchProducts } from "../redux/slice/searchProduct.ts";
import { fetchFilteredProducts } from "../redux/slice/filterProduct.ts";
import { trackAddToCart, trackSearch } from "../utils/tracking";
import { addToCart } from "../redux/slice/userCart.ts";
import "./Products.css";

const Products = () => {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const lastExecutedQuery = useRef("");
  const postsPerPage = 20;

  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search)
    .get("q")
    ?.toLowerCase()
    .trim();

  // Redux state
  const { products, loading: productsLoading } = useSelector(
    (state) => state.product
  );

  const { results: searchResults, status: searchStatus } = useSelector(
    (state) => state.search
  );

  const { filteredProducts, status: filterStatus } = useSelector(
    (state) => state.filterProduct
  );

  const { recommendations, status: recStatus } = useSelector(
    (state) => state.userRecommendations
  );

  // Load initial products / recommendations
  useEffect(() => {
    if (!searchQuery) {
      if (user?.id) {
        dispatch(fetchUserRecommendations(user.id));
      } else {
        dispatch(fetchProducts());
      }
    }
  }, [user?.id, searchQuery, dispatch]);

  // Set default products
  useEffect(() => {
    if (!searchQuery) {
      if (recStatus === "success" && recommendations?.length > 0) {
        setDisplayProducts(recommendations);
      } else if (!productsLoading && products.length > 0) {
        setDisplayProducts(products);
      }
    }
  }, [recStatus, recommendations, products, productsLoading, searchQuery]);

  // FILTER
  useEffect(() => {
    if (filterStatus === "success") {
      setDisplayProducts(filteredProducts);
      setCurrentPage(1);
    }
  }, [filteredProducts, filterStatus]);

  // SEARCH (FIXED - no duplicate calls)
  useEffect(() => {

    if (!searchQuery) return;

    if (lastExecutedQuery.current === searchQuery) return;

    lastExecutedQuery.current = searchQuery;

    setCurrentPage(1);
    dispatch(searchProducts(searchQuery));
    trackSearch(dispatch, user?.id, searchQuery);
  }, [searchQuery, dispatch, user?.id]);

  // APPLY SEARCH RESULTS
  useEffect(() => {
    if (!searchQuery) return;

    if (searchStatus === "success") {
      setDisplayProducts(searchResults || []);
      setCurrentPage(1);
    }
  }, [searchResults, searchStatus, searchQuery]);

  // PAGINATION
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = displayProducts.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  // CART
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add products to cart.");
      navigate("/login");
      return;
    }
    dispatch(addToCart({ userId: user.id, product }));
    await trackAddToCart(dispatch, user?.id, product);
  };

  // WISHLIST
  const handleWishlistToggle = (productId) => {
    setWishList((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // FILTER
  const handleFilterChange = (filters) => {
    dispatch(fetchFilteredProducts(filters));
    setCurrentPage(1);
  };

  const isLoading =
    (searchQuery && searchStatus === "loading") ||
    (!searchQuery &&
      (productsLoading || recStatus === "loading")) ||
    filterStatus === "loading";

  const LoadingSkeleton = () => {
  return (
    <div className="shopDetailsProducts">
      <div className="shopDetailsProductsContainer">

        {Array.from({ length: postsPerPage }).map((_, idx) => (
          <div key={idx} className="sdProductContainer skeletonCard">

            {/* IMAGE */}
            <div className="sdProductImages">
              <Skeleton height="100%" width="100%" />
            </div>

            {/* INFO */}
            <div className="sdProductInfo">

              <div className="sdProductCategoryWishlist">
                <Skeleton width={60} height={10} />
                <Skeleton circle width={18} height={18} />
              </div>

              <div className="product-title">
                <Skeleton width="90%" />
                <Skeleton width="70%" />
              </div>

              <div className="product-price">
                <Skeleton width={80} />
              </div>

              <div className="sdProductRatingStar">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} width={10} height={10} />
                ))}
                <Skeleton width={40} />
              </div>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

  // PRODUCTS
  const ProductList = () => (
    <div className="shopDetailsProducts">
      <div className="shopDetailsProductsContainer">
        {currentPosts.length === 0 ? (
          <div className="no-products">
            <h3>No Products Found</h3>
            <p>Try another search or filter</p>
          </div>
        ) : (
          currentPosts.map((product) => (
            <div key={product.id} className="sdProductContainer">
              <div className="sdProductImages">
                <Link to={`/product/${product.id}`} target="_blank" rel="noopener noreferrer">
                  <img
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                    alt={product.name}
                  />
                </Link>

                {/* <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button> */}
              </div>

              <div className="sdProductInfo">
                <div className="sdProductCategoryWishlist">
                  <p>{product.category}</p>
                  <FiHeart
                    onClick={() => handleWishlistToggle(product.id)}
                    style={{
                      color: wishList[product.id] ? "red" : "#767676",
                    }}
                  />
                </div>

                <div className="product-title">{product.name}</div>
                <p className="product-price">${product.amount}</p>

                <div className="sdProductRatingStar">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color="#FEC78A" size={10} />
                  ))}
                  <span>({product.reviews_count})</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="shopDetails">
      <div className="shopDetailMain">
        <div className="shopDetails__left">
          <Filters onApplyFilters={handleFilterChange} searchQuery={searchQuery} />
        </div>

        <div className="shopDetails__right">
          <div className="row">
            {isLoading ? <LoadingSkeleton /> : <ProductList />}
          </div>

          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={displayProducts.length}
            paginate={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;