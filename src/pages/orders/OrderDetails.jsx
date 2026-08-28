import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useOrderDetails } from '../../tanstack/orders.ts';
import Skeleton from 'react-loading-skeleton';

import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import { FaMoneyBillWave, FaCcVisa, FaGooglePay, FaApplePay, FaArrowLeft } from 'react-icons/fa';

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
  Delivered: 'Order delivered successfully',
  Cancelled: 'Order has been cancelled',
};

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: order, isLoading: loading } = useOrderDetails(orderId);

  const parseAddress = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const getPaymentIcon = (m) => {
    if (m === 0) return <FaCcVisa />;
    if (m === 1) return <FaGooglePay />;
    if (m === 2) return <FaApplePay />;
    return <FaMoneyBillWave />;
  };

  const handlePrint = () => {
    if (!order) return;
    const address = parseAddress(order?.shipping_address);
    const total = order?.order_items?.reduce((a, b) => a + b.price_each * b.quantity, 0) ?? 0;

    const itemsHtml =
      order?.order_items
        ?.map(
          (item, i) => `
      <tr>
        <td style="text-align:center;color:#999">${i + 1}</td>
        <td>${item.products?.name}</td>
        <td style="text-align:center;font-weight:600">${item.quantity}</td>
        <td style="text-align:right">$${item.price_each?.toFixed(2)}</td>
        <td style="text-align:right;font-weight:700">$${(item.price_each * item.quantity).toFixed(2)}</td>
      </tr>
    `
        )
        .join('') || '';

    const cancelReasonHtml =
      order?.status === 'Cancelled' && order?.Reason
        ? `<div class="inv-cancel-reason"><p class="inv-cancel-label">Cancellation Reason</p><p>${order.Reason}</p></div>`
        : '';

    const paymentHtml =
      order?.orderpayments_logs
        ?.map(
          (l) => `
      <p style="font-size:12.5px;color:#555;margin:0 0 4px;font-family:'Courier New',monospace">
        $${l.amount} — ${l.status}
      </p>
    `
        )
        .join('') || '';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order?.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', serif; padding: 48px; color: #000; }
          .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #000; margin-bottom: 32px; }
          .inv-brand-name { font-size: 48px; font-weight: 900; letter-spacing: 0.08em; color: #000; display: block; line-height: 1; }
          .inv-brand-tagline { font-size: 11px; font-weight: 400; color: #888; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 6px; display: block; }
          .inv-title { font-size: 52px; font-weight: 400; letter-spacing: 0.12em; color: #000; margin: 0 0 16px; text-align: right; text-transform: uppercase; }
          .inv-meta { display: flex; flex-direction: column; gap: 6px; text-align: right; font-size: 12px; color: #555; font-family: 'Courier New', monospace; }
          .inv-meta strong { color: #000; font-weight: 700; }
          .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 36px; padding: 24px; background: #fafafa; border: 1px solid #e0e0e0; }
          .inv-party-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: #999; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
          .inv-party-name { font-size: 15px; font-weight: 700; color: #000; margin: 0 0 6px; }
          .inv-party-detail { font-size: 12.5px; color: #555; margin: 0 0 4px; font-family: 'Courier New', monospace; }
          .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 12.5px; font-family: 'Courier New', monospace; }
          .inv-table thead { background: #000; color: #fff; }
          .inv-table th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; padding: 14px 16px; text-align: left; }
          .inv-table td { padding: 14px 16px; border-bottom: 1px solid #eee; color: #333; }
          .inv-table tbody tr:nth-child(even) { background: #fafafa; }
          .inv-total-row td { border-bottom: none; border-top: 3px solid #000; padding-top: 16px; background: transparent !important; }
          .inv-total-label { text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #555; }
          .inv-total-value { text-align: right; font-size: 24px; font-weight: 900; color: #000; }
          .inv-footer { text-align: center; padding-top: 32px; border-top: 1px solid #ddd; margin-top: 8px; }
          .inv-thankyou { font-family: 'Georgia', serif; font-size: 16px; font-style: italic; color: #000; margin: 0 0 6px; }
          .inv-contact { font-size: 11px; color: #999; margin: 0; font-family: 'Courier New', monospace; }
          .inv-cancel-reason { margin: 16px 0 24px; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; }
          .inv-cancel-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #dc2626; margin: 0 0 6px; }
          .inv-cancel-text { font-size: 12px; color: #7f1d1d; margin: 0; font-family: 'Courier New', monospace; }
          @media print { body { padding: 24px; } }
        </style>
      </head>
      <body>
        <div class="inv-header">
          <div>
            <span class="inv-brand-name">UOM</span>
            <span class="inv-brand-tagline">Premium Tech Store</span>
          </div>
          <div>
            <h1 class="inv-title">INVOICE</h1>
            <div class="inv-meta">
              <span><strong>Invoice #</strong> INV-${order?.id}</span>
              <span><strong>Order #</strong> ${order?.id}</span>
              <span><strong>Date:</strong> ${new Date(order?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              ${order?.tracking_number ? `<span><strong>Tracking:</strong> ${order?.tracking_number}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="inv-parties">
          <div>
            <p class="inv-party-label">Bill To</p>
            <p class="inv-party-name">${user?.name}</p>
            ${address ? `<p class="inv-party-detail">${address.addressLine1}${address.state ? `, ${address.state}` : ''}</p>` : ''}
          </div>
          <div>
            <p class="inv-party-label">Payment Method</p>
            ${paymentHtml}
          </div>
        </div>

        ${cancelReasonHtml}

        <table class="inv-table">
          <thead>
            <tr>
              <th style="width:40px;text-align:center">#</th>
              <th>Item</th>
              <th style="width:60px;text-align:center">Qty</th>
              <th style="width:100px;text-align:right">Unit Price</th>
              <th style="width:100px;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr class="inv-total-row">
              <td colSpan="4" class="inv-total-label">Total Paid</td>
              <td class="inv-total-value">$${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="inv-footer">
          <p class="inv-thankyou">Thank you for your purchase!</p>
          <p class="inv-contact">Questions? Contact us at maxrai788@gmail.com</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

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

  const address = parseAddress(order?.shipping_address);
  const total = order?.order_items?.reduce((a, b) => a + b.price_each * b.quantity, 0) ?? 0;
  const doneCount = TRACK_STEPS.filter((s) => STATUS_DONE_MAP[s]?.(order?.status)).length;
  const progressPct = doneCount <= 1 ? 0 : ((doneCount - 1) / (TRACK_STEPS.length - 1)) * 80;
  const statusKey = (order?.status ?? '').toLowerCase().replace(/ /g, '-');

  return (
    <div className="od-page">
      <div className="od-container">
        <div className="od-receipt">
          {/* ── TOP ACTION BAR (BACK + PRINT) ──────────── */}
          <div className="od-print-top">
            <button className="od-back-btn" onClick={() => navigate('/order')}>
              <FaArrowLeft /> Back to Orders
            </button>
            <button className="od-print-btn" onClick={handlePrint}>
              Print Invoice
            </button>
          </div>

          {/* ── HEADER ─────────────────────────────────── */}
          <div className="od-header">
            <div className="od-header-left">
              <span className="od-brand-name">UOM</span>
              <span className="od-brand-tagline">Premium Tech Store</span>
            </div>
            <div className="od-header-right">
              <h1 className="od-invoice-title">INVOICE</h1>
              <div className="od-invoice-meta">
                <span>
                  <strong>Invoice #</strong> INV-{order?.id}
                </span>
                <span>
                  <strong>Order #</strong> {order?.id}
                </span>
                <span>
                  <strong>Date:</strong>{' '}
                  {new Date(order?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {order?.tracking_number && (
                  <span>
                    <strong>Tracking:</strong> {order?.tracking_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── BILL TO / PAYMENT ──────────────────────── */}
          <div className="od-parties">
            <div className="od-party">
              <p className="od-party-label">Bill To</p>
              <p className="od-party-name">{user?.name}</p>
              {address && (
                <p className="od-party-detail">
                  {address.addressLine1}
                  {address.state ? `, ${address.state}` : ''}
                </p>
              )}
            </div>
            <div className="od-party">
              <p className="od-party-label">Payment</p>
              {order?.orderpayments_logs?.map((l, i) => (
                <p className="od-party-detail" key={i}>
                  {getPaymentIcon(l.payment_method)} ${l.amount} — {l.status}
                </p>
              ))}
            </div>
          </div>

          {/* ── STATUS ─────────────────────────────────── */}
          <div className="od-status-row">
            <span className={`od-status-pill ${statusKey}`}>{order?.status}</span>
            <span className="od-status-desc">{STATUS_DESC[order?.status] ?? ''}</span>
          </div>

          {order?.status === 'Cancelled' && order?.Reason && (
            <div className="od-cancel-reason">
              <span className="od-cancel-label">Cancellation Reason</span>
              <p className="od-cancel-text">{order.Reason}</p>
            </div>
          )}

          {/* ── TRACKING ───────────────────────────────── */}
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

          {/* ── ITEMS TABLE ────────────────────────────── */}
          <div className="od-items-section">
            <table className="od-table">
              <thead>
                <tr>
                  <th className="od-th-num">#</th>
                  <th className="od-th-item">Item</th>
                  <th className="od-th-qty">Qty</th>
                  <th className="od-th-price">Unit Price</th>
                  <th className="od-th-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {order?.order_items?.map((item, i) => (
                  <tr key={i}>
                    <td className="od-td-num">{i + 1}</td>
                    <td className="od-td-item">{item.products?.name}</td>
                    <td className="od-td-qty">{item.quantity}</td>
                    <td className="od-td-price">${item.price_each?.toFixed(2)}</td>
                    <td className="od-td-total">${(item.price_each * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="od-total-row">
                  <td colSpan={4} className="od-total-label">
                    Total Paid
                  </td>
                  <td className="od-total-value">${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── FOOTER ─────────────────────────────────── */}
          <div className="od-footer">
            <p className="od-thankyou">Thank you for your purchase!</p>
            <p className="od-contact">Questions? Contact us at maxrai788@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
