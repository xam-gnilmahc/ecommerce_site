import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { useAuth } from "../context/authContext";
import { FaCheckCircle } from "react-icons/fa";
import { supabase } from "../supaBaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const NotificationPage = () => {
  const { user, getNotificationsByUserId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'read' | 'unread'
  const containerRef = useRef();

  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher("8a749302cc2bbbaf87b5", {
      cluster: "ap1",
      encrypted: true,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    // Realtime listener
    channel.bind("order-placed", (data) => {
      console.log(data);
      setNotifications((prev) => [
        {
          id: Date.now(),
          orderId: data.orderId,
          message: data.message,
          type:data.type,
          read: false,
        },
        ...prev,
      ]);
    });

    // Fetch initial notifications
    (async () => {
      const data = await getNotificationsByUserId();
      setNotifications(data);
    })();

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filteredNotifications =
    filter === "read"
      ? notifications.filter((n) => n.read)
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (id, orderId) => {
    // Update in database
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Open order details in new tab
    window.open(`/orders/${orderId}`, "_blank");
  };

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      {/* Bell Icon */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="position-relative"
        style={{ fontSize: "1.5rem", cursor: "pointer" }}
        aria-label="Toggle notifications"
      >
        🔔
        {notifications.length > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{
              fontSize: "0.65rem",
              padding: "4px 6px",
              minWidth: "20px",
              textAlign: "center",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
       <div
  className="card border"
  style={{
    position: "absolute",
    top: "2.5rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: "420px",
    height: "400px",
    zIndex: 1050,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
  }}
>

          {/* Fixed Header */}
          <div
            className="card-header bg-secondary text-white"
            style={{ flexShrink: 0 }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Notifications</h6>
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
              />
            </div>
            <div className="mt-2 d-flex gap-2">
              <button
                onClick={() => setFilter("unread")}
                className={`btn btn-sm ${
                  filter === "unread" ? "btn-light" : "btn-outline-light"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`btn btn-sm ${
                  filter === "read" ? "btn-light" : "btn-outline-light"
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`btn btn-sm ${
                  filter === "all" ? "btn-light" : "btn-outline-light"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Scrollable List */}
          <ul
            className="list-group list-group-flush"
            style={{
              overflowY: "auto",
              flex: 1,
            }}
          >
            {filteredNotifications.length === 0 ? (
              <li className="list-group-item text-center text-muted py-3">
                No notifications to show.
              </li>
            ) : (
              filteredNotifications.map(
                ({ id, order_id, message, read, created_at, type }) => (
                  <li
  key={id}
  className="list-group-item"
  style={{
    border: "none",
    borderBottom: "1px solid #dee2e6",
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  }}
  onClick={() => handleNotificationClick(id, order_id)}
>

                    {/* Left check icon */}
                    <FaCheckCircle
                      size={20}
                      className={read ? "text-success" : "text-secondary"}
                      style={{ marginTop: "4px" }}
                    />

                    {/* Message content */}
                    <div style={{ flex: 1 }}>
                      {/* Top row: Title and time */}
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ marginBottom: "4px" }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "black",
                          }}
                        >
                         
                          {type === 0
                            ? "New order placed"
                            : type === 1
                            ? "Out for delivery today"
                            : "Order update"}
                        </div>

                        <div style={{ fontSize: "0.75rem", color: "black" }}>
                          {dayjs(created_at).fromNow()}
                        </div>
                      </div>

                      {/* Body message */}
                      <div style={{ fontSize: "0.85rem", color: "black" }}>
                        <span dangerouslySetInnerHTML={{ __html: message }} />
                      </div>
                    </div>

                    {/* Red dot if unread */}
                    {!read && (
                      <span
                        className="badge bg-danger"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          marginTop: "6px",
                        }}
                      />
                    )}
                  </li>
                )
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
