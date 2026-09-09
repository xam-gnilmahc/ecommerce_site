import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import Filters from './Filter';
import SortBar from './SortBar';
import Pagination from '../ui/Pagination';
import { IoClose } from 'react-icons/io5';
import { FaStar } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import { trackAddToCart, trackSearch } from '../../tanstack/tracking';
import { useAddToCart } from '../../tanstack/cart';
import { useProducts } from '../../tanstack/products';
import { useSearchProducts } from '../../tanstack/search';
import { useFilteredProducts } from '../../tanstack/filters';
import { useUserRecommendations } from '../../tanstack/recommendations';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import { supabase } from '../../supaBaseClient';
import './Products.css';
import { Product } from '../../types/products';

const Products: React.FC = () => {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [outOfStockMap, setOutOfStockMap] = useState<Record<number, boolean>>({});
  const [wishList, setWishList] = useState<Record<number, boolean>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [activeFilters, setActiveFilters] = useState<{
    brands: string[];
    category: string[];
    priceRange: null;
  } | null>(null);
  const postsPerPage = 20;

  const { user, trackProduct } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const addCartMutation = useAddToCart();

  const searchQuery = new URLSearchParams(location.search).get('q')?.toLowerCase().trim() || '';

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: recommendations = [], isLoading: recLoading } = useUserRecommendations(user?.id);
  const { data: searchResults, status: searchStatus } = useSearchProducts(searchQuery || '');
  const { data: filteredProducts, status: filterStatus } = useFilteredProducts(
    activeFilters || { brands: [], category: [], priceRange: null }
  );

  useEffect(() => {
    if (!searchQuery && !activeFilters) {
      if (recommendations.length > 0) {
        setDisplayProducts(recommendations);
      } else if (!productsLoading && products.length > 0) {
        setDisplayProducts(products);
      }
    }
  }, [recommendations, products, productsLoading, searchQuery, activeFilters]);

  useEffect(() => {
    if (activeFilters && filterStatus === 'success') {
      setDisplayProducts(filteredProducts || []);
      setCurrentPage(1);
    }
  }, [filteredProducts, filterStatus, activeFilters]);

  useEffect(() => {
    if (!searchQuery) return;
    if (searchStatus === 'success') {
      setDisplayProducts(searchResults || []);
      setCurrentPage(1);
    }
    if (searchStatus === 'error') {
      setDisplayProducts([]);
    }
  }, [searchResults, searchStatus, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      trackSearch(user?.id, searchQuery);
    }
  }, [searchQuery, user?.id]);

  const sortProducts = (items: Product[], sortKey: string): Product[] => {
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
        return sorted.sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
      case 'oldest':
        return sorted.sort(
          (a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
      default:
        return sorted;
    }
  };

  const sortedProducts = sortProducts(displayProducts, sortBy);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedProducts.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    const ids = currentPosts.map((p) => p.id);
    if (ids.length === 0) return;

    let cancelled = false;
    const checkStock = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('product_id, stock_quantity')
        .in('product_id', ids);

      if (cancelled || !data) {
        if (!cancelled && !data) {
          setOutOfStockMap(Object.fromEntries(ids.map((pid) => [pid, true])));
        }
        return;
      }

      const map: Record<number, boolean> = {};
      ids.forEach((pid) => {
        const row = data.find((d) => d.product_id === pid);
        map[pid] = !row || Number(row.stock_quantity) === 0;
      });
      setOutOfStockMap(map);
    };

    setOutOfStockMap({});
    checkStock();
    return () => {
      cancelled = true;
    };
  }, [displayProducts, sortBy, currentPage]);

  const isOutOfStock = (productId: number) => outOfStockMap[productId] === true;

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please login to add products to cart.');
      navigate('/login');
      return;
    }
    addCartMutation.mutate({ userId: user.id, product });
    await trackAddToCart(user?.id, product);
  };

  const handleWishlistToggle = (productId: number) => {
    setWishList((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleFilterChange = (filters: {
    brands: string[];
    category: string[];
    priceRange: null;
  }) => {
    if (searchQuery) {
      navigate('/search', { replace: true });
    }
    setDisplayProducts([]);
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const isLoading =
    (searchQuery && searchStatus === 'pending') ||
    (!searchQuery && !activeFilters && (productsLoading || recLoading)) ||
    (activeFilters && filterStatus === 'pending');

  const LoadingSkeleton = () => {
    return (
      <div className="shopDetailsProducts">
        <div className="shopDetailsProductsContainer">
          {Array.from({ length: postsPerPage }).map((_, idx) => (
            <div key={idx} className="sdProductContainer skeletonCard">
              <div className="sdProductImages">
                <Skeleton height="100%" width="100%" />
              </div>

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
              <div className={`sdProductImages ${isOutOfStock(product.id) ? 'out-of-stock' : ''}`}>
                <Link
                  to={`/product/${product.id}`}
                  rel="noopener noreferrer"
                  onClick={() => trackProduct(String(product.id))}
                >
                  <img
                    src={`${SUPABASE_STORAGE_URL}productimages/${product.banner_url}`}
                    alt={product.name}
                  />
                </Link>

                {isOutOfStock(product.id) && (
                  <span className="sdOutOfStockBadge">Currently Out of Stock</span>
                )}
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
        <div className="shopDetails__right">
          <div className="shopToolbar">
            <Filters onApplyFilters={handleFilterChange} />
            <SortBar
              sortBy={sortBy}
              onSortChange={handleSortChange}
              totalProducts={displayProducts.length}
            />
          </div>
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
