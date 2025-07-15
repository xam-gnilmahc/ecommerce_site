import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { useAuth } from "../context/authContext";
import { FaCheckCircle } from "react-icons/fa";
import { FiBell, FiSettings } from "react-icons/fi"; // ✅ Notification bell icon
import { IoMdCheckmark } from "react-icons/io";
import { IoIosNotifications } from "react-icons/io";
import { supabase } from "../supaBaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const PAGE_SIZE = 10; // number of notifications to load per batch

const NotificationPage = () => {
  const { user, getNotificationsByUserId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); // page number for pagination

  const containerRef = useRef();
  const listRef = useRef();

  // Fetch notifications in pages
  const fetchNotifications = async (pageNum) => {
    try {
      setLoadingMore(true);

      const start = (pageNum - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const newItems = await getNotificationsByUserId(start, end);

      setNotifications((prev) =>
        pageNum === 1 ? newItems : [...prev, ...newItems]
      );

      setHasMore(newItems.length === PAGE_SIZE); // if less than PAGE_SIZE, no more data

      setLoadingMore(false);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    if (!user?.id) return;

    // Setup Pusher for real-time updates (same as before)
    const pusher = new Pusher("8a749302cc2bbbaf87b5", {
      cluster: "ap1",
      encrypted: true,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind("order-placed", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          order_id: data.orderId,
          message: data.message,
          type: data.type,
          read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    // Fetch first page
    fetchNotifications(1);

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]);

  // Handle clicks outside dropdown to close
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

  // Infinite scroll handler
  const onScroll = () => {
    if (!listRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    // When user scrolls near bottom (e.g. 100px from bottom)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Fetch more when page changes (except first load)
  useEffect(() => {
    if (page === 1) return; // already loaded page 1 on mount
    fetchNotifications(page);
  }, [page]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (id, orderId) => {
    window.open(`/orders/${orderId}`, "_blank");
  };

  const handleBellClick = async () => {
    const wasOpen = open;
    setOpen((prev) => !prev);

    if (!wasOpen) {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) {
        try {
          await supabase
            .from("notifications")
            .update({ read: true })
            .in("id", unreadIds);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (err) {
          console.error("Failed to mark all as read:", err.message);
        }
      }
    }
  };

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      <div
        onClick={handleBellClick}
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#e7f1fb")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        <div style={{ position: "relative" }}>
          {open ? <IoIosNotifications size={30} /> : <FiBell size={25} />}
          {unreadCount > 0 && (
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-black"
              style={{
                transform: "translate(-50%, 10%)",
                fontSize: "0.65rem",
                padding: "4px 6px",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
      {open && (
        <div
          className="notification-dropdown card border"
          style={{
            position: "absolute",
            top: "2.5rem",
            left: "50%",
            transform: "translateX(-50%) translateY(-10px)",
            width: "450px",
            height: "450px",
            zIndex: 1050,
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            opacity: 0,
            animation: "fadeSlideIn 0.3s ease forwards",
          }}
        >
          <div className="card-header bg-white  d-flex justify-content-between py-3 align-items-center">
            <h6 className="mb-0">Notifications</h6>
            <FiSettings
              size={18}
              style={{ cursor: "pointer" }}
              title="Notification Settings"
              onClick={() => alert("Open settings panel here")}
            />
          </div>

          <ul
            className="list-group list-group-flush"
            style={{ overflowY: "auto", flex: 1 }}
            ref={listRef}
            onScroll={onScroll}
          >
            {notifications.length === 0 ? (
              <li className="list-group-item text-center text-muted py-3">
                No notifications to show.
              </li>
            ) : (
              notifications.map(
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
                      backgroundColor: "white",
                    }}
                    onClick={() => handleNotificationClick(id, order_id)}
                  >
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        cursor: "pointer",
                        backgroundColor: "#FCF7FA",
                      }}
                    >
                      <IoMdCheckmark size={20} style={{ marginTop: "4px" }} />
                    </div>
                    <div style={{ flex: 1 }}>
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
                      <div style={{ fontSize: "0.85rem", color: "black" }}>
                        <span dangerouslySetInnerHTML={{ __html: message }} />
                      </div>
                    </div>
                  </li>
                )
              )
            )}
            {/* Loading indicator at bottom */}
            {loadingMore && (
              <li className="list-group-item text-center text-muted py-3">
                Loading more notifications...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
