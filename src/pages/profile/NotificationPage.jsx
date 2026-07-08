import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../../context/authContext';
import { FaCheckCircle } from 'react-icons/fa';
import { FiBell, FiSettings } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { IoIosNotifications } from 'react-icons/io';
import { supabase } from '../../supaBaseClient';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const PAGE_SIZE = 10;

const NotificationPage = () => {
  const { user, getNotificationsByUserId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
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

  const fetchNotifications = async (pageNum) => {
    try {
      setLoadingMore(true);

      const start = (pageNum - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const newItems = await getNotificationsByUserId(start, end);

      setNotifications((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));

      setHasMore(newItems.length === PAGE_SIZE);

      setLoadingMore(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const pusher = new Pusher('8a749302cc2bbbaf87b5', {
      cluster: 'ap1',
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

    fetchNotifications(1);
    fetchUnreadCount();

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?.id]);

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

  const onScroll = () => {
    if (!listRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollHeight - scrollTop - clientHeight < 100) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (page === 1) return;
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
    <>
      <style>{`
        .notif-scrollbar::-webkit-scrollbar { width: 6px; }
        .notif-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .notif-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        .notif-msg-content a {
          color: #111827;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid #111827;
          transition: opacity 0.2s ease;
        }
        .notif-msg-content a:hover { opacity: 0.7; }
      `}</style>

      <div className="relative" ref={containerRef}>
        <button
          className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center relative cursor-pointer transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
          onClick={handleBellClick}
        >
          {open ? <IoIosNotifications size={22} /> : <FiBell size={20} />}

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-px min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-[5px]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute top-[50px] right-0 w-[320px] h-[400px] bg-white border border-gray-200 rounded-[14px] overflow-hidden z-[5000] flex flex-col md:w-[400px] md:h-[450px] md:right-0">
            <div className="h-14 px-4 border-b border-gray-100 flex items-center justify-between">
              <h4 className="m-0 text-base font-semibold">Notifications</h4>
              <FiSettings size={18} />
            </div>

            <div
              className="flex-1 overflow-y-auto notif-scrollbar"
              ref={listRef}
              onScroll={onScroll}
            >
              {notifications.length === 0 ? (
                <div className="py-10 px-5 text-center text-gray-400">No notifications</div>
              ) : (
                notifications.map(({ id, order_id, message, created_at, type }) => (
                  <div
                    key={id}
                    className="flex gap-4 p-4 border-b border-gray-100 cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                    onClick={() => window.open(`/orders/${order_id}`, '_blank')}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
                      <IoMdCheckmark />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-1">
                        <h5 className="m-0 text-sm font-semibold text-primary">
                          {type === 0
                            ? 'Order Update'
                            : type === 1
                              ? 'Out for Delivery'
                              : 'Order Update'}
                        </h5>

                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {dayjs(created_at).fromNow()}
                        </span>
                      </div>

                      <div
                        className="notif-msg-content text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: message,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}

              {loadingMore && (
                <div className="py-10 px-5 text-center text-gray-400">Loading...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPage;
