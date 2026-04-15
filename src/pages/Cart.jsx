import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FaTimes, FaQuestion } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./cart.css";
import { useAppDispatch } from "../redux/index.ts";
import {
  addToCart,
  removeFromCart,
  fetchCartItems,
  removeItemDirectlyFromCart,
} from "../redux/slice/userCart.ts";
import { trackAddToCart } from "../utils/tracking";
import Navbar from "../components/Navbar.jsx";

const Cart = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { items: cart, fetchLoading } = useSelector((state) => state.addToCart);

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, cart.length]);

  const updateItemQuantity = async (product, action) => {
    if (!user) return;
    if (action === "increase") {
      dispatch(addToCart({ userId: user.id, product }));
      // track increase as add-to-cart
      trackAddToCart(dispatch, user?.id, product);
    } else if (action === "decrease") dispatch(removeFromCart({ userId: user.id, product }));
  };

  const handleRemoveFromCart = (product) => {
    if (!user) return;
    dispatch(removeItemDirectlyFromCart({ userId: user.id, productId: product.id }));
  };

  const EmptyCart = () => (
    <div className="empty-cart">
      <h3>Your Cart is Empty</h3>
      <Link to="/" className="btn btn-outline-primary btn-lg mt-3">
        Continue Shopping
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
          <div className="row g-3">
            {/* Cart Items */}
            <div className="col-12 col-lg-8">
              <div className="cart-items">
                <h5>🛒 Shopping Cart</h5>
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <button
                      onClick={() => handleRemoveFromCart(item.products)}
                      className="remove-btn"
                    >
                      <FaTimes size={14} />
                    </button>

                    <div className="cart-item-inner">
                      <img
                        src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                        alt={item.products.name}
                      />

                      <div className="cart-item-details">
                        <h6  title={item.products.name}>{item.products.name}</h6>
                        <p>
                          {item.products.description.length > 80
                            ? item.products.description.slice(0, 80) + "..."
                            : item.products.description}
                        </p>
                        <div className="rating">
                          {Array.from({ length: 5 }, (_, i) => {
                            const rating = item.products?.rating || 0;
                            return (
                              <i
                                key={i}
                                className={`fa ${rating >= i + 1
                                    ? "fa-star"
                                    : rating >= i + 0.5
                                      ? "fa-star-half-o"
                                      : "fa-star-o"
                                  } text-warning`}
                              />
                            );
                          })}
                        </div>

                        {/* Quantity */}
                        <div className="quantity-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateItemQuantity(item.products, "decrease")}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateItemQuantity(item.products, "increase")}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-12 col-lg-4">
              <div className="order-summary">
                <h5>📦 Order Summary</h5>
                <ul>
                  <li>
                    <span>
                      Subtotal ({totalItems})
                      <FaQuestion className="info-icon" />
                    </span>
                    <span>${Math.round(subtotal)}</span>
                  </li>
                  <li>
                    <span>Shipping</span>
                    <span>$0</span>
                  </li>
                  <li>
                    <span>
                      Estimated Tax <FaQuestion className="info-icon" />
                    </span>
                    <span>-</span>
                  </li>
                  <li className="total">
                    <span>Total</span>
                    <span>${Math.round(subtotal)}</span>
                  </li>
                </ul>
                <Link to="/checkout" className="btn btn-primary w-100">
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Skeleton Loader for Cart Items
  const CartSkeleton = () => (
    <section className="cart-section">
      <div className="container">
        <div className="row g-3">
          {/* Cart Items Skeleton */}
          <div className="col-12 col-lg-8">
            <div className="cart-items">
              <Skeleton height={40} width={200} className="mb-3" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="cart-item skeleton-card mb-3 p-3 rounded-3">
                  <div className="cart-item-inner">
                    <Skeleton width={100} height={100} />
                    <div className="cart-item-details flex-grow-1 ms-3">
                      <Skeleton height={20} width="70%" className="mb-2" />
                      <Skeleton height={15} width="90%" className="mb-2" />
                      <Skeleton height={15} width="50%" className="mb-2" />
                      <div className="d-flex gap-2 mt-2">
                        <Skeleton width={35} height={35} />
                        <Skeleton width={40} height={35} />
                        <Skeleton width={35} height={35} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="col-12 col-lg-4">
            <div className="order-summary skeleton-card p-4 rounded-3">
              <Skeleton height={30} width={180} className="mb-3" />
              <ul>
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="d-flex justify-content-between mb-2">
                    <Skeleton height={15} width={120} />
                    <Skeleton height={15} width={50} />
                  </li>
                ))}
              </ul>
              <Skeleton height={40} width="100%" className="mt-3 rounded-pill" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );


  return (
    <>
      <Navbar />
      <div className="container py-4">
        {fetchLoading ? <CartSkeleton /> : cart.length ? <ShowCart /> : <EmptyCart />}
      </div>
    </>
  );
};

export default Cart;
