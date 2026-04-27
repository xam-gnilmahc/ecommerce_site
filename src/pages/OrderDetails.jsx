import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Sidebar from "../components/Sidebar";
import Skeleton from "react-loading-skeleton";
import toast from "react-hot-toast";

import {
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
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

  const { getOrderDetails, user, updateOrder } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [cancelShow, setCancelShow] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const fetchedRef = useRef(false);
  const designRef = useRef();

  const predefinedReasons = [
    "Wrong item delivered",
    "Item damaged",
    "Late delivery",
    "Changed my mind",
    "Other",
  ];

  useEffect(() => {
    if (fetchedRef.current) return;

    fetchedRef.current = true;

    const loadOrder = async () => {
      try {
        setLoading(true);

        const data = await getOrderDetails(orderId);

        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const parseAddress = (addressStr) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  const shippingAddress = parseAddress(order?.shipping_address);

  const handlePrint = () => {
    if (!designRef.current) return;
    window.print();
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 0:
        return <FaCcVisa className="fs-4 text-primary" />;

      case 1:
        return <FaGooglePay className="fs-4 text-success" />;

      case 2:
        return <FaApplePay className="fs-4" />;

      default:
        return <FaMoneyBillWave />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "pending";

      case "confirmed":
        return "confirmed";

      case "shipped out":
      case "out for delivery":
        return "shipping";

      case "delivered":
        return "delivered";

      case "cancelled":
        return "cancelled";

      default:
        return "";
    }
  };

  const getStatusColor = (status) => {
    if (status?.toLowerCase().includes("fail")) {
      return "text-danger";
    }

    if (status?.toLowerCase().includes("pending")) {
      return "text-warning";
    }

    return "text-success";
  };

  const handleCancelOrder = async () => {
    try {
      setPaymentLoading(true);

      toast.success("Order cancelled successfully");

      setCancelShow(false);
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar />

      <main className="order-details-main">
        {/* top */}
        {!loading && (
          <div className="details-header">
            <div>
              <h2>Order #{order?.id}</h2>

              <p>
                Manage and track your order details
              </p>
            </div>

            <div className="details-actions">
              {order?.status !== "Delivered" &&
                order?.status !== "Cancelled" && (
                  <button
                    className="btn btn-dark"
                    onClick={() =>
                      setCancelShow(true)
                    }
                  >
                    Cancel Order
                  </button>
                )}

              <button
                className="btn btn-dark"
                onClick={handlePrint}
              >
                Invoice
              </button>

              <button
                className="btn btn-dark"
                onClick={() =>
                  navigate(`/track/${order.id}`)
                }
              >
                Track Order
              </button>
            </div>
          </div>
        )}

        {/* loading */}
        {loading || !order ? (
          <div className="row g-4">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  className="col-md-6"
                  key={index}
                >
                  <Skeleton
                    height={220}
                    borderRadius={24}
                  />
                </div>
              )
            )}
          </div>
        ) : (
          <div
            className="modern-order-wrapper"
            ref={designRef}
          >
            {/* banner */}
            <div className="top-order-banner">
              <div>
                <h3>
                  {order.status ===
                  "Cancelled"
                    ? "Order Cancelled"
                    : "Order Status"}
                </h3>

                <p>
                  Tracking Number:
                  <strong>
                    {" "}
                    {order.tracking_number}
                  </strong>
                </p>
              </div>

              <div
                className={`status-badge ${getStatusClass(
                  order.status
                )}`}
              >
                {order.status}
              </div>
            </div>

            <div className="row g-4 mt-1">
              {/* shipping */}
              <div className="col-lg-6">
                <div className="modern-card">
                  <h5>
                    <FaShippingFast />
                    Shipping Details
                  </h5>

                  <div className="info-group">
                    <span>Recipient</span>

                    <strong>
                      <FaUser />
                      {user?.name}
                    </strong>
                  </div>

                  <div className="info-group">
                    <span>Address</span>

                    <strong>
                      <FaMapMarkerAlt />

                      {
                        shippingAddress?.addressLine1
                      }
                      ,{" "}
                      {shippingAddress?.state}
                      ,{" "}
                      {
                        shippingAddress?.country
                      }
                    </strong>
                  </div>

                  <div className="info-group">
                    <span>Status</span>

                    <strong>
                      {order.status}
                    </strong>
                  </div>
                </div>
              </div>

              {/* payment */}
              <div className="col-lg-6">
                <div className="modern-card">
                  <h5>
                    <FaFileInvoice />
                    Payment Summary
                  </h5>

                  {order
                    ?.orderpayments_logs
                    ?.length > 0 ? (
                    order.orderpayments_logs.map(
                      (log, index) => (
                        <div
                          className="payment-row"
                          key={index}
                        >
                          <div>
                            {getPaymentIcon(
                              log.payment_method
                            )}
                          </div>

                          <div>
                            $
                            {Number(
                              log.amount
                            ).toFixed(2)}
                          </div>

                          <div
                            className={getStatusColor(
                              log.status
                            )}
                          >
                            {log.status}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-muted">
                      No payment logs
                    </p>
                  )}
                </div>
              </div>

              {/* products */}
              <div className="col-12">
                <div className="modern-card">
                  <h5>
                    Ordered Items (
                    {
                      order.order_items
                        ?.length
                    }
                    )
                  </h5>

                  <div className="products-grid">
                    {order.order_items?.map(
                      (item, index) => (
                        <div
                          className="modern-product"
                          key={index}
                        >
                          <img
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                            alt={
                              item.products
                                ?.name
                            }
                          />

                          <div className="flex-grow-1">
                            <h6>
                              {
                                item.products
                                  ?.name
                              }
                            </h6>

                            <p>
                              Qty:{" "}
                              {
                                item.quantity
                              }
                            </p>
                          </div>

                          <strong>
                            $
                            {(
                              item.price_each *
                              item.quantity
                            ).toFixed(2)}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* summary */}
              <div className="col-12">
                <div className="modern-card">
                  <h5>
                    <FaMoneyBillWave />
                    Order Summary
                  </h5>

                  <div className="summary-row">
                    <span>
                      Items Total
                    </span>

                    <strong>
                      $
                      {order.order_items
                        .reduce(
                          (
                            acc,
                            item
                          ) =>
                            acc +
                            item.price_each *
                              item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>Shipping</span>

                    <strong>
                      $
                      {order.shipping_method ===
                      0
                        ? "0.00"
                        : "30.00"}
                    </strong>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>

                    <h4>
                      $
                      {(
                        order.order_items.reduce(
                          (
                            acc,
                            item
                          ) =>
                            acc +
                            item.price_each *
                              item.quantity,
                          0
                        ) +
                        (order.shipping_method ===
                        0
                          ? 0
                          : 30)
                      ).toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* cancel modal */}
        {cancelShow && (
          <div className="custom-modal-overlay">
            <div className="custom-modal">
              <h4>
                Cancel Order
              </h4>

              <p>
                Why are you cancelling
                this order?
              </p>

              <select
                className="form-select mb-3"
                value={selectedReason}
                onChange={(e) => {
                  const reason =
                    e.target.value;

                  setSelectedReason(
                    reason
                  );

                  if (
                    reason !== "Other"
                  ) {
                    setRefundReason(
                      reason
                    );
                  } else {
                    setRefundReason(
                      ""
                    );
                  }
                }}
              >
                <option value="">
                  Select reason
                </option>

                {predefinedReasons.map(
                  (reason, index) => (
                    <option
                      key={index}
                      value={reason}
                    >
                      {reason}
                    </option>
                  )
                )}
              </select>

              {selectedReason ===
                "Other" && (
                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Enter reason"
                  value={
                    refundReason
                  }
                  onChange={(e) =>
                    setRefundReason(
                      e.target.value
                    )
                  }
                />
              )}

              <div className="modal-actions">
                <button
                  className="btn btn-light"
                  onClick={() =>
                    setCancelShow(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  className="btn btn-danger"
                  onClick={
                    handleCancelOrder
                  }
                  disabled={
                    paymentLoading
                  }
                >
                  {paymentLoading
                    ? "Processing..."
                    : "Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderDetailsPage;