import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FaTimes, FaQuestion } from "react-icons/fa";
import LottieLoader from "../components/LottieLoader";
import "./cart.css";
import "animate.css"; // ✅ added animation library
import { useAppDispatch } from "../redux/index.ts";
import { addToCart, removeFromCart, fetchCartItems } from "../redux/slice/userCart.ts";

const Cart = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { items: cart, fetchLoading  } = useSelector((state) => state.addToCart);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [user, dispatch]);

  const updateItemQuantity = (product, action) => {
    if (!user) return;

    if (action === "increase") {
      dispatch(addToCart({ userId: user.id, product }));
    } else if (action === "decrease") {
      dispatch(removeFromCart({ userId: user.id, product }));
    }
  };

  const handleRemoveFromCart = (product) => {
    if (!user) return;
    dispatch(removeFromCart({ userId: user.id, product }));
  };

  const EmptyCart = () => (
    <div className="container py-5 text-center bg-white">
      <h3 className="mb-4 text-primary">Your Cart is Empty</h3>
      <Link to="/" className="btn btn-outline-primary btn-lg">
        <i className="fa fa-arrow-left me-2" /> Continue Shopping
      </Link>
    </div>
  );

  const ShowCart = () => {
    let subtotal = 0;
    let shipping = 0.00;
    let totalItems = 0;

    cart.forEach((item) => {
      subtotal += item.amount * item.quantity;
      totalItems += item.quantity;
    });

    return (
      <section className="py-3 bg-gradient from-gray-50 to-gray-100 min-h-screen">
        <div className="container">
          {/* Top Offer Banner */}
          <div className="alert alert-warning rounded-3 text-center fw-bold fs-6 mb-4 text-dark">
            🔥 Save up to <span className="text-danger">40%</span> for{" "}
            <span className="text-primary">Premium Members</span>!
            <Link
              to="#"
              className="ms-2 text-decoration-underline text-primary"
            >
              Join Now
            </Link>
          </div>

          <div className="row g-3">
            {/* Cart Items */}
            <div className="col-12 col-lg-8">
              {/* Info Banner */}
              <div className="alert alert-info d-flex justify-content-between align-items-center rounded-3 px-3 py-2 mb-3">
                <div>
                  🎉 Free shipping for members!{" "}
                  <Link
                    to="#"
                    className="text-decoration-underline text-primary fw-semibold"
                  >
                    Sign up now
                  </Link>
                </div>
                <button className="btn-close" aria-label="Close" />
              </div>

              <div className="bg-light p-4 rounded-3">
                <h5 className="mb-4 text-xl fw-semibold text-dark">
                  🛒 Shopping Cart
                </h5>
                <div style={{ maxHeight: "800px", overflowX: "auto" }}>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="mb-4 p-3 bg-white rounded-3 position-relative"
                    >
                      <button
                        onClick={() => handleRemoveFromCart(item.products)}
                        className="position-absolute top-0 end-0 m-2 bg-danger-subtle text-danger border-0 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px" }}
                      >
                        <FaTimes size={14} />
                      </button>

                      <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                        {/* Product Image */}
                        <img
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                          alt={item.products.name}
                          className="img-fluid"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "contain",
                          }}
                        />

                        {/* Product Details */}
                        <div className="flex-grow-1 w-100">
                          <h6
                            className="mb-1 fw-bold text-dark"
                            style={{
                              maxWidth: "400px",
                            }}
                            title={item.products.name}
                          >
                            {item.products.name}
                          </h6>
                          <p
                            className="mb-1 text-muted small"
                            style={{
                              maxWidth: "400px",
                            }}
                          >
                            {item.products.description.length > 100
                              ? item.products.description.slice(0, 100) + "..."
                              : item.products.description}
                          </p>
                          <div className="d-flex gap-1 mb-2">
                            {Array.from({ length: 5 }, (_, i) => {
                              const rating = item.products?.rating || 0;
                              return (
                                <i
                                  key={i}
                                  className={`fa ${
                                    rating >= i + 1
                                      ? "fa-star"
                                      : rating >= i + 0.5
                                      ? "fa-star-half-o"
                                      : "fa-star-o"
                                  } text-warning`}
                                />
                              );
                            })}
                          </div>

                          {/* Quantity Controls + Total */}
                          <div className="d-flex align-items-center flex-wrap gap-2">
                            <span className="text-muted small me-2">
                              Quantity:
                            </span>
                            <div
                              className="d-flex align-items-center rounded-pill border overflow-hidden"
                              style={{
                                height: "38px",
                                fontSize: "14px",
                                backgroundColor: "#fff",
                              }}
                            >
                              <div
                                className="d-flex justify-content-center align-items-center border-end"
                                style={{
                                  cursor: "pointer",
                                  userSelect: "none",
                                  width: "38px",
                                  height: "100%",
                                  backgroundColor: "#f0f0f0",
                                }}
                                onClick={() =>
                                  updateItemQuantity(item.products, "decrease")
                                }
                              >
                                <i className="fas fa-minus" />
                              </div>
                              <span
                                className="px-3 fw-semibold text-center"
                                style={{ minWidth: "40px" }}
                              >
                                {item.quantity}
                              </span>
                              <div
                                className="d-flex justify-content-center align-items-center border-start"
                                style={{
                                  cursor: "pointer",
                                  userSelect: "none",
                                  width: "38px",
                                  height: "100%",
                                  backgroundColor: "#f0f0f0",
                                }}
                                onClick={() =>
                                  updateItemQuantity(item.products, "increase")
                                }
                              >
                                <i className="fas fa-plus" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="col-12 col-lg-4">
              <div className="bg-light p-4 rounded-3">
                <h5 className="mb-4 text-lg fw-semibold text-dark">
                  📦 Order Summary
                </h5>
                <ul className="list-unstyled mb-3">
                  <li className="d-flex justify-content-between mb-2">
                    <span className="fw-bold d-flex align-items-center gap-1">
                      Subtotal ({totalItems}){" "}
                      <span
                        className="bg-dark rounded-circle text-white d-flex justify-content-center align-items-center"
                        style={{
                          width: "10px",
                          height: "10px",
                          fontSize: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <FaQuestion />
                      </span>
                    </span>
                    <span>${Math.round(subtotal)}</span>
                  </li>
                  <li className="d-flex justify-content-between mb-2">
                    <span className="fw-bold">Shipping</span>
                    <span>${shipping}</span>
                  </li>
                  <li className="d-flex justify-content-between mb-2">
                    <span className="fw-bold d-flex align-items-center gap-1">
                      Estimated Tax{" "}
                      <span
                        className="bg-dark rounded-circle text-white d-flex justify-content-center align-items-center"
                        style={{
                          width: "10px",
                          height: "10px",
                          fontSize: "8px",
                          cursor: "pointer",
                        }}
                      >
                        <FaQuestion />
                      </span>
                    </span>
                    <span>-</span>
                  </li>
                  <li className="d-flex justify-content-between border-top pt-2 fw-bold">
                    <span>Total</span>
                    <span>${Math.round(subtotal + shipping)}</span>
                  </li>
                </ul>
                <Link
                  to="/checkout"
                  className="btn btn-dark w-100 rounded-pill fw-semibold"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <>
      <div className="container py-4">
        {fetchLoading  ? (
          <LottieLoader />
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
