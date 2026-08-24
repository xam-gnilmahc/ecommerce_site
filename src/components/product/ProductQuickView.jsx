import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { supabase } from '../../supaBaseClient';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../../redux/index.ts';
import { addToCart } from '../../redux/slice/userCart.ts';
import { trackAddToCart } from '../../utils/tracking.ts';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import ProductImageGallery from './ProductImageGallery';
import { IoClose } from 'react-icons/io5';
import { FaStar } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';

const ProductQuickView = ({ productId, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [stockQty, setStockQty] = useState(null);
  const [wishClicked, setWishClicked] = useState(false);

  const { user, trackProduct } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [selectSize, setSelectSize] = useState('');

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          product_items(id, size, sku_number, color),
          product_images(id, image_url, is_primary)
        `
        )
        .eq('id', productId)
        .single();

      if (error) {
        console.error(error);
        toast.error('Failed to load product');
        setLoading(false);
        return;
      }
      setProduct(data);
      if (data.product_items?.length > 0) {
        setSelectSize(data.product_items[0].size);
      }
      setLoading(false);
    };

    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('stock_quantity')
        .eq('product_id', productId)
        .single();
      if (error || !data) {
        setStockQty(0);
      } else {
        setStockQty(data.stock_quantity);
      }
    };

    fetchProduct();
    fetchInventory();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add products to cart.');
      navigate('/login');
      return;
    }
    dispatch(addToCart({ userId: user.id, product }));
    await trackAddToCart(dispatch, user?.id, product);
  };

  const StockBadge = () => {
    if (stockQty === null) {
      return (
        <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full text-[13px] font-bold w-fit bg-[#f5f5f5] text-[#888] border border-[#e0e0e0]">
          <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#ccc]" />
          Checking stock...
        </div>
      );
    }
    if (stockQty === 0) {
      return (
        <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full text-[13px] font-bold w-fit bg-[#fff0f0] text-[#b91c1c] border border-[#fca5a5]">
          <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#ef4444]" />
          Out of Stock
        </div>
      );
    }
    if (stockQty <= 10) {
      return (
        <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full text-[13px] font-bold w-fit bg-[#fff8f0] text-[#c2600a] border border-[#fcd5a0]">
          <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#f97316]" />
          Only {stockQty} left in stock
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-[14px] py-[6px] rounded-full text-[13px] font-bold w-fit bg-[#f0faf4] text-[#1a7f45] border border-[#a8e6bf]">
        <span className="w-2 h-2 rounded-full inline-block shrink-0 bg-[#22c55e]" />
        In Stock ({stockQty} available)
      </div>
    );
  };

  const sizeMap = {
    Mobile: ['128GB', '256GB', '512GB'],
    Laptop: ['256GB', '512GB', '1TB'],
    Watch: ['40mm', '44mm', '45mm'],
    Earbuds: ['Standard', 'Pro', 'Max'],
    Tablet: ['64GB', '128GB', '256GB'],
    Monitor: ['24"', '27"', '32"'],
    Keyboard: ['60%', 'TKL', 'Full Size'],
  };
  const sizes = product?.category ? sizeMap[product.category] || [] : [];

  useEffect(() => {
    if (sizes.length > 0 && !selectSize) {
      setSelectSize(sizes[0]);
    }
  }, [sizes, selectSize]);

  const LoadingSkeleton = () => (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="md:w-1/2">
        <Skeleton height={360} borderRadius={12} />
        <div className="flex gap-2 mt-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width={60} height={60} borderRadius={8} />
          ))}
        </div>
      </div>
      <div className="md:w-1/2 flex flex-col gap-3">
        <Skeleton height={14} width={80} />
        <Skeleton height={28} width="80%" />
        <Skeleton height={16} width={120} />
        <Skeleton height={36} width={100} />
        <Skeleton height={32} width={140} />
        <Skeleton height={60} />
        <div className="flex gap-2 mt-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width={40} height={36} borderRadius={8} />
          ))}
        </div>
        <Skeleton height={48} borderRadius={10} className="mt-2" />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2); }
          50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.08); }
        }
        @keyframes pulse-orange {
          0%, 100% { box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2); }
          50% { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.08); }
        }
        @keyframes pulse-grey {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white shadow-2xl w-full max-w-[1100px] max-h-[90vh] overflow-y-auto animate-quick-in">
          <button
            onClick={onClose}
            className="fixed top-5 right-5 z-20 w-9 h-9 flex items-center justify-center bg-white/90 border border-[#e8e8e8] text-[#555] cursor-pointer hover:bg-white hover:shadow-md transition-all"
          >
            <IoClose size={20} />
          </button>

          {loading ? (
            <LoadingSkeleton />
          ) : product ? (
            <div className="flex flex-col lg:flex-row max-lg:gap-0">
              <div className="lg:w-1/2 lg:sticky lg:top-0 lg:self-start p-4 sm:p-6 lg:p-8 max-lg:border-b max-lg:border-[#eee]">
                <ProductImageGallery
                  images={product.product_images || []}
                  productName={product.name || ''}
                  bannerUrl={product.banner_url || ''}
                />
              </div>

              <div className="lg:w-1/2 flex flex-col p-6 sm:p-8 lg:p-10">
                <p className="text-[11px] uppercase text-[#94a3b8] font-semibold tracking-[0.1em] m-0">
                  {product.category}
                </p>
                <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-bold text-[#111] leading-[1.15] m-0 mt-2">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={14}
                        color={i < (product.rating || 0) ? '#f6b100' : '#e0e0e0'}
                      />
                    ))}
                  </div>
                  <span className="text-[13px] text-[#64748b]">({product.rating || 0})</span>
                </div>

                <div className="flex items-baseline gap-4 mt-4">
                  <p className="text-[30px] sm:text-[34px] font-bold text-[#0a0a0a] m-0">
                    ${product.amount}
                  </p>
                  <StockBadge />
                </div>

                <div className="mt-6">
                  <p className="text-[14px] text-[#555] leading-[1.7] m-0">
                    {product.description?.substring(0, 350)}
                    {product.description?.length > 350 ? '...' : ''}
                  </p>
                </div>

                {sizes.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[13px] font-semibold text-[#222] m-0 mb-2.5">
                      Storage / Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          className={`px-4 py-[7px] text-[13px] font-medium cursor-pointer transition-all duration-150 border ${
                            selectSize === size
                              ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                              : 'bg-white text-[#333] border-[#d4d4d4] hover:border-[#0a0a0a]'
                          }`}
                          onClick={() => setSelectSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-[13px] font-semibold text-[#222] m-0 mb-2.5">Quantity</p>
                  <div className="flex w-fit border border-[#d4d4d4] divide-x divide-[#d4d4d4]">
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-white text-[#111] text-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors border-0 leading-none"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>
                    <span className="w-12 h-9 flex items-center justify-center text-sm font-semibold bg-white leading-none">
                      {quantity}
                    </span>
                    <button
                      className="w-9 h-9 flex items-center justify-center bg-white text-[#111] text-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors border-0 leading-none"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  disabled={stockQty === 0}
                  className="w-full mt-8 py-[15px] bg-[#0a0a0a] text-white border-0 text-[14px] font-bold cursor-pointer transition-all duration-150 hover:opacity-85 disabled:opacity-35 disabled:cursor-not-allowed uppercase tracking-wider"
                  onClick={handleAddToCart}
                >
                  {stockQty === 0 ? 'Out of Stock' : `Add to Cart — $${product.amount}`}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default ProductQuickView;
