import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "./ordersPage.css";
import Navbar from "../components/Navbar.jsx";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTruck,
} from "react-icons/fa";

const OrdersPage = () => {
  const { fetchUserOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const load = async () => {
      setLoading(true);
      const data = await fetchUserOrders();
      setOrders(data || []);
      setLoading(false);
    };

    load();
  }, []);

  const formatDate = (d) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return <FaClock />;

    case "confirmed":
    case "packed":
      return <FaBoxOpen />;

    case "shipped out":
      return <FaTruck />;

    case "delivered":
      return <FaCheckCircle />;

    default:
      return <FaBoxOpen />;
  }
};

  return (
    <>
      <Navbar />

      <div className="orders-layout">
        <main className="orders-main">

          {loading ? (
            <div className="order-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <div className="order-card" key={i}>
                  <Skeleton height={18} width={160} />
                  <Skeleton height={80} />
                  <Skeleton height={40} />
                </div>
              ))}
            </div>
          ) : (
            <div className="order-list">

              {orders.map((order) => (
                <div className="order-card"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >

                  {/* HEADER */}
                  <div className="order-top">

                    <div>
                      <div className="tracking">
                        Tracking: {order.tracking_number || "N/A"}
                      </div>
                    </div>

                    <div className={`status ${order.status?.toLowerCase()}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </div>

                  </div>

                  {/* PRODUCTS */}
                  <div className="product-list">
                    {order.order_items?.slice(0, 2).map((item, i) => (
                      <div className="product-row" key={i}>
                        <img
                          src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                          alt=""
                        />

                        <div className="product-info">
                          <div className="name">{item.products.name}</div>
                          <div className="qty">Qty: {item.quantity}</div>
                        </div>

                        <div className="price">
                          ${(item.price_each * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="order-footer">

                    <div className="total">
                      Total: ${Number(order.total_amount).toLocaleString()}
                    </div>

                    <div className="delivery-right">
                      <span>Delivery:</span>
                      <strong>{formatDate(order.delivery_date || order.estimated_date)}</strong>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default OrdersPage;