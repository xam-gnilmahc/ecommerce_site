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
import LottieLoader from "../components/LottieLoader";
import { supabase } from "../supaBaseClient";
import "./Animation.css";
import "./checkout.css";
import {FaChevronDown, FaChevronUp } from "react-icons/fa";

// Stripe Publishable Key
const stripePromise = loadStripe(
  "pk_test_51PGec42K0njal9PzJzzxwBOVszXOkqMCBcovRYFChW727EsjLGJ9sWMvztGAGnnmVAtquHDgSllxMryuvfgnv87D00nc9a1Yp7"
);

const Checkout = () => {
  const { user, removeFromCartAfterOrder, cart, loading, placeOrder } =
    useAuth();

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
  const [shippingMethod, setShippingMethod] = useState("free");
    const [showPromo, setShowPromo] = useState(false);
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
      toast.error("Use card payment gate way.");
      return;
    }

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setPaymentError(error.message);
      toast.error(`Payment failed: ${error.message}`);
    } else {
      let subtotal = 0;
      let shipping = shippingMethod === "free" ? 0 : 30;
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
        comment: "Payment for order",
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

        let status = "success";

        if (result.message != "Payment successful") {
          status = "failed";
          toast.error("Payment processing failed.");
          return;
        }

       const orderId = await placeOrder({ 
          ...paymentData, 
          payment_status: status,
          shippingMethod 
        }, result);

        if (orderId) {
          setShow(true); // ✅ Only show after order placement is successful
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
  let shipping = shippingMethod === "free" ? 0 : 30;
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
              <div className="col-12 col-lg-8">
                <div className="">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* 1. Contact Information */}
                      <div className="col-12">
                        <h5 className="mb-3" style={{ color: "#000" }}>
                          Delivery Information
                        </h5>
                        <div className="">
                          <div className="row g-3">
                            <div className="col-12 col-md-6">
                              <label
                                className="form-label"
                                style={{ color: "#6c757d" }}
                              >
                                Email
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
                            <div className="col-12 col-md-6">
                              <label
                                className="form-label"
                                style={{ color: "#6c757d" }}
                              >
                                Name
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

                          {/* 2. Delivery Method */}

                          <div className="row g-3 mt-2">
                            <div className="col-12 col-md-6">
                              <label
                                className="form-label"
                                style={{ color: "#6c757d" }}
                              >
                                Address Line 1
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={addressLine1}
                                style={{ color: "#6c757d" }}
                                onChange={(e) =>
                                  setAddressLine1(e.target.value)
                                }
                                required
                              />
                            </div>
                            <div className="col-12 col-md-6">
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
          type="text"
          className="form-control w-full"
          style={{ color: "#6c757d" }}
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          required
        />
      </div>
      <div className="col-md-4">
        <label className="form-label" style={{ color: "#6c757d" }}>
          Country
        </label>
        <select
          className="form-select w-full"
          style={{ color: "#6c757d" }}
          value={selectedCountry}
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
        <select
          style={{ color: "#6c757d" }}
          className="form-select w-full"
          value={selectedState}
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
      className={`border rounded p-3 flex-fill text-start ${
        shippingMethod === "free" ? "border-dark bg-light" : "border-secondary"
      }`}
      style={{ cursor: "pointer", minWidth: "160px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="form-check m-0">
          <input
            className="form-check-input"
            type="radio"
            name="shipping"
            id="shippingFree"
            value="free"
            checked={shippingMethod === "free"}
            onChange={() => setShippingMethod("free")}
          />
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
      className={`border rounded p-3 flex-fill text-start ${
        shippingMethod === "express" ? "border-dark bg-light" : "border-secondary"
      }`}
      style={{ cursor: "pointer", minWidth: "160px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="form-check m-0">
          <input
            className="form-check-input"
            type="radio"
            name="shipping"
            id="shippingExpress"
            value="express"
            checked={shippingMethod === "express"}
            onChange={() => setShippingMethod("express")}
          />
          <label className="form-check-label ms-2" htmlFor="shippingExpress">
            Express Shipping
          </label>
        </div>
        <strong>$30</strong>
      </div>
      <div className="text-muted ps-4">1–3 Days</div>
    </label>
  </div>
</div>


                      {/* 3. Payment Method */}
                      <div className="col-12 pt-4">
                        <h5 className="mb-3" style={{ color: "#000" }}>
                          Payment Method
                        </h5>
                        <div className=" payment-method">
                          <div className="d-flex  gap-3">
                            {/* Cash on Delivery */}
                            <label
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={paymentMethod === "cod"}
                                onChange={() => setPaymentMethod("cod")}
                                style={{ accentColor: "#0d6efd" }} // Blue circle color for checked radio
                              />
                              <span>Cash on Delivery</span>
                            </label>

                            {/* Card Payment */}
                            <label
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value="card"
                                checked={paymentMethod === "card"}
                                onChange={() => setPaymentMethod("card")}
                                style={{ accentColor: "#0d6efd" }}
                              />
                              <span>Card</span>
                            </label>

                            {/* Google Pay */}
                            {/* <label
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <input
              type="radio"
              name="payment"
              value="googlePay"
              checked={paymentMethod === "googlePay"}
              onChange={() => setPaymentMethod("googlePay")}
              style={{ accentColor: "#0d6efd" }}
            />
            <span>Google Pay</span>
          </label> */}

                            {/* Apple Pay */}
                            {/* <label
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <input
              type="radio"
              name="payment"
              value="applePay"
              checked={paymentMethod === "applePay"}
              onChange={() => setPaymentMethod("applePay")}
              style={{ accentColor: "#0d6efd" }}
            />
            <span>Apple Pay</span>
          </label> */}
                          </div>

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
                              <p
                                className="mt-2"
                                style={{ fontSize: "0.9rem", color: "#6c757d" }}
                              >
                                Test Card Numbers: <br />
                                - 4242 4242 4242 4242 (Visa) <br />
                                - 5555 5555 5555 4444 (Mastercard) <br />- 3782
                                8224 6310 005 (American Express)
                              </p>
                            </div>
                          )}
                          {paymentMethod === "cod" && (
                            <div
                              className="px-3 py-3"
                              style={{
                                marginTop: "-0.75rem",
                                marginBottom: "1rem",
                              }}
                            >
                              <h6 className="fw-bold text-warning mb-2">
                                Cash on Delivery Unavailable
                              </h6>
                              <p className="text-muted mb-1">
                                For some reason, Cash on Delivery is not
                                available at the moment.
                              </p>
                              <p className="text-muted mb-0">
                                Please proceed with a secure card payment to
                                complete your order.
                              </p>
                            </div>
                          )}
                          {paymentMethod === "applePay" && (
                            <p>Apple Pay button will be here.</p>
                          )}
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="col-12 pt-4">
                        <button
                          type="submit"
                          className="btn btn-dark w-100"
                          disabled={loading || !stripe}
                        >
                          {paymentLoading
                            ?(
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
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary on Right */}
              <div className="col-md-4 order-summary pt-5 ">
                <div className="bg-white border border-gray-200 rounded-3 p-4">
                  <h5 className="mb-4 text-lg font-semibold text-gray-800">
                    📦 Order Summary
                  </h5>

                  <div className="card-body">
                    <div
                      className="mx-auto"
                      style={{
                        maxHeight: "790px",
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
                        <div
                                      onClick={() => setShowPromo(!showPromo)}
                                      className=" d-flex justify-content-between px-3"
                                      style={{ userSelect: "none" }}
                                    >
                                      <span>Do you have a promo code?</span>
                                      {showPromo ? <FaChevronUp /> : <FaChevronDown />}
                                    </div>
                      
                                    {/* Promo code input */}
                                    {showPromo && (
                                      <div className="mb-1">
                                        <input
                                          type="text"
                                          className="form-control rounded ms-3 me-5"
                                          placeholder="Enter promo code"
                                        />
                                      </div>
                                    )}
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
                {/* ✅ Success Lottie Animation */}
                <div
                  className="position-absolute top-0 start-50 translate-middle-x"
                  style={{
                    width: "1000px",
                    height: "100px",
                    zIndex: 1,
                    marginTop: "-50px",
                  }}
                >
                  <LottieLoader useAlt={true} />
                </div>

                {/* ✅ Header */}
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
                    style={{ zIndex: 3 }}
                  ></button>
                </div>

                {/* ✅ Body Content */}
                <div className="modal-body px-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-check-circle-fill text-success fs-1"></i>
                  </div>

                  <h6 className="text-success fw-bold mb-2">
                    Payment Successful!
                  </h6>
                  <p className="text-muted mb-4">
                    Your order has been placed successfully. We'll start
                    preparing it right away!
                  </p>

                  <hr
                    className="my-4"
                    style={{
                      height: "0",
                      backgroundColor: "transparent",
                      opacity: ".75",
                      borderTop: "2px dashed #9e9e9e",
                    }}
                  />
                  <ul className="list-group list-group-flush text-start">
                    <li className="list-group-item d-flex justify-content-between text-muted">
                      Estimated Delivery
                      { shippingMethod === "free" ? (
                        <>
                         <span>7 - 20 business days</span>
                        </>

                      ):(
                        <>
                        <span>1 - 3 business days</span>
                        </>

                      )}
                    </li>
                    <li className="list-group-item d-flex justify-content-between text-muted">
                      Payment Status
                      <span className="text-success fw-semibold">
                        Confirmed
                      </span>
                    </li>
                  </ul>
                </div>

                {/* ✅ Footer */}
                {/* <div className="modal-footer border-0 d-flex justify-content-center pb-4">
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
        </div> */}
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
