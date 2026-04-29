import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Skeleton from "react-loading-skeleton";
import toast from "react-hot-toast";

import {
  FaMapMarkerAlt,
  FaUser,
  FaFileInvoice,
  FaMoneyBillWave,
  FaCcVisa,
  FaGooglePay,
  FaApplePay,
} from "react-icons/fa";

import "./orderDetails.css";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { getOrderDetails, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const designRef = useRef();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getOrderDetails(orderId);
      setOrder(data);
      setLoading(false);
    };

    load();
  }, [orderId]);

  const parseAddress = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const address = parseAddress(order?.shipping_address);

  const getPaymentIcon = (m) => {
    if (m === 0) return <FaCcVisa />;
    if (m === 1) return <FaGooglePay />;
    if (m === 2) return <FaApplePay />;
    return <FaMoneyBillWave />;
  };

  if (loading) {
    return (
      <div className="od-container">
        <Skeleton height={120} />
        <Skeleton height={200} />
        <Skeleton height={200} />
      </div>
    );
  }

  return (
    <div className="od-page">
      <div className="od-container" ref={designRef}>

        {/* HEADER */}
        <div className="od-header">
          <div>
            <h2>Order #{order?.id}</h2>
            <p>Tracking: {order?.tracking_number}</p>
          </div>

          <div className="od-actions">
            {/* <button onClick={() => navigate(-1)}>Back</button> */}
            <button onClick={() => window.print()}>Invoice</button>
          </div>
        </div>

        {/* STATUS */}
        <div className="od-status-bar">
          <div className={`od-status-pill ${order.status?.toLowerCase()}`}>
            {order.status}
          </div>

          <div className="od-status-text">
            {order.status === "Pending" && "Your order is waiting for confirmation"}
            {order.status === "Confirmed" && "Seller has confirmed your order"}
            {order.status === "Shipped Out" && "Your order is on the way"}
            {order.status === "Out for Delivery" && "Delivery partner is near you"}
            {order.status === "Delivered" && "Order delivered successfully 🎉"}
            {order.status === "Cancelled" && "Order has been cancelled"}
          </div>
        </div>

        {/* GRID */}
        <div className="od-grid">

          {/* SHIPPING */}
          <div className="od-card">
            <h4>Shipping Address</h4>

            <p><FaUser /> {user?.name}</p>

            <p>
              <FaMapMarkerAlt />
              {address?.addressLine1}, {address?.state}
            </p>
          </div>

          {/* PAYMENT */}
          <div className="od-card">
            <h4>Payments</h4>

            {order.orderpayments_logs?.map((l, i) => (
              <div className="od-row" key={i}>
                {getPaymentIcon(l.payment_method)}
                <span>${l.amount}</span>
                <span>{l.status}</span>
              </div>
            ))}
          </div>

        </div>

        {/* TRACKING TIMELINE */}
<div className="od-section">
  <h4 className="od-section-title">Order Tracking</h4>

  <div className="od-track-wrapper">

    {/* BASE LINE */}
    <div className="od-track-line-bg" />

    {[
      "Placed",
      "Confirmed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ].map((step, i) => {

      const statusMap = {
        Placed: true,
        Confirmed: ["Confirmed", "Shipped Out", "Out for Delivery", "Delivered"].includes(order.status),
        Shipped: ["Shipped Out", "Out for Delivery", "Delivered"].includes(order.status),
        "Out for Delivery": ["Out for Delivery", "Delivered"].includes(order.status),
        Delivered: order.status === "Delivered",
      };

      const done = statusMap[step];

      return (
        <div key={i} className={`od-track-step ${done ? "done" : ""}`}>
          <div className="od-track-circle">
            {done ? "✓" : i + 1}
          </div>

          <div className="od-track-label">{step}</div>
        </div>
      );
    })}

  </div>
</div>

        {/* PRODUCTS */}
        <div className="od-section">
          <h4 className="od-section-title">Products</h4>

          {order.order_items?.map((item, i) => (
            <div className="od-product" key={i}>

              {/* IMAGE */}
              <div className="od-product-img">
                <img
                  src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                  alt={item.products?.name}
                />
              </div>

              {/* INFO */}
              <div className="od-product-info">
                <h5>{item.products?.name}</h5>

                <p className="od-product-sub">
                  Qty: <span>{item.quantity}</span>
                </p>
              </div>

              {/* PRICE */}
              <div className="od-product-price">
                <span>₹{(item.price_each * item.quantity).toFixed(2)}</span>
              </div>

            </div>
          ))}
        </div>

        {/* SUMMARY */}
        <div className="od-summary">
          <h3>
            Total: $
            {order.order_items
              .reduce((a, b) => a + b.price_each * b.quantity, 0)
              .toFixed(2)}
          </h3>
        </div>

      </div>
    </div>
  );
};

export default OrderDetailsPage;