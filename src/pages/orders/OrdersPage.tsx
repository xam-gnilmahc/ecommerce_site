import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useUserOrders } from '../../tanstack/orders.ts';
import Skeleton from 'react-loading-skeleton';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import './ordersPage.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped Out' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

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

  const statusSlug = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

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

  const renderHeadline = (order) => {
    if (order.status === 'Cancelled') return <span className="ship-headline">Order cancelled</span>;
    if (order.status === 'Delivered') {
      return (
        <span className="ship-headline delivered">
          Delivered <strong>{formatDate(order.estimated_date || order.updated_at)}</strong>
        </span>
      );
    }
    return (
      <span className="ship-headline">
        Arriving <strong>{formatDate(order.estimated_date)}</strong>
      </span>
    );
  };

  return (
    <div className="orders-layout">
      <main className="orders-main">
        <div className="orders-list-col">
          {/* Page heading */}
          <div className="orders-header">
            <h1 className="orders-page-title">My orders</h1>

            {/* Filters */}
            <div className="order-filters">
              <div className="filter-group">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                    onClick={() => setStatusFilter(f.key)}
                  >
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
                  <Skeleton height={16} width={180} style={{ marginBottom: 12 }} />
                  <Skeleton height={72} style={{ marginBottom: 8 }} />
                  <Skeleton height={16} width="60%" />
                </div>
              ))}
            </div>
          ) : (
            <div className="order-list">
              {visibleOrders().map((order) => {
                const itemCount = order.order_items?.length || 0;
                const slug = statusSlug(order.status);
                return (
                  <div
                    className="order-card"
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                  >
                    {/* top strip: order no + date / status */}
                    <div className="order-card-head">
                      <span className="order-card-no">
                        Order #{order.tracking_number || order.id}
                        <span className="order-card-date">{formatDate(order.created_at)}</span>
                      </span>
                      <span className={`order-status order-status--${slug}`}>{order.status}</span>
                    </div>

                    <div className="order-card-body">
                      {/* product thumbnails */}
                      <div className="product-list">
                        {order.order_items?.slice(0, 2).map((item, i) => {
                          const product: any = item.products;
                          return (
                            <div className="product-thumb" key={i}>
                              <img
                                src={`${SUPABASE_STORAGE_URL}productimages/${product?.banner_url}`}
                                alt={product?.name}
                              />
                              {item.quantity > 1 && (
                                <span className="thumb-qty-badge">×{item.quantity}</span>
                              )}
                            </div>
                          );
                        })}
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

                      {/* info */}
                      <div className="order-card-info">
                        {renderHeadline(order)}
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
                      </div>

                      {/* view link */}
                      <button
                        type="button"
                        className="order-card-link"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order.id);
                        }}
                      >
                        View order
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
