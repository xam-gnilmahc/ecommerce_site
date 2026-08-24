import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { FaTimes, FaQuestion } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './cart.css';
import { useAppDispatch } from '../../redux/index.ts';
import {
  addToCart,
  removeFromCart,
  fetchCartItems,
  removeItemDirectlyFromCart,
  incrementQtyOptimistic,
  decrementQtyOptimistic,
} from '../../redux/slice/userCart.ts';
import { trackAddToCart } from '../../utils/tracking.ts';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import Navbar from '../../components/ui/Navbar';

const Cart = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { items: cart, fetchLoading } = useSelector((state) => state.addToCart);

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, user?.id]);

  const updateItemQuantity = async (product, action) => {
    if (!user) return;
    if (action === 'increase') {
      dispatch(incrementQtyOptimistic(product.id));
      dispatch(addToCart({ userId: user.id, product }));
      trackAddToCart(dispatch, user?.id, product);
    } else if (action === 'decrease') {
      dispatch(decrementQtyOptimistic(product.id));
      dispatch(removeFromCart({ userId: user.id, product }));
    }
  };

  const handleRemoveFromCart = (product) => {
    if (!user) return;
    dispatch(removeItemDirectlyFromCart({ userId: user.id, productId: product.id }));
  };

  const EmptyCart = () => (
    <div className="empty-cart">
      <div className="empty-cart-icon">🛒</div>
      <h3>Your cart is empty</h3>
      <p>Add some items before checking out</p>
      <Link to="/" className="empty-cart-btn">
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
      <section className="cart-section">
        <div className="container">
          {/* Page heading */}
          {/* <p className="cart-page-label">Your bag</p> */}
          <h1 className="cart-page-title">
            Shopping
            <br />
            <em>cart</em>
          </h1>

          <div className="cart-layout">
            {/* ── LEFT: items ─────────────────────── */}
            <div className="cart-left">
              <h2 className="cart-left-title">Items ({totalItems})</h2>

              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveFromCart(item.products)}
                      className="remove-btn"
                      aria-label="Remove item"
                    >
                      <FaTimes size={11} />
                    </button>

                    {/* Image */}
                    <div className="cart-item-img">
                      <img
                        src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                        alt={item.products.name}
                      />
                    </div>

                    {/* Details */}
                    <div className="cart-item-details">
                      <h6 title={item.products.name}>{item.products.name}</h6>
                      <p>
                        {item.products.description.length > 80
                          ? item.products.description.slice(0, 80) + '…'
                          : item.products.description}
                      </p>

                      {/* Stars */}
                      <div className="rating">
                        {Array.from({ length: 5 }, (_, i) => {
                          const rating = item.products?.rating || 0;
                          return (
                            <i
                              key={i}
                              className={`fa ${
                                rating >= i + 1
                                  ? 'fa-star'
                                  : rating >= i + 0.5
                                    ? 'fa-star-half-o'
                                    : 'fa-star-o'
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Qty */}
                      <div className="quantity-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateItemQuantity(item.products, 'decrease')}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateItemQuantity(item.products, 'increase')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="cart-item-price">
                      ${(item.amount * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: summary ──────────────────── */}
            <div className="cart-right">
              <div className="cart-summary">
                <div className="cart-summary-head">
                  <h2 className="cart-summary-title">Order summary</h2>
                  <span className="cart-summary-count">{totalItems} items</span>
                </div>

                <ul className="cart-totals">
                  <li className="cart-total-row">
                    <span className="row-label">
                      Subtotal
                      <FaQuestion className="info-icon" />
                    </span>
                    <span>${Math.round(subtotal)}</span>
                  </li>
                  <li className="cart-total-row">
                    <span>Shipping</span>
                    <span className="cart-free">Free</span>
                  </li>
                  <li className="cart-total-row">
                    <span className="row-label">
                      Estimated tax <FaQuestion className="info-icon" />
                    </span>
                    <span>—</span>
                  </li>
                  <li className="cart-total-final">
                    <span>Total</span>
                    <span className="cart-total-amount">${Math.round(subtotal)}</span>
                  </li>
                </ul>

                <Link to="/checkout" className="cart-checkout-btn">
                  Proceed to checkout
                </Link>

                <p className="cart-secure-note">
                  <span className="cart-lock">🔒</span> Payments secured by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const CartSkeleton = () => (
    <section className="cart-section">
      <div className="container">
        <Skeleton height={14} width={80} style={{ marginBottom: 10 }} />
        <Skeleton height={52} width={260} style={{ marginBottom: 48 }} />
        <div className="cart-layout">
          <div className="cart-left">
            <Skeleton height={20} width={160} style={{ marginBottom: 24 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '20px 0',
                  borderBottom: '1px solid #e8e8e8',
                }}
              >
                <Skeleton width={72} height={72} borderRadius={12} />
                <div style={{ flex: 1 }}>
                  <Skeleton height={14} width="60%" style={{ marginBottom: 6 }} />
                  <Skeleton height={12} width="80%" style={{ marginBottom: 10 }} />
                  <Skeleton height={32} width={96} borderRadius={8} />
                </div>
                <Skeleton height={20} width={50} />
              </div>
            ))}
          </div>
          <div className="cart-right">
            <div className="cart-summary">
              <Skeleton height={22} width={140} style={{ marginBottom: 24 }} />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}
                >
                  <Skeleton height={14} width={120} />
                  <Skeleton height={14} width={50} />
                </div>
              ))}
              <Skeleton height={56} borderRadius={12} style={{ marginTop: 24 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <div className="cart-root">
        {fetchLoading && !cart.length ? (
          <CartSkeleton />
        ) : cart.length ? (
          <ShowCart />
        ) : (
          <EmptyCart />
        )}
      </div>
    </>
  );
};

export default Cart;
