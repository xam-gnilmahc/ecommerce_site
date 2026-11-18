import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useUserOrders } from '../../tanstack/orders.ts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiPackage } from 'react-icons/fi';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import './ordersPage.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out-for-delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const matchesFilter = (order, key) => {
  switch (key) {
    case 'pending':
      return order.status === 'Pending';
    case 'confirmed':
      return order.status === 'Confirmed' || order.status === 'Packed';
    case 'shipped':
      return order.status === 'Shipped Out';
    case 'out-for-delivery':
      return order.status === 'Out for Delivery';
    case 'delivered':
      return order.status === 'Delivered';
    case 'cancelled':
      return order.status === 'Cancelled';
    default:
      return true;
  }
};

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: allOrders = [], isLoading: loading } = useUserOrders(user?.id);

  const [statusFilter, setStatusFilter] = useState('all');

  const orders = useMemo(() => allOrders.filter((o) => o.status !== 'Cancelled'), [allOrders]);
  const cancelledOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'Cancelled'),
    [allOrders]
  );

  const filterCounts = useMemo(() => {
    const counts = {};
    FILTERS.forEach((f) => {
      counts[f.key] = allOrders.filter((o) => matchesFilter(o, f.key)).length;
    });
    return counts;
  }, [allOrders]);

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
    if (statusFilter === 'cancelled') return cancelledOrders;
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => matchesFilter(o, statusFilter));
  };

  const renderHeadline = (order) => {
    // order_date holds the estimated delivery date (set on insert)
    const eta = formatDate(order.order_date || order.created_at);
    if (order.status === 'Cancelled') {
      return <span className="order-headline is-cancelled">Order cancelled</span>;
    }
    if (order.status === 'Delivered') {
      return (
        <span className="order-headline">
          Delivered <strong>{eta}</strong>
        </span>
      );
    }
    return (
      <span className="order-headline">
        Arriving <strong>{eta}</strong>
      </span>
    );
  };

  const shown = visibleOrders();

  return (
    <div className="orders-layout">
      <main className="orders-main">
        <div className="orders-list-col">
          <header className="orders-header">
            <p className="orders-eyebrow">Account</p>
            <div className="orders-title-row">
              <h1 className="orders-page-title">My orders</h1>
              {!loading && !!allOrders.length && (
                <span className="orders-count">
                  {allOrders.length} order{allOrders.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </header>

          <div className="order-filters" role="tablist" aria-label="Filter orders">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === f.key}
                className={`filter-btn ${statusFilter === f.key ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.key)}
              >
                {f.label}
                {!loading && !!filterCounts[f.key] && (
                  <span className="filter-count">{filterCounts[f.key]}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="order-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="order-row order-row--skeleton" key={i}>
                  <div className="order-thumbs">
                    <Skeleton width={88} height={88} />
                    <Skeleton width={88} height={88} />
                  </div>
                  <div className="order-summary">
                    <Skeleton width={140} height={11} />
                    <Skeleton width="60%" height={16} />
                    <Skeleton width="40%" height={12} />
                  </div>
                  <Skeleton width={92} height={26} />
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty__icon">
                <FiPackage size={22} />
              </div>
              <p className="orders-empty__title">
                {statusFilter === 'cancelled' ? 'No cancelled orders' : 'No orders yet'}
              </p>
              <p className="orders-empty__hint">
                {statusFilter === 'cancelled'
                  ? 'Cancelled orders will appear here'
                  : 'Orders you place will show up here'}
              </p>
              {statusFilter !== 'cancelled' && (
                <Link to="/search" className="orders-empty__btn">
                  Start shopping
                </Link>
              )}
            </div>
          ) : (
            <div className="order-list">
              {shown.map((order) => {
                const items = order.order_items || [];
                const itemCount = items.length;
                const totalQty = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
                const slug = statusSlug(order.status);
                return (
                  <article
                    className="order-row"
                    key={order.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => handleOrderClick(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOrderClick(order.id);
                      }
                    }}
                  >
                    <div className="order-thumbs">
                      {items.slice(0, 2).map((item, i) => {
                        const product: any = item.products;
                        return (
                          <div className="order-thumb" key={i}>
                            <img
                              src={`${SUPABASE_STORAGE_URL}productimages/${product?.banner_url}`}
                              alt={product?.name || 'Product'}
                              loading="lazy"
                            />
                            {item.quantity > 1 && (
                              <span className="order-thumb-qty">×{item.quantity}</span>
                            )}
                          </div>
                        );
                      })}
                      {itemCount > 2 && (
                        <span className="order-thumb-more" aria-hidden="true">
                          +{itemCount - 2}
                        </span>
                      )}
                    </div>

                    <div className="order-summary">
                      <p className="order-ref">
                        <span>Order</span> {order.tracking_number || order.id}
                        <span className="order-ref-date">{formatDate(order.created_at)}</span>
                      </p>
                      {renderHeadline(order)}
                      <p className="order-meta">
                        {totalQty} item{totalQty !== 1 ? 's' : ''}
                        <span className="order-meta-dot">·</span>${' '}
                        {Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>

                    <div className="order-side">
                      <span className={`order-status order-status--${slug}`}>{order.status}</span>
                      <span className="order-open">
                        View order
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
