import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../../context/authContext';
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from '../../config/env';
import { FiBell, FiSettings, FiShoppingBag, FiTruck, FiRefreshCw } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { supabase } from '../../supaBaseClient';
import { fetchNotifications } from '../../tanstack/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
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
  { label: 'New Order', Icon: FiShoppingBag },
  { label: 'Out for delivery', Icon: FiTruck },
  { label: 'Order update', Icon: FiRefreshCw },
];

const NotificationPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);

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
      setLoadingMore(false);
      setInitialLoading(false);
    }
  };

  const markAllRead = async () => {
    if (!user?.id) return;
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
      console.error('Failed to mark all as read:', (err as Error).message);
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

  // Infinite scroll handler
  const onScroll = () => {
    if (!listRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Fetch more when page changes (except first load)
  useEffect(() => {
    if (page === 1) return;
    fetchNotificationsPage(page);
  }, [page]);

  return (
    <div className="notif-page">
      <div className="notification-dropdown notif-page__card">
        {/* HEADER */}
        <div className="notification-header">
          <h4>Notifications</h4>

          <div className="notification-header__actions">
            {unreadCount > 0 && (
              <button type="button" className="notification-mark" onClick={markAllRead}>
                Mark all read
              </button>
            )}

            <button
              type="button"
              className="notification-settings-btn"
              onClick={() => window.open('/settings', '_self')}
              aria-label="Notification settings"
            >
              <FiSettings size={17} />
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="notification-list" ref={listRef} onScroll={onScroll}>
          {initialLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="notification-item notification-item--skeleton">
                <Skeleton width={40} height={40} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Skeleton width="45%" height={12} style={{ display: 'block', marginBottom: 8 }} />
                  <Skeleton width="85%" height={11} style={{ display: 'block' }} />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty__icon">
                <FiBell size={22} />
              </div>
              <p className="notification-empty__title">No notifications yet</p>
              <p className="notification-empty__hint">Order updates will appear here</p>
            </div>
          ) : (
            notifications.map(({ id, order_id, message, created_at, type }) => {
              const meta = TYPE_META[type] || TYPE_META[0];
              const TypeIcon = meta.Icon;
              return (
                <div
                  key={id}
                  className="notification-item"
                  onClick={() => order_id && window.open(`/orders/${order_id}`, '_blank')}
                >
                  <div className="notification-icon">
                    <TypeIcon size={17} />
                  </div>
                  <div className="notification-content">
                    <div className="notification-top">
                      <h5>{meta.label}</h5>
                      <span>{dayjs(created_at).fromNow()}</span>
                    </div>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: message,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
          {loadingMore && !initialLoading && <div className="notification-loading">Loading...</div>}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
