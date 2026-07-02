import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../../context/authContext';
import { FaCheckCircle } from 'react-icons/fa';
import { FiBell, FiSettings } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { IoIosNotifications } from 'react-icons/io';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotifications, useUnreadNotificationCount, useMarkNotificationsAsRead } from '../../hooks/useNotifications.ts';
dayjs.extend(relativeTime);

const NotificationPage = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef();
  const listRef = useRef();

  // TanStack Query hooks
  const {
    data: notificationsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNotifications(user?.id);

  const { data: unreadCount = 0 } = useUnreadNotificationCount(user?.id);
  const markAsReadMutation = useMarkNotificationsAsRead();

  // Flatten all pages into a single array
  const notifications = notificationsData?.pages?.flatMap((page) => page.data) ?? [];

  // Pusher for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher('8a749302cc2bbbaf87b5', {
      cluster: 'ap1',
      encrypted: true,
    });

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind('order-placed', (data) => {
      // Invalidate queries to refetch notifications
      // The QueryClient will handle the cache update
    });

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
    if (!listRef.current || isFetchingNextPage || !hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      fetchNextPage();
    }
  };

  const handleBellClick = async () => {
    const wasOpen = open;
    setOpen((prev) => !prev);

    if (!wasOpen && user?.id) {
      markAsReadMutation.mutate(user.id);
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

            <FiSettings size={18} />
          </div>

          {/* LIST */}

          <div className="notification-list" ref={listRef} onScroll={onScroll}>
            {isLoading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
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

            {isFetchingNextPage && <div className="notification-loading">Loading...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
