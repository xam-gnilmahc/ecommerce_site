import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiArrowLeft } from "react-icons/fi";
import "./orderDetails.css";
import Sidebar from "../components/Sidebar";
import LottieLoader from "../components/LottieLoader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaCcVisa, FaGooglePay, FaApplePay } from "react-icons/fa";

import {
  FaHourglassHalf, // Pending
  FaTruckLoading, // Shipped Out
  FaBoxOpen, // Out for Delivery
  FaTimesCircle, // Cancelled
  FaCheckDouble, // Delivered
} from "react-icons/fa";
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
  const [cancelShow, setCancelShow] = useState(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaHourglassHalf className="text-warning" title="Pending" />;
      case "Confirmed":
        return <FaCheckCircle className="text-primary" title="Confirmed" />;
      case "Shipped Out":
        return <FaTruckLoading className="text-info" title="Shipped Out" />;
      case "Out for Delivery":
        return <FaBoxOpen className="text-success" title="Out for Delivery" />;
      case "Delivered":
        return <FaCheckDouble className="text-success" title="Delivered" />;
      case "Cancelled":
        return <FaTimesCircle className="text-danger" title="Cancelled" />;
      default:
        return (
          <FaHourglassHalf className="text-secondary" title="Processing" />
        );
    }
  };

  const handlePrint = () => {
    const printContents =
      `
  <div>
    <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
      <div>
        <img src="data:image/png;base64,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" alt="Company Logo" style="height: 60px;" />
      </div>
      <div>
        <h1 style="font-size: 3rem; font-weight: bold; color: #333;">
          INVOICE
        </h1>
      </div>
    </div>
    <!-- other invoice content -->
  </div>
` + designRef.current.innerHTML;

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
  const getPaymentIcon = (method) => {
    switch (method) {
      case 0:
        return <FaCcVisa title="Card" className="text-primary fs-3" />;
      case 1:
        return <FaGooglePay title="Google Pay" className="text-success fs-3" />;
      case 2:
        return <FaApplePay title="Apple Pay" className="text-dark fs-3" />;
      default:
        return <span className="text-muted">Unknown</span>;
    }
  };

  const getStatusColor = (status) => {
    if (status.toLowerCase().includes("fail")) return "text-danger";
    if (status.toLowerCase().includes("refund")) return "text-warning";
    return "text-success";
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
      ) + (order.shipping_method === 0 ? 0 : 30)
    ).toFixed(2);

    const paymentData = {
      chargeId: order.orderpayments_logs[0]?.charge_id || "null",
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
        setCancelShow(false);
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

  const closeModal = () => setCancelShow(false);

  return (
    <>
      <div className="d-flex">
        <Sidebar />
        <main className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
          <div>
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
                    {order?.status !== "Delivered" && (
                      <button
                        type="button"
                        className="btn"
                        style={{ backgroundColor: "#333", color: "#fff" }}
                        onClick={() => setCancelShow(true)}
                      >
                        Cancel
                      </button>
                    )}

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
                  ref={designRef}
                  style={{ borderRadius: "1rem" }}
                >
                  <div className=" mb-4 p-4">
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
                          {order.status === "Cancelled" ? (
                            <>{formatDate(order.order_cancelled)}</>
                          ) : (
                            <>{formatDate(order.order_date)}</>
                          )}
                        </p>
                      </div>

                      {/* Delivered In */}
                      <div className="col-6 col-md-2 text-center text-md-start">
                        <p className="text-muted small mb-1">
                          <FaClock className="me-2" />
                          Delivered in
                        </p>
                        {order.status === "Cancelled" ? (
                          <p className="fw-semibold mb-0 text-danger">
                            Cancelled
                          </p>
                        ) : (
                          (() => {
                            const today = new Date();
                            const deliveryDate = new Date(order.order_date);

                            // Remove time part for accurate day difference
                            today.setHours(0, 0, 0, 0);
                            deliveryDate.setHours(0, 0, 0, 0);

                            const diffDays = Math.ceil(
                              (deliveryDate - today) / (1000 * 60 * 60 * 24)
                            );

                            if (diffDays === 0) {
                              return (
                                <p className="fw-semibold mb-0 text-success">
                                  Item will arrive today!
                                </p>
                              );
                            }

                            if (diffDays < 0) {
                              return (
                                <p className="fw-semibold mb-0 text-success">
                                  Item is already delivered!
                                </p>
                              );
                            }

                            return (
                              <p className="fw-semibold mb-0">
                                {diffDays} Days
                              </p>
                            );
                          })()
                        )}
                      </div>

                      <div className="col-6 col-md-2 text-center text-md-start">
                        <p className="text-muted small mb-1">
                          <FaClock className="me-2" />
                          Status
                        </p>
                        {getStatusIcon(order.status)}
                        <span className="fw-semibold mb-0 ml-1">
                          {order.status}
                        </span>
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
                          <p className="fw-bold text-muted mb-1">
                            {order?.Reason}
                          </p>
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
                          <strong>Recipient:</strong> {user?.name}
                        </p>
                        <p>
                          <FaMapMarkerAlt className="me-1" />
                          <strong>Delivery address:</strong>
                          <br />
                          {shippingAddress?.addressLine1},{" "}
                          {shippingAddress?.state}, {shippingAddress?.zipCode},{" "}
                          {shippingAddress?.country}
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
                      <div className="p-3 border rounded  h-100">
                        <h6 className="fw-semibold mb-3 d-flex align-items-center small">
                          <FaFileInvoice className="me-2 text-secondary" />
                          Payment Summary
                        </h6>

                        <div
                          className="table-responsive"
                          style={{ maxHeight: "220px", overflowY: "auto" }}
                        >
                          <table className="table table-sm table-borderless mb-0 small align-middle">
                            <thead className="table-light sticky-top">
                              <tr>
                                <th style={{ width: "3rem" }}>#</th>
                                <th style={{ width: "6rem" }}>Method</th>
                                <th style={{ width: "6rem" }}>Amount</th>
                                <th style={{ width: "7rem" }}>Status</th>
                                <th style={{ width: "7rem" }}>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order?.orderpayments_logs?.length > 0 ? (
                                order.orderpayments_logs.map((log, index) => (
                                  <tr key={log.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                      {getPaymentIcon(log.payment_method)}
                                    </td>
                                    <td>${log.amount.toFixed(2)}</td>
                                    <td className={getStatusColor(log.status)}>
                                      {log.status}
                                    </td>

                                    <td>
                                      {new Date(
                                        log.created_at
                                      ).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td
                                    colSpan="6"
                                    className="text-center text-muted small"
                                  >
                                    No payment logs available.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
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
                            <span>
                              ${order.shippnig_method === 0 ? 0.0 : 30.0}
                            </span>
                          </li>
                        </ul>

                        {/* Total */}
                        <div className="d-flex justify-content-between fw-bold  pt-3">
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
                              ) + (order.shipping_method === 0 ? 0 : 30)
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
                {cancelShow && (
                  <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
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
                              closeModal();
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
                                onChange={(e) =>
                                  setRefundReason(e.target.value)
                                }
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
                            cancellation policy. Refunds may take up to 7
                            business days.
                          </p>
                        </div>

                        <div className="modal-footer bg-light border-top-0 px-4 py-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            data-dismiss="modal"
                            onClick={() => {
                              closeModal();
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
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default OrderDetailsPage;
