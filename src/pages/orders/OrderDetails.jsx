import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Skeleton from 'react-loading-skeleton';

import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import {
  FaMapMarkerAlt,
  FaUser,
  FaMoneyBillWave,
  FaCcVisa,
  FaGooglePay,
  FaApplePay,
} from 'react-icons/fa';

import './orderDetails.css';

const TRACK_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_DONE_MAP = {
  Placed: () => true,
  Confirmed: (s) => ['Confirmed', 'Shipped Out', 'Out for Delivery', 'Delivered'].includes(s),
  Shipped: (s) => ['Shipped Out', 'Out for Delivery', 'Delivered'].includes(s),
  'Out for Delivery': (s) => ['Out for Delivery', 'Delivered'].includes(s),
  Delivered: (s) => s === 'Delivered',
};

const STATUS_DESC = {
  Pending: 'Your order is waiting for confirmation',
  Confirmed: 'Seller has confirmed your order',
  'Shipped Out': 'Your order is on the way',
  'Out for Delivery': 'Delivery partner is near you',
  Delivered: 'Order delivered successfully 🎉',
  Cancelled: 'Order has been cancelled',
};

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { getOrderDetails, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getOrderDetails(orderId);
      setOrder(data);
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="od-page">
        <div className="od-container">
          <Skeleton height={160} borderRadius={0} style={{ marginBottom: 16 }} />
          <Skeleton height={320} borderRadius={0} style={{ marginBottom: 16 }} />
          <Skeleton height={200} borderRadius={0} />
        </div>
      </div>
    );
  }

  /* helpers */
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

  const total = order?.order_items?.reduce((a, b) => a + b.price_each * b.quantity, 0) ?? 0;

  /* tracking progress width */
  const doneCount = TRACK_STEPS.filter((s) => STATUS_DONE_MAP[s]?.(order?.status)).length;
  const progressPct = doneCount <= 1 ? 0 : ((doneCount - 1) / (TRACK_STEPS.length - 1)) * 80;

  const statusKey = (order?.status ?? '').toLowerCase().replace(/ /g, '\\ ');

  return (
    <div className="od-page">
      <div className="od-container">
        <div className="od-receipt">
          {/* ── TOP BAND ─────────────────────────────────── */}
          <div className="od-top-band">
            <div className="od-brand">
              <span className="od-brand-name">UOM</span>
              <span className="od-brand-label">Order Receipt</span>
            </div>

            <div className="od-top-meta">
              <span className="od-order-number">
                Order <span>#{order?.id}</span>
              </span>
              <span className="od-tracking-number">{order?.tracking_number}</span>
              <button className="od-invoice-btn" onClick={() => window.print()}>
                Print Invoice
              </button>
            </div>
          </div>

          {/* ── STATUS ROW ───────────────────────────────── */}
          <div className="od-status-row">
            <span className={`od-status-pill ${statusKey}`}>{order?.status}</span>
            <span className="od-status-desc">{STATUS_DESC[order?.status] ?? ''}</span>
          </div>

          {/* ── TRACKING ─────────────────────────────────── */}
          <div className="od-track-section">
            <p className="od-section-label">Tracking</p>

            <div className="od-track-wrapper">
              <div className="od-track-line-bg" />
              <div className="od-track-line-fill" style={{ width: `${progressPct}%` }} />

              {TRACK_STEPS.map((step, i) => {
                const done = STATUS_DONE_MAP[step]?.(order?.status);
                return (
                  <div key={i} className={`od-track-step ${done ? 'done' : ''}`}>
                    <div className="od-track-circle">{done ? '✓' : i + 1}</div>
                    <div className="od-track-label">{step}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="od-divider" />

          {/* ── META GRID ────────────────────────────────── */}
          <div className="od-meta-grid">
            {/* Shipping */}
            <div className="od-meta-block">
              <p className="od-section-label">Shipping Address</p>
              <div className="od-meta-row">
                <FaUser />
                <span>{user?.name}</span>
              </div>
              {address && (
                <div className="od-meta-row">
                  <FaMapMarkerAlt />
                  <span>
                    {address.addressLine1}
                    {address.state ? `, ${address.state}` : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="od-meta-block">
              <p className="od-section-label">Payment</p>
              {order?.orderpayments_logs?.map((l, i) => (
                <div className="od-pay-row" key={i}>
                  {getPaymentIcon(l.payment_method)}
                  <span className="od-pay-amount">${l.amount}</span>
                  <span className="od-pay-status">{l.status}</span>
                </div>
              ))}
            </div>
          </div>

          <hr className="od-divider" />

          {/* ── ITEMS ────────────────────────────────────── */}
          <div className="od-items-section">
            <p className="od-section-label">Items Ordered</p>

            {order?.order_items?.map((item, i) => (
              <div className="od-item" key={i}>
                <div className="od-item-img">
                  <img
                    src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                    alt={item.products?.name}
                  />
                </div>

                <div className="od-item-info">
                  <p className="od-item-name">{item.products?.name}</p>
                  <p className="od-item-qty">Qty: {item.quantity}</p>
                </div>

                <div className="od-item-price">${(item.price_each * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* ── FOOTER / TOTAL ───────────────────────────── */}
          <div className="od-footer">
            <p className="od-footer-note">
              Thank you for your order.
              <br />
              Questions? Contact our support team.
            </p>

            <div className="od-total-block">
              <span className="od-total-label">Total Paid</span>
              <span className="od-total-amount">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
