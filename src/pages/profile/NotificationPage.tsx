import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from '../../config/env';
import { FiBell, FiSettings, FiShoppingBag, FiTruck, FiRefreshCw } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { supabase } from '../../supaBaseClient';
import { fetchNotifications } from '../../tanstack/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import './notificationPage.css';
dayjs.extend(relativeTime);

const PAGE_SIZE = 10;

interface Notification {
  id: number;
  order_id: number | null;
  message: string;
  type: number;
  read: boolean;
  created_at: string;
}

const TYPE_META = [
  { label: 'New order', Icon: FiShoppingBag },
  { label: 'Out for delivery', Icon: FiTruck },
  { label: 'Order update', Icon: FiRefreshCw },
];

const NotificationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchingRef = useRef(false);

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

  const fetchNotificationsPage = async (pageNum: number) => {
    fetchingRef.current = true;
    try {
      if (pageNum === 1) setInitialLoading(true);
      setLoadingMore(true);

      const start = (pageNum - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const newItems = await fetchNotifications(user!.id, start, end);

      setNotifications((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));

      setHasMore(newItems.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      fetchingRef.current = false;
      setLoadingMore(false);
      setInitialLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    // Hide the button right away instead of after the round trip.
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read:', (err as Error).message);
      fetchUnreadCount();
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    } as ConstructorParameters<typeof Pusher>[1]);

    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind('order-placed', (data: any) => {
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

    fetchNotificationsPage(1);
    fetchUnreadCount();

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]);

  // Fetch more when page changes (except first load)
  useEffect(() => {
    if (page === 1) return;
    fetchNotificationsPage(page);
  }, [page]);

  // Infinite scroll on the document
  useEffect(() => {
    if (initialLoading || loadingMore || !hasMore) return;

    const onScroll = () => {
      if (fetchingRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - scrollTop - clientHeight < 320) {
        fetchingRef.current = true;
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [initialLoading, loadingMore, hasMore]);

  return (
    <div className="np-page">
      <div className="np-container">
        <header className="np-head">
          <div>
            <p className="np-eyebrow">Account</p>
            <div className="np-title-row">
              <h1 className="np-title">Notifications</h1>
              {!initialLoading && unreadCount > 0 && (
                <span className="np-unread-count">{unreadCount} unread</span>
              )}
            </div>
            <p className="np-subtitle">Order updates and delivery alerts</p>
          </div>

          <div className="np-actions">
            {unreadCount > 0 && (
              <button type="button" className="np-mark" onClick={markAllRead}>
                Mark all read
              </button>
            )}
            <button
              type="button"
              className="np-settings"
              onClick={() => navigate('/settings')}
              aria-label="Notification settings"
            >
              <FiSettings size={16} />
            </button>
          </div>
        </header>

        {initialLoading ? (
          <div className="np-list">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="np-item np-item--skeleton">
                <Skeleton width={40} height={40} style={{ flexShrink: 0 }} />
                <div className="np-content">
                  <Skeleton width={140} height={12} style={{ display: 'block', marginBottom: 8 }} />
                  <Skeleton width="80%" height={11} style={{ display: 'block' }} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="np-empty">
            <div className="np-empty__icon">
              <FiBell size={22} />
            </div>
            <p className="np-empty__title">No notifications yet</p>
            <p className="np-empty__hint">Order updates will appear here</p>
          </div>
        ) : (
          <div className="np-list">
            {notifications.map(({ id, order_id, message, created_at, type, read }) => {
              const meta = TYPE_META[type] || TYPE_META[0];
              const TypeIcon = meta.Icon;
              return (
                <article
                  key={id}
                  className={`np-item ${!read ? 'is-unread' : ''} ${order_id ? 'is-link' : ''}`}
                  onClick={() => order_id && navigate(`/orders/${order_id}`)}
                  role={order_id ? 'link' : undefined}
                  tabIndex={order_id ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (order_id && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      navigate(`/orders/${order_id}`);
                    }
                  }}
                >
                  <span className="np-icon">
                    <TypeIcon size={17} />
                  </span>

                  <div className="np-content">
                    <div className="np-top">
                      <h2 className="np-item-title">{meta.label}</h2>
                      <time className="np-time">{dayjs(created_at).fromNow()}</time>
                    </div>
                    <p
                      className="np-message"
                      dangerouslySetInnerHTML={{
                        __html: message,
                      }}
                    />
                    {order_id && (
                      <span className="np-link">
                        View order
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {!read && <span className="np-dot" aria-label="Unread" />}
                </article>
              );
            })}
          </div>
        )}

        {loadingMore && !initialLoading && <p className="np-loading">Loading more…</p>}
      </div>
    </div>
  );
};

export default NotificationPage;
