import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import SortBar from './SortBar';
import Pagination from '../ui/Pagination.js';
import { FaStar } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { useAppDispatch } from '../../redux/index.ts';
import { fetchProducts } from '../../redux/slice/Product.ts';
import { fetchUserRecommendations } from '../../redux/slice/userRecommendation.ts';
import { searchProducts } from '../../redux/slice/searchProduct.ts';
import { fetchFilteredProducts } from '../../redux/slice/filterProduct.ts';
import { trackAddToCart, trackSearch } from '../../utils/tracking.ts';
import { addToCart } from '../../redux/slice/userCart.ts';

const Products = () => {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [wishList, setWishList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const lastExecutedQuery = useRef('');
  const postsPerPage = 20;

  const { user, trackProduct } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search).get('q')?.toLowerCase().trim();

  // Redux state
  const { products, loading: productsLoading } = useSelector((state) => state.product);

  const { results: searchResults, status: searchStatus } = useSelector((state) => state.search);

  const { filteredProducts, status: filterStatus } = useSelector((state) => state.filterProduct);

  const { recommendations, status: recStatus } = useSelector((state) => state.userRecommendations);

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
      if (recStatus === 'success' && recommendations?.length > 0) {
        setDisplayProducts(recommendations);
      } else if (!productsLoading && products.length > 0) {
        setDisplayProducts(products);
      }
    }
  }, [recStatus, recommendations, products, productsLoading, searchQuery]);

  // FILTER
  useEffect(() => {
    if (filterStatus === 'success') {
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
    setDisplayProducts([]);
    dispatch(searchProducts(searchQuery));
    trackSearch(dispatch, user?.id, searchQuery);
  }, [searchQuery, dispatch, user?.id]);

  // APPLY SEARCH RESULTS
  useEffect(() => {
    if (!searchQuery) return;

    if (searchStatus === 'success') {
      setDisplayProducts(searchResults || []);
      setCurrentPage(1);
    }

    if (searchStatus === 'failed') {
      setDisplayProducts([]);
    }
  }, [searchResults, searchStatus, searchQuery]);

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

  // SORT
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const isLoading =
    (searchQuery && searchStatus === 'loading') ||
    (!searchQuery && (productsLoading || recStatus === 'loading')) ||
    filterStatus === 'loading';

  const LoadingSkeleton = () => {
    return (
      <div className="px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
          {Array.from({ length: postsPerPage }).map((_, idx) => (
            <div key={idx} className="flex flex-col pointer-events-none">
              <div className="relative w-full h-[260px] flex items-center justify-center overflow-hidden bg-gray-100">
                <Skeleton height="100%" width="100%" />
              </div>
              <div className="p-2.5 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <Skeleton width={60} height={10} />
                  <Skeleton circle width={18} height={18} />
                </div>
                <div className="text-[15px] font-medium text-gray-900 leading-relaxed line-clamp-2">
                  <Skeleton width="90%" />
                  <Skeleton width="70%" />
                </div>
                <div className="text-[15px] font-bold text-gray-900">
                  <Skeleton width={80} />
                </div>
                <div className="flex items-center gap-1">
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
    <div className="px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {currentPosts.length === 0 ? (
          <div className="col-span-full text-center py-[60px] px-5 text-gray-500">
            <h3>No Products Found</h3>
            <p>Try another search or adjust filters</p>
          </div>
        ) : (
          currentPosts.map((product) => (
            <div key={product.id} className="group flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5">
              <div className="relative w-full h-[260px] flex items-center justify-center overflow-hidden max-md:h-[220px]">
                <Link
                  to={`/product/${product.id}`}
                  rel="noopener noreferrer"
                  onClick={() => trackProduct(product.id)}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${product.banner_url}`}
                    alt={product.name}
                    className="block w-4/5 h-4/5 object-contain mx-auto transition-all duration-500 group-hover:scale-105"
                  />
                </Link>

                <button
                  className="absolute bottom-3 left-3 right-3 py-[11px] px-3 border-none rounded-xl bg-gray-900/90 text-white text-xs font-semibold tracking-wide cursor-pointer opacity-0 translate-y-2 transition-all duration-200 backdrop-blur-[6px] hover:bg-gray-900 group-hover:opacity-100 group-hover:translate-y-0 max-sm:opacity-100 max-sm:translate-y-0"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>

              <div className="p-2.5 flex flex-col gap-1 transition-all duration-200">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase text-gray-400 m-0 tracking-wide">{product.category}</p>
                  <FiHeart
                    onClick={() => handleWishlistToggle(product.id)}
                    style={{
                      color: wishList[product.id] ? 'red' : '#767676',
                    }}
                    className="text-[16px] cursor-pointer transition-all duration-200 hover:text-red-500 hover:scale-110"
                  />
                </div>

                <div className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-600 transition-colors duration-200">{product.name}</div>
                <p className="text-[13px] font-semibold text-gray-900">${product.amount}</p>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color="#FEC78A" size={9} />
                  ))}
                  <span className="text-[10px] text-gray-500">({product.reviews_count})</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="px-4 py-2 md:px-6 lg:px-8">
        <SortBar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          onApplyFilters={handleFilterChange}
          searchQuery={searchQuery}
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
    </>
  );
};

export default Products;
