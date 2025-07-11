import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext";
import Filters from "./Filter";
import Pagination from "./Pagination";
import SearchBar from "./SearchBar";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { useAppDispatch } from "../redux/index.ts";
import { fetchProducts } from "../redux/slice/Product.ts";
import { searchProducts } from "../redux/slice/searchProduct.ts";
import { fetchFilteredProducts } from "../redux/slice/filterProduct.ts";
import { addToCart } from "../redux/slice/userCart.ts";
import { RootState } from "../redux/index.ts";
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
    (state: RootState) => state.product
  );
  const { results: searchResults, status: searchStatus } = useSelector(
    (state: RootState) => state.search
  );
  const { filteredProducts, status: filterStatus } = useSelector(
    (state: RootState) => state.filterProduct
  );

  // Fetch all products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Update local product state when products load
  useEffect(() => {
    if (!productsLoading && products.length > 0) {
      setAllProducts(products);
      setDisplayProducts(products);
    }
  }, [productsLoading, products]);

  // Update filtered products from filters
  useEffect(() => {
    if (filterStatus !== "loading" && filteredProducts) {
      setDisplayProducts(filteredProducts);
      setCurrentPage(1);
    }
  }, [filteredProducts, filterStatus]);

  // Handle search status changes: clear displayProducts on loading, set results on success, reset on fail/idle
  useEffect(() => {
    if (searchStatus === "loading") {
      setDisplayProducts([]); // Clear to avoid flicker
    } else if (searchStatus === "success") {
      setDisplayProducts(searchResults.length > 0 ? searchResults : []);
      setCurrentPage(1);
    } else if (searchStatus === "failed" || searchStatus === "idle") {
      setDisplayProducts(allProducts);
      setCurrentPage(1);
    }
  }, [searchResults, searchStatus, allProducts]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = displayProducts.slice(indexOfFirstPost, indexOfLastPost);

  // Event handlers
  const handleAddToCart = (product) => {
    if (!user) {
      toast.error("Please login to add products to cart.");
      navigate("/login");
      return;
    }
    dispatch(addToCart({ userId: user.id, product }));
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

  const handleSearch = (searchValue) => {
    const trimmed = searchValue.toLowerCase().trim();
    if (trimmed === "") {
      setDisplayProducts(allProducts);
    } else {
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

  // Products display component
  const ProductList = () => (
    <div className="shopDetailsProducts">
      <div className="shopDetailsProductsContainer">
        {currentPosts.length === 0 ? (
          <div className="text-center">
            <h3 style={{ color: "#333", fontSize: "1.5rem", marginBottom: 10 }}>
              No products found
            </h3>
            <p style={{ color: "#666", fontSize: "1rem" }}>
              Try changing your filters or search criteria.
            </p>
          </div>
        ) : (
          currentPosts.map((product) => (
            <div key={product.id} className="sdProductContainer">
              <div className="sdProductImages position-relative">
                {product.sticker && (
                  <div
                    className="position-absolute top-0 end-0 bg-transparent px-4"
                    style={{ zIndex: 1 }}
                  >
                    <img
                      src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/sticker/${product.sticker}`}
                      alt="Sticker"
                      style={{ width: 50, height: 50, objectFit: "contain" }}
                    />
                  </div>
                )}
                <Link to={`/product/${product.id}`}>
                  <img
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                    alt={product.name}
                  />
                </Link>
                <h4
                  className="bg-light"
                  onClick={() => handleAddToCart(product)}
                  style={{ cursor: "pointer" }}
                >
                  Add to Cart
                </h4>
              </div>
              <div className="sdProductInfo">
                <div className="sdProductCategoryWishlist">
                  <p>{product.category}</p>
                  <FiHeart
                    onClick={() => handleWishlistToggle(product.id)}
                    style={{
                      color: wishList[product.id] ? "#0d6efd" : "#767676", // or "#0d6efd" for both
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div className="sdProductNameInfo">
                  <h5>{product.name.substring(0, 35)}</h5>
                </div>
                <p>${product.amount}</p>
                <div className="sdProductRatingReviews">
                  <div className="sdProductRatingStar">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color="#FEC78A" size={10} />
                    ))}
                  </div>
                  <span>{product.reviews_count}</span>
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
              <IoFilterSharp style={{ margin: 0 }} />
              <p style={{ margin: 0 }}>Filter</p>
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
            {productsLoading || searchStatus === "loading" ? (
              <LoadingSkeleton />
            ) : (
              <ProductList />
            )}
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
