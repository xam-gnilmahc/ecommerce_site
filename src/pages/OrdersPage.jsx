import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LottieLoader from "../components/LottieLoader";
import ordersPage from "./ordersPage.css";

const STATUSES = [
  "All",
  "Pending",
  "Confirmed",
  "Shipped Out",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Refunded",
];

const OrdersPage = () => {
  const { fetchUserOrders, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
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

  // Filter orders by selected status
  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter(
          (o) => o.status.toLowerCase() === filterStatus.toLowerCase()
        );

  // Dummy refund handler
  const handleRefund = (orderId) => {
    alert(`Refund requested for order #${orderId}`);
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        <div className="mb-3">
          <h2 className="fw-bold text-secondary mb-1">Orders</h2>
          <p className="text-muted small mb-2">Dashboard / Orders</p>
          <hr />
        </div>

        {/* Status filter row */}
        <div className="d-flex flex-wrap gap-2 mb-4 bg-light p-3 rounded">
          {STATUSES.map((status) => {
            const count =
              status === "All"
                ? orders.length
                : orders.filter(
                    (o) => o.status.toLowerCase() === status.toLowerCase()
                  ).length;

            const isActive = filterStatus === status;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-sm d-flex align-items-center ${
                  isActive ? "btn-dark text-white" : "btn-outline-secondary"
                }`}
                style={{
                  borderRadius: "20px",
                  fontWeight: 500,
                }}
              >
                {status}
                <span className="badge bg-secondary text-white rounded-pill ms-2">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <LottieLoader />
        ) : filteredOrders.length === 0 ? (
          <div className="text-center mt-5">
            <h4>No Orders Found</h4>
            <p className="text-muted">
              Try selecting a different status or place your first order!
            </p>
            <Link to="/" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i> Continue Shopping
            </Link>
          </div>
        ) : (
          <div
            className="d-flex flex-column gap-3 overflow-auto bg-light p-3 rounded"
            style={{ maxHeight: "75vh", minWidth: "100%" }}
          >
            {filteredOrders.map((order) => {
              const shippingAddress = parseAddress(order.shipping_address);
              return (
                <div
                  key={order.id}
                  className="card  border-0 w-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-2">
                      <div className="fw-semibold text-dark">
                        Order{" "}
                        <span className="text-decoration-underline">
                          #{order.id}
                        </span>
                        <span
                          className={`badge bg-${getStatusColor(
                            order.status
                          )} ms-2`}
                        >
                          <i
                            className={`bi ${getStatusIcon(order.status)} me-1`}
                          ></i>
                          {order.status}
                        </span>
                      </div>

                      {order.status.toLowerCase() === "delivered" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefund(order.id);
                          }}
                        >
                          Cancel & Refund
                        </button>
                      )}
                    </div>

                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                      <InlineDetail
                        label="Order Date"
                        value={formatDate(order.created_at)}
                        icon="calendar"
                      />
                      <InlineDetail
                        label="Delivery Date"
                        value={formatDate(order.order_date)}
                        icon="truck"
                      />
                      <InlineDetail
                        label="Total"
                        value={`$${order.total_amount.toFixed(2)}`}
                        icon="cash-stack"
                      />
                      <InlineDetail
                        label="Payment"
                        value={
                          <span
                            className={`badge bg-${getPaymentStatusColor(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status}
                          </span>
                        }
                        icon="credit-card"
                      />
                      {shippingAddress && (
                        <InlineDetail
                          label="Shipping Address"
                          value={`${shippingAddress.addressLine1}, ${
                            shippingAddress.addressLine2 || ""
                          }, ${shippingAddress.state} ${
                            shippingAddress.zipCode
                          }, ${shippingAddress.country}`}
                          icon="geo-alt"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Inline CSS styles for status items */}
      <style>{`
        .status-item {
          position: relative;
          padding-bottom: 4px;
          font-weight: 500;
          color: #6c757d; /* Bootstrap secondary gray */
          transition: color 0.3s ease;
          outline-offset: 3px;
        }
        .status-item::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0;
          background-color: #6c757d;
          transition: width 0.3s ease;
          border-radius: 1px;
        }
        .status-item:hover,
        .status-item:focus-visible {
          color: #212529; /* Bootstrap body color */
          outline: none;
        }
        .status-item:hover::after,
        .status-item:focus-visible::after {
          width: 100%;
        }
        .status-item.active {
          color: #212529;
          font-weight: 600;
        }
        .status-item.active::after {
          width: 100%;
          background-color: #212529;
        }
      `}</style>
    </div>
  );
};

const InlineDetail = ({ label, value, icon }) => (
  <div>
    <small className="text-muted d-block fw-semibold mb-1">
      <i className={`bi bi-${icon} `}></i> {label}
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
    case "refunded":
      return "dark";
    case "pending":
      return "warning";
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
    case "refunded":
      return "arrow-counterclockwise";
    case "pending":
      return "clock";
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
