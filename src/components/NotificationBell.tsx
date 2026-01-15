import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { getCurrentUserDataKey } from '../security/keyAccess';
import { decryptField, isEncrypted } from '../security/secureFields';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type:
    | 'bid_won'
    | 'bid_placed'
    | 'auction_ending'
    | 'delivery_update'
    | 'payment'
    | 'wallet'
    | 'withdrawal_processed'
    | 'withdrawal_failed'
    | 'inspection_approved'
    | 'inspection_rejected'
    | 'inspection_pending'
    | 'inspection_needs_action'
    | 'system'
    | 'system_announcement';
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!showNotifications) return;
      if (e.key === 'Escape') {
        setShowNotifications(false);
        buttonRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (!showNotifications) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const dataKey = await getCurrentUserDataKey();

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      let items = data || [];
      if (dataKey) {
        items = await Promise.all(items.map(async (n: any) => ({
          ...n,
          title: isEncrypted(n.title) ? await decryptField(dataKey, n.title) : n.title,
          message: isEncrypted(n.message) ? await decryptField(dataKey, n.message) : n.message,
        })));
      }

      // Normalize read state: prefer read_at if present, else fall back to boolean read
      const normalized = (items || []).map((n: any) => ({
        ...n,
        read: !!(n.read_at || n.read),
      }));

      setNotifications(normalized as any);
      setUnreadCount(normalized?.filter((n: any) => !n.read).length || 0);

      const tableChannel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        }, async payload => {
          const newItem = payload.new as any;
          if (dataKey) {
            newItem.title = isEncrypted(newItem.title) ? await decryptField(dataKey, newItem.title) : newItem.title;
            newItem.message = isEncrypted(newItem.message) ? await decryptField(dataKey, newItem.message) : newItem.message;
          }
          const normalized = { ...newItem, read: !!(newItem.read_at || newItem.read) };
          setNotifications(prev => [normalized, ...prev]);
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      const userChannel = supabase.channel(`user:${session.user.id}`);
      userChannel.on('broadcast', { event: 'notification' }, async ({ payload }: any) => {
        const item = payload;
        if (dataKey) {
          item.title = isEncrypted(item.title) ? await decryptField(dataKey, item.title) : item.title;
          item.message = isEncrypted(item.message) ? await decryptField(dataKey, item.message) : item.message;
        }
        const normalized = { ...item, read: !!(item.read_at || item.read) };
        setNotifications(prev => [normalized, ...prev]);
        setUnreadCount(prev => prev + (normalized.read ? 0 : 1));
      }).subscribe();

      return () => {
        supabase.removeChannel(tableChannel);
        supabase.removeChannel(userChannel);
      };
    };

    const unsub = fetchNotifications();
    return () => {
      if (typeof unsub === 'function') (unsub as any)();
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (!error) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowNotifications(prev => !prev);
    } else if (e.key === 'ArrowDown' && showNotifications) {
      panelRef.current?.focus();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_won':
        return '\ud83c\udfc6';
      case 'bid_placed':
        return '\ud83d\udcb0';
      case 'auction_ending':
        return '\u23f0';
      case 'inspection_approved':
        return '\u2705';
      case 'inspection_rejected':
      case 'inspection_needs_action':
        return '\u26a0\ufe0f';
      case 'inspection_pending':
        return '\ud83d\uddd3\ufe0f';
      case 'delivery_update':
        return '\ud83d\udce6';
      case 'payment':
      case 'wallet':
      case 'withdrawal_processed':
      case 'withdrawal_failed':
        return '\ud83d\udcb3';
      default:
        return '\ud83d\udce2';
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={showNotifications}
        aria-controls="notification-panel"
        onKeyDown={onButtonKeyDown}
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
      >
        <Bell className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Open notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            ref={panelRef}
            id="notification-panel"
            role="menu"
            tabIndex={-1}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto" role="group">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                    role="menuitem"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t dark:border-gray-700 flex items-center justify-between gap-2">
              <Link
                to="/notifications"
                onClick={() => setShowNotifications(false)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all notifications
              </Link>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
