import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import {
  HiLocationMarker,
} from "react-icons/hi";
import Skeleton from "react-loading-skeleton";
import "./ordersPage.css";

const STATUSES = [
  "All",
  "Pending",
  "Confirmed",
  "Packed",
  "Shipped Out",
  "Out for Delivery",
  "Delivered",
];

const OrdersPage = () => {
  const { fetchUserOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    const loadOrders = async () => {
      try {
        setLoading(true);

        const data = await fetchUserOrders();

        setOrders(data || []);
      } catch (error) {
        console.error(error);
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

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter(
          (o) =>
            o.status?.toLowerCase() === filterStatus.toLowerCase()
        );

  return (
    <div className="orders-layout">
      <Sidebar />

      <main className="orders-main">
        {/* Header */}
        <div className="orders-header">
          <div>
            <h2>My Orders</h2>
            <p>Track, manage and review recent purchases</p>
          </div>

          <div className="orders-count">
            {orders.length} Orders
          </div>
        </div>

        {/* Status Tabs */}
        <div className="orders-tabs">
          {STATUSES.map((status) => {
            const count =
              status === "All"
                ? orders.length
                : orders.filter(
                    (o) =>
                      o.status?.toLowerCase() ===
                      status.toLowerCase()
                  ).length;

            return (
              <button
                key={status}
                className={`tab-btn ${
                  filterStatus === status ? "active" : ""
                }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="orders-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="modern-order-card" key={i}>
                <Skeleton height={24} width={120} />
                <Skeleton height={18} width={180} />
                <Skeleton height={120} />
                <Skeleton height={40} />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <FaBoxOpen size={45} />
            <h3>No Orders Found</h3>

            <p>
              Looks like there are no orders in this section.
            </p>

            <Link to="/" className="shop-btn">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const shippingAddress = parseAddress(
                order.shipping_address
              );

              const destination = `${shippingAddress?.country || ""
                }`;

              return (
                <div
                  key={order.id}
                  className="modern-order-card"
                  onClick={() =>
                    navigate(`/orders/${order.id}`)
                  }
                >
                  {/* top */}
                  <div className="order-top">
                    <div>
                      <p className="order-label">
                        ORDER #{order.id}
                      </p>

                      <h4>
                        {order.order_items?.length || 0} Items
                      </h4>
                    </div>

                    <div
                      className={`status-pill ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </div>

                  {/* timeline */}
                  <div className="timeline">
                    <div className="timeline-item active">
                      <FaCheckCircle />
                      <span>Placed</span>
                    </div>

                    <div className="line"></div>

                    <div
                      className={`timeline-item ${
                        order.status !== "Pending"
                          ? "active"
                          : ""
                      }`}
                    >
                      <FaBoxOpen />
                      <span>Packed</span>
                    </div>

                    <div className="line"></div>

                    <div
                      className={`timeline-item ${
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    >
                      <FaTruck />
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* products */}
                  <div className="product-preview">
                    {order.order_items
                      ?.slice(0, 3)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="product-item"
                        >
                          <img
                            src={`https://fzliiwigydluhgbuvnmr.supabase.co/storage/v1/object/public/productimages/${item.products.banner_url}`}
                            alt={item.products.name}
                          />

                          <div className="product-info">
                            <h5>
                              {item.products.name}
                            </h5>

                            <p>
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <strong>
                            $
                            {(
                              item.price_each *
                              item.quantity
                            ).toFixed(2)}
                          </strong>
                        </div>
                      ))}
                  </div>

                  {/* shipping */}
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

                  {/* footer */}
                  <div className="order-footer">
                    <div>
                      <p>Total</p>
                      <h3>
                        $
                        {Number(
                          order.total_amount
                        ).toLocaleString()}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                    >
                      View Order
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

const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "pending";

    case "confirmed":
    case "packed":
      return "processing";

    case "shipped out":
    case "out for delivery":
      return "shipping";

    case "delivered":
      return "delivered";

    default:
      return "";
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return <FaClock />;

    case "delivered":
      return <FaCheckCircle />;

    default:
      return <FaBoxOpen />;
  }
};

export default OrdersPage;