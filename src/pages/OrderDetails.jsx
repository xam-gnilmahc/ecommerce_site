import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiArrowLeft } from "react-icons/fi";
import "./orderDetails.css";
import Sidebar from "../components/Sidebar";
import LottieLoader from "../components/LottieLoader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  FaCheckCircle,
  FaBox,
  SiPoe,
  FaTruck,
  FaShippingFast,
  FaRegCopy,
  FaMapMarkerAlt,
  FaUser,
  FaFileInvoice,
  FaPhoneAlt,
  FaListAlt,
  FaTag,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import toast from "react-hot-toast";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderDetails, user, loading, updateOrder } = useAuth();
  const [paymentLoading, setLoading] = useState(false); // Add loading state
  const [order, setOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [error, setError] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const predefinedReasons = [
    "Wrong item delivered",
    "Item damaged",
    "Late delivery",
    "Changed my mind",
    "Other",
  ];
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const designRef = useRef();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.tracking_number);
    setCopied(true);
    toast.success("Copied Successfully");
  };

  const handlePrint = () => {
    const printContents = designRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const parseAddress = (addressStr) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    (async () => setOrder(await getOrderDetails(orderId)))();
  }, [orderId]);

  const steps = [
    "Pending",
    "Confirmed",
    "Shipped Out",
    "Out for Delivery",
    "Delivered",
  ];
  const currentIdx = steps.findIndex(
    (s) => s.toLowerCase() === order?.status?.toLowerCase()
  );
  const shippingAddress = parseAddress(order?.shipping_address);
  const destination =
    `${shippingAddress?.addressLine1}, ${shippingAddress?.country}` ||
    "Destination";

  const payColor = (s) =>
    s === "success" ? "success" : s === "pending" ? "warning" : "danger";

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // const handleSubmit = () => {
  //   if (!refundReason) {
  //     alert("Please provide a reason for refund.");
  //     return;
  //   }
  //   alert(`Refund reason submitted: ${refundReason}`);

  //   // Reset form and close modal
  //   setSelectedReason("");
  //   setRefundReason("");

  // };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const fixed = value.replace(" ", "T");
    const date = new Date(fixed);
    if (isNaN(date)) return "Invalid date";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCancelOrder = async () => {
    setLoading(true);

    const amount = (
      order.order_items.reduce(
        (acc, item) => acc + parseFloat(item.price_each * item.quantity),
        0
      ) + 30
    ).toFixed(2);

    const paymentData = {
      chargeId: order.orderpayments_logs?.charge_id || "null",
      amount: parseFloat(amount),
    };

    console.log(paymentData);

    try {
      const response = await fetch(
        "https://fzliiwigydluhgbuvnmr.supabase.co/functions/v1/quick-responder",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bGlpd2lneWRsdWhnYnV2bm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MjkxNTMsImV4cCI6MjA1NzUwNTE1M30.w3Y7W14lmnD-gu2U4dRjqIhy7JZpV9RUmv8-1ybQ92w",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      const result = await response.json();
      console.log(result);

      if (result.message !== "Refund processed") {
        const modalEl = document.getElementById("exampleModal");
        modalEl.setAttribute("data-dismiss", "modal");
        toast.error(`${result?.error || result?.message}`);
        await updateOrder(order.id, { message: "Refund failed" }, amount);
      } else {
        await updateOrder(order.id, result, amount, refundReason);
        navigate("/return-cancel");
        toast.success(
          "Refund successful. Refund may take up to 7 business days."
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.error_message ||
        err.response?.data?.message ||
        "Order cancel failed.";
      toast.error(`Payment error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex">
        <Sidebar />
        <main className="flex-grow-1 p-3" style={{ marginLeft: "280px" }}>
          <div ref={designRef}>
            {/* Header with Back Arrow and Order ID */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-3">
              {/* Left side - Heading and Breadcrumb */}
              <div>
                <h2 className="order-id m-0">
                  Orders Details # <span>{order?.id}</span>
                </h2>
                <small className="text-muted d-block mt-1">
                  Dashboard / Order Details
                </small>
              </div>

              {/* Right side - Buttons */}
              <div className="d-flex flex-wrap gap-2">
                {order?.status !== "Cancelled" && (
                  <>
                    <button
                      type="button"
                      className="btn"
                      data-toggle="modal"
                      data-target="#exampleModal"
                      style={{ backgroundColor: "#333", color: "#fff" }}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-outline-secondary"
                      onClick={handlePrint}
                    >
                      <i className="bi bi-receipt-cutoff" />
                      Invoice
                    </button>

                    <button
                      className="btn"
                      style={{ backgroundColor: "#333", color: "#fff" }}
                      onClick={() => navigate(`/track/${order.id}`)}
                    >
                      <i className="bi bi-truck" />
                      Track
                    </button>
                  </>
                )}

                {order?.status === "Cancelled" && (
                  <>
                    <button className="btn btn-outline-danger" disabled>
                      Order Cancelled
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handlePrint}
                    >
                      <i className="bi bi-receipt-cutoff" />
                      Invoice
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* Header Buttons */}

            {loading || !order ? (
              <LottieLoader />
            ) : (
              <>
                <div
                  className="border m-1  p-4"
                  style={{ borderRadius: "1rem" }}
                >
                  <div className="card mb-4 p-4">
                    <div className="row gy-4 align-items-center">
                      {/* Shipping Info */}
                      <div className="col-12 col-md-8 col-lg-5">
                        <h6 className="fw-semibold mb-2 d-flex align-items-center">
                          <FaShippingFast className="me-2" />
                          {order.status === "Cancelled"
                            ? "This order was cancelled."
                            : "Be patient, package on deliver!"}
                        </h6>

                        <div className="d-flex flex-column flex-sm-row align-items-center gap-2 small">
                          {/* Origin */}
                          <div className="border rounded-pill px-3 py-1 bg-white">
                            Kathmandu, Nepal
                          </div>

                          {/* Dotted Line */}
                          <div
                            className="d-none d-sm-block flex-grow-1 position-relative"
                            style={{ height: "1px", background: "#ccc" }}
                          >
                            <span
                              className="position-absolute top-50 start-0 translate-middle-y w-100"
                              style={{
                                borderTop: "2px dotted #999",
                                height: "1px",
                                display: "block",
                              }}
                            ></span>
                          </div>

                          {/* Destination */}
                          <div className="border rounded-pill px-3 py-1 bg-white text-end">
                            {destination}
                          </div>
                        </div>
                      </div>

                      {/* Estimated Arrival */}
                      <div className="col-6 col-md-2 text-center text-md-start">
                        <p className="text-muted small mb-1">
                          {order.status === "Cancelled" ? (
                            <>
                              <FaShippingFast className="me-2 text-danger" />
                              Order was Cancelled
                            </>
                          ) : (
                            <>
                              <FaShippingFast className="me-2" />
                              Estimated Arrival
                            </>
                          )}
                        </p>
                        <p className="fw-semibold mb-0">
                          {formatDate(order.order_date)}
                        </p>
                      </div>

                      {/* Delivered In */}
                      <div className="col-6 col-md-2 text-center text-md-start">
                        <p className="text-muted small mb-1">
                          {" "}
                          <FaClock className="me-2" />
                          Delivered in
                        </p>
                        {order.status === "Cancelled" ? (
                          <p className="fw-semibold mb-0 text-danger">
                            Cancelled
                          </p>
                        ) : (
                          <p className="fw-semibold mb-0">
                            {Math.floor(Math.random() * (10 - 7 + 1)) + 7} Days
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    {/* Timeline */}
                    {order.status != "Cancelled" ? (
                        <div className="col-md-4">
                        <div className="p-4 border rounded bg-white h-100">
                          <h6 className="fw-semibold mb-3 d-flex align-items-center">
                            <FaBox className="me-2 text-secondary" />
                            Timeline
                          </h6>
                          <ul className="list-unstyled small mb-0">
                            <li className="mb-3">
                              <strong>4 Jul (Now) 06:00</strong>
                              <br />
                              Your package is packed by the courier
                              <br />
                              Kthmandu, Bagmati, kalanki
                            </li>
                            <li className="mb-3">
                              <strong>2 Jul 06:00</strong>
                              <br />
                              Shipment has been created
                              <br />
                              Kalanki, Bafal
                            </li>
                            <li>
                              <strong>1 Jul 06:00</strong>
                              <br />
                              Order placed{" "}
                              <FaCheckCircle className="text-success ms-1" />
                            </li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="col-md-4">
                        <div className="p-4 border rounded bg-white h-100">
                          <h6 className="fw-semibold mb-3 d-flex align-items-center">
                            <FaShippingFast className="me-2 text-secondary" />
                            Reason
                          </h6>
                          <p className="fw-bold text-muted mb-1">{order?.Reason}</p>
                        </div>
                      </div>
                    )}
                    <div className="col-md-4">
                        <div className="p-4 border rounded bg-white h-100">
                          <h6 className="fw-semibold mb-3 d-flex align-items-center">
                            <FaShippingFast className="me-2 text-secondary" />
                            Shipment Details
                          </h6>
                          <p className="fw-bold mb-1">
                            UOM WHARE HOUSE , KALANKI{" "}
                          </p>
                          <p>
                            <FaUser className="me-1" />
                            <strong>Recipient:</strong> {user.name}
                          </p>
                          <p>
                            <FaMapMarkerAlt className="me-1" />
                            <strong>Delivery address:</strong>
                            <br />
                            {shippingAddress?.addressLine1},{" "}
                            {shippingAddress?.state}, {shippingAddress?.zipCode}
                            , {shippingAddress?.country}
                          </p>
                          <p className="mb-0">
                            <strong>Tracking No.:</strong>{" "}
                            <span className="border rounded-pill px-2 py-1 d-inline-block">
                              {order.tracking_number}
                            </span>
                            <FaRegCopy
                              onClick={handleCopy}
                              className="text-black ml-1"
                              style={{ cursor: "pointer" }}
                              title={copied ? "Copied!" : "Copy to clipboard"}
                            />
                          </p>
                        </div>
                      </div>
                    {/* Payment */}
                    <div className="col-md-4">
                      <div className="p-4 border rounded bg-white h-100">
                        <h6 className="fw-semibold mb-3 d-flex align-items-center">
                          <FaFileInvoice className="me-2 text-secondary" />
                          Payment Summary
                        </h6>
                        {order.orderpayments_logs ? (
                          <div className="">
                            <div className="mb-2">
                              <strong>Amount:</strong> $
                              {order.orderpayments_logs.amount.toFixed(2)}{" "}
                              {order.orderpayments_logs.currency}
                            </div>
                            <div className="mb-2 small">
                              <strong>Transaction ID:</strong>{" "}
                              {order.orderpayments_logs.stripe_payment_id}
                            </div>
                            <div className="mb-2">
                              <strong>Status:</strong>{" "}
                              {order.orderpayments_logs.status}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontStyle: "italic" }}
                            >
                              Paid via Stripe card
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted small">
                            No payment records found.
                          </div>
                        )}
                      </div>
                    </div>
                    
                  </div>

                  <div className="card p-4 mb-4 border rounded">
                    <h6 className="fw-semibold mb-3">
                      Items{" "}
                      <span className="badge bg-light text-dark ms-2">
                        {order?.order_items?.length}
                      </span>
                    </h6>
                    <div className="row g-3">
                      {order.order_items.map((it, i) => (
                        <div key={i} className="col-md-6">
                          <div className="d-flex align-items-center bg-light gap-2 rounded p-3">
                            <img
                              src={
                                it.products?.banner_url
                                  ? `https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${it.products.banner_url}`
                                  : "/no-image.png"
                              }
                              alt={it.products?.name}
                              style={{
                                width: "80px",
                                height: "60px",
                                objectFit: "contain",
                              }}
                            />

                            <div>
                              <p className="fw-semibold mb-1 small mb-0">
                                {it.products.name}
                              </p>
                              <p className="text-muted small mb-0">
                                Quantity: {it.quantity}
                              </p>
                              <p className="text-muted small mb-0">
                                Price: ${it.price_each.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div
                    className=" card p-4 rounded"
                    style={{
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                      minHeight: "250px",
                    }}
                  >
                    {/* Order Summary Header */}
                    <h5
                      className="mb-4 d-flex align-items-center"
                      style={{ fontWeight: "700", color: "#2d3748" }}
                    >
                      <FaListAlt className="me-2 text-primary" /> Order Summary
                    </h5>

                    {/* Order Items */}
                    {order.order_items.length > 0 ? (
                      <>
                        <ul className="list-unstyled small mb-4">
                          {order.order_items.map((item, index) => (
                            <li
                              key={index}
                              className="d-flex justify-content-between border-bottom py-2"
                            >
                              <span>
                                <FaTag className="me-2 text-muted" />
                                {item.products.name}
                              </span>
                              <span>
                                ${parseFloat(item.price_each).toFixed(2)}
                              </span>
                            </li>
                          ))}
                          <li className="d-flex justify-content-between border-bottom py-2">
                            <span>
                              <FaTruck className="me-2 text-muted" />
                              Shipping Charge
                            </span>
                            <span>$30.00</span>
                          </li>
                        </ul>

                        {/* Total */}
                        <div className="d-flex justify-content-between fw-bold border-top pt-3">
                          <span className="d-flex align-items-center">
                            <FaMoneyBillWave className="me-2 text-success" />
                            Total
                          </span>
                          <span>
                            $
                            {(
                              order.order_items.reduce(
                                (acc, item) =>
                                  acc +
                                  parseFloat(item.price_each * item.quantity),
                                0
                              ) + 30
                            ).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted small">
                        No items found in this order.
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="modal fade"
                  id="exampleModal"
                  tabIndex="-1"
                  role="dialog"
                  aria-labelledby="exampleModalLabel"
                  aria-hidden="true"
                >
                  <div
                    className="modal-dialog modal-md modal-dialog-centered"
                    role="document"
                  >
                    <div className="modal-content border-0 shadow-lg rounded-3">
                      <div className="modal-header bg-light border-bottom-0">
                        <h5
                          className="modal-title fw-bold"
                          id="exampleModalLabel"
                        >
                          Cancel Order
                        </h5>
                        <button
                          type="button"
                          className="btn-close"
                          data-dismiss="modal"
                          aria-label="Close"
                          onClick={() => {
                            setSelectedReason("");
                            setRefundReason("");
                          }}
                        ></button>
                      </div>

                      <div className="modal-body py-2 px-3">
                        {selectedReason !== "Other" && (
                          <div className="mb-2">
                            <label className="form-label fw-semibold">
                              Reason <span className="text-danger">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={selectedReason}
                              onChange={(e) => {
                                const reason = e.target.value;
                                setSelectedReason(reason);

                                if (reason !== "Other") {
                                  setRefundReason(reason);
                                } else {
                                  setRefundReason(""); // clear for custom input
                                }
                              }}
                            >
                              <option value="">Select a reason</option>
                              {predefinedReasons.map((reason, idx) => (
                                <option key={idx} value={reason}>
                                  {reason}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {selectedReason === "Other" && (
                          <div className="mb-2 animate__animated animate__fadeIn">
                            <label className="form-label fw-semibold">
                              Enter Custom Reason{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              placeholder="Please describe the reason"
                            />
                          </div>
                        )}
                        <p
                          style={{
                            backgroundColor: "#dbeafe",
                            color: "#0d6efd",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "0.65rem", // smaller font size
                            fontStyle: "normal",
                            marginTop: "2px",
                            border: "1px solid #a5d8ff",
                          }}
                        >
                          ℹ️ Please note: Cancelled orders are subject to our
                          cancellation policy. Refunds may take up to 7 business
                          days.
                        </p>
                      </div>

                      <div className="modal-footer bg-light border-top-0 px-4 py-3">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          data-dismiss="modal"
                          onClick={() => {
                            setSelectedReason("");
                            setRefundReason("");
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCancelOrder}
                          disabled={paymentLoading}
                          className="btn btn-danger"
                        >
                          {paymentLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Processing...
                            </>
                          ) : (
                            "Cancel & Refund"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default OrderDetailsPage;
