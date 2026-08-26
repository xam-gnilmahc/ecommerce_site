import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import Skeleton from 'react-loading-skeleton';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import './ordersPage.css';
import Navbar from '../../components/ui/Navbar';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaUser,
  FaMoneyBillWave,
  FaCcVisa,
  FaGooglePay,
  FaApplePay,
  FaTimes,
} from 'react-icons/fa';

const TRACK_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_DONE_MAP = {
  Placed: () => true,
  Confirmed: (s) => ['Confirmed', 'Shipped Out', 'Out for Delivery', 'Delivered'].includes(s),
  Shipped: (s) => ['Shipped Out', 'Out for Delivery', 'Delivered'].includes(s),
  'Out for Delivery': (s) => ['Out for Delivery', 'Delivered'].includes(s),
  Delivered: (s) => s === 'Delivered',
};

const STATUS_DESC = {
  Pending: 'Waiting for confirmation',
  Confirmed: 'Seller confirmed your order',
  'Shipped Out': 'Your order is on the way',
  'Out for Delivery': 'Delivery partner is near you',
  Delivered: 'Order delivered successfully 🎉',
  Cancelled: 'This order was cancelled',
};

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

const OrdersPage = () => {
  const { fetchUserOrders, getOrderDetails, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [showCancelled, setShowCancelled] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    const load = async () => {
      setLoading(true);
      const data = await fetchUserOrders();
      setOrders(data?.filter((o) => o.status !== 'Cancelled') || []);
      setCancelledOrders(data?.filter((o) => o.status === 'Cancelled') || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleOrderClick = async (orderId) => {
    if (activeId === orderId && panelOpen) {
      handleClose();
      return;
    }
    setActiveId(orderId);
    setPanelOpen(true);
    setDetailLoading(true);
    setSelectedOrder(null);
    const data = await getOrderDetails(orderId);
    setSelectedOrder(data);
    setDetailLoading(false);
  };

  const handleClose = () => {
    setPanelOpen(false);
    setActiveId(null);
    setTimeout(() => setSelectedOrder(null), 320);
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <FaClock />;
      case 'confirmed':
      case 'packed':
        return <FaBoxOpen />;
      case 'shipped out':
        return <FaTruck />;
      case 'delivered':
        return <FaCheckCircle />;
      default:
        return <FaBoxOpen />;
    }
  };

  const order = selectedOrder;
  const address = parseAddress(order?.shipping_address);
  const total = order?.order_items?.reduce((a, b) => a + b.price_each * b.quantity, 0) ?? 0;
  const doneCount = TRACK_STEPS.filter((s) => STATUS_DONE_MAP[s]?.(order?.status)).length;
  const progressPct = doneCount <= 1 ? 0 : ((doneCount - 1) / (TRACK_STEPS.length - 1)) * 80;
  const statusKey = (order?.status ?? '').toLowerCase().replace(/ /g, '-');

  return (
    <>
      <div className="orders-layout">
        <main className={`orders-main ${panelOpen ? 'panel-open' : ''}`}>
          {/* ── LIST COLUMN ─────────────────────────────── */}
          <div className="orders-list-col">
            {/* Page heading */}
            <div className="orders-header">
              <h1 className="orders-page-title">
                My <em>orders</em>
              </h1>

              {/* Toggle */}
              <div className="toggle-slider">
                <div className={`toggle-highlight ${showCancelled ? 'right' : ''}`} />
                <button
                  className={`toggle-option ${!showCancelled ? 'active' : ''}`}
                  onClick={() => setShowCancelled(false)}
                >
                  Orders
                </button>
                <button
                  className={`toggle-option ${showCancelled ? 'active' : ''}`}
                  onClick={() => setShowCancelled(true)}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {loading ? (
              <div className="order-list">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div className="order-card" key={i}>
                    <Skeleton height={18} width={160} style={{ marginBottom: 10 }} />
                    <Skeleton height={80} style={{ marginBottom: 8 }} />
                    <Skeleton height={40} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="order-list">
                {(showCancelled ? cancelledOrders : orders).map((order) => {
                  const itemCount = order.order_items?.length || 0;
                  const isDelivered = order.status === 'Delivered';
                  return (
                    <div
                      className={`order-card ${activeId === order.id ? 'order-card--active' : ''}`}
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
                    >
                      {/* Amazon-style grey header band */}
                      <div className="order-card-band">
                        <div className="band-col">
                          <span className="band-label">Order placed</span>
                          <span className="band-value">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="band-col">
                          <span className="band-label">Total</span>
                          <span className="band-value">
                            ${Number(order.total_amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="band-col band-col--ship">
                          <span className="band-label">Ship to</span>
                          <span className="band-value band-ship-name">{user?.name}</span>
                        </div>
                        <div className="band-right">
                          <span className="band-order-no">
                            Order #{order.tracking_number || order.id}
                          </span>
                          <button
                            type="button"
                            className="band-view-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOrderClick(order.id);
                            }}
                          >
                            View order details
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="order-card-body">
                        {/* Amazon: big green headline line */}
                        <div className="ship-line">
                          {showCancelled || order.status === 'Cancelled' ? (
                            <span className="ship-headline cancelled">
                              <FaTimes /> Order cancelled
                            </span>
                          ) : isDelivered ? (
                            <span className="ship-headline delivered">
                              <FaCheckCircle /> Delivered{' '}
                              <strong>
                                {formatDate(order.estimated_date || order.updated_at)}
                              </strong>
                            </span>
                          ) : (
                            <span className="ship-headline">
                              Arriving <strong>{formatDate(order.estimated_date)}</strong>
                            </span>
                          )}
                          <div className={`status ${order.status?.toLowerCase()}`}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </div>

                        {/* Flipkart-style meta line */}
                        <div className="order-meta-line">
                          <span>
                            {itemCount} item{itemCount > 1 ? 's' : ''}
                          </span>
                          <i>·</i>
                          <span>Sold by UOM</span>
                          <i>·</i>
                          <span className="meta-paid">
                            Paid ${Number(order.total_amount).toFixed(2)}
                          </span>
                        </div>

                        {/* product thumbnails in one row */}
                        <div className="product-list">
                          {order.order_items?.slice(0, 2).map((item, i) => (
                            <div className="product-thumb" key={i}>
                              <img
                                src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                                alt={item.products.name}
                              />
                              {item.quantity > 1 && (
                                <span className="thumb-qty-badge">×{item.quantity}</span>
                              )}
                            </div>
                          ))}
                          {itemCount > 2 && (
                            <button
                              type="button"
                              className="product-more-tile"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(order.id);
                              }}
                            >
                              +{itemCount - 2}
                              <small>more</small>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!showCancelled && orders.length === 0 && !loading && (
                  <div className="orders-empty">No orders yet — start shopping!</div>
                )}
                {showCancelled && cancelledOrders.length === 0 && !loading && (
                  <div className="orders-empty">No cancelled orders</div>
                )}
              </div>
            )}
          </div>

          {/* ── DETAIL PANEL ────────────────────────────── */}
          <div className={`orders-detail-panel ${panelOpen ? 'panel-visible' : ''}`}>
            <div className="od-panel-inner">
              <button className="od-close-btn" onClick={handleClose}>
                <FaTimes />
              </button>

              {detailLoading ? (
                <div className="od-skeleton-wrap">
                  <div className="skel-band">
                    <div className="skel-band-left">
                      <Skeleton width={60} height={22} borderRadius={0} />
                      <Skeleton width={90} height={11} borderRadius={0} style={{ marginTop: 6 }} />
                    </div>
                    <div className="skel-band-right">
                      <Skeleton width={110} height={13} borderRadius={0} />
                      <Skeleton width={80} height={11} borderRadius={0} style={{ marginTop: 5 }} />
                      <Skeleton width={90} height={24} borderRadius={0} style={{ marginTop: 7 }} />
                    </div>
                  </div>
                  <div className="skel-status-row">
                    <Skeleton width={80} height={24} borderRadius={0} />
                    <Skeleton width={160} height={13} borderRadius={0} />
                  </div>
                  <div className="skel-track-section">
                    <Skeleton
                      width={70}
                      height={10}
                      borderRadius={0}
                      style={{ marginBottom: 16 }}
                    />
                    <div className="skel-track-steps">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div className="skel-track-step" key={i}>
                          <Skeleton circle width={26} height={26} />
                          <Skeleton
                            width={40}
                            height={9}
                            borderRadius={0}
                            style={{ marginTop: 6 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="skel-divider" />
                  <div className="skel-meta-grid">
                    <div className="skel-meta-block">
                      <Skeleton
                        width={100}
                        height={10}
                        borderRadius={0}
                        style={{ marginBottom: 12 }}
                      />
                      <div className="skel-meta-row">
                        <Skeleton circle width={14} height={14} />
                        <Skeleton width={90} height={13} borderRadius={0} />
                      </div>
                      <div className="skel-meta-row">
                        <Skeleton circle width={14} height={14} />
                        <Skeleton width={130} height={13} borderRadius={0} />
                      </div>
                    </div>
                    <div className="skel-meta-block skel-meta-block--right">
                      <Skeleton
                        width={70}
                        height={10}
                        borderRadius={0}
                        style={{ marginBottom: 12 }}
                      />
                      <div className="skel-meta-row">
                        <Skeleton width={28} height={20} borderRadius={0} />
                        <Skeleton width={50} height={13} borderRadius={0} />
                        <Skeleton width={55} height={13} borderRadius={0} />
                      </div>
                    </div>
                  </div>
                  <div className="skel-divider" />
                  <div className="skel-items-section">
                    <Skeleton
                      width={90}
                      height={10}
                      borderRadius={0}
                      style={{ marginBottom: 14 }}
                    />
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div className="skel-item-row" key={i}>
                        <Skeleton width={48} height={48} borderRadius={0} />
                        <div className="skel-item-info">
                          <Skeleton width={140} height={13} borderRadius={0} />
                          <Skeleton
                            width={60}
                            height={11}
                            borderRadius={0}
                            style={{ marginTop: 5 }}
                          />
                        </div>
                        <Skeleton width={48} height={16} borderRadius={0} />
                      </div>
                    ))}
                  </div>
                  <div className="skel-footer">
                    <div>
                      <Skeleton width={160} height={11} borderRadius={0} />
                      <Skeleton width={120} height={11} borderRadius={0} style={{ marginTop: 5 }} />
                    </div>
                    <div className="skel-total">
                      <Skeleton width={60} height={10} borderRadius={0} />
                      <Skeleton width={80} height={24} borderRadius={0} style={{ marginTop: 5 }} />
                    </div>
                  </div>
                </div>
              ) : order ? (
                <>
                  {/* TOP BAND */}
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

                  {/* STATUS ROW */}
                  <div className="od-status-row">
                    <span className={`od-status-pill ${statusKey}`}>{order?.status}</span>
                    <span className="od-status-desc">{STATUS_DESC[order?.status] ?? ''}</span>
                  </div>

                  {/* TRACKING */}
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

                  {/* META */}
                  <div className="od-meta-grid">
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

                  {/* ITEMS */}
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
                        <div className="od-item-price">
                          ${(item.price_each * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
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
                </>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default OrdersPage;
