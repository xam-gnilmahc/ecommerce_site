import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FiBell, FiSettings } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { useAuth } from '../../context/authContext';
import { supabase } from '../../supaBaseClient';
import { fetchNotifications } from '../../tanstack/notifications.ts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PAGE_SIZE = 10;
const REFRESH_INTERVAL = 15000;

const NavbarBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const wrapperRef = useRef(null);
  const openRef = useRef(false);
  const busyRef = useRef(false);
  const pageRef = useRef(0);
  const loadedRef = useRef(false);
  const lastFetchRef = useRef(0);

  /* ── unread badge (shared cache for desktop + mobile instances) ── */
  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications-unread', user?.id],
    enabled: !!user?.id,
    staleTime: REFRESH_INTERVAL,
    queryFn: async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      return count || 0;
    },
  });

  /* ── fetch items from 0..count-1 (used for first load + refresh) ── */
  const load = async (count) => {
    if (busyRef.current || !user?.id || count < 1) return;
    busyRef.current = true;
    if (count <= PAGE_SIZE) setLoading(true);
    else setLoadingMore(true);
    try {
      const fresh = await fetchNotifications(user.id, 0, count - 1);
      setItems(fresh);
      pageRef.current = Math.ceil(fresh.length / PAGE_SIZE);
      setHasMore(fresh.length === count);
      loadedRef.current = true;
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      busyRef.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /* ── infinite scroll: append next batch ── */
  const loadMore = async () => {
    if (busyRef.current || !hasMore || !user?.id) return;
    busyRef.current = true;
    setLoadingMore(true);
    try {
      const start = pageRef.current * PAGE_SIZE;
      const next = await fetchNotifications(user.id, start, start + PAGE_SIZE - 1);
      setItems((prev) => [...prev, ...next]);
      pageRef.current += 1;
      setHasMore(next.length === PAGE_SIZE);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      busyRef.current = false;
      setLoadingMore(false);
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
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', user.id] });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const openPopup = () => {
    if (openRef.current) return;
    openRef.current = true;
    setOpen(true);
    if (!loadedRef.current) {
      load(PAGE_SIZE);
    } else if (Date.now() - lastFetchRef.current > REFRESH_INTERVAL) {
      load(Math.max(pageRef.current, 1) * PAGE_SIZE);
    }
  };

  const closePopup = () => {
    if (!openRef.current) return;
    openRef.current = false;
    setOpen(false);
    markAllRead();
  };

  const togglePopup = () => {
    if (openRef.current) closePopup();
    else openPopup();
  };

  /* close when clicking outside */
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) closePopup();
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onListScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) loadMore();
  };

  const openItem = (orderId) => {
    if (orderId) navigate(`/orders/${orderId}`);
    closePopup();
  };

  if (!user) return null;

  return (
    <div className="notif-nav" ref={wrapperRef}>
      <button
        type="button"
        className="nav-action notif-nav__btn"
        onClick={togglePopup}
        aria-label="Notifications"
      >
        <FiBell className="nav-action__icon" />
        {unread > 0 && <span className="notification-count">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notification-dropdown">
          {/* HEADER */}
          <div className="notification-header">
            <h4>Notifications</h4>

            <button
              type="button"
              className="notification-settings-btn"
              onClick={() => {
                closePopup();
                navigate('/settings');
              }}
              aria-label="Notification settings"
            >
              <FiSettings size={17} />
            </button>
          </div>

          {/* LIST — infinite scroll */}
          <div className="notification-list" onScroll={onListScroll}>
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : items.length === 0 ? (
              <div className="notification-empty">
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              items.map(({ id, order_id, message, created_at, type }) => (
                <div key={id} className="notification-item" onClick={() => openItem(order_id)}>
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

                    <p dangerouslySetInnerHTML={{ __html: message }} />
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

export default NavbarBell;
