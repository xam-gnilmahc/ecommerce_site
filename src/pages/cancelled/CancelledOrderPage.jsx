import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import { HiLocationMarker } from 'react-icons/hi';
import { FaTruck, FaTimesCircle, FaBoxOpen } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';

const CancelledOrderPage = () => {
  const { fetchUserCancelledOrders } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchUserCancelledOrders();
        setOrders(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const parseAddress = (addressStr) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col gap-0 p-6 lg:p-12 transition-all duration-300 ease-in-out items-start justify-center max-w-[1400px] mx-auto w-full">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>Cancelled Orders</h2>
            <p>Refunded or cancelled purchases</p>
          </div>

          <div className="text-sm font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">{orders.length} Cancelled</div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4" key={i}>
                <Skeleton height={20} width={120} />
                <Skeleton height={16} width={180} />
                <Skeleton height={120} />
                <Skeleton height={40} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <FaBoxOpen size={48} />
            <h3>No Cancelled Orders</h3>
            <p>No cancelled orders found yet.</p>
            <Link to="/" className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => {
              const shippingAddress = parseAddress(order.shipping_address);
              const destination = shippingAddress?.country || 'Destination';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-red-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {/* TOP */}
                  <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ORDER #{order.id}</p>
                      <h4>{order.order_items?.length || 0} Items</h4>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                      <FaTimesCircle />
                      Cancelled
                    </div>
                  </div>

                  {/* CANCEL INFO */}
                  <div className="flex items-start gap-3 bg-red-50 text-red-700 p-3 rounded-lg mb-3 text-sm">
                    <FaTimesCircle className="mt-0.5 shrink-0" />
                    <div>
                      <strong>Order Cancelled</strong>
                      <p>Refund will be processed within 5–7 business days.</p>
                    </div>
                  </div>

                  {/* SHIPPING */}
                  <div className="flex items-center gap-2 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaTruck />
                      <span>Kathmandu</span>
                    </div>

                    <div className="flex-1 h-px bg-gray-300"></div>

                    <div className="flex items-center gap-1">
                      <HiLocationMarker />
                      <span>{destination}</span>
                    </div>
                  </div>

                  {/* PRODUCTS */}
                  <div className="space-y-2">
                    {order.order_items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                          alt={item.products.name}
                          className="w-10 h-10 object-contain bg-gray-100 rounded shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{item.products.name}</h5>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>

                        <strong className="text-sm font-bold text-gray-900 shrink-0">${(item.price_each * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <h3>${Number(order.total_amount).toLocaleString()}</h3>
                    </div>

                    <button
                      className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
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
