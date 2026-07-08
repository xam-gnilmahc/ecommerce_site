import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { FaTimes, FaStar } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAppDispatch } from '../../redux/index.ts';
import {
  addToCart,
  removeFromCart,
  fetchCartItems,
  removeItemDirectlyFromCart,
} from '../../redux/slice/userCart.ts';
import { trackAddToCart } from '../../utils/tracking.ts';

const Cart = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { items: cart, fetchLoading } = useSelector((state) => state.addToCart);

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, cart.length]);

  const updateItemQuantity = async (product, action) => {
    if (!user) return;
    if (action === 'increase') {
      dispatch(addToCart({ userId: user.id, product }));
      trackAddToCart(dispatch, user?.id, product);
    } else if (action === 'decrease') {
      dispatch(removeFromCart({ userId: user.id, product }));
    }
  };

  const handleRemoveFromCart = (product) => {
    if (!user) return;
    dispatch(removeItemDirectlyFromCart({ userId: user.id, productId: product.id }));
  };

  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center gap-4 min-h-[calc(100vh-64px)] text-center px-8">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 m-0">Your cart is empty</h3>
      <p className="text-sm text-gray-400 m-0">Looks like you haven't added anything yet</p>
      <Link
        to="/"
        className="mt-2 bg-gray-900 text-white border-none rounded-lg px-6 py-2.5 text-sm font-medium no-underline cursor-pointer transition-colors hover:bg-gray-800"
      >
        Continue shopping
      </Link>
    </div>
  );

  const ShowCart = () => {
    let subtotal = 0;
    let totalItems = 0;

    cart.forEach((item) => {
      subtotal += item.amount * item.quantity;
      totalItems += item.quantity;
    });

    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">Shopping Cart</h1>
          <span className="text-sm text-gray-400">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col border border-gray-200 rounded-xl divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                      alt={item.products.name}
                      className="w-4/5 h-4/5 object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 m-0 truncate">{item.products.name}</p>
                        <p className="text-xs text-gray-400 m-0 mt-0.5 truncate">
                          {item.products.description?.length > 60
                            ? item.products.description.slice(0, 60) + '...'
                            : item.products.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.products)}
                        className="shrink-0 w-7 h-7 flex items-center justify-center border border-gray-200 rounded-full bg-white cursor-pointer text-gray-300 transition-colors hover:border-red-300 hover:text-red-400"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          className="w-8 h-8 border-none bg-white text-sm font-medium text-gray-600 cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors"
                          onClick={() => updateItemQuantity(item.products, 'decrease')}
                        >
                          −
                        </button>
                        <span className="min-w-[32px] h-8 flex items-center justify-center text-sm font-semibold text-gray-900 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          className="w-8 h-8 border-none bg-white text-sm font-medium text-gray-600 cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors"
                          onClick={() => updateItemQuantity(item.products, 'increase')}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-900">${(item.amount * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 mt-4 no-underline hover:text-gray-600 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 m-0 mb-4">Order Summary</h2>

              <div className="flex flex-col gap-2.5 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimated tax</span>
                  <span className="text-gray-400">—</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="flex w-full mt-5 h-11 bg-gray-900 text-white border-none rounded-lg text-sm font-semibold no-underline items-center justify-center cursor-pointer transition-colors hover:bg-gray-800"
              >
                Proceed to Checkout
              </Link>

              <p className="text-[11px] text-gray-400 mt-3 text-center m-0">🔒 Secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartSkeleton = () => (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
      <Skeleton height={28} width={200} style={{ marginBottom: 32 }} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5">
                <Skeleton width={80} height={80} borderRadius={8} />
                <div className="flex-1">
                  <Skeleton height={14} width="60%" style={{ marginBottom: 4 }} />
                  <Skeleton height={12} width="40%" style={{ marginBottom: 12 }} />
                  <div className="flex items-center justify-between">
                    <Skeleton width={96} height={32} borderRadius={8} />
                    <Skeleton width={60} height={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-[320px]">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <Skeleton height={18} width={120} style={{ marginBottom: 16 }} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={16} style={{ marginBottom: 8 }} />
            ))}
            <Skeleton height={44} borderRadius={8} style={{ marginTop: 16 }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {fetchLoading ? <CartSkeleton /> : cart.length ? <ShowCart /> : <EmptyCart />}
    </div>
  );
};

export default Cart;
