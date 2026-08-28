import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useUserOrders } from '../../tanstack/orders.ts';
import Skeleton from 'react-loading-skeleton';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import './ordersPage.css';
import { FaBoxOpen, FaCheckCircle, FaClock, FaTruck, FaTimes, FaFileInvoice } from 'react-icons/fa';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: allOrders = [], isLoading: loading } = useUserOrders(user?.id);

  const orders = useMemo(() => allOrders.filter((o) => o.status !== 'Cancelled'), [allOrders]);
  const cancelledOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'Cancelled'),
    [allOrders]
  );
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const visibleOrders = () => {
    switch (statusFilter) {
      case 'pending':
        return orders.filter((o) => o.status === 'Pending');
      case 'confirmed':
        return orders.filter((o) => o.status === 'Confirmed' || o.status === 'Packed');
      case 'shipped':
        return orders.filter((o) => o.status === 'Shipped Out');
      case 'out-for-delivery':
        return orders.filter((o) => o.status === 'Out for Delivery');
      case 'delivered':
        return orders.filter((o) => o.status === 'Delivered');
      case 'cancelled':
        return cancelledOrders;
      default:
        return orders;
    }
  };

  return (
    <div className="orders-layout">
      <main className="orders-main">
        <div className="orders-list-col">
          {/* Page heading */}
          <div className="orders-header">
            <h1 className="orders-page-title">
              My <em>orders</em>
            </h1>

            {/* Filters */}
            <div className="order-filters">
              <div className="filter-group">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'shipped', label: 'Shipped Out' },
                  { key: 'out-for-delivery', label: 'Out for Delivery' },
                  { key: 'delivered', label: 'Delivered' },
                  { key: 'cancelled', label: 'Cancelled' },
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.key === 'cancelled' && <FaTimes />}
                    {f.label}
                  </button>
                ))}
              </div>
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
              {visibleOrders().map((order) => {
                const itemCount = order.order_items?.length || 0;
                const isDelivered = order.status === 'Delivered';
                return (
                  <div
                    className="order-card"
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
                          <FaFileInvoice />
                          View Invoice
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
                        {order.status === 'Cancelled' ? (
                          <span className="ship-headline cancelled">
                            <FaTimes /> Order cancelled
                          </span>
                        ) : isDelivered ? (
                          <span className="ship-headline delivered">
                            <FaCheckCircle /> Delivered{' '}
                            <strong>{formatDate(order.estimated_date || order.updated_at)}</strong>
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
              {visibleOrders().length === 0 && !loading && (
                <div className="orders-empty">
                  {statusFilter === 'cancelled'
                    ? 'No cancelled orders'
                    : 'No orders yet — start shopping!'}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
