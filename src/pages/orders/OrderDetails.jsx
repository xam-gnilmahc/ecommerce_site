import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import Skeleton from 'react-loading-skeleton';

import {
  FaMapMarkerAlt,
  FaUser,
  FaMoneyBillWave,
  FaCcVisa,
  FaGooglePay,
  FaApplePay,
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
  Pending: 'Your order is waiting for confirmation',
  Confirmed: 'Seller has confirmed your order',
  'Shipped Out': 'Your order is on the way',
  'Out for Delivery': 'Delivery partner is near you',
  Delivered: 'Order delivered successfully 🎉',
  Cancelled: 'Order has been cancelled',
};

const STATUS_PILL_CLASSES = {
  Pending: 'bg-[#fff7d6] text-[#946200]',
  Confirmed: 'bg-[#dbeafe] text-[#1d4ed8]',
  'Shipped Out': 'bg-[#ede9fe] text-[#6d28d9]',
  'Out for Delivery': 'bg-[#cffafe] text-[#0e7490]',
  Delivered: 'bg-[#dcfce7] text-[#15803d]',
  Cancelled: 'bg-[#fee2e2] text-[#dc2626]',
};

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { getOrderDetails, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getOrderDetails(orderId);
      setOrder(data);
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] p-4">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          <Skeleton height={160} borderRadius={24} />
          <Skeleton height={320} borderRadius={24} />
          <Skeleton height={200} borderRadius={24} />
        </div>
      </div>
    );
  }

  const parseAddress = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };
  const address = parseAddress(order?.shipping_address);

  const getPaymentIcon = (m) => {
    if (m === 0) return <FaCcVisa />;
    if (m === 1) return <FaGooglePay />;
    if (m === 2) return <FaApplePay />;
    return <FaMoneyBillWave />;
  };

  const total = order?.order_items?.reduce((a, b) => a + b.price_each * b.quantity, 0) ?? 0;

  const doneCount = TRACK_STEPS.filter((s) => STATUS_DONE_MAP[s]?.(order?.status)).length;
  const progressPct = doneCount <= 1 ? 0 : ((doneCount - 1) / (TRACK_STEPS.length - 1)) * 80;

  const pillClasses = STATUS_PILL_CLASSES[order?.status] || 'bg-gray-100 text-gray-600';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .od-print-area, .od-print-area * { visibility: visible; }
          .od-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .od-invoice-btn { display: none !important; }
        }
        .od-track-line-bg {
          position: absolute; top: 15px; left: calc(10% - 4px); right: calc(10% - 4px);
          height: 2px; background: #e5e7eb; z-index: 0;
        }
        .od-track-line-fill {
          position: absolute; top: 15px; left: calc(10% - 4px);
          height: 2px; background: #111827; z-index: 1;
          transition: width 0.6s ease;
        }
        .od-pill-dot::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: currentColor; opacity: 0.7;
        }
      `}</style>

      <div className="min-h-screen bg-[#f9fafb]">
        <div className="od-print-area mx-auto max-w-[800px] flex flex-col">
          <div className="bg-white rounded-none">
            {/* TOP BAND */}
            <div className="bg-[#111827] px-9 pt-8 pb-7 flex justify-between items-start gap-5 max-sm:flex-col max-sm:gap-5 max-sm:px-6 max-sm:pt-6 max-sm:pb-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold tracking-[4px] uppercase text-[#6b7280]">
                  UOM
                </span>
                <span className="text-2xl font-extrabold text-white tracking-tight leading-none">
                  Order Receipt
                </span>
              </div>

              <div className="flex flex-col items-end gap-1.5 max-sm:items-start">
                <span className="text-sm font-bold text-white/50 tracking-wide uppercase">
                  Order <span className="text-white">#{order?.id}</span>
                </span>
                <span className="text-xs text-white/35 tracking-wide">
                  {order?.tracking_number}
                </span>
                <button
                  className="od-invoice-btn mt-2 px-4 py-2.5 rounded-full border border-white/20 bg-transparent text-white/75 text-xs font-bold tracking-[1.5px] uppercase cursor-pointer transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/40"
                  onClick={() => window.print()}
                >
                  Print Invoice
                </button>
              </div>
            </div>

            {/* STATUS ROW */}
            <div className="py-4 px-9 flex items-center justify-between gap-3 border-b border-[#e5e7eb] bg-[#ffffff] max-sm:px-6 max-sm:py-3.5">
              <span
                className={`od-pill-dot inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase whitespace-nowrap ${pillClasses}`}
              >
                {order?.status}
              </span>
              <span className="text-sm text-[#6b7280]">{STATUS_DESC[order?.status] ?? ''}</span>
            </div>

            {/* TRACKING */}
            <div className="px-9 pt-8 pb-7 border-b border-[#e5e7eb] max-sm:px-6 max-sm:py-6">
              <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#6b7280] mb-6">
                Tracking
              </p>

              <div className="flex items-start justify-between relative pb-2">
                <div className="od-track-line-bg" />
                <div className="od-track-line-fill" style={{ width: `${progressPct}%` }} />

                {TRACK_STEPS.map((step, i) => {
                  const done = STATUS_DONE_MAP[step]?.(order?.status);
                  return (
                    <div
                      key={i}
                      className={`flex-1 text-center relative z-[2] flex flex-col items-center gap-2 min-w-[80px]`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 relative z-[2] ${
                          done
                            ? 'bg-[#111827] border-[#111827] text-white'
                            : 'bg-[#e5e7eb] border-[#e5e7eb] text-[#9ca3af]'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <div
                        className={`text-xs leading-[1.3] text-center ${
                          done ? 'text-[#111827] font-bold' : 'text-[#9ca3af] font-medium'
                        }`}
                      >
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="h-px border-0 border-t-2 border-dashed border-[#e5e7eb]" />

            {/* META GRID */}
            <div className="grid grid-cols-2 border-b border-[#e5e7eb] max-sm:grid-cols-1">
              {/* Shipping */}
              <div className="py-7 px-9 border-r border-[#e5e7eb] max-sm:px-6 max-sm:py-6 max-sm:border-r-0 max-sm:border-b max-sm:border-[#e5e7eb]">
                <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#6b7280] mb-3.5">
                  Shipping Address
                </p>
                <div className="flex items-center gap-[9px] text-sm text-[#374151] mb-2 leading-[1.4]">
                  <FaUser className="text-[#6b7280] shrink-0 text-sm" />
                  <span>{user?.name}</span>
                </div>
                {address && (
                  <div className="flex items-center gap-[9px] text-sm text-[#374151] mb-2 leading-[1.4]">
                    <FaMapMarkerAlt className="text-[#6b7280] shrink-0 text-sm" />
                    <span>
                      {address.addressLine1}
                      {address.state ? `, ${address.state}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="py-7 px-9 max-sm:px-6 max-sm:py-6">
                <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#6b7280] mb-3.5">
                  Payment
                </p>
                {order?.orderpayments_logs?.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 py-[9px] border-b border-dashed border-[#e5e7eb] text-sm text-[#374151] last:border-b-0 [&:last-child]:border-b-0"
                  >
                    <span className="text-lg text-[#6b7280]">
                      {getPaymentIcon(l.payment_method)}
                    </span>
                    <span className="font-bold text-[#111827]">${l.amount}</span>
                    <span className="ml-auto text-xs font-bold tracking-wider uppercase text-[#059669]">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="h-px border-0 border-t-2 border-dashed border-[#e5e7eb]" />

            {/* ITEMS */}
            <div className="py-7 px-9 border-b border-[#e5e7eb] max-sm:px-6 max-sm:py-6">
              <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#6b7280] mb-6">
                Items Ordered
              </p>

              {order?.order_items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3.5 border-b border-[#f3f4f6] last:border-b-0 [&:last-child]:border-b-0"
                >
                  <div className="w-[72px] h-[72px] shrink-0 rounded-xl bg-[#f3f4f6] border border-[#f3f4f6] flex items-center justify-center overflow-hidden p-1.5 max-sm:w-14 max-sm:h-14">
                    <img
                      className="w-full h-full object-contain"
                      src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                      alt={item.products?.name}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#111827] mb-1 whitespace-nowrap overflow-hidden text-ellipsis max-sm:text-xs">
                      {item.products?.name}
                    </p>
                    <p className="text-xs text-[#9ca3af]">Qty: {item.quantity}</p>
                  </div>

                  <div className="text-base font-bold text-[#111827] shrink-0">
                    ${(item.price_each * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="py-6 px-9 bg-[#f9fafb] flex justify-between items-center gap-5 max-sm:flex-col max-sm:items-start max-sm:px-6 max-sm:py-5 max-sm:gap-4">
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Thank you for your order.
                <br />
                Questions? Contact our support team.
              </p>

              <div className="flex flex-col items-end gap-0.5 max-sm:items-start">
                <span className="text-[10px] font-bold tracking-[2px] uppercase text-[#9ca3af]">
                  Total Paid
                </span>
                <span className="text-2xl font-extrabold text-[#111827] tracking-tighter">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsPage;
