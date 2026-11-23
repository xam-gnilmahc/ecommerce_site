import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../supaBaseClient';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import './Animation.css';
import './checkout.css';
import { useCartItems } from '../../tanstack/cart.ts';
import { usePlaceOrder } from '../../tanstack/orders.ts';
import { trackPurchase } from '../../tanstack/tracking.ts';
import { ExpressCheckout } from '../../features/expressCheckout';
import type { ExpressAuthorization } from '../../features/expressCheckout';

const Checkout = () => {
  const { user } = useAuth();
  const placeOrderMutation = usePlaceOrder();

  const { data: cart = [], isLoading: loading } = useCartItems(user?.id);

  const email = user?.email || '';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [shippingMethod] = useState('free');
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

  const handleExpressAuthorized = async ({
    finalData,
    result,
    shippingMethod: walletShippingMethod,
  }: ExpressAuthorization) => {
    if (result.status !== 'succeeded' || result.error) {
      throw new Error(result?.error || 'Payment could not be completed.');
    }
    const orderId = await placeOrderMutation.mutateAsync({
      userId: user.id,
      userName: user.full_name || user.name,
      userEmail: user.email || email,
      data: { ...finalData, payment_status: 'success', shippingMethod: walletShippingMethod },
      stripe: result,
    });
    await handleOrderSuccess(orderId);
  };

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
                <div className="ck-form">
                  <div className="ck-section">
                    <Skeleton height={19} width={110} />
                    <Skeleton height={48} borderRadius={8} />
                    <div className="ck-row ck-row--2">
                      <Skeleton height={48} borderRadius={8} />
                      <Skeleton height={48} borderRadius={8} />
                    </div>
                    <Skeleton height={48} borderRadius={8} />
                    <Skeleton height={48} borderRadius={8} />
                    <div className="ck-row ck-row--3">
                      <Skeleton height={48} borderRadius={8} />
                      <Skeleton height={48} borderRadius={8} />
                      <Skeleton height={48} borderRadius={8} />
                    </div>
                  </div>
                  <div className="ck-section">
                    <Skeleton height={16} width={140} />
                    <Skeleton height={56} borderRadius={8} />
                  </div>
                  <div className="ck-section">
                    <Skeleton height={19} width={90} />
                    <Skeleton height={130} borderRadius={8} />
                  </div>
                  <Skeleton height={54} borderRadius={8} />
                </div>
              </div>
            </div>
            <div className="ck-right">
              <div className="ck-items">
                {[1, 2].map((i) => (
                  <div key={i} className="ck-item">
                    <div className="ck-item-img">
                      <Skeleton width="100%" height="100%" />
                    </div>
                    <div className="ck-item-info">
                      <Skeleton height={14} style={{ marginBottom: 6 }} />
                      <Skeleton height={12} width="40%" />
                    </div>
                    <Skeleton height={14} width={54} />
                  </div>
                ))}
              </div>
              <Skeleton height={48} borderRadius={8} style={{ marginBottom: 28 }} />
              <div className="ck-totals">
                {[1, 2].map((i) => (
                  <div key={i} className="ck-total-row">
                    <Skeleton height={14} width="40%" />
                    <Skeleton height={14} width={70} />
                  </div>
                ))}
                <div className="ck-total-final">
                  <Skeleton height={16} width={70} />
                  <Skeleton height={16} width={110} />
                </div>
              </div>
            </div>
          </div>
        ) : cart.length && !show ? (
          /* ── MAIN CHECKOUT ── */
          <div className="ck-layout">
            {/* ── LEFT FORM ─────────────────────────── */}
            <div className="ck-left">
              <div className="ck-col">
                <div className="ck-form">
                  {/* EXPRESS CHECKOUT — the only payment method */}
                  {user && (
                    <ExpressCheckout
                      subtotalCents={Math.round(getSubtotal() * 100)}
                      lineItems={cart.map((item) => ({
                        name: item.products.name,
                        amount: Math.round(item.amount * item.quantity * 100),
                      }))}
                      buyer={{ name: fullName || user.full_name || user.name, email, phone }}
                      fallbackAddress={getAddress()}
                      onProcessingChange={setPaymentLoading}
                      onAuthorized={handleExpressAuthorized}
                    />
                  )}
                </div>
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

export default Checkout;
