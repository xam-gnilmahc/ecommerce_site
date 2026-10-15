import React, { useState, useEffect, useMemo, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Filters from './Filter';
import SortBar from './SortBar';
import { trackSearch } from '../../tanstack/tracking.ts';
import { useProducts } from '../../tanstack/products.ts';
import { useSearchProducts } from '../../tanstack/search.ts';
import { useFilteredProducts } from '../../tanstack/filters.ts';
import { useUserRecommendations } from '../../tanstack/recommendations.ts';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import { supabase } from '../../supaBaseClient';
import './Products.css';

const EMPTY_FILTERS = {
  categories: [],
  brands: [],
  priceRange: null,
  availability: [],
};

const formatPrice = (amount) => {
  const value = Number(amount);
  if (Number.isNaN(value)) return '';
  return `$${value.toFixed(2)} USD`;
};

const Products = () => {
  const [baseProducts, setBaseProducts] = useState([]);
  const [outOfStockMap, setOutOfStockMap] = useState({});
  const [stockLoaded, setStockLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [activeFilters, setActiveFilters] = useState(null);
  const postsPerPage = 20;

  const { user, trackProduct } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const searchQuery = urlParams.get('q')?.toLowerCase().trim();

  // filters passed in the URL (e.g. navbar category hover popup → Apply)
  const urlBrands = (urlParams.get('brand') || '').split(',').filter(Boolean);
  const urlMin = urlParams.get('min');
  const urlMax = urlParams.get('max');
  const urlAvailability = (urlParams.get('avail') || '').split(',').filter(Boolean);
  const urlPriceRange =
    urlMin !== null || urlMax !== null ? [Number(urlMin || 0), Number(urlMax || 999999)] : null;
  const hasApiFilters = urlBrands.length > 0 || urlPriceRange !== null;

  // term sent to the API — first letter of each word capitalized
  const apiSearchTerm = hasApiFilters
    ? (searchQuery || '').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  // RESET everything (filters, sort, page) on any navigation — e.g. navbar links
  useEffect(() => {
    setActiveFilters(null);
    setSortBy('default');
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // TanStack Query hooks
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: recommendations = [], isLoading: recLoading } = useUserRecommendations(user?.id);
  const { data: searchResults, status: searchStatus } = useSearchProducts(searchQuery || '');
  // navbar popup filters → hit the API with search + brand + price in one query
  const { data: apiFilteredResults, status: apiFilteredStatus } = useFilteredProducts({
    searchTerm: apiSearchTerm,
    brands: urlBrands,
    category: [],
    priceRange: urlPriceRange as [number, number] | null,
  });

  const filters = {
    ...EMPTY_FILTERS,
    ...(activeFilters || {}),
    // URL-seeded availability (from the navbar popup) applies until the drawer sets its own
    availability: activeFilters ? activeFilters.availability : urlAvailability,
  };

  // Base feed: search results, recommendations, or all products
  useEffect(() => {
    if (searchQuery || hasApiFilters) return;
    if (recommendations.length > 0) {
      setBaseProducts(recommendations);
    } else if (!productsLoading && products.length > 0) {
      setBaseProducts(products);
    }
  }, [recommendations, products, productsLoading, searchQuery, hasApiFilters]);

  // Search feed
  useEffect(() => {
    if (!searchQuery || hasApiFilters) return;
    if (searchStatus === 'success') {
      setBaseProducts(searchResults || []);
      setCurrentPage(1);
    }
    if (searchStatus === 'error') {
      setBaseProducts([]);
    }
  }, [searchResults, searchStatus, searchQuery, hasApiFilters]);

  // API-filtered feed (navbar popup: category + brand + price → server-side query)
  useEffect(() => {
    if (!hasApiFilters) return;
    if (apiFilteredStatus === 'success') {
      setBaseProducts(apiFilteredResults || []);
      setCurrentPage(1);
    }
    if (apiFilteredStatus === 'error') {
      setBaseProducts([]);
    }
  }, [apiFilteredResults, apiFilteredStatus, hasApiFilters]);

  // Track search
  useEffect(() => {
    if (searchQuery) {
      trackSearch(user?.id, searchQuery);
    }
  }, [searchQuery, user?.id]);

  // ── INVENTORY CHECK ──────────────────────────────────────────────────────
  useEffect(() => {
    const ids = baseProducts.map((p) => p.id);
    if (ids.length === 0) {
      setOutOfStockMap({});
      setStockLoaded(true);
      return;
    }

    let cancelled = false;
    setStockLoaded(false);
    setOutOfStockMap({});

    const checkStock = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('product_id, stock_quantity')
        .in('product_id', ids);

      if (cancelled) return;

      if (!data) {
        setOutOfStockMap(Object.fromEntries(ids.map((pid) => [pid, true])));
        setStockLoaded(true);
        return;
      }

      const map = {};
      ids.forEach((pid) => {
        const row = data.find((d) => d.product_id === pid);
        map[pid] = !row || Number(row.stock_quantity) === 0;
      });
      setOutOfStockMap(map);
      setStockLoaded(true);
    };

    checkStock();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseProducts]);

  const isOutOfStock = (productId) => outOfStockMap[productId] === true;

  // ── FILTERS — applied to the CURRENT product list ────────────────────────
  const filteredProducts = useMemo(() => {
    let list = baseProducts;

    if (filters.categories.length) {
      list = list.filter((p) => filters.categories.includes(p.category));
    }
    if (filters.brands.length) {
      list = list.filter((p) => filters.brands.includes(p.brand));
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      list = list.filter((p) => {
        const amount = Number(p.amount);
        return amount >= Number(min) && amount <= Number(max);
      });
    }
    if (filters.availability.length) {
      list = list.filter((p) => {
        const out = outOfStockMap[p.id] === true;
        return filters.availability.includes(out ? 'out' : 'in');
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baseProducts,
    filters.categories.join(),
    filters.brands.join(),
    filters.priceRange?.join(),
    filters.availability.join(),
    outOfStockMap,
  ]);

  // ── SORT ─────────────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    if (sortBy === 'default') return filteredProducts;
    const sorted = [...filteredProducts];
    switch (sortBy) {
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
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sorted.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      default:
        return sorted;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts, sortBy]);

  // PAGINATION → infinite scroll
  const visiblePosts = sortedProducts.slice(0, currentPage * postsPerPage);
  const hasMore = visiblePosts.length < sortedProducts.length;
  const sentinelRef = useRef(null);

  // FILTER
  const handleFilterChange = (next) => {
    const nextFilters = { ...EMPTY_FILTERS, ...next };
    const nextHasAny =
      nextFilters.brands.length > 0 ||
      nextFilters.categories.length > 0 ||
      nextFilters.priceRange !== null ||
      nextFilters.availability.length > 0;

    setActiveFilters(nextHasAny ? nextFilters : null);
    setCurrentPage(1);
  };

  // SORT
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const awaitingStock = filters.availability.length > 0 && !stockLoaded && baseProducts.length > 0;

  const isLoading =
    (hasApiFilters && apiFilteredStatus === 'pending') ||
    (!hasApiFilters &&
      ((searchQuery && searchStatus === 'pending') ||
        (!searchQuery && (productsLoading || recLoading)))) ||
    awaitingStock;

  // infinite scroll — load next batch when sentinel nears viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || isLoading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setCurrentPage((p) => p + 1);
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasMore]);

  const priceBounds = useMemo(() => {
    const amounts = baseProducts.map((p) => Number(p.amount)).filter((n) => !Number.isNaN(n));
    if (!amounts.length) return { min: 0, max: 0 };
    return { min: Math.min(...amounts), max: Math.ceil(Math.max(...amounts)) };
  }, [baseProducts]);

  const LoadingSkeleton = () => (
    <div className="shopDetailsProductsContainer">
      {Array.from({ length: postsPerPage }).map((_, idx) => (
        <div key={idx} className="sdProductContainer skeletonCard">
          <div className="sdProductImages">
            <Skeleton height="100%" width="100%" />
          </div>
          <div className="sdProductInfo">
            <div className="product-price">
              <Skeleton width={80} />
            </div>
            <div className="product-title">
              <Skeleton width="90%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCard = (product) => {
    const out = isOutOfStock(product.id);
    const primary = `${SUPABASE_STORAGE_URL}productimages/${product.banner_url}`;
    const secondary = product.details_banner
      ? `${SUPABASE_STORAGE_URL}productimages/${product.details_banner}`
      : null;

    return (
      <div key={product.id} className="sdProductContainer">
        <div className={`sdProductImages ${out ? 'out-of-stock' : ''}`}>
          <Link
            to={`/product/${product.id}`}
            rel="noopener noreferrer"
            onClick={() => trackProduct(product.id)}
          >
            <img
              className="sdProductImg sdProductImg--primary"
              src={primary}
              alt={product.name}
              loading="lazy"
            />
            {secondary && (
              <img
                className="sdProductImg sdProductImg--secondary"
                src={secondary}
                alt=""
                loading="lazy"
              />
            )}
          </Link>

          {out && <span className="sdOutOfStockBadge">Sold out</span>}
        </div>

        <div className="sdProductInfo">
          <p className="product-price">{formatPrice(product.amount)}</p>
          <Link className="product-title" to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </div>
      </div>
    );
  };

  const ProductList = () => (
    <div className="shopDetailsProducts">
      <div className="shopDetailsProductsContainer">
        {visiblePosts.length === 0 ? (
          <div className="no-products">
            <p className="no-products__title">No products found</p>
            <p className="no-products__hint">Try another search or filter</p>
          </div>
        ) : (
          visiblePosts.map((product) => renderCard(product))
        )}
      </div>
    </div>
  );

  return (
    <div className="shopDetails">
      <Filters
        key={location.key}
        filters={filters}
        onChange={handleFilterChange}
        resultCount={sortedProducts.length}
        minPrice={priceBounds.min}
        maxPrice={priceBounds.max}
        sort={<SortBar sortBy={sortBy} onSortChange={handleSortChange} />}
      />

      <div className="plp-grid">{isLoading ? <LoadingSkeleton /> : <ProductList />}</div>

      {!isLoading && hasMore && <div ref={sentinelRef} className="plp-sentinel" />}
    </div>
  );
};

export default Products;
