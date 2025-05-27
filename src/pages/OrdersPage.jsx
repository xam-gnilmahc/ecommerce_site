import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LottieLoader from "../components/LottieLoader";

const OrdersPage = () => {
  const { fetchUserOrders, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchUserOrders();
      setOrders(data);
    };
    loadOrders();
  }, []);

  const parseAddress = (addressStr) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        <div className="mb-4">
          <h2 className="fw-bold text-dark">
            <i className="bi bi-bag-check-fill"></i>My Orders
          </h2>
          <p className="text-muted">A summary of your recent purchases</p>
        </div>

        {loading ? (
          <LottieLoader />
        ) : orders.length === 0 ? (
          <div className="text-center mt-5">
          <h4>No Orders Yet</h4>
          <p className="text-muted">Start exploring and place your first order!</p>
          <Link to="/" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-1"></i> Continue Shopping
          </Link>
        </div>
        ) : (
          <div className="d-flex flex-column gap-3 overflow-auto " style={{ maxHeight: "75vh", maxWidth:"120vh" }}>
            {orders.map((order) => {
              const shippingAddress = parseAddress(order.shipping_address);
              return (
                <div
                  key={order.id}
                  className="card border border-gray-200 rounded-3"
                  role="button"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") navigate(`/orders/${order.id}`);
                  }}
                  tabIndex={0}
                >
                  <div className="card-body">
                  <div className="d-flex justify-content-between flex-wrap">
  <div className="fw-semibold mb-2 text-dark">
    Order{" "}
    <span
      className="text-primary"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/orders/${order.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/orders/${order.id}`);
        }
      }}
      style={{ cursor: "pointer", textDecoration: "underline" }}
    >
      #{order.id}
    </span>

    <span
      className={`badge bg-${getStatusColor(order.status)} ms-2`}
      style={{ fontSize: "0.75rem" }}
    >
      <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
      {order.status}
    </span>
  </div>
</div>


                    <div className="d-flex flex-wrap gap-4 mt-2">
                      <InlineDetail label="Order Date" value={formatDate(order.created_at)} icon="calendar" />
                      <InlineDetail label="Delivery Date" value={formatDate(order.order_date)} icon="truck" />
                      <InlineDetail label="Total" value={`$${order.total_amount.toFixed(2)}`} icon="cash-stack" />
                      <InlineDetail
                        label="Payment"
                        icon="credit-card"
                        value={
                          <span
                            className={`badge bg-${getPaymentStatusColor(order.payment_status)} px-2 py-1`}
                            style={{ fontSize: "0.8rem" }}
                          >
                            {order.payment_status}
                          </span>
                        }
                      />
                      {shippingAddress && (
                        <div className="d-flex flex-column" style={{ minWidth: "180px" }}>
                          <small className="text-muted fw-semibold mb-1">
                            <i className="bi bi-geo-alt "></i>Shipping Address
                          </small>
                          <small className="text-muted">
                            {shippingAddress.addressLine1}
                            {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}
                            , {shippingAddress.state} {shippingAddress.zipCode}, {shippingAddress.country}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
};

const InlineDetail = ({ label, value, icon }) => (
  <div className="d-flex flex-column" style={{ minWidth: "150px" }}>
    <small className="text-muted fw-semibold mb-1">
      <i className={`bi bi-${icon}`}></i>{label}
    </small>
    <small>{value}</small>
  </div>
);

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

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "info";
    case "shipped out":
      return "secondary";
    case "out for delivery":
      return "warning";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "dark";
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "check2-circle";
    case "shipped out":
      return "box-seam";
    case "out for delivery":
      return "truck";
    case "delivered":
      return "check-circle-fill";
    case "cancelled":
      return "x-circle-fill";
    default:
      return "question-circle";
  }
};

const getPaymentStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "success":
      return "success";
    case "failure":
    case "failed":
      return "danger";
    case "pending":
      return "warning";
    default:
      return "secondary";
  }
};

export default OrdersPage;
