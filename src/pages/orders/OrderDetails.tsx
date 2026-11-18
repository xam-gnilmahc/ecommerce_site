import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useOrderDetails } from '../../tanstack/orders';
import Skeleton from 'react-loading-skeleton';

import { FaMoneyBillWave, FaCcVisa, FaGooglePay, FaApplePay, FaArrowLeft } from 'react-icons/fa';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';

import './orderDetails.css';

const TRACK_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'] as const;

const STATUS_DONE_MAP: Record<string, (status: string) => boolean> = {
  Placed: () => true,
  Confirmed: (s) => ['Confirmed', 'Shipped Out', 'Out for Delivery', 'Delivered'].includes(s),
  Shipped: (s) => ['Shipped Out', 'Out for Delivery', 'Delivered'].includes(s),
  'Out for Delivery': (s) => ['Out for Delivery', 'Delivered'].includes(s),
  Delivered: (s) => s === 'Delivered',
};

const STATUS_DESC: Record<string, string> = {
  Pending: 'Your order is waiting for confirmation',
  Confirmed: 'Seller has confirmed your order',
  'Shipped Out': 'Your order is on the way',
  'Out for Delivery': 'Delivery partner is near you',
  Delivered: 'Order delivered successfully',
  Cancelled: 'Order has been cancelled',
};

interface Address {
  addressLine1: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  zipCode?: string;
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: order, isLoading: loading } = useOrderDetails(orderId);

  const parseAddress = (str: string | null | undefined): Address | null => {
    try {
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  };

  const getPaymentIcon = (m: number) => {
    if (m === 0) return <FaCcVisa />;
    if (m === 1) return <FaGooglePay />;
    if (m === 2) return <FaApplePay />;
    return <FaMoneyBillWave />;
  };

  const handlePrint = () => {
    if (!order) return;
    const address = parseAddress(order?.shipping_address);
    const total =
      order?.order_items?.reduce((a: number, b: any) => a + b.price_each * b.quantity, 0) ?? 0;

    const itemsHtml =
      order?.order_items
        ?.map(
          (item: any, i: number) => `
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
          (l: any) => `
      <p style="font-size:12.5px;color:#555;margin:0 0 4px;font-family:'Courier New',monospace">
        $${l.amount} — ${l.status}
      </p>
    `
        )
        .join('') || '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
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
              <span><strong>Date:</strong> ${new Date(order?.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              ${order?.tracking_number ? `<span><strong>Tracking:</strong> ${order?.tracking_number}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="inv-parties">
          <div>
            <p class="inv-party-label">Bill To</p>
            <p class="inv-party-name">${user?.full_name || user?.name || ''}</p>
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

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const paymentLabel = (m: number) => {
    if (m === 0) return 'Card';
    if (m === 1) return 'Google Pay';
    if (m === 2) return 'Apple Pay';
    return 'Cash on delivery';
  };

  if (loading) {
    return (
      <div className="od-page">
        <div className="od-container">
          <Skeleton height={28} width={120} borderRadius={0} style={{ marginBottom: 28 }} />
          <Skeleton height={44} width={280} borderRadius={0} style={{ marginBottom: 28 }} />
          <Skeleton height={120} borderRadius={0} style={{ marginBottom: 24 }} />
          <Skeleton height={280} borderRadius={0} />
        </div>
      </div>
    );
  }

  const address = parseAddress(order?.shipping_address);
  const items = order?.order_items ?? [];
  const total =
    order?.order_items?.reduce((a: number, b: any) => a + b.price_each * b.quantity, 0) ?? 0;
  const itemQty = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0);
  const totalPaid = Number(order?.total_amount ?? total);
  const shipping = Math.max(0, totalPaid - total);
  const doneCount = TRACK_STEPS.filter((s) => STATUS_DONE_MAP[s]?.(order?.status)).length;
  const progressPct = doneCount <= 1 ? 0 : ((doneCount - 1) / (TRACK_STEPS.length - 1)) * 80;
  const statusKey = (order?.status ?? '').toLowerCase().replace(/ /g, '-');
  const eta = formatDate(order?.order_date || order?.created_at);
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="od-page">
      <div className="od-container">
        {/* ── TOOLBAR ────────────────────────────────── */}
        <div className="od-toolbar">
          <button className="od-back-btn" onClick={() => navigate('/order')}>
            <FaArrowLeft size={11} /> My orders
          </button>
          <button className="od-print-btn" onClick={handlePrint}>
            Print invoice
          </button>
        </div>

        {/* ── HEADER ─────────────────────────────────── */}
        <header className="od-head">
          <p className="od-eyebrow">{isCancelled ? 'Cancelled order' : 'Order details'}</p>
          <div className="od-head-row">
            <h1 className="od-title">#{order?.tracking_number || order?.id}</h1>
            <span className={`od-status-pill ${statusKey}`}>{order?.status}</span>
          </div>
          <p className="od-head-meta">
            Placed {formatDate(order?.created_at)}
            <span className="od-meta-dot">·</span>
            {itemQty} item{itemQty !== 1 ? 's' : ''}
            <span className="od-meta-dot">·</span>${totalPaid.toFixed(2)}
          </p>
          <p className="od-head-desc">
            {isCancelled
              ? 'This order was cancelled and will not be delivered.'
              : `${STATUS_DESC[order?.status] ?? ''}. Estimated delivery ${eta}.`}
          </p>
        </header>

        {isCancelled && order?.Reason && (
          <div className="od-cancel-reason">
            <span className="od-cancel-label">Cancellation reason</span>
            <p className="od-cancel-text">{order.Reason}</p>
          </div>
        )}

        {/* ── TRACKING ───────────────────────────────── */}
        {!isCancelled && (
          <section className="od-panel od-track-section">
            <div className="od-panel-head">
              <h2 className="od-panel-title">Tracking</h2>
              <span className="od-panel-note">{TRACK_STEPS[Math.max(doneCount - 1, 0)]}</span>
            </div>
            <div className="od-track-wrapper">
              <div className="od-track-line-bg" />
              <div className="od-track-line-fill" style={{ width: `${progressPct}%` }} />
              {TRACK_STEPS.map((step, i) => {
                const done = STATUS_DONE_MAP[step]?.(order?.status);
                return (
                  <div key={i} className={`od-track-step ${done ? 'done' : ''}`}>
                    <div className="od-track-circle">
                      {step === 'Delivered' && done ? '✓' : i + 1}
                    </div>
                    <div className="od-track-label">{step}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── BODY: ITEMS + SUMMARY ──────────────────── */}
        <div className="od-body">
          <section className="od-panel od-items-section">
            <div className="od-panel-head">
              <h2 className="od-panel-title">Items</h2>
              <span className="od-panel-note">
                {itemQty} item{itemQty !== 1 ? 's' : ''}
              </span>
            </div>

            <ul className="od-item-list">
              {items.map((item: any, i: number) => (
                <li className="od-item" key={i}>
                  <div className="od-item-thumb">
                    {item.products?.banner_url ? (
                      <img
                        src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                        alt={item.products?.name || 'Product'}
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                  <div className="od-item-info">
                    <p className="od-item-name">{item.products?.name}</p>
                    <p className="od-item-qty">
                      ${item.price_each?.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="od-item-total">
                    ${(item.price_each * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="od-totals">
              <div className="od-total-line">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="od-total-line">
                <span>Shipping</span>
                <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="od-total-line od-total-line--grand">
                <span>Total paid</span>
                <span>${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          </section>

          <aside className="od-summary">
            <div className="od-summary-block">
              <p className="od-summary-label">Delivery</p>
              <p className="od-summary-strong">{user?.full_name || user?.name}</p>
              {address ? (
                <p className="od-summary-text">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                  <br />
                  {[address.state, address.zipCode].filter(Boolean).join(', ')}
                  {address.country ? <>
                    <br />
                    {address.country}
                  </> : null}
                </p>
              ) : (
                <p className="od-summary-text">No address on file</p>
              )}
              {!isCancelled && (
                <p className="od-summary-text od-summary-eta">
                  {order?.status === 'Delivered' ? 'Delivered' : 'Arriving'} <strong>{eta}</strong>
                </p>
              )}
            </div>

            <div className="od-summary-block">
              <p className="od-summary-label">Payment</p>
              {order?.orderpayments_logs?.length ? (
                order.orderpayments_logs.map((l: any, i: number) => (
                  <div className="od-pay-row" key={i}>
                    <span className="od-pay-icon">{getPaymentIcon(l.payment_method)}</span>
                    <div>
                      <p className="od-summary-strong">{paymentLabel(l.payment_method)}</p>
                      <p className="od-summary-text">
                        ${Number(l.amount).toFixed(2)} · {l.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="od-summary-text">No payment recorded</p>
              )}
            </div>

            {order?.tracking_number && (
              <div className="od-summary-block">
                <p className="od-summary-label">Tracking number</p>
                <p className="od-summary-mono">{order.tracking_number}</p>
              </div>
            )}
          </aside>
        </div>

        {/* ── FOOTER ─────────────────────────────────── */}
        <footer className="od-footer">
          <p className="od-thankyou">Thank you for your purchase.</p>
          <p className="od-contact">Questions? Contact us at maxrai788@gmail.com</p>
        </footer>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
