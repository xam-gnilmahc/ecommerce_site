import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LottieLoader from "../components/LottieLoader";
import ordersPage from "./ordersPage.css";
import { HiLocationMarker } from "react-icons/hi"; // or choose another icon
import { FaTruck } from 'react-icons/fa';

const CancelledOrderPage = () => {
  const { fetchUserCancelledOrders, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrders = async () => {
      const data = await fetchUserCancelledOrders();
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
  return (
    <div className="d-flex">
      <Sidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "280px"}}>
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1"> My Cancelled Orders</h2>
          <p className="text-muted small mb-2">Dashboard / Cancelled Orders</p>
          <hr />
        </div>
        {/* Status filter row */}


        {loading ? (
          <LottieLoader />
        ) : orders.length === 0 ? (
          <div className="text-center mt-5">
            <h4>No Cancelled Orders Found</h4>
            <Link to="/" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-1"></i> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row g-3 bg-white overflow-auto "
          style={{
    maxHeight: "75vh", // better on all devices
    overflowY: "auto",
    scrollbarWidth: "thin",
  }}>
          {orders.map((order) => {
            const shippingAddress = parseAddress(order.shipping_address);
            const destination = `${shippingAddress?.addressLine1}, ${shippingAddress?.country}` || "Destination";
        
            return (
              <div
                key={order.id}
                className="col-12 col-sm-6"
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div
                  className="border h-100 d-flex flex-column"
                  style={{
                    borderRadius: "1rem",
                    borderColor: "#ddd",
                    minHeight: "270px",
                  }}
                >
                  {/* Card Body */}
                  <div className="card-body d-flex flex-column" style={{ flex: 1 }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between px-2 pt-2 align-items-start flex-wrap">
                      <div className="d-flex flex-column">
                        <span className="text-muted tiny">Order ID</span>
                        <span className="fw-bold tiny">#{order.id}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <div className="py-0 px-2 rounded-pill border bg-white">
                          <span className="text-muted tiny me-1">Est:</span>
                          <span className="fw-bold tiny">{formatDate(order.order_date)}</span>
                        </div>
                        <span
                          className={`bg-${getStatusColor(order.status)} rounded-pill p-1 text-white`}
                          style={{ fontSize: "0.6rem", padding: "2px 6px" }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
        
                    {/* Route */}
                    <div
                      className="d-flex justify-content-between px-2 pt-2 align-items-center flex-nowrap overflow-auto gap-2"
                      style={{ flexShrink: 0 }}
                    >
                      <div className="d-flex align-items-center border rounded-pill p-1 bg-white" style={{ minWidth: "130px" }}>
                        <FaTruck className="me-1 text-dark tiny" />
                        <span className="tiny fw-bold">Kathmandu, Nepal</span>
                      </div>

                      <span className="text-muted">••••••••</span>

                      <div className="d-flex align-items-center border rounded-pill p-1 bg-white" style={{ minWidth: "130px" }}>
                        <HiLocationMarker className="me-1 text-dark tiny" />
                        <span className="tiny fw-bold">{destination}</span>
                      </div>
                    </div>

                    {/* Product List */}
                    <div
                      className="d-flex flex-wrap gap-2 px-2 py-1 ml-2 mr-2 mt-2 border  overflow-auto"
                      style={{
                        flexGrow: 1,
                        maxHeight: "150px",
                        borderTopLeftRadius:"1rem",
                        borderTopRightRadius:"1rem",
                        scrollbarWidth: "none", /* Firefox */
                        msOverflowStyle: "none", /* IE and Edge */
                      }}
                      onScroll={e => e.currentTarget.style.scrollbarWidth = 'none'}
                    >
                      {order.order_items?.map((item, index) => (
                        <div
                          key={index}
                          className="d-flex rounded p-1 bg-white"
                          style={{
                            flex: "1 1 calc(50% - 10px)",
                            maxWidth: "calc(50% - 10px)",
                            minWidth: "140px",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                            <div
  style={{ flex: "0 0 100px" }}
  className="overflow-hidden"
>
  <img
    src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
    alt={item.products.name}
    className="img-fluid rounded bg-light p-2 transition-all"
    style={{
      width: "80px",
      height: "80px",
      objectFit: "contain",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = "scale(1.05)";
      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = "scale(1)";
      e.currentTarget.style.boxShadow = "none";
    }}
  />
</div>
                          <div className="d-flex flex-column justify-content-center" style={{ flex: 1 }}>
                            <div className="fw-bold tiny d-none d-sm-block">{item.products?.name}</div>
                            <div className="text-muted tiny fw-bold">${item.price_each} x {item.quantity}</div>
                            <div className="text-muted tiny fw-bold">
                              ${(item.price_each * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
        
                    {/* Footer */}
                    <div
                      className="d-flex justify-content-between align-items-center px-2 py-2 bg-light"
                      style={{
                        borderBottomLeftRadius: "1rem",
                        borderBottomRightRadius: "1rem",
                      }}
                    >
                      <div>
                        <span className="fw-bold tiny">${order.total_amount.toLocaleString()}</span>
                        <span className="text-muted tiny"> ({order.order_items?.length} items)</span>
                      </div>
                      <button
                        className="btn btn-dark btn-xs px-3 py-1 rounded-pill"
                        style={{ fontSize: "0.7rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}`);
                        }}
                      >
                        Details
                      </button>
                    </div>
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

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

export default CancelledOrderPage;
