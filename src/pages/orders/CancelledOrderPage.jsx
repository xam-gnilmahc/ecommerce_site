import React from 'react';
import { useAuth } from '../../context/authContext';
import { useUserCancelledOrders } from '../../tanstack/orders.ts';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import { SUPABASE_STORAGE_URL } from '../../utils/supabaseStorage';
import { HiLocationMarker } from 'react-icons/hi';
import { FaTruck, FaTimesCircle, FaBoxOpen } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import '../orders/ordersPage.css';

const CancelledOrderPage = () => {
  const { user } = useAuth();
  const { data: orders = [], isLoading: loading } = useUserCancelledOrders(user?.id);

  const navigate = useNavigate();

  const parseAddress = (addressStr) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="orders-layout">
      <Sidebar />

      <main className="orders-main">
        {/* HEADER */}
        <div className="orders-header">
          <div>
            <h2>Cancelled Orders</h2>
            <p>Refunded or cancelled purchases</p>
          </div>

          <div className="orders-count cancelled-count">{orders.length} Cancelled</div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="orders-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="modern-order-card" key={i}>
                <Skeleton height={20} width={120} />
                <Skeleton height={16} width={180} />
                <Skeleton height={120} />
                <Skeleton height={40} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <FaBoxOpen size={48} />
            <h3>No Cancelled Orders</h3>
            <p>No cancelled orders found yet.</p>
            <Link to="/" className="shop-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => {
              const shippingAddress = parseAddress(order.shipping_address);
              const destination = shippingAddress?.country || 'Destination';

              return (
                <div
                  key={order.id}
                  className="modern-order-card cancelled-card"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {/* TOP */}
                  <div className="order-top">
                    <div>
                      <p className="order-label">ORDER #{order.id}</p>
                      <h4>{order.order_items?.length || 0} Items</h4>
                    </div>

                    <div className="status-pill cancelled">
                      <FaTimesCircle />
                      Cancelled
                    </div>
                  </div>

                  {/* CANCEL INFO */}
                  <div className="cancelled-banner">
                    <FaTimesCircle />
                    <div>
                      <strong>Order Cancelled</strong>
                      <p>Refund will be processed within 5–7 business days.</p>
                    </div>
                  </div>

                  {/* SHIPPING */}
                  <div className="shipping-box">
                    <div>
                      <FaTruck />
                      <span>Kathmandu</span>
                    </div>

                    <div className="shipping-line"></div>

                    <div>
                      <HiLocationMarker />
                      <span>{destination}</span>
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="product-preview">
                    {order.order_items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="product-item">
                        <img
                          src={`${SUPABASE_STORAGE_URL}productimages/${item.products.banner_url}`}
                          alt={item.products.name}
                        />

                        <div className="product-info">
                          <h5>{item.products.name}</h5>
                          <p>Qty: {item.quantity}</p>
                        </div>

                        <strong>${(item.price_each * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="order-footer">
                    <div>
                      <p>Total</p>
                      <h3>${Number(order.total_amount).toLocaleString()}</h3>
                    </div>

                    <button
                      className="cancelled-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CancelledOrderPage;
