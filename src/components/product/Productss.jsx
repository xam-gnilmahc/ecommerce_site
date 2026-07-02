import React, { useState, useEffect, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import Filters from './Filter';
import SortBar from './SortBar';
import Pagination from '../ui/Pagination.js';
import { IoClose } from 'react-icons/io5';
import { FaStar } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { useProducts } from '../../hooks/useProducts.ts';
import { useSearchProducts } from '../../hooks/useSearchProducts.ts';
import { useFilteredProducts } from '../../hooks/useFilteredProducts.ts';
import { useRecommendations } from '../../hooks/useRecommendations.ts';
import { useAddToCart } from '../../hooks/useCartMutations.ts';
import { trackAddToCart, trackSearch } from '../../utils/tracking.ts';
import './Products.css';

const Products = () => {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [activeFilters, setActiveFilters] = useState(null);
  const lastExecutedQuery = useRef('');
  const postsPerPage = 20;

  const { user, trackProduct } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search).get('q')?.toLowerCase().trim();

  // TanStack Query hooks
  const { data: products = [], isLoading: productsLoading } = useProducts(!searchQuery && !activeFilters);
  const { data: searchResults = [], isLoading: searchLoading, status: searchStatus } = useSearchProducts(searchQuery, !!searchQuery);
  const { data: filteredProducts = [], isLoading: filterLoading, status: filterStatus } = useFilteredProducts(activeFilters, !!activeFilters);
  const { data: recommendations = [], isLoading: recLoading, status: recStatus } = useRecommendations(user?.id, !!user?.id && !searchQuery && !activeFilters);
  const addToCartMutation = useAddToCart();

  // Set default products based on query state
  useEffect(() => {
    if (searchQuery) {
      if (searchStatus === 'success') {
        setDisplayProducts(searchResults);
        setCurrentPage(1);
      }
    } else if (activeFilters) {
      if (filterStatus === 'success') {
        setDisplayProducts(filteredProducts);
        setCurrentPage(1);
      }
    } else {
      if (recStatus === 'success' && recommendations.length > 0) {
        setDisplayProducts(recommendations);
      } else if (!productsLoading && products.length > 0) {
        setDisplayProducts(products);
      }
    }
  }, [searchQuery, searchResults, searchStatus, activeFilters, filteredProducts, filterStatus, recommendations, recStatus, products, productsLoading]);

  // Track search
  useEffect(() => {
    if (searchQuery && searchStatus === 'success' && lastExecutedQuery.current !== searchQuery) {
      lastExecutedQuery.current = searchQuery;
      trackSearch(user?.id, searchQuery);
    }
  }, [searchQuery, searchStatus, user?.id]);

  // SORT
  const sortProducts = (items, sortKey) => {
    if (sortKey === 'default') return items;
    const sorted = [...items];
    switch (sortKey) {
      case 'price-low':
        return sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
      case 'price-high':
        return sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
      case 'rating-high':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'rating-low':
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case 'name-az':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name-za':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      default:
        return sorted;
    }
  };

  const sortedProducts = sortProducts(displayProducts, sortBy);

  // PAGINATION
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedProducts.slice(indexOfFirstPost, indexOfLastPost);

  // CART
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Please login to add products to cart.');
      navigate('/login');
      return;
    }
    addToCartMutation.mutate({ userId: user.id, product });
    await trackAddToCart(user?.id, product);
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
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  // SORT
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const isLoading =
    (searchQuery && searchLoading) ||
    (!searchQuery && !activeFilters && (productsLoading || recLoading)) ||
    (activeFilters && filterLoading);

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
                <Link
                  to={`/product/${product.id}`}
                  rel="noopener noreferrer"
                  onClick={() => trackProduct(product.id)}
                >
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
                      color: wishList[product.id] ? 'red' : '#767676',
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
          <SortBar
            sortBy={sortBy}
            onSortChange={handleSortChange}
            totalProducts={displayProducts.length}
          />
          <div className="row">{isLoading ? <LoadingSkeleton /> : <ProductList />}</div>

          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={sortedProducts.length}
            paginate={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
