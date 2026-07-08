import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import Skeleton from 'react-loading-skeleton';
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
  Delivered: 'Order delivered successfully',
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

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-orange-50 text-orange-600';
      case 'confirmed':
        return 'bg-blue-50 text-blue-600';
      case 'packed':
        return 'bg-purple-50 text-purple-600';
      case 'shipped out':
        return 'bg-green-50 text-green-600';
      case 'out for delivery':
        return 'bg-yellow-50 text-yellow-600';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-600';
      case 'cancelled':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getPillClasses = (statusKey) => {
    switch (statusKey) {
      case 'pending':
        return 'bg-orange-50 text-orange-600';
      case 'confirmed':
        return 'bg-blue-50 text-blue-600';
      case 'packed':
        return 'bg-purple-50 text-purple-600';
      case 'shipped-out':
        return 'bg-green-50 text-green-600';
      case 'out-for-delivery':
        return 'bg-yellow-50 text-yellow-600';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-600';
      case 'cancelled':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const displayOrders = showCancelled ? cancelledOrders : orders;

  return (
    <>
      <style>{`
        @media print {
          nav, header { display: none !important; }
          .print-hide { display: none !important; }
          html, body { margin: 0; padding: 0; background: white; }
          .print-layout { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-panel { width: 100%; max-width: 680px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 0; }
          .print-band { background: #1a1a2e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-status-row { background: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-track-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-track-done { background: #1a1a2e !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-footer-bg { background: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-divider { border-top: 1px solid #e5e7eb !important; margin: 0 !important; }
          @page { size: A4; margin: 20mm 15mm; }
        }
      `}</style>
      <div className="bg-gray-100 min-h-screen overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">My Orders</h1>
              {!loading && (
                <p className="text-sm text-gray-400 mt-1 m-0">
                  {displayOrders.length} {showCancelled ? 'cancelled ' : ''}order
                  {displayOrders.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="relative flex items-center bg-white rounded-full p-0.5 border border-gray-200 overflow-hidden">
              <div
                className={`absolute top-0.5 bottom-0.5 w-1/2 bg-gray-900 rounded-full transition-transform duration-200 ease-out ${showCancelled ? 'translate-x-full' : ''}`}
              />
              <button
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer border-none bg-transparent transition-colors duration-200 z-10 ${!showCancelled ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setShowCancelled(false)}
              >
                Active
              </button>
              <button
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer border-none bg-transparent transition-colors duration-200 z-10 ${showCancelled ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setShowCancelled(true)}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton width={120} height={14} borderRadius={4} />
                    <Skeleton width={80} height={22} borderRadius={999} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton width={48} height={48} borderRadius={8} />
                    <div className="flex-1">
                      <Skeleton width="70%" height={12} borderRadius={4} />
                      <Skeleton width="40%" height={10} borderRadius={4} style={{ marginTop: 4 }} />
                    </div>
                    <Skeleton width={60} height={14} borderRadius={4} />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Skeleton width={100} height={14} borderRadius={4} />
                    <Skeleton width={90} height={12} borderRadius={4} />
                  </div>
                </div>
              ))}
            </div>
          ) : displayOrders.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-4">
                <FaBoxOpen className="text-gray-300 text-xl" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 m-0">No orders yet</h3>
              <p className="text-sm text-gray-400 mt-1">
                {showCancelled ? 'No cancelled orders' : 'Your orders will appear here'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between px-4 py-2.5 bg-white border-b border-gray-200 gap-3 max-sm:flex-col max-sm:items-start">
                    <div className="flex items-center gap-3 text-[11px] flex-wrap">
                      <span className="text-gray-400">
                        ORDER PLACED
                        <br />
                        <span className="text-gray-700 font-medium whitespace-nowrap">
                          {formatDate(ord.created_at)}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        TOTAL
                        <br />
                        <span className="text-gray-700 font-medium">
                          ${Number(ord.total_amount).toLocaleString()}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        SHIP TO
                        <br />
                        <span className="text-gray-700 font-medium truncate max-w-[100px] sm:max-w-[150px]">
                          {user?.name || 'You'}
                        </span>
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-gray-400">ORDER # {ord.id}</div>
                      <div
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-0.5 ${getStatusClasses(ord.status)}`}
                      >
                        {getStatusIcon(ord.status)}
                        <span>{ord.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-4 py-3">
                    {ord.order_items?.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50/50 transition-colors -mx-4 px-4"
                        onClick={() => handleOrderClick(ord.id)}
                      >
                        <img
                          className="w-14 h-14 object-contain shrink-0"
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                          alt=""
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.products.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 shrink-0">
                          ${(item.price_each * item.quantity).toFixed(2)}
                        </div>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#d1d5db"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="shrink-0"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    ))}
                    {ord.order_items?.length > 3 && (
                      <div className="text-center pt-2">
                        <span className="text-xs font-medium text-gray-400">
                          +{ord.order_items.length - 3} more item
                          {ord.order_items.length - 3 > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span>Delivery:</span>
                      <span className="font-medium text-gray-700">
                        {formatDate(ord.delivery_date || ord.estimated_date)}
                      </span>
                    </div>
                    <button
                      className="text-xs font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-4 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleOrderClick(ord.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel Overlay */}
        {panelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20" onClick={handleClose} />
            <div
              className={`relative w-full max-w-[580px] bg-white shadow-2xl h-full overflow-y-auto pt-16 transform transition-transform duration-300 ease-out ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-transparent border-none cursor-pointer hover:text-gray-900"
                  onClick={handleClose}
                >
                  <FaArrowLeft className="text-xs" />
                  Back
                </button>
                <button
                  className="text-sm font-medium text-gray-900 bg-transparent border-none cursor-pointer"
                  onClick={() => window.print()}
                >
                  Print
                </button>
              </div>

              {detailLoading ? (
                <div className="p-5">
                  <Skeleton width={80} height={22} borderRadius={4} style={{ marginBottom: 12 }} />
                  <Skeleton width={140} height={12} borderRadius={4} style={{ marginBottom: 20 }} />
                  <Skeleton height={10} borderRadius={4} style={{ marginBottom: 16 }} />
                  <div className="flex justify-between mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div className="flex flex-col items-center" key={i}>
                        <Skeleton circle width={24} height={24} />
                        <Skeleton width={40} height={8} borderRadius={4} style={{ marginTop: 4 }} />
                      </div>
                    ))}
                  </div>
                  <Skeleton width={100} height={10} borderRadius={4} style={{ marginBottom: 12 }} />
                  <Skeleton width="80%" height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width="60%" height={12} borderRadius={4} style={{ marginBottom: 20 }} />
                  <Skeleton width={100} height={10} borderRadius={4} style={{ marginBottom: 12 }} />
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div className="flex items-center gap-3 py-2 border-b border-gray-100" key={i}>
                      <Skeleton width={40} height={40} borderRadius={8} />
                      <div className="flex-1">
                        <Skeleton width="80%" height={12} borderRadius={4} />
                        <Skeleton
                          width="40%"
                          height={10}
                          borderRadius={4}
                          style={{ marginTop: 3 }}
                        />
                      </div>
                      <Skeleton width={50} height={14} borderRadius={4} />
                    </div>
                  ))}
                </div>
              ) : order ? (
                <div className="p-5">
                  {/* Order Header */}
                  <div className="mb-5">
                    <div className="text-xs font-mono font-medium text-gray-400 mb-1">
                      #{order?.tracking_number}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPillClasses(statusKey)}`}
                      >
                        {order?.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {STATUS_DESC[order?.status] ?? ''}
                      </span>
                    </div>
                  </div>

                  {/* Tracking */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 m-0">
                      Tracking
                    </p>
                    <div className="relative flex justify-between items-start pb-1">
                      <div className="absolute top-[11px] left-[10%] h-[2px] bg-gray-100 w-[80%] rounded-sm" />
                      <div
                        className="absolute top-[11px] left-[10%] h-[2px] bg-gray-900 rounded-sm transition-all duration-400"
                        style={{ width: `${progressPct}%` }}
                      />
                      {TRACK_STEPS.map((step, i) => {
                        const done = STATUS_DONE_MAP[step]?.(order?.status);
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 z-[1] flex-1">
                            <div
                              className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-colors ${
                                done
                                  ? 'bg-gray-900 border-gray-900 text-white'
                                  : 'bg-white border-gray-200 text-gray-300'
                              }`}
                            >
                              {done ? '✓' : i + 1}
                            </div>
                            <div
                              className={`text-[8px] font-semibold text-center max-w-[48px] leading-tight ${done ? 'text-gray-900' : 'text-gray-400'}`}
                            >
                              {step}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="border-t border-gray-100 m-0 mb-5" />

                  {/* Shipping */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 m-0">
                      Shipping Address
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                      <FaUser className="text-gray-300 text-xs shrink-0" />
                      <span>{user?.name}</span>
                    </div>
                    {address && (
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <FaMapMarkerAlt className="text-gray-300 text-xs shrink-0 mt-0.5" />
                        <span>
                          {address.addressLine1}
                          {address.state ? `, ${address.state}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <hr className="border-t border-gray-100 m-0 mb-5" />

                  {/* Payment */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 m-0">
                      Payment
                    </p>
                    {order?.orderpayments_logs?.map((l, i) => (
                      <div className="flex items-center gap-2 text-sm mb-1" key={i}>
                        <span className="text-base text-gray-700">
                          {getPaymentIcon(l.payment_method)}
                        </span>
                        <span className="font-semibold text-gray-900">${l.amount}</span>
                        <span className="text-xs text-gray-400">{l.status}</span>
                      </div>
                    ))}
                  </div>

                  <hr className="border-t border-gray-100 m-0 mb-5" />

                  {/* Items */}
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 m-0">
                      Items
                    </p>
                    {order?.order_items?.map((item, i) => (
                      <div
                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0"
                        key={i}
                      >
                        <div className="w-[44px] h-[44px] overflow-hidden shrink-0">
                          <img
                            className="w-full h-full object-contain"
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                            alt={item.products?.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 m-0 truncate">
                            {item.products?.name}
                          </p>
                          <p className="text-xs text-gray-400 m-0">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-bold text-gray-900 shrink-0">
                          ${(item.price_each * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Total Paid</span>
                    <span className="text-lg font-extrabold text-gray-900">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
