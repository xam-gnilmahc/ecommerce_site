import { useState, useEffect } from "react";
import { Footer, Navbar } from "../components";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Country, State } from "country-state-city";
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/authContext"; // adjust path if needed
import { sendOrderEmail } from "../service/emailService";
import LottieLoader from "../components/LottieLoader";
import { supabase } from "../supaBaseClient";
import "./Animation.css";

// Stripe Publishable Key
const stripePromise = loadStripe(
  "pk_test_51PGec42K0njal9PzJzzxwBOVszXOkqMCBcovRYFChW727EsjLGJ9sWMvztGAGnnmVAtquHDgSllxMryuvfgnv87D00nc9a1Yp7"
);

const Checkout = () => {
  const { user, removeFromCartAfterOrder, cart, loading } = useAuth();

  const state = useSelector((state) => state.handleCart);
  const elements = useElements();
  const stripe = useStripe();

  // Shipping Information States
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.full_name || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [states, setStates] = useState([]);
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setLoading] = useState(false); // Add loading state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [show, setShow] = useState(false);

  // Handle Country Change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setStates(State.getStatesOfCountry(country)); // Update states based on country
  };

  // Handle State Change
  const handleStateChange = (state) => {
    setSelectedState(state);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe.js hasn't loaded yet.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setPaymentError(
        "Card element is not mounted properly. Please reload and try again."
      );
      toast.error("Card element not found.");
      return;
    }

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setPaymentError(error.message);
      toast.error(`Payment failed: ${error.message}`);
    } else {
      let subtotal = 0;
      let shipping = 30.0;
      let totalItems = 0;
      cart.map((item) => {
        subtotal += item.amount * item.quantity;
        totalItems += item.quantity;
      });

      const address = {
        addressLine1,
        addressLine2,
        country: selectedCountry,
        state: selectedState,
        zipCode,
      };

      const totalAmount = Math.round(subtotal + shipping);
      const paymentData = {
        paymentMethodId: token.id,
        amount: totalAmount,
        name,
        email,
        address,
        comment: "Payment for order #12345",
      };

      setLoading(true); // Set loading to true when payment is being processed

      try {
        const response = await fetch(
          "https://fzliiwigydluhgbuvnmr.supabase.co/functions/v1/smart-handler",
          {
            method: "POST",
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bGlpd2lneWRsdWhnYnV2bm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjkxNTMsImV4cCI6MjA1NzUwNTE1M30.w3Y7W14lmnD-gu2U4dRjqIhy7JZpV9RUmv8-1ybQ92w", // Your Bearer Token
              "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
          }
        );

        const result = await response.json();

        if (result.message === "Payment successful") {
          await sendOrderEmail(
            user.full_name || user.name,
            email,
            cart,
            address,
            totalAmount
          );
          // toast.success("Payment processed successfully!");
          setShow(true);
          await removeFromCartAfterOrder();
        } else {
          toast.error("Payment processing failed.");
        }
      } catch (err) {
        console.log(err);
        const errorMessage =
          err.response?.data?.errors?.error_message ||
          err.response?.data?.message ||
          "Payment failed";
        setPaymentError(errorMessage);
        toast.error(`Payment error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  let subtotal = 0;
  let shipping = 30.0;
  let totalItems = 0;
  cart.map((item) => {
    return (subtotal += item.amount * item.quantity);
  });

  cart.map((item) => {
    return (totalItems += item.quantity);
  });

  const closeModal = () => setShow(false);

  return (
    <>
      <Navbar />
      <div className="container my-4 py-3">
        {/* <h1 className="text-center mb-4">Checkout</h1>
        <hr /> */}
        <div className="row">
          {loading ? (
            <LottieLoader />
          ) : cart.length ? (
            <>
              {/* Main form section */}
              <div className="col-md-8">
                <div className="card  bg-white border border-gray-200 rounded-3 p-4">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* 1. Contact Information */}
                      <div className="col-12">
                        <h5 className="mb-3" style={{ color: "#000" }}>
                          1. Contact Information
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              Email{" "}
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              value={email}
                              style={{ color: "#6c757d" }}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              Name{" "}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={name}
                              style={{ color: "#6c757d" }}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Delivery Method */}
                      <div className="col-12 pt-4">
                        <h5 className="mb-3" style={{ color: "#000" }}>
                          2. Delivery Method
                        </h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              Address Line 1{" "}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={addressLine1}
                              style={{ color: "#6c757d" }}
                              onChange={(e) => setAddressLine1(e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ color: "#6c757d" }}
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value)}
                            />
                          </div>
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              Zip Code{" "}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              style={{ color: "#6c757d" }}
                              value={zipCode}
                              onChange={(e) => setZipCode(e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              Country{" "}
                            </label>
                            <select
                              className="form-select"
                              style={{ color: "#6c757d" }}
                              value={selectedCountry}
                              onChange={(e) =>
                                handleCountryChange(e.target.value)
                              }
                              required
                            >
                              <option value="">Select Country</option>
                              {Country.getAllCountries().map((country) => (
                                <option
                                  key={country.isoCode}
                                  value={country.isoCode}
                                >
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label
                              className="form-label"
                              style={{ color: "#6c757d" }}
                            >
                              State{" "}
                            </label>
                            <select
                              className="form-select"
                              value={selectedState}
                              onChange={(e) =>
                                handleStateChange(e.target.value)
                              }
                              required
                            >
                              <option value="">Select State</option>
                              {states.map((state) => (
                                <option
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* 3. Payment Method */}
                      <div className="col-12 pt-4">
                        <h5 className="mb-3" style={{ color: "#000" }}>
                          3. Payment Method
                        </h5>
                        <div className="p-3 border bg-white rounded">
                          <label
                            className="form-label"
                            style={{ color: "#6c757d" }}
                          >
                            Payment Methods
                          </label>

                          {/* Display Payment Icons */}
                          <div className="d-flex justify-content-between mb-3">
                            <button
                              className={`btn btn-light p-2 border d-flex align-items-center justify-content-center ${
                                paymentMethod === "card"
                                  ? "border-secondary"
                                  : ""
                              }`}
                              onClick={() => setPaymentMethod("card")}
                              style={{ width: "30%" }}
                            >
                              <i
                                className="fa fa-credit-card"
                                style={{ fontSize: "24px" }}
                              ></i>
                              <span
                                className="ms-2"
                                style={{ color: "#6c757d" }}
                              >
                                Card
                              </span>
                            </button>
                            <button
                              className={`btn btn-light p-2 border d-flex align-items-center justify-content-center ${
                                paymentMethod === "googlePay"
                                  ? "border-secondary"
                                  : ""
                              }`}
                              onClick={() => setPaymentMethod("googlePay")}
                              style={{ width: "30%" }}
                            >
                              <i
                                className="fa fa-google"
                                style={{ fontSize: "24px" }}
                              ></i>
                              <span
                                className="ms-2"
                                style={{ color: "#6c757d" }}
                              >
                                Google Pay
                              </span>
                            </button>
                            <button
                              className={`btn btn-light p-2 border d-flex align-items-center justify-content-center ${
                                paymentMethod === "applePay"
                                  ? "border-secondary"
                                  : ""
                              }`}
                              onClick={() => setPaymentMethod("applePay")}
                              style={{ width: "30%" }}
                            >
                              <i
                                className="fa fa-apple"
                                style={{ fontSize: "24px" }}
                              ></i>
                              <span
                                className="ms-2"
                                style={{ color: "#6c757d" }}
                              >
                                Apple Pay
                              </span>
                            </button>
                          </div>

                          {/* Conditionally render Card Input or Payment Buttons */}
                          {paymentMethod === "card" && (
                            <div className="mt-4 p-3 border rounded">
                              <CardElement />
                              <p
                                className="mt-2"
                                style={{ fontSize: "0.9rem", color: "#6c757d" }}
                              >
                                Test Card Numbers: Use one of these for testing:
                                <br />
                                - 4242 4242 4242 4242 (Visa) <br />
                                - 5555 5555 5555 4444 (Mastercard) <br />- 3782
                                8224 6310 005 (American Express)
                              </p>
                            </div>
                          )}

                          {paymentMethod === "googlePay" && (
                            <div>
                              {/* Placeholder for Google Pay */}
                              <p>Google Pay button will be here.</p>
                            </div>
                          )}

                          {paymentMethod === "applePay" && (
                            <div>
                              {/* Placeholder for Apple Pay */}
                              <p>Apple Pay button will be here.</p>
                            </div>
                          )}

                          {/* Development Mode Warning */}
                          <div
                            className="dev-mode-warning mt-3"
                            style={{
                              backgroundColor: "#fff8db",
                              borderLeft: "4px solid #facc15",
                              color: "#92400e",
                              padding: "8px 12px",
                              fontSize: "0.95rem",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              borderRadius: "4px",
                            }}
                          >
                            🚧 This feature is currently in{" "}
                            <strong>development mode</strong>. No real payment
                            details required. Use the test cards above! 🛠️
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="col-12 pt-4">
                        <button
                          type="submit"
                          className="btn btn-success  w-100"
                          disabled={loading || !stripe}
                        >
                          {paymentLoading
                            ? "Submitting Payment..."
                            : "Submit Payment"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary on Right */}
              <div className="col-md-4">
                <div className="bg-white border border-gray-200 rounded-3 p-4">
                  <h5 className="mb-4 text-lg font-semibold text-gray-800">
                    📦 Order Summary
                  </h5>
                  <div className="card-body">
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

                    {/* Order Summary */}
                    <ul className="list-group list-group-flush mt-3">
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ color: "#6c757d" }}
                      >
                        Products ({totalItems}){" "}
                        <span>${Math.round(subtotal)}</span>
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ color: "#6c757d" }}
                      >
                        Shipping <span>${shipping}</span>
                      </li>
                      <li
                        className="list-group-item d-flex justify-content-between fw-bold"
                        style={{ color: "#000" }}
                      >
                        Total <span>${Math.round(subtotal + shipping)}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-12 text-center py-5 bg-light">
              <h4 className="mb-4">No item in Cart</h4>
              <Link to="/" className="btn btn-outline-dark">
                <i className="fa fa-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          )}
        </div>
        {show && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div
                className="modal-content animate-fade-in border-0 position-relative"
                style={{
                  borderRadius: "1rem",
                  boxShadow: "0 0.75rem 1.5rem rgba(0, 0, 0, 0.15)",
                  overflow: "hidden",
                }}
              >
                {/* 🔥 Lottie animation as overlay */}
                <div
                  className="position-absolute top-0 start-50 translate-middle-x"
                  style={{
                    width: "1000px",
                    height: "100px",
                    zIndex: 1, // Ensure the loader is below the button
                    marginTop: "-50px",
                  }}
                >
                  <LottieLoader useAlt={true} />
                </div>

                {/* Modal header with close button */}
                <div
                  className="modal-header border-0 d-flex justify-content-between align-items-center"
                  style={{ zIndex: 2 }}
                >
                  <h5 className="modal-title text-dark fw-semibold m-0">
                    Thank You, {user.full_name || name}!
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    style={{ zIndex: 3 }} // Ensure the close button is above the animation
                  ></button>
                </div>

                <div className="modal-body px-4">
                  <h6 className="text-success mb-3">
                    Your payment was successful.
                  </h6>
                  <hr
                    className="mt-2 mb-4"
                    style={{
                      height: "0",
                      backgroundColor: "transparent",
                      opacity: ".75",
                      borderTop: "2px dashed #9e9e9e",
                    }}
                  />
                  <ul className="list-group list-group-flush mt-3">
                    <li
                      className="list-group-item d-flex justify-content-between"
                      style={{ color: "#6c757d" }}
                    >
                      order
                      <span>#12343556</span>
                    </li>
                    <li
                      className="list-group-item d-flex justify-content-between"
                      style={{ color: "#6c757d" }}
                    >
                      Estimated Delivery <span>3–5 business days</span>
                    </li>
                    {/* <li
                      className="list-group-item d-flex justify-content-between fw-bold"
                      style={{ color: "#000" }}
                    >
                      Total <span>${Math.round(subtotal + shipping)}</span>
                    </li> */}
                  </ul>
                </div>

                <div className="modal-footer border-0 d-flex justify-content-center pb-4">
                  <button
                    className="btn bg-success"
                    style={{
                      color: "#fff",
                      borderRadius: "2rem",
                      padding: "0.6rem 1.5rem",
                    }}
                  >
                    Track Your Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default () => (
  <Elements stripe={stripePromise}>
    <Checkout />
  </Elements>
);
