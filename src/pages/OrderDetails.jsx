import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { FiArrowLeft } from "react-icons/fi";
import "./orderDetails.css";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderDetails } = useAuth();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    (async () => setOrder(await getOrderDetails(orderId)))();
  }, [orderId]);

  if (!order)
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status" />
        <p className="loading-text">Loading order details…</p>
      </div>
    );

  const steps = ["Pending","Confirmed", "Shipped Out", "Out for Delivery", "Delivered"];
  const currentIdx = steps.findIndex(
    (s) => s.toLowerCase() === order.status.toLowerCase()
  );

  const payColor = (s) =>
    s === "success" ? "success" : s === "pending" ? "warning" : "danger";

  const formatDate = (value) => {
    if (!value) return "N/A";
    const fixed = value.replace(" ", "T");
    const date = new Date(fixed);
    if (isNaN(date)) return "Invalid date";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <div className="container my-5">
        {/* Header with Back Arrow and Order ID */}
        <div className="d-flex align-items-center mb-4">
          <button
            onClick={handleBack}
            className="btn btn-link p-0 me-3"
            style={{ fontSize: "1.8rem", lineHeight: 1, color: "#0d6efd" }}
            aria-label="Go back"
            title="Go back"
          >
            <FiArrowLeft />
          </button>
          <h2 className="order-id m-0">
            Order #<span>{order.id}</span>
          </h2>
        </div>

        {/* Header Buttons */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <div></div> {/* Empty div to keep spacing */}
          <div className="btn-group">
            <button className="btn btn-outline-secondary" disabled>
              <i className="bi bi-receipt-cutoff me-2" /> Invoice
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/track/${order.id}`)}
            >
              <i className="bi bi-truck me-2" /> Track
            </button>
          </div>
        </div>

        {/* Dates */}
        <div className="dates-row mb-5">
          <div>
            <small className="text-muted">Order Date</small>
            <div className="date-value">{formatDate(order.created_at)}</div>
          </div>
          <div>
            <small className="text-muted">Delivery Date</small>
            <div className="date-value">{formatDate(order.order_date)}</div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="progress-tracker mb-5">
          {steps.map((label, i) => {
            const isCurrent = i === currentIdx;
            const isCompleted = i < currentIdx;

            return (
              <div key={label} className="step-item position-relative">
                <div
                  className={`step-circle ${
                    isCompleted ? "completed" : ""
                  } ${isCurrent ? "current" : ""}`}
                >
                  {i + 1}
                </div>
                <div
                  className={`step-label ${
                    isCurrent
                      ? "current-label"
                      : isCompleted
                      ? "completed-label"
                      : ""
                  }`}
                >
                  {label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`position-absolute top-50 start-50 translate-middle-y border-bottom ${
                      i < currentIdx ? "border-primary" : "border-muted"
                    }`}
                    style={{
                      width: "100%",
                      zIndex: -1,
                      left: "50%",
                      right: 0,
                      height: "8px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Items Table */}
        <h4 className="mb-4">Items</h4>
        <div className="table-responsive mb-5">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: 110 }}>Product</th>
                <th>Product Name</th>
                <th className="text-end">Qty</th>
                <th className="text-end">Price</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <img
                      src={
                        it.products?.banner_url
                          ? `https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${it.products.banner_url}`
                          : "/no-image.png"
                      }
                      alt={it.products?.name}
                      className="product-img"
                    />
                  </td>
                  <td>{it.products?.name}</td>
                  <td className="text-end">{it.quantity}</td>
                  <td className="text-end">${it.price_each.toFixed(2)}</td>
                  <td className="text-end">
                    ${(it.quantity * it.price_each).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment & Summary & Address */}
        <div className="row g-4">
  {/* Payment */}
  <div className="col-md-4">
    <div
      className="p-4 rounded"
      style={{
        backgroundColor: "#f9fafb",
        border: "1px solid #e2e8f0",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <h5 className="mb-3" style={{ fontWeight: "600", color: "#333" }}>
        Payment
      </h5>
      <div style={{ maxWidth: "120px" }}>
        <span
          className={`badge bg-${payColor(
            order.payment_status
          )} fs-6 w-100 d-inline-block text-center`}
          style={{
            fontWeight: "600",
            padding: "0.5rem 0",
            borderRadius: "12px",
          }}
        >
          {order.payment_status.toUpperCase()}
        </span>
      </div>
      <p className="mt-3 text-muted small" style={{ fontStyle: "italic" }}>
        Paid via Stripe card payment
      </p>
    </div>
  </div>

  {/* Order Summary */}
  <div className="col-md-4">
    <div
      className="p-4 rounded"
      style={{
        backgroundColor: "#f9fafb",
        border: "1px solid #e2e8f0",
        minHeight: "200px",
      }}
    >
      <h5 className="mb-3" style={{ fontWeight: "600", color: "#333" }}>
        Order Summary
      </h5>
      <div className="summary-row d-flex justify-content-between mb-2" style={{ fontWeight: "500" }}>
        <span>Subtotal</span>
        <span>${(order.total_amount - 30).toFixed(2)}</span>
      </div>
      <div className="summary-row d-flex justify-content-between mb-2" style={{ fontWeight: "500" }}>
        <span>Shipping</span>
        <span>$30.00</span>
      </div>
      <hr style={{ borderColor: "#d1d5db" }} />
      <div className="summary-row total d-flex justify-content-between" style={{ fontWeight: "700", fontSize: "1.15rem" }}>
        <span>Total</span>
        <span>${order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  </div>

  {/* Shipping Address */}
  <div className="col-md-4">
    <div
      className="p-4 rounded"
      style={{
        backgroundColor: "#f9fafb",
        border: "1px solid #e2e8f0",
        minHeight: "200px",
        color: "#444",
        fontWeight: "500",
      }}
    >
      <h5 className="mb-3" style={{ fontWeight: "600", color: "#333" }}>
        Shipping Address
      </h5>
      {(() => {
        let addr;
        try {
          addr = JSON.parse(order.shipping_address);
        } catch {
          addr = null;
        }
        return addr ? (
          <>
            <div>{addr.addressLine1}</div>
            {addr.addressLine2 && <div>{addr.addressLine2}</div>}
            <div>
              {addr.state}, {addr.zipCode}
            </div>
            <div>{addr.country}</div>
          </>
        ) : (
          <small className="text-muted">No address available.</small>
        );
      })()}
    </div>
  </div>
</div>

      </div>
    </>
  );
};

export default OrderDetailsPage;
