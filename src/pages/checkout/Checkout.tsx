import { useState, useEffect } from 'react';
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
import { supabase } from '../../supaBaseClient';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import { STRIPE_URL } from '../../config/env';
import './Animation.css';
import './checkout.css';
import { useCartItems } from '../../tanstack/cart.ts';
import { usePlaceOrder } from '../../tanstack/orders.ts';
import { trackPurchase } from '../../tanstack/tracking.ts';
import { processCardPayment, processGooglePay } from '../../services/googlePayService.ts';

const stripePromise = loadStripe(STRIPE_URL);

const CARD_STYLE = {
  disableAutofill: true,
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
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const placeOrderMutation = usePlaceOrder();

  const { data: cart = [], isLoading: loading } = useCartItems(user?.id);

  const email = user?.email || '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [show, setShow] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('free');
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  /* ── Prefill from user + default saved address ── */
  useEffect(() => {
    if (!user) return;
    const fullName = user.full_name || user.name || '';
    if (fullName && !firstName && !lastName) {
      const parts = fullName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) return;
      const def = data?.find((a) => a.is_default) || data?.[0];
      if (def) {
        setAddressLine1((prev) => prev || def.address_line1 || '');
        setAddressLine2((prev) => prev || def.address_line2 || '');
        if (def.country) {
          setSelectedCountry(def.country);
          setStates(State.getStatesOfCountry(def.country));
        }
        setSelectedState((prev) => prev || def.state || '');
        setZipCode((prev) => prev || def.zip_code || '');
      }
    })();
  }, [user?.id]);

  const getSubtotal = () => cart.reduce((s, i) => s + i.amount * i.quantity, 0);
  const getShipping = () => (shippingMethod === 'free' ? 0 : 3);
  const getAddress = () => ({
    addressLine1,
    addressLine2,
    country: selectedCountry,
    state: selectedState,
    zipCode,
    city,
    phone,
  });
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const hasAddress = Boolean(addressLine1 && selectedCountry);

  const handleOrderSuccess = async (orderId) => {
    if (!orderId) return;
    trackPurchase(user?.id, { id: orderId, items: cart }).catch(() => {});
    setShow(true);
  };

  const handlePaymentError = (result) => {
    if (result.message !== 'Payment successful') {
      toast.error(result?.error || 'Payment processing failed.');
      return true;
    }
    return false;
  };

  const handleCountryChange = (c) => {
    setSelectedCountry(c);
    setStates(State.getStatesOfCountry(c));
    setSelectedState('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    try {
      const totalAmount = Math.round(getSubtotal() + getShipping());
      const { finalData, result } = await processCardPayment(stripe, elements, {
        amount: totalAmount,
        name: fullName || user?.full_name || user?.name,
        email,
        address: getAddress(),
      });
      if (handlePaymentError(result)) return;
      const orderId = await placeOrderMutation.mutateAsync({
        userId: user.id,
        userName: user.full_name || user.name,
        userEmail: user.email || email,
        data: { ...finalData, payment_status: 'success', shippingMethod },
        stripe: result,
      });
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
      const orderId = await placeOrderMutation.mutateAsync({
        userId: user.id,
        userName: user.full_name || user.name,
        userEmail: user.email || email,
        data: {
          ...finalData,
          payment_status: 'success',
          shippingMethod: gpayId === 'free' ? 'free' : 'express',
        },
        stripe: result,
      });
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

      <div className="ck-root">
        {loading ? (
          /* ── SKELETON ── */
          <div className="ck-layout">
            <div className="ck-left">
              <div className="ck-col">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={48} style={{ marginBottom: 12, borderRadius: 8 }} />
                ))}
              </div>
            </div>
            <div className="ck-right">
              {[1, 2].map((i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                  <Skeleton width={64} height={64} borderRadius={8} />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={14} style={{ marginBottom: 6 }} />
                    <Skeleton height={12} width="50%" />
                  </div>
                </div>
              ))}
              <Skeleton height={48} borderRadius={8} style={{ margin: '20px 0' }} />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={18} style={{ marginBottom: 10 }} />
              ))}
            </div>
          </div>
        ) : cart.length && !show ? (
          /* ── MAIN CHECKOUT ── */
          <div className="ck-layout">
            {/* ── LEFT FORM ─────────────────────────── */}
            <div className="ck-left">
              <div className="ck-col">
                <form onSubmit={handleSubmit} className="ck-form">
                  {/* EXPRESS CHECKOUT */}
                  {paymentRequest && user && (
                    <>
                      <p className="ck-express-label">Express checkout</p>
                      <div className="ck-express-btns">
                        <GooglePayButton
                          environment="TEST"
                          buttonSizeMode="fill"
                          paymentRequest={paymentRequest}
                          onLoadPaymentData={handleLoadPaymentData}
                          onError={console.error}
                          onPaymentDataChanged={
                            ((d: any) => getUpdatedPaymentData(paymentRequest, d)) as any
                          }
                        />
                      </div>
                      <div className="ck-or">
                        <span>OR</span>
                      </div>
                    </>
                  )}

                  {/* DELIVERY */}
                  <div className="ck-section">
                    <h2 className="ck-section-title">Delivery</h2>

                    <div className="ck-select">
                      <select
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Country/Region
                        </option>
                        {Country.getAllCountries().map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ck-row ck-row--2">
                      <input
                        className="ck-input"
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <input
                        className="ck-input"
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>

                    <input
                      className="ck-input"
                      type="text"
                      placeholder="Address"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      required
                    />

                    <input
                      className="ck-input"
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                    />

                    <div className="ck-row ck-row--3">
                      <input
                        className="ck-input"
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      <div className="ck-select">
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          required
                        >
                          <option value="" disabled>
                            State
                          </option>
                          {states.map((s) => (
                            <option key={s.isoCode} value={s.isoCode}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        className="ck-input"
                        type="text"
                        placeholder="ZIP code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                      />
                    </div>

                    <input
                      className="ck-input"
                      type="tel"
                      placeholder="Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />

                    <label className="ck-check">
                      <input type="checkbox" />
                      <span>Text me with news and offers</span>
                    </label>
                  </div>

                  {/* SHIPPING METHOD */}
                  <div className="ck-section">
                    <h2 className="ck-section-title ck-section-title--sm">Shipping method</h2>
                    {!hasAddress ? (
                      <div className="ck-ship-placeholder">
                        Enter your shipping address to view available shipping methods.
                      </div>
                    ) : (
                      <div className="ck-ship-options">
                        <label
                          className={`ck-ship-option ${shippingMethod === 'free' ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === 'free'}
                            onChange={() => setShippingMethod('free')}
                          />
                          <span>Free shipping · 7–20 business days</span>
                          <span className="ck-ship-option-price">Free</span>
                        </label>
                        <label
                          className={`ck-ship-option ${shippingMethod === 'express' ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="shipping"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                          />
                          <span>Express shipping · 1–3 business days</span>
                          <span className="ck-ship-option-price">$3</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* PAYMENT */}
                  <div className="ck-section">
                    <h2 className="ck-section-title">Payment</h2>
                    <p className="ck-section-sub">All transactions are secure and encrypted.</p>

                    <div className="ck-pay-box">
                      <div className="ck-pay-row ck-pay-row--active">
                        <span className="ck-radio ck-radio--on" />
                        <span className="ck-pay-row-label">Credit card</span>
                        <span className="ck-card-badges">
                          <span className="ck-card-badge">VISA</span>
                          <span className="ck-card-badge">MC</span>
                          <span className="ck-card-badge">AMEX</span>
                        </span>
                      </div>

                      <div className="ck-pay-body">
                        <div className="ck-stripe-box">
                          <CardElement options={CARD_STYLE} />
                        </div>
                        <label className="ck-check ck-check--tight">
                          <input type="checkbox" checked readOnly />
                          <span>Use shipping address as billing address</span>
                        </label>
                        <p className="ck-test-cards">
                          Test cards: <code>4242 4242 4242 4242</code> ·{' '}
                          <code>5555 5555 5555 4444</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DISCLAIMER */}
                  <div className="ck-disclaimer">
                    <span className="ck-disclaimer-icon">ⓘ</span>
                    <div>
                      <strong>Disclaimer</strong>
                      <p>
                        Please review your order carefully before placing it. Once an order is
                        submitted order details can't be changed, including shipping address, size,
                        color, or items.
                      </p>
                    </div>
                  </div>

                  {/* SUBMIT */}
                  <button type="submit" className="ck-submit" disabled={!stripe || paymentLoading}>
                    {paymentLoading ? 'Processing…' : 'Pay now'}
                  </button>

                  {/* FOOTER LINKS */}
                  <div className="ck-footer-links">
                    <Link to="/terms">Refund policy</Link>
                    <Link to="/contact">Shipping</Link>
                    <Link to="/terms">Privacy policy</Link>
                    <Link to="/terms">Terms of service</Link>
                    <Link to="/contact">Contact</Link>
                  </div>
                </form>
              </div>
            </div>

            {/* ── RIGHT SUMMARY ─────────────────────── */}
            <aside className="ck-right">
              <div className="ck-items">
                {cart.map((item) => (
                  <div key={item.id} className="ck-item">
                    <div className="ck-item-img">
                      <img
                        src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                        alt={item.products.name}
                      />
                      <span className="ck-item-qty">{item.quantity}</span>
                    </div>
                    <div className="ck-item-info">
                      <div className="ck-item-name">{item.products.name}</div>
                      <div className="ck-item-unit">${Number(item.amount).toFixed(2)}</div>
                    </div>
                    <div className="ck-item-price">${(item.amount * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="ck-discount">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    toast.error('Invalid discount code');
                    setDiscountCode('');
                  }}
                >
                  Apply
                </button>
              </div>

              <div className="ck-totals">
                <div className="ck-total-row">
                  <span>
                    Subtotal · {totalItems} item{totalItems === 1 ? '' : 's'}
                  </span>
                  <span>${getSubtotal().toFixed(2)}</span>
                </div>
                <div className="ck-total-row">
                  <span className="ck-ship-label">
                    Shipping <span className="ck-help">?</span>
                  </span>
                  <span className="ck-muted">
                    {!hasAddress
                      ? 'Enter shipping address'
                      : getShipping() === 0
                        ? 'Free'
                        : `$${getShipping().toFixed(2)}`}
                  </span>
                </div>
                <div className="ck-total-final">
                  <span>Total</span>
                  <span className="ck-total-amount">
                    <span className="ck-cur">USD</span> ${' '}
                    {(getSubtotal() + getShipping()).toFixed(2)}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* ── EMPTY CART / SUCCESS ── */
          <div className="ck-empty">
            <div className="ck-empty-icon">🛒</div>
            <h2 className="ck-empty-title">
              {show ? 'Thank you! Your order was placed.' : 'Your cart is empty'}
            </h2>
            <p className="ck-empty-sub">
              {show ? 'A confirmation email is on its way.' : 'Add some items before checking out'}
            </p>
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
