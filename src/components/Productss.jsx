import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import { supabase } from "../supaBaseClient";
import Filters from "./Filter";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useAppDispatch } from "../redux/index.ts";
import { fetchProducts } from "../redux/slice/Product.ts";
import { fetchUserRecommendations } from "../redux/slice/userRecommendation.ts";
import { searchProducts } from "../redux/slice/searchProduct.ts";
import { fetchFilteredProducts } from "../redux/slice/filterProduct.ts";
import { trackAddToCart, trackSearch } from '../utils/tracking';
import { addToCart } from "../redux/slice/userCart.ts";
import "./Products.css";

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux selectors
  const { products, loading: productsLoading } = useSelector(
    (state) => state.product
  );
  const { results: searchResults, status: searchStatus } = useSelector(
    (state) => state.search
  );
  const { filteredProducts, status: filterStatus } = useSelector(
    (state) => state.filterProduct
  );

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchUserRecommendations(user?.id));
    }
  }, [dispatch, products.length]);

  // Update local product state when products load (used as fallback)
  useEffect(() => {
    if (!productsLoading && products.length > 0) {
      setAllProducts(products);
      setDisplayProducts(products);
    }
  }, [productsLoading, products]);

  // Listen for recommendation slice updates and use them when available
  const { recommendations, status: recStatus } = useSelector(
    (state) => state.userRecommendations
  );

  useEffect(() => {
    if (recStatus === 'loading') return; // wait

    if (recStatus === 'success' && recommendations && recommendations.length > 0) {
      setAllProducts(recommendations);
      setDisplayProducts(recommendations);
      setCurrentPage(1);
    }

    if (recStatus === 'success' && (!recommendations || recommendations.length === 0)) {
      // No recommendations for this user — ensure we have products
      if (products.length === 0) {
        dispatch(fetchProducts());
      }
    }
  }, [recStatus, recommendations, dispatch, products.length]);

  // Update filtered products from filters
  useEffect(() => {
    if (filterStatus === "success") {
      setDisplayProducts(filteredProducts);
      setCurrentPage(1);
    }
  }, [filteredProducts, filterStatus]);

  // Handle search status changes: clear displayProducts on loading, set results on success, reset on fail/idle
  useEffect(() => {
    if (searchStatus === "success") {
      setDisplayProducts(searchResults.length > 0 ? searchResults : []);
      setCurrentPage(1);
    } else if (searchStatus === "failed" || searchStatus === "idle") {
      setDisplayProducts(allProducts);
    }
  }, [searchResults, searchStatus, allProducts]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = displayProducts.slice(indexOfFirstPost, indexOfLastPost);

  // Event handlers
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add products to cart.");
      navigate("/login");
      return;
    }
    dispatch(addToCart({ userId: user.id, product }));
    // non-blocking: fire-and-forget tracking for logged-in users
    await trackAddToCart(dispatch, user?.id, product);
  };

  const handleWishlistToggle = (productId) => {
    setWishList((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleFilterChange = (filters) => {
    dispatch(fetchFilteredProducts(filters));
    setCurrentPage(1);
  };

  const handleSearch = async (searchValue) => {
    const trimmed = searchValue.toLowerCase().trim();
    if (trimmed === "") {
      setDisplayProducts(allProducts);
    } else {
      // track search only for logged-in users
      await trackSearch(dispatch, user?.id, trimmed);
      dispatch(searchProducts(trimmed));
    }
    setCurrentPage(1);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <>
      {[...Array(postsPerPage)].map((_, idx) => (
        <div key={idx} className="col-md-4 col-sm-6 col-xs-8 col-12 mb-4">
          <Skeleton height={400} />
        </div>
      ))}
    </>
  );

  const isLoading =
  productsLoading ||
  recStatus === "loading" ||
  (searchStatus === "loading" && searchResults.length === 0) ||
  (filterStatus === "loading" && filteredProducts.length === 0);

  // Products display component
  const ProductList = () => (
    <div className="shopDetailsProducts">
      <div className="shopDetailsProductsContainer">
        {currentPosts.length === 0 ? (
          <div className="no-products">
            <h3>No Products Found</h3>
            <p>Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          currentPosts.map((product) => (
            <div key={product.id} className="sdProductContainer">
              <div className="sdProductImages">
                {product.sticker && (
                  <div className="product-sticker">
                    <img
                      src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/sticker/${product.sticker}`}
                      alt="Sticker"
                    />
                  </div>
                )}
                <Link to={`/product/${product.id}`} preventScrollReset>
                  <img
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                    alt={product.name}
                  />
                </Link>
                <button
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
              <div className="sdProductInfo">
                <div className="sdProductCategoryWishlist">
                  <p>{product.category}</p>
                  <FiHeart
                    className="wishlist-icon"
                    onClick={() => handleWishlistToggle(product.id)}
                    style={{
                      color: wishList[product.id] ? "#0d6efd" : "#767676",
                    }}
                  />
                </div>
                <div className="sdProductNameInfo">
                  <h5>{product.name}</h5>
                </div>
                <p className="product-price">${product.amount}</p>
                <div className="sdProductRatingReviews">
                  <div className="sdProductRatingStar">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color="#FEC78A" size={10} />
                    ))}
                  </div>
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
          <Filters onApplyFilters={handleFilterChange} />
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

            <div className="shopDetailsBreadcrumbLink">
              <SearchBar onSearch={handleSearch} />
            </div>

            <div
              className="filterLeft"
              onClick={toggleDrawer}
              role="button"
              tabIndex={0}
            >
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

              <div
                className="filterRight"
                onClick={toggleDrawer}
                role="button"
                tabIndex={0}
              >
                <div className="filterSeprator"></div>
                <IoFilterSharp />
                <p>Filter</p>
              </div>
            </div>
          </div>

          <div className="row">
            {isLoading ? <LoadingSkeleton /> : <ProductList />}
          </div>

          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={displayProducts.length}
            paginate={paginate}
            currentPage={currentPage}
          />

          <div className={`filterDrawer ${isDrawerOpen ? "open" : ""}`}>
            <div className="drawerHeader">
              <p>Filter By</p>
              <IoClose
                onClick={closeDrawer}
                className="closeButton"
                size={26}
              />
            </div>
            <div className="drawerContent">
              <Filters onApplyFilters={handleFilterChange} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
