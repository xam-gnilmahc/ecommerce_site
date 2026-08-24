import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../../context/authContext';
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from '../../config/env';
import { FaCheckCircle } from 'react-icons/fa';
import { FiBell, FiSettings } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { IoIosNotifications } from 'react-icons/io';
import { supabase } from '../../supaBaseClient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const PAGE_SIZE = 10; // number of notifications to load per batch

const NotificationPage = () => {
  const { user, getNotificationsByUserId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1); // page number for pagination
  const [unreadCount, setUnreadCount] = useState(0);

  const containerRef = useRef();
  const listRef = useRef();

  const fetchUnreadCount = async () => {
    if (!user?.id) return;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setUnreadCount(count || 0);
    }
  };

  // Fetch notifications in pages
  const fetchNotifications = async (pageNum) => {
    try {
      setLoadingMore(true);

      const start = (pageNum - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const newItems = await getNotificationsByUserId(start, end);

      setNotifications((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));

      setHasMore(newItems.length === PAGE_SIZE); // if less than PAGE_SIZE, no more data

      setLoadingMore(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    // Setup Pusher for real-time updates (same as before)
    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind('order-placed', (data) => {
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
      setUnreadCount((prev) => prev + 1);
    });

    // Fetch first page
    fetchNotifications(1);
    fetchUnreadCount();

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]);

  // Handle clicks outside dropdown to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  const handleBellClick = async () => {
    const wasOpen = open;
    setOpen((prev) => !prev);

    if (!wasOpen) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) throw error;

        fetchUnreadCount();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark all as read:', err.message);
      }
    }
  };

  return (
    <div className="notification-wrapper" ref={containerRef}>
      {/* BELL */}

      <button className="notification-bell" onClick={handleBellClick}>
        {open ? <IoIosNotifications size={22} /> : <FiBell size={20} />}

        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* DROPDOWN */}

      {open && (
        <div className="notification-dropdown">
          {/* HEADER */}

          <div className="notification-header">
            <h4>Notifications</h4>

            <button
              type="button"
              className="notification-settings-btn"
              onClick={() => window.open('/settings', '_self')}
              aria-label="Notification settings"
            >
              <FiSettings size={17} />
            </button>
          </div>

          {/* LIST */}

          <div className="notification-list" ref={listRef} onScroll={onScroll}>
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(({ id, order_id, message, created_at, type }) => (
                <div
                  key={id}
                  className="notification-item"
                  onClick={() => window.open(`/orders/${order_id}`, '_blank')}
                >
                  <div className="notification-icon">
                    <IoMdCheckmark />
                  </div>

                  <div className="notification-content">
                    <div className="notification-top">
                      <h5>
                        {type === 0
                          ? 'New Order'
                          : type === 1
                            ? 'Out for delivery'
                            : 'Order update'}
                      </h5>

                      <span>{dayjs(created_at).fromNow()}</span>
                    </div>

                    <p
                      dangerouslySetInnerHTML={{
                        __html: message,
                      }}
                    />
                  </div>
                </div>
              ))
            )}

            {loadingMore && <div className="notification-loading">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
