import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, Calendar, Package, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | 'bid_won'
    | 'bid_placed'
    | 'bid_outbid'
    | 'auction_ending'
    | 'auction_started'
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
  read: boolean;
  created_at: string;
  auction_id?: string;
  metadata?: any;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [bidAlertsEnabled, setBidAlertsEnabled] = useState(true);
  const [auctionRemindersEnabled, setAuctionRemindersEnabled] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching notifications from Supabase:', error);
        return;
      }

      const mapped: Notification[] = (data || []).map((n: any) => ({
        id: n.id,
        title: n.title || 'Notification',
        message: n.message || '',
        type: n.type || 'system',
        // Prefer read_at if present, fall back to boolean read for older rows
        read: !!(n.read_at || n.read),
        created_at: n.created_at,
        auction_id: n.auction_id,
        metadata: n.metadata,
      }));

      setNotifications(mapped);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_preferences')
          .select('email_notifications, sms_notifications, bid_alerts, auction_reminders')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading notification preferences:', error);
        }

        if (data) {
          setEmailEnabled(!!data.email_notifications);
          setSmsEnabled(!!data.sms_notifications);
          setBidAlertsEnabled(!!data.bid_alerts);
          setAuctionRemindersEnabled(!!data.auction_reminders);
        }
      } catch (e) {
        console.error('Error fetching user preferences:', e);
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Realtime updates for new notifications while the page is open
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-page')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n: any = payload.new;
        const mapped: Notification = {
          id: n.id,
          title: n.title || 'Notification',
          message: n.message || '',
          type: n.type || 'system',
          read: !!(n.read_at || n.read),
          created_at: n.created_at,
          auction_id: n.auction_id,
          metadata: n.metadata,
        };

        setNotifications((prev) => [mapped, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSavePreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          email_notifications: emailEnabled,
          sms_notifications: smsEnabled,
          bid_alerts: bidAlertsEnabled,
          auction_reminders: auctionRemindersEnabled,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving notification preferences:', error);
        return;
      }
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id);

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_won':
        return { icon: <CheckCircle className="h-6 w-6" />, color: 'text-green-500', bg: 'bg-green-100' };
      case 'bid_placed':
        return { icon: <DollarSign className="h-6 w-6" />, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'auction_ending':
        return { icon: <AlertTriangle className="h-6 w-6" />, color: 'text-yellow-500', bg: 'bg-yellow-100' };
      case 'inspection_approved':
        return { icon: <CheckCircle className="h-6 w-6" />, color: 'text-emerald-500', bg: 'bg-emerald-100' };
      case 'inspection_rejected':
      case 'inspection_needs_action':
        return { icon: <AlertTriangle className="h-6 w-6" />, color: 'text-red-500', bg: 'bg-red-100' };
      case 'inspection_pending':
        return { icon: <Info className="h-6 w-6" />, color: 'text-indigo-500', bg: 'bg-indigo-100' };
      case 'delivery_update':
        return { icon: <Package className="h-6 w-6" />, color: 'text-purple-500', bg: 'bg-purple-100' };
      case 'wallet':
      case 'withdrawal_processed':
      case 'withdrawal_failed':
      case 'system':
      case 'system_announcement':
        return { icon: <Info className="h-6 w-6" />, color: 'text-gray-500', bg: 'bg-gray-100' };
      case 'payment':
        return { icon: <DollarSign className="h-6 w-6" />, color: 'text-green-500', bg: 'bg-green-100' };
      default:
        return { icon: <Bell className="h-6 w-6" />, color: 'text-gray-500', bg: 'bg-gray-100' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;

    if (typeFilter === 'bids') {
      const bidTypes: Notification['type'][] = ['bid_won', 'bid_placed', 'bid_outbid', 'auction_ending', 'auction_started'];
      if (!bidTypes.includes(n.type)) return false;
    } else if (typeFilter === 'inspections') {
      const inspectionTypes: Notification['type'][] = [
        'inspection_approved',
        'inspection_rejected',
        'inspection_pending',
        'inspection_needs_action',
      ];
      if (!inspectionTypes.includes(n.type)) return false;
    } else if (typeFilter !== 'all' && n.type !== typeFilter) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type Filter
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="bids">Bids Only</option>
              <option value="inspections">Inspections</option>
              <option value="bid_won">Bid Won</option>
              <option value="bid_placed">Bid Placed</option>
              <option value="auction_ending">Auction Ending</option>
              <option value="delivery_update">Delivery Updates</option>
              <option value="payment">Payment</option>
              <option value="wallet">Wallet & withdrawals</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'unread' ? 'All notifications have been read' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const iconData = getNotificationIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${
                  !notification.read ? 'border-l-4 border-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${iconData.bg}`}>
                    <div className={iconData.color}>
                      {iconData.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-medium ${
                          !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </div>
                          <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                            {notification.type.replace('_', ' ')}
                          </span>
                          {notification.auction_id && (
                            <Link
                              to={`/timed-auction/${notification.auction_id}`}
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              View auction
                            </Link>
                          )}
                          {(notification.type === 'wallet' || notification.type === 'withdrawal_processed' || notification.type === 'withdrawal_failed') && (
                            <Link
                              to="/wallet"
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              View wallet
                            </Link>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-indigo-600"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading}
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">SMS Notifications</h4>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading}
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Bid Alerts</h4>
                <p className="text-sm text-gray-500">Get notified when outbid</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading}
                checked={bidAlertsEnabled}
                onChange={(e) => setBidAlertsEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Auction Reminders</h4>
                <p className="text-sm text-gray-500">Reminders for ending auctions</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading}
                checked={auctionRemindersEnabled}
                onChange={(e) => setAuctionRemindersEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleSavePreferences}
            disabled={prefsLoading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;