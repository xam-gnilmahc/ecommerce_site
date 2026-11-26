import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authContext';
import { useOrderDetails } from '../../tanstack/orders';
import { createInvoiceForOrder } from '../../services/invoiceService';
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
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [freshInvoiceUrl, setFreshInvoiceUrl] = useState<string | null>(null);

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

  /**
   * Opens the order's invoice, building and uploading the PDF first when the
   * order has no link yet. The tab is opened on the click itself, because a
   * window opened after the async build looks like a popup and gets blocked.
   */
  const openInvoice = async () => {
    if (!order) return;

    const tab = window.open('', '_blank');
    const show = (url: string) => {
      if (tab) tab.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    };

    const link = freshInvoiceUrl || order.invoice_url;
    if (link) {
      show(link);
      return;
    }

    setInvoiceBusy(true);
    try {
      const url = await createInvoiceForOrder(order.id);
      if (!url) throw new Error('Order not found');
      setFreshInvoiceUrl(url);
      show(url);
    } catch {
      tab?.close();
      toast.error('Could not prepare the invoice. Please try again.');
    } finally {
      setInvoiceBusy(false);
    }
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
  // An invoice only exists once the parcel has left the warehouse.
  const canInvoice = ['Shipped Out', 'Out for Delivery', 'Delivered'].includes(order?.status ?? '');

  return (
    <div className="od-page">
      <div className="od-container">
        {/* ── TOOLBAR ────────────────────────────────── */}
        <div className="od-toolbar">
          <button className="od-back-btn" onClick={() => navigate('/order')}>
            <FaArrowLeft size={11} /> My orders
          </button>
          {canInvoice && (
            <button
              className="od-print-btn"
              onClick={openInvoice}
              disabled={invoiceBusy}
              aria-busy={invoiceBusy}
            >
              {invoiceBusy ? 'Preparing invoice…' : 'Invoice PDF'}
            </button>
          )}
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
                  <p className="od-item-total">${(item.price_each * item.quantity).toFixed(2)}</p>
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
                  {address.country ? (
                    <>
                      <br />
                      {address.country}
                    </>
                  ) : null}
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
