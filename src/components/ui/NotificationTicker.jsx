import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../../context/authContext';
import { PUSHER_APP_KEY, PUSHER_CLUSTER } from '../../config/env';
import { supabase } from '../../supaBaseClient';
import { IoMdCheckmark } from 'react-icons/io';
import { FiBell } from 'react-icons/fi';

const TICKER_SIZE = 8;

const NotificationTicker = () => {
  const { user, getNotificationsByUserId } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0);
  const hasSeenRef = useRef(false);
  const pendingTimers = useRef([]);
  const seenTimer = useRef(null);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (!error) {
      setUnreadCount(count || 0);
      unreadCountRef.current = count || 0;
    }
  };

  const markAllSeen = async () => {
    if (hasSeenRef.current || !user?.id || unreadCountRef.current === 0) return;
    hasSeenRef.current = true;

    seenTimer.current = setTimeout(async () => {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(0);
      unreadCountRef.current = 0;
      hasSeenRef.current = false;
    }, 2000);
  };

  const cancelMarkSeen = () => {
    if (seenTimer.current) {
      clearTimeout(seenTimer.current);
      seenTimer.current = null;
      hasSeenRef.current = false;
    }
  };

  useEffect(() => {
    if (!user?.id) return undefined;

    const load = async () => {
      const data = await getNotificationsByUserId(0, TICKER_SIZE - 1);
      setItems(data || []);
    };
    load();
    fetchUnreadCount().then(() => {
      setTimeout(() => markAllSeen(), 2000);
    });

    const pusher = new Pusher(PUSHER_APP_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });
    const channel = pusher.subscribe(`user-${user.id}`);

    channel.bind('order-placed', (data) => {
      const timer = setTimeout(() => {
        setItems((prev) =>
          [
            {
              id: Date.now(),
              order_id: data.orderId,
              message: data.message,
              type: data.type,
              created_at: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, TICKER_SIZE)
        );
        setUnreadCount((c) => c + 1);
        unreadCountRef.current += 1;
      }, 1000);
      pendingTimers.current.push(timer);
    });

    return () => {
      pendingTimers.current.forEach(clearTimeout);
      pendingTimers.current = [];
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;
  if (items.length === 0) return null;

  const groups = items.length > 0 ? [items] : [];

  return (
    <div className="notif-ticker" onMouseEnter={markAllSeen} onMouseLeave={cancelMarkSeen}>
      <span className="notif-ticker-badge">
        <FiBell size={14} />
        {unreadCount > 0 && (
          <span className="notif-ticker-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </span>
      <div className="notif-ticker-viewport">
        {items.length === 0 ? (
          <span className="notif-ticker-empty">No new updates</span>
        ) : (
          <div className="notif-ticker-track" key={items.length}>
            {groups.map((group, g) => (
              <div className="notif-ticker-group" key={g}>
                {group.map((n) => (
                  <button
                    type="button"
                    className="notif-ticker-item"
                    key={`${g}-${n.id}`}
                    onClick={() => n.order_id && window.open(`/orders/${n.order_id}`, '_self')}
                  >
                    <IoMdCheckmark className="tick-icon" />
                    <span dangerouslySetInnerHTML={{ __html: n.message }} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationTicker;
