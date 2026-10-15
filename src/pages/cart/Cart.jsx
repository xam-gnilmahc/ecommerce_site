import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { FiTrash2 } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './cart.css';
import { useCartItems, useUpdateCartQuantity, useRemoveFromCart } from '../../tanstack/cart.ts';
import { useBestSellingProducts } from '../../tanstack/products.ts';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import toast from 'react-hot-toast';

const Cart = () => {
  const { user } = useAuth();
  const { data: cart = [], isPending: fetchLoading } = useCartItems(user?.id);
  const { data: bestSelling = [] } = useBestSellingProducts();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeCartMutation = useRemoveFromCart();
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');

  const updateItemQuantity = (item, action) => {
    if (!user) return;
    const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
    updateQuantityMutation.mutate({
      userId: user.id,
      productId: item.product_id,
      quantity: newQty,
    });
  };

  const handleRemoveFromCart = (item) => {
    if (!user) return;
    removeCartMutation.mutate({ userId: user.id, productId: item.product_id });
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

    const cartIds = new Set(cart.map((item) => item.product_id));
    const alsoLike = bestSelling
      .map((row) => row.products)
      .filter(Boolean)
      .filter((p) => !cartIds.has(p.id))
      .slice(0, 8);

    return (
      <section className="cart-section">
        <div className="cart-layout">
          {/* ── LEFT: items ─────────────────────── */}
          <div className="cart-left">
            <span className="cart-count-badge">{totalItems}</span>

            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  {/* Image */}
                  <div className="cart-item-img">
                    <img
                      src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                      alt={item.products.name}
                    />
                  </div>

                  {/* Details */}
                  <div className="cart-item-details">
                    <h6>{item.products.name}</h6>
                    <p>${Number(item.amount).toFixed(2)}</p>
                  </div>

                  {/* Qty */}
                  <div className="cart-item-qty">
                    <button
                      onClick={() => updateItemQuantity(item, 'decrease')}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateItemQuantity(item, 'increase')}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveFromCart(item)}
                    className="cart-item-remove"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {/* Price */}
                  <div className="cart-item-price">${(item.amount * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: summary ──────────────────── */}
          <div className="cart-right">
            <div className="cart-summary">
              <button
                type="button"
                className="cart-discount-row"
                onClick={() => setDiscountOpen((v) => !v)}
              >
                <span>Discount</span>
                <span>{discountOpen ? '−' : '+'}</span>
              </button>

              {discountOpen && (
                <div className="cart-discount-form">
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
              )}

              <div className="cart-summary-divider" />

              <div className="cart-total-row">
                <span>Estimated total</span>
                <span>${subtotal.toFixed(2)} USD</span>
              </div>

              <p className="cart-summary-note">
                Taxes and <span className="cart-underline">shipping</span> calculated at checkout.
              </p>

              <Link to="/checkout" className="cart-checkout-btn">
                Checkout | ${subtotal.toFixed(2)}
              </Link>
            </div>
          </div>
        </div>

        {/* ── YOU MAY ALSO LIKE ─────────────────── */}
        {alsoLike.length > 0 && (
          <div className="cart-also">
            <div className="cart-also-head">
              <h2>You may also like</h2>
              <Link to="/products" className="cart-also-viewall">
                View all
              </Link>
            </div>

            <div className="cart-also-grid">
              {alsoLike.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="cart-also-card">
                  <div className="cart-also-img">
                    <img
                      src={`${SUPABASE_STORAGE_URL}productimages/${product.banner_url}`}
                      alt={product.name}
                    />
                  </div>
                  <p className="cart-also-name">{product.name}</p>
                  <p className="cart-also-price">${product.amount}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  const CartSkeleton = () => (
    <section className="cart-section">
      <div className="cart-layout">
        <div className="cart-left">
          <Skeleton height={36} width={36} borderRadius="50%" style={{ marginBottom: 20 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cart-item">
              <Skeleton width={100} height={100} />
              <div style={{ flex: 1 }}>
                <Skeleton height={16} width="60%" style={{ marginBottom: 8 }} />
                <Skeleton height={12} width={70} />
              </div>
              <Skeleton height={44} width={140} />
              <Skeleton height={16} width={16} />
              <Skeleton height={16} width={70} />
            </div>
          ))}
        </div>
        <div className="cart-right">
          <div className="cart-summary">
            <Skeleton height={18} width={120} style={{ marginBottom: 20 }} />
            <div className="cart-summary-divider" />
            <Skeleton height={18} width="100%" style={{ marginBottom: 12 }} />
            <Skeleton height={14} width="80%" style={{ marginBottom: 28 }} />
            <Skeleton height={54} borderRadius={0} />
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="cart-root">
      {fetchLoading && !cart.length ? <CartSkeleton /> : cart.length ? <ShowCart /> : <EmptyCart />}
    </div>
  );
};

export default Cart;
