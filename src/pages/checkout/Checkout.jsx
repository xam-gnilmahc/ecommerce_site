import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Country, State } from 'country-state-city';
import Skeleton from 'react-loading-skeleton';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import GooglePayButton from '@google-pay/button-react';
import {
  buildPaymentRequest,
  getUpdatedPaymentData,
} from '../../components/product/GooglePlay.tsx';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { fetchTotalCart } from '../../redux/slice/userCart.ts';
import { useAppDispatch } from '../../redux/index.ts';
import { fetchCartItems } from '../../redux/slice/userCart.ts';
import { trackPurchase } from '../../utils/tracking.ts';
import { processCardPayment, processGooglePay } from '../../service/googlePayService.ts';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_URL);

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: '#0a0a0a',
      '::placeholder': { color: '#bbb' },
    },
    invalid: { color: '#ef4444' },
  },
};

const Checkout = () => {
  const { user, placeOrder } = useAuth();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const { items: cart, fetchLoading: loading } = useSelector((s) => s.addToCart);

  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.full_name || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [show, setShow] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('free');

  const getSubtotal = () => cart.reduce((s, i) => s + i.amount * i.quantity, 0);
  const getShipping = () => (shippingMethod === 'free' ? 0 : 3);
  const getAddress = () => ({
    addressLine1,
    addressLine2,
    country: selectedCountry,
    state: selectedState,
    zipCode,
  });

  const handleOrderSuccess = async (orderId) => {
    if (!orderId) return;
    dispatch(fetchTotalCart(user.id));
    await trackPurchase(dispatch, user?.id, { id: orderId, items: cart });
    setShow(true);
    toast.success('Payment successful!');
  };

  const handlePaymentError = (result) => {
    if (result.message !== 'Payment successful') {
      toast.error(result?.error || 'Payment processing failed.');
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [user?.id]);

  const handleCountryChange = (c) => {
    setSelectedCountry(c);
    setStates(State.getStatesOfCountry(c));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const totalAmount = Math.round(getSubtotal() + getShipping());
      const { finalData, result } = await processCardPayment(stripe, elements, {
        amount: totalAmount,
        name,
        email,
        address: getAddress(),
      });
      if (handlePaymentError(result)) return;
      const orderId = await placeOrder(
        { ...finalData, payment_status: 'success', shippingMethod },
        result
      );
      await handleOrderSuccess(orderId);
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLoadPaymentData = async (paymentData) => {
    setPaymentLoading(true);
    try {
      const gpayId = paymentData.shippingOptionData?.id;
      const totalAmount = Math.round(getSubtotal() + (gpayId === 'free' ? 0 : 3));
      const { finalData, result } = await processGooglePay(paymentData, {
        amount: totalAmount,
        name: user?.name || user?.full_name,
        email: user?.email || email,
      });
      if (handlePaymentError(result)) return;
      const orderId = await placeOrder(
        {
          ...finalData,
          payment_status: 'success',
          shippingMethod: gpayId === 'free' ? 'free' : 'express',
        },
        result
      );
      await handleOrderSuccess(orderId);
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (!cart?.length) return;
    const displayItems = cart.map((i) => ({
      label: i.products.name,
      price: (i.amount * i.quantity).toFixed(2),
      type: 'LINE_ITEM',
    }));
    setPaymentRequest(buildPaymentRequest(displayItems));
  }, [cart]);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      <style>{`
        @keyframes ckSpin {
          to { transform: rotate(360deg); }
        }
        .StripeElement { padding-top: 4px; }
      `}</style>

      {paymentLoading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-[ckSpin_0.75s_linear_infinite]" />
            <p className="text-base font-semibold text-gray-900 m-0">Processing payment...</p>
            <p className="text-sm text-gray-400 m-0">Please don't refresh</p>
          </div>
        </div>
      )}

      <div className="bg-white min-h-screen">
        {loading ? (
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton height={28} width={180} style={{ marginBottom: 24 }} />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={52} style={{ marginBottom: 12, borderRadius: 8 }} />
                ))}
              </div>
              <div className="w-full lg:w-[320px]">
                <Skeleton height={200} borderRadius={12} />
              </div>
            </div>
          </div>
        ) : cart.length && !show ? (
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left - Form */}
              <div className="flex-1 min-w-0">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Delivery Info */}
                  {paymentMethod === 'card' && (
                    <div className="border border-gray-200 rounded-xl p-5">
                      <h2 className="text-sm font-semibold text-gray-900 m-0 mb-4 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                          1
                        </span>
                        Delivery Information
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Email
                          </label>
                          <input
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Full name
                          </label>
                          <input
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Address line 1
                          </label>
                          <input
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            type="text"
                            value={addressLine1}
                            onChange={(e) => setAddressLine1(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Address line 2{' '}
                            <span className="text-gray-300 font-normal">(optional)</span>
                          </label>
                          <input
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            type="text"
                            value={addressLine2}
                            onChange={(e) => setAddressLine2(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Zip code
                          </label>
                          <input
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            type="text"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Country
                          </label>
                          <select
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            value={selectedCountry}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            required
                          >
                            <option value="">Select country</option>
                            {Country.getAllCountries().map((c) => (
                              <option key={c.isoCode} value={c.isoCode}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            State
                          </label>
                          <select
                            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm outline-none transition-colors focus:border-gray-400 bg-white"
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            required
                          >
                            <option value="">Select state</option>
                            {states.map((s) => (
                              <option key={s.isoCode} value={s.isoCode}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping */}
                  {paymentMethod === 'card' && (
                    <div className="border border-gray-200 rounded-xl p-5">
                      <h2 className="text-sm font-semibold text-gray-900 m-0 mb-3">
                        Shipping Method
                      </h2>
                      <div className="flex flex-col gap-2">
                        <label
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'free' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value="free"
                              checked={shippingMethod === 'free'}
                              onChange={() => setShippingMethod('free')}
                              className="accent-gray-900"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">Free shipping</div>
                              <div className="text-xs text-gray-400">7-20 business days</div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">$0</span>
                        </label>
                        <label
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${shippingMethod === 'express' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value="express"
                              checked={shippingMethod === 'express'}
                              onChange={() => setShippingMethod('express')}
                              className="accent-gray-900"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Express shipping
                              </div>
                              <div className="text-xs text-gray-400">1-3 business days</div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">$3</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Payment */}
                  <div className="border border-gray-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-gray-900 m-0 mb-3 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                        {paymentMethod === 'card' ? '3' : '2'}
                      </span>
                      Payment Method
                    </h2>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        type="button"
                        className={`flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer text-left transition-colors ${paymentMethod === 'card' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6b7280"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Card</div>
                          <div className="text-xs text-gray-400">Visa / Mastercard</div>
                        </div>
                        {paymentMethod === 'card' && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer text-left transition-colors ${paymentMethod === 'googlePay' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setPaymentMethod('googlePay')}
                      >
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6b7280"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Google Pay</div>
                          <div className="text-xs text-gray-400">Fast & secure</div>
                        </div>
                        {paymentMethod === 'googlePay' && (
                          <span className="ml-auto w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center">
                            ✓
                          </span>
                        )}
                      </button>
                    </div>

                    {paymentMethod === 'card' && (
                      <div>
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <CardElement options={CARD_STYLE} />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 m-0">
                          Test:{' '}
                          <code className="bg-gray-100 border border-gray-200 rounded px-1 py-px text-[11px]">
                            4242 4242 4242 4242
                          </code>
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'googlePay' && (
                      <div className="rounded-lg overflow-hidden">
                        {paymentRequest && user ? (
                          <GooglePayButton
                            environment="TEST"
                            buttonSizeMode="fill"
                            paymentRequest={paymentRequest}
                            onLoadPaymentData={handleLoadPaymentData}
                            onError={console.error}
                            onPaymentDataChanged={(d) => getUpdatedPaymentData(paymentRequest, d)}
                          />
                        ) : (
                          <p className="text-sm text-gray-400 m-0">
                            {user ? 'Preparing...' : 'Please log in to use Google Pay.'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {paymentMethod === 'card' && (
                    <button
                      type="submit"
                      disabled={!stripe || paymentLoading}
                      className="w-full h-11 bg-gray-900 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentLoading ? 'Processing...' : `Pay $${Math.round(total)}`}
                    </button>
                  )}
                </form>
              </div>

              {/* Right - Summary */}
              <div className="w-full lg:w-[320px] shrink-0">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900 m-0 mb-4">Order Summary</h2>

                  <div className="flex flex-col gap-3 mb-4 max-h-[300px] overflow-y-auto">
                    {cart.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0"
                      >
                        <div className="w-11 h-11 bg-white rounded-lg border border-gray-200 flex items-center justify-center shrink-0">
                          <img
                            className="w-9 h-9 object-contain"
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                            alt={item.products.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 m-0 truncate">
                            {item.products.name}
                          </p>
                          <p className="text-xs text-gray-400 m-0">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                          ${(item.amount * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal ({totalItems} items)</span>
                      <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span
                        className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900'}
                      >
                        {shipping === 0 ? 'Free' : `$${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200 mt-1">
                      <span>Total</span>
                      <span>${Math.round(total)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-3 text-center m-0">
                    🔒 Secure payment
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : show ? (
          /* Success */
          <div className="flex flex-col items-center justify-center gap-4 min-h-[calc(100vh-64px)] text-center px-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 m-0">Order placed!</h2>
            <p className="text-sm text-gray-400 m-0">Your order has been confirmed</p>
            <Link
              to="/order"
              className="mt-2 bg-gray-900 text-white border-none rounded-lg px-6 py-2.5 text-sm font-medium no-underline cursor-pointer transition-colors hover:bg-gray-800"
            >
              View Orders
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 min-h-[calc(100vh-64px)] text-center px-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 m-0">Your cart is empty</h2>
            <p className="text-sm text-gray-400 m-0">Add some items before checking out</p>
            <Link
              to="/"
              className="mt-2 bg-gray-900 text-white border-none rounded-lg px-6 py-2.5 text-sm font-medium no-underline cursor-pointer transition-colors hover:bg-gray-800"
            >
              Continue shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);
