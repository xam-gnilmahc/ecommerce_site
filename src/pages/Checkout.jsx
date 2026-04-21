import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Country, State } from "country-state-city";
import Skeleton from "react-loading-skeleton";
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import GooglePayButton from '@google-pay/button-react';
import { buildPaymentRequest, getUpdatedPaymentData } from '../components/GooglePlay.jsx';
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext"; // adjust path if needed
import "./Animation.css";
import "./checkout.css";
import { fetchTotalCart } from "../redux/slice/userCart.ts";
import Navbar from "../components/Navbar";
import { useAppDispatch } from "../redux/index.ts";
import { fetchCartItems, } from "../redux/slice/userCart.ts";
import { trackPurchase } from "../utils/tracking";
import { processCardPayment, processGooglePay } from "../service/googlePayService";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_URL);

const Checkout = () => {
  const { user, placeOrder } = useAuth();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const { items: cart, fetchLoading: loading } = useSelector((state) => state.addToCart);

  // States for form fields, loading, payment method, etc.
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.full_name || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false); // Add loading state
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [show, setShow] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("free");
  const [showPromo, setShowPromo] = useState(false);

  const getSubtotal = () => cart.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  const getShipping = () => (shippingMethod === "free" ? 0 : 3);

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
    toast.success("Payment successful!");
  };

  const handlePaymentError = (result) => {
    if (result.message !== "Payment successful") {
      toast.error(result?.error || "Payment processing failed.");
      return true;
    }
    return false;
  };

  // ---------------- FETCH CART ----------------
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [user?.id]);

  // ---------------- COUNTRY ----------------
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setStates(State.getStatesOfCountry(country));
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
  };

  // ---------------- CARD PAYMENT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);

    try {
      const subtotal = getSubtotal();
      const totalAmount = Math.round(subtotal + getShipping());

      const { finalData, result } = await processCardPayment(
        stripe,
        elements,
        {
          amount: totalAmount,
          name,
          email,
          address: getAddress(),
        }
      );

      if (handlePaymentError(result)) return;

      const orderId = await placeOrder(
        { ...finalData, payment_status: "success", shippingMethod },
        result
      );

      await handleOrderSuccess(orderId);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // ---------------- GOOGLE PAY ----------------
  const handleLoadPaymentData = async (paymentData) => {
    setPaymentLoading(true);

    try {
      const subtotal = getSubtotal();
      const gpayShippingId = paymentData.shippingOptionData?.id;
      const totalAmount = Math.round(subtotal + (gpayShippingId == "free" ? 0 : 3));

      const { finalData, result } = await processGooglePay(paymentData, {
        amount: totalAmount,
        name: user?.name || user?.full_name,
        email: user?.email || email,
      });

      if (handlePaymentError(result)) return;

      const orderId = await placeOrder(
        { ...finalData, payment_status: "success", shippingMethod: gpayShippingId == "free" ? "free" : "express" },
        result
      );

      await handleOrderSuccess(orderId);
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // ---------------- GOOGLE PAY REQUEST ----------------
  useEffect(() => {
    if (!cart?.length) return;

    const displayItems = cart.map((item) => ({
      label: item.products.name,
      price: (item.amount * item.quantity).toFixed(2),
      type: "LINE_ITEM",
    }));

    setPaymentRequest(buildPaymentRequest(displayItems));
  }, [cart]);


  return (
    <>
      {paymentLoading && (
        <div className="payment-overlay">
          <div className="payment-loader-box">
            <div className="payment-spinner"></div>
            <h3>Processing Payment...</h3>
            <p>Please do not refresh or click anything</p>
          </div>
        </div>
      )}
      <Navbar />
      <div className="container my-4 py-3">
        <div className="row">
          {loading ? (
            <>
              {/* Left Form Skeleton */}
              <div className="col-12 col-lg-8">
                <Skeleton height={30} width="40%" className="mb-3" /> {/* Delivery Info Header */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <Skeleton height={40} />
                  </div>
                  <div className="col-md-6">
                    <Skeleton height={40} />
                  </div>
                </div>
              </div>

              {/* Right Cart Summary Skeleton */}
              <div className="col-md-4">
                <Skeleton height={25} width="50%" className="mb-3" /> {/* Summary title */}
                {Array(2)
                  .fill(0)
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="d-flex mb-3 align-items-center"
                      style={{ minHeight: "60px" }}
                    >
                      <Skeleton height={60} width={60} />
                      <div className="ms-2 w-100">
                        <Skeleton height={15} width="80%" className="mb-2" />
                        <Skeleton height={15} width="60%" className="mb-1" />
                        <Skeleton height={15} width="40%" />
                      </div>
                    </div>
                  ))}
                <Skeleton height={30} width="50%" className="mb-1" /> {/* Products total */}
                <Skeleton height={30} width="50%" className="mb-1" /> {/* Shipping */}
                <Skeleton height={30} width="50%" /> {/* Total */}
              </div>
            </>
          ) : cart.length && show === false ? (
            <>
              {/* Main form section */}
              <div className="col-12 col-lg-8">
                <div className="">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* Contact Information */}
                      {paymentMethod === 'card' && (
                        <>
                          <div className="col-12">
                            <h5 className="mb-3" style={{ color: "#000" }}>
                              Delivery Information
                            </h5>
                            <div className="">
                              <div className="row g-3">
                                <div className="col-12 col-md-6">
                                  <label className="form-label" style={{ color: "#6c757d" }}>
                                    Email
                                  </label>
                                  <input type="email" className="form-control" value={email} style={{ color: "#6c757d" }} onChange={(e) => setEmail(e.target.value)} required/>
                                </div>
                                <div className="col-12 col-md-6">
                                  <label className="form-label" style={{ color: "#6c757d" }}>
                                    Name
                                  </label>
                                  <input type="text" className="form-control" value={name} style={{ color: "#6c757d" }} onChange={(e) => setName(e.target.value)} required/>
                                </div>
                              </div>

                              {/* 2. Delivery Method */}

                              <div className="row g-3 mt-2">
                                <div className="col-12 col-md-6">
                                  <label className="form-label" style={{ color: "#6c757d" }}>
                                    Address Line 1
                                  </label>
                                  <input type="text" className="form-control" value={addressLine1} style={{ color: "#6c757d" }}
                                    onChange={(e) =>
                                      setAddressLine1(e.target.value)
                                    }
                                    required
                                  />
                                </div>
                                <div className="col-12 col-md-6">
                                  <label className="form-label" style={{ color: "#6c757d" }}>
                                    Address Line 2
                                  </label>
                                  <input
                                    type="text" className="form-control" style={{ color: "#6c757d" }} value={addressLine2}
                                    onChange={(e) =>
                                      setAddressLine2(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="row g-3">
                                  <div className="col-md-4">
                                    <label className="form-label" style={{ color: "#6c757d" }}>
                                      Zip Code
                                    </label>
                                    <input
                                      type="text" className="form-control w-full" style={{ color: "#6c757d" }} value={zipCode}
                                      onChange={(e) => setZipCode(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="col-md-4">
                                    <label className="form-label" style={{ color: "#6c757d" }}>
                                      Country
                                    </label>
                                    <select className="form-select w-full" style={{ color: "#6c757d" }} value={selectedCountry}
                                      onChange={(e) => handleCountryChange(e.target.value)}
                                      required
                                    >
                                      <option value="">Select Country</option>
                                      {Country.getAllCountries().map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                          {country.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-md-4">
                                    <label className="form-label" style={{ color: "#6c757d" }}>
                                      State
                                    </label>
                                    <select style={{ color: "#6c757d" }} className="form-select w-full" value={selectedState}
                                      onChange={(e) => handleStateChange(e.target.value)}
                                      required
                                    >
                                      <option value="">Select State</option>
                                      {states.map((state) => (
                                        <option key={state.isoCode} value={state.isoCode}>
                                          {state.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-12 pt-2">
                            <h6 className="mb-3" style={{ color: "#000" }}>Shipping Method</h6>
                            <div className="d-flex gap-3">
                              {/* Free Shipping Option */}
                              <label
                                className={`border rounded p-3 flex-fill text-start ${shippingMethod === "free" ? "border-primary bg-primary bg-opacity-10" : "border-secondary"
                                  }`}
                                style={{ cursor: "pointer", minWidth: "160px" }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="form-check m-0">
                                    <input className="form-check-input" type="radio"  name="shipping"  id="shippingFree" value="free" checked={shippingMethod === "free"} onChange={() => setShippingMethod("free")}/>
                                    <label className="form-check-label ms-2" htmlFor="shippingFree">
                                      Free Shipping
                                    </label>
                                  </div>
                                  <strong>$0</strong>
                                </div>
                                <div className="text-muted ps-4">7–20 Days</div>
                              </label>

                              {/* Express Shipping Option */}
                              <label
                                className={`border rounded p-3 flex-fill text-start ${shippingMethod === "express" ? "border-primary bg-primary bg-opacity-10" : "border-secondary"
                                  }`}
                                style={{ cursor: "pointer", minWidth: "160px" }}
                              >
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <div className="form-check m-0">
                                    <input className="form-check-input" type="radio" name="shipping" id="shippingExpress" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} />
                                    <label className="form-check-label ms-2" htmlFor="shippingExpress">
                                      Express Shipping
                                    </label>
                                  </div>
                                  <strong>$3</strong>
                                </div>
                                <div className="text-muted ps-4">1–3 Days</div>
                              </label>
                            </div>
                          </div>
                        </>
                      )}

                      {/* 3. Payment Method */}
                      <div className="col-12 pt-4">
                        <h5 className="mb-3" style={{ color: "#000" }}>
                          Payment Method
                        </h5>

                        <div className="payment-grid">
                          {/* CARD */}
                          <div
                            onClick={() => setPaymentMethod("card")}
                            className={`payment-card ${paymentMethod === "card" ? "active" : ""}`}
                          >
                            <div className="payment-content">
                              <div>
                                <h6>💳 Card</h6>
                                <p>Pay securely with your card</p>
                              </div>
                              {paymentMethod === "card" && <div className="check">✓</div>}
                            </div>
                          </div>

                          {/* GOOGLE PAY */}
                          <div
                            onClick={() => setPaymentMethod("googlePay")}
                            className={`payment-card ${paymentMethod === "googlePay" ? "active" : ""}`}
                          >
                            <div className="payment-content">
                              <div>
                                <h6>🟢 Google Pay</h6>
                                <p>Fast checkout with Google</p>
                              </div>
                              {paymentMethod === "googlePay" && <div className="check">✓</div>}
                            </div>
                          </div>

                        </div>

                        <div className="payment-method">

                          {/* Prompt when no payment method selected */}
                          {paymentMethod === "" && (
                            <p className="text-muted mt-3">
                              Choose how you’d like to pay: Card or Google Pay.
                            </p>
                          )}

                          {/* Conditional payment fields */}
                          {paymentMethod === "card" && (
                            <div className="mt-4 p-3 border rounded">
                              <CardElement
                                options={{
                                  style: {
                                    base: {
                                      fontSize: "18px",
                                      lineHeight: "30px",
                                      padding: "12px 14px",
                                      color: "#424770",
                                      "::placeholder": { color: "#aab7c4" },
                                    },
                                    invalid: { color: "#9e2146" },
                                  },
                                }}
                              />
                              <p className="mt-2" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                                Test Card Numbers: <br />
                                - 4242 4242 4242 4242 (Visa) <br />
                                - 5555 5555 5555 4444 (Mastercard) <br />- 3782 8224 6310 005 (American Express)
                              </p>
                            </div>
                          )}

                          {paymentMethod === "applePay" && <p>Apple Pay button will be here.</p>}

                          {paymentMethod === "googlePay" && (
                            <div className="mt-4">
                              {paymentRequest ? (
                                user ? (
                                  <GooglePayButton
                                    environment="TEST"
                                    buttonSizeMode="fill"
                                    paymentRequest={paymentRequest}
                                    onLoadPaymentData={handleLoadPaymentData}
                                    onError={(error) => console.error(error)}
                                    onPaymentDataChanged={(paymentData) => getUpdatedPaymentData(paymentRequest, paymentData)}
                                  />
                                ) : (
                                  <p className="text-muted">Please login to use Google Pay.</p>
                                )
                              ) : (
                                <p className="text-muted">Preparing payment...</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit */}
                      {paymentMethod === 'card' && (
                        <div className="col-12 pt-4">
                          <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading || !stripe}
                          >
                            {paymentLoading
                              ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  Submitting Payment...
                                </>
                              )
                              : "Submit Payment"}
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary on Right */}
              <div className="col-md-4 ">
                <div className="bg-white border border-gray-200 rounded-3 p-4">
                  <h5 className="mb-4 text-lg font-semibold text-gray-800">
                    📦 Order Summary
                  </h5>

                  <div className="card-body">
                    <div
                      className="mx-auto"
                      style={{
                        maxHeight: "600px",
                        overflowX: "auto",
                      }}
                    >
                      {cart.map((item, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-center mb-3"
                          style={{
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "10px",
                          }}
                        >
                          {/* Product Image */}
                          <div style={{ width: "25%", flexShrink: 0 }}>
                            <img
                              src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                              alt={item.products.name}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "contain",
                                borderRadius: "5px",
                              }}
                            />
                          </div>

                          {/* Product Details */}
                          <div
                            className="d-flex flex-column"
                            style={{ width: "75%", paddingLeft: "10px" }}
                          >
                            <div className="d-flex flex-column mb-1">
                              {/* Product Name */}
                              <span
                                className="fw-bold"
                                style={{ color: "#000", color: "#6c757d" }}
                              >
                                {item.products.name}
                              </span>

                              {/* Quantity */}
                              <span
                                style={{ color: "#6c757d", fontSize: "14px" }}
                              >
                                Quantity: {item.quantity}
                              </span>

                              {/* Price */}
                              <span
                                style={{ color: "#6c757d", fontSize: "14px" }}
                              >
                                {`$${item.amount.toFixed(2)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Order Summary */}
                    <ul className="list-group list-group-flush mt-3">
                      <li className="list-group-item d-flex justify-content-between" style={{ color: "#6c757d" }}>
                        Products ({cart.reduce((s, i) => s + i.quantity, 0)})
                        <span>${Math.round(getSubtotal())}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between" style={{ color: "#6c757d" }}>
                        Shipping
                        <span>${getShipping()}</span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between fw-bold" style={{ color: "#000" }}>
                        Total
                        <span>${Math.round(getSubtotal() + getShipping())}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-12 text-center py-5 bg-light">
              <h4 className="mb-4">No item in Cart</h4>
              <Link to="/" className="btn btn-outline-primary">
                <i className="fa fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);
