import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { Bell } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [bidAlertsEnabled, setBidAlertsEnabled] = useState(true);
  const [auctionRemindersEnabled, setAuctionRemindersEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
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
        setSaveMessage('Failed to save preferences. Please try again.');
        return;
      }

      setSaveMessage('Preferences saved successfully.');
    } catch (e) {
      console.error('Error saving preferences:', e);
      setSaveMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-7 w-7 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control how you receive alerts about bids, auctions, and wallet activity.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Email notifications</h4>
                <p className="text-sm text-gray-500">Receive auction and wallet updates via email.</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading || saving}
                checked={emailEnabled}
                onChange={(e) => setEmailEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">SMS notifications</h4>
                <p className="text-sm text-gray-500">Critical alerts and OTPs via SMS (where supported).</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading || saving}
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Bid alerts</h4>
                <p className="text-sm text-gray-500">Get notified when you are outbid or win an auction.</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading || saving}
                checked={bidAlertsEnabled}
                onChange={(e) => setBidAlertsEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Auction reminders</h4>
                <p className="text-sm text-gray-500">Reminders for auctions you are watching or bidding in.</p>
              </div>
              <input
                type="checkbox"
                disabled={prefsLoading || saving}
                checked={auctionRemindersEnabled}
                onChange={(e) => setAuctionRemindersEnabled(e.target.checked)}
                className="h-4 w-4 text-indigo-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={handleSavePreferences}
            disabled={prefsLoading || saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
          {saveMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-300">{saveMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
