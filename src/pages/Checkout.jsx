import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Country, State } from 'country-state-city';
import Skeleton from 'react-loading-skeleton';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import GooglePayButton from '@google-pay/button-react';
import { buildPaymentRequest, getUpdatedPaymentData } from '../components/GooglePlay.jsx';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext'; // adjust path if needed
import './Animation.css';
import './checkout.css';
import { fetchTotalCart } from '../redux/slice/userCart.ts';
import Navbar from '../components/Navbar';
import { useAppDispatch } from '../redux/index.ts';
import { fetchCartItems } from '../redux/slice/userCart.ts';
import { trackPurchase } from '../utils/tracking';
import { processCardPayment, processGooglePay } from '../service/googlePayService';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_URL);

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily: "'DM Sans', sans-serif",
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

  /* ── RENDER ── */
  return (
    <>
      {paymentLoading && (
        <div className="ck-overlay">
          <div className="ck-overlay-box">
            <div className="ck-spinner" />
            <p className="ck-overlay-title">Processing payment…</p>
            <p className="ck-overlay-sub">Please don't refresh or navigate away</p>
          </div>
        </div>
      )}

      <Navbar />

      <div className="ck-root">
        {loading ? (
          /* ── SKELETON ── */
          <div className="ck-layout">
            <div className="ck-left">
              <Skeleton height={28} width={180} style={{ marginBottom: 24 }} />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={52} style={{ marginBottom: 12, borderRadius: 10 }} />
              ))}
              <Skeleton height={28} width={160} style={{ margin: '24px 0 12px' }} />
              {[1, 2].map((i) => (
                <Skeleton key={i} height={72} style={{ marginBottom: 12, borderRadius: 12 }} />
              ))}
            </div>
            <div className="ck-right">
              <Skeleton height={28} width={140} style={{ marginBottom: 20 }} />
              {[1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <Skeleton width={56} height={56} borderRadius={10} />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={14} style={{ marginBottom: 6 }} />
                    <Skeleton height={12} width="60%" />
                  </div>
                </div>
              ))}
              <Skeleton height={1} style={{ margin: '16px 0' }} />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={18} style={{ marginBottom: 8 }} />
              ))}
            </div>
          </div>
        ) : cart.length && !show ? (
          /* ── MAIN CHECKOUT ── */
          <div className="ck-layout">
            {/* ── LEFT FORM ─────────────────────────── */}
            <div className="ck-left">
              {/* step label */}
              {/* <p className="ck-step-label">Checkout</p> */}
              <h1 className="ck-page-title">
                Complete your
                <br />
                <em>order</em>
              </h1>

              <form onSubmit={handleSubmit} className="ck-form">
                {/* DELIVERY INFO — only if card */}
                {paymentMethod === 'card' && (
                  <div className="ck-block">
                    <h2 className="ck-block-title">
                      <span className="ck-num">01</span> Delivery info
                    </h2>

                    <div className="ck-fields">
                      <div className="ck-field">
                        <label className="ck-label">Email</label>
                        <input
                          className="ck-input"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="ck-field">
                        <label className="ck-label">Full name</label>
                        <input
                          className="ck-input"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="ck-field ck-field--full">
                        <label className="ck-label">Address line 1</label>
                        <input
                          className="ck-input"
                          type="text"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          required
                        />
                      </div>
                      <div className="ck-field ck-field--full">
                        <label className="ck-label">
                          Address line 2 <span className="ck-opt">(optional)</span>
                        </label>
                        <input
                          className="ck-input"
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                        />
                      </div>
                      <div className="ck-field">
                        <label className="ck-label">Zip code</label>
                        <input
                          className="ck-input"
                          type="text"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          required
                        />
                      </div>
                      <div className="ck-field">
                        <label className="ck-label">Country</label>
                        <select
                          className="ck-input"
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
                      <div className="ck-field">
                        <label className="ck-label">State</label>
                        <select
                          className="ck-input"
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

                {/* SHIPPING — only if card */}
                {paymentMethod === 'card' && (
                  <div className="ck-block">
                    <h2 className="ck-block-title">Shipping method</h2>
                    <div className="ck-shipping-row">
                      <label
                        className={`ck-ship-card ${shippingMethod === 'free' ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value="free"
                          checked={shippingMethod === 'free'}
                          onChange={() => setShippingMethod('free')}
                          hidden
                        />
                        <div className="ck-ship-left">
                          <span className="ck-ship-icon">📦</span>
                          <div>
                            <div className="ck-ship-name">Free shipping</div>
                            <div className="ck-ship-eta">7–20 business days</div>
                          </div>
                        </div>
                        <div className="ck-ship-price">$0</div>
                      </label>
                      <label
                        className={`ck-ship-card ${shippingMethod === 'express' ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          hidden
                        />
                        <div className="ck-ship-left">
                          <span className="ck-ship-icon">⚡</span>
                          <div>
                            <div className="ck-ship-name">Express shipping</div>
                            <div className="ck-ship-eta">1–3 business days</div>
                          </div>
                        </div>
                        <div className="ck-ship-price">$3</div>
                      </label>
                    </div>
                  </div>
                )}

                {/* PAYMENT */}
                <div className="ck-block">
                  <h2 className="ck-block-title">
                    <span className="ck-num">{paymentMethod === 'card' ? '03' : '01'}</span> Payment
                    method
                  </h2>

                  <div className="ck-pay-grid">
                    <button
                      type="button"
                      className={`ck-pay-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/179/179457.png"
                        alt="card"
                        width={22}
                      />
                      <div>
                        <div className="ck-pay-name">Card</div>
                        <div className="ck-pay-sub">Visa / Master / Amex</div>
                      </div>
                      {paymentMethod === 'card' && <span className="ck-pay-check">✓</span>}
                    </button>
                    <button
                      type="button"
                      className={`ck-pay-btn ${paymentMethod === 'googlePay' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('googlePay')}
                    >
                      <img
                        src="https://toppng.com/uploads/preview/google-pay-gpay-logo-11530962961mwws81tde9.png"
                        alt="gpay"
                        width={28}
                      />
                      <div>
                        <div className="ck-pay-name">Google Pay</div>
                        <div className="ck-pay-sub">Fast & secure</div>
                      </div>
                      {paymentMethod === 'googlePay' && <span className="ck-pay-check">✓</span>}
                    </button>
                  </div>

                  {!paymentMethod && (
                    <p className="ck-pay-prompt">Select a payment method to continue.</p>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="ck-stripe-box">
                      <CardElement options={CARD_STYLE} />
                      <p className="ck-test-cards">
                        Test cards: <code>4242 4242 4242 4242</code> ·{' '}
                        <code>5555 5555 5555 4444</code>
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'googlePay' && (
                    <div className="ck-gpay-box">
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
                        <p className="ck-pay-prompt">
                          {user ? 'Preparing payment…' : 'Please log in to use Google Pay.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                {paymentMethod === 'card' && (
                  <button type="submit" className="ck-submit" disabled={!stripe || paymentLoading}>
                    {paymentLoading
                      ? 'Processing…'
                      : `Pay $${Math.round(getSubtotal() + getShipping())}`}
                  </button>
                )}
              </form>
            </div>

            {/* ── RIGHT SUMMARY ─────────────────────── */}
            <aside className="ck-right">
              <div className="ck-summary">
                <h2 className="ck-summary-title">Order summary</h2>

                <div className="ck-items">
                  {cart.map((item, i) => (
                    <div key={i} className="ck-item">
                      <div className="ck-item-img">
                        <img
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                          alt={item.products.name}
                        />
                        <span className="ck-item-qty">{item.quantity}</span>
                      </div>
                      <div className="ck-item-info">
                        <div className="ck-item-name">{item.products.name}</div>
                        <div className="ck-item-price">
                          ${(item.amount * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ck-totals">
                  <div className="ck-total-row">
                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>${Math.round(getSubtotal())}</span>
                  </div>
                  <div className="ck-total-row">
                    <span>Shipping</span>
                    <span>
                      {getShipping() === 0 ? (
                        <span className="ck-free">Free</span>
                      ) : (
                        `$${getShipping()}`
                      )}
                    </span>
                  </div>
                  <div className="ck-total-row ck-total-row--final">
                    <span>Total</span>
                    <span>${Math.round(getSubtotal() + getShipping())}</span>
                  </div>
                </div>

                <p className="ck-secure-note">🔒 Payments secured by Stripe</p>
              </div>
            </aside>
          </div>
        ) : (
          /* ── EMPTY CART ── */
          <div className="ck-empty">
            <div className="ck-empty-icon">🛒</div>
            <h2 className="ck-empty-title">Your cart is empty</h2>
            <p className="ck-empty-sub">Add some items before checking out</p>
            <Link to="/" className="ck-empty-btn">
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
