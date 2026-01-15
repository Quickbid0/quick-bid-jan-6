import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Settings, Save, Percent, Clock, DollarSign, Shield, Globe, Mail, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemSettings {
  commission_rate: number;
  min_bid_increment: number;
  auction_extension_time: number;
  min_deposit_amount: number;
  max_active_auctions: number;
  verification_required: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_refund_enabled: boolean;
  platform_fee: number;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  enable_live_webcast: boolean;
  enable_auto_bidding: boolean;
  enable_ai_fraud_actions: boolean;
  enable_ai_recommendations: boolean;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    commission_rate: 5,
    min_bid_increment: 100,
    auction_extension_time: 5,
    min_deposit_amount: 1000,
    max_active_auctions: 10,
    verification_required: true,
    email_notifications: true,
    sms_notifications: false,
    auto_refund_enabled: true,
    platform_fee: 2.5,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenance_mode: false,
    enable_live_webcast: true,
    enable_auto_bidding: true,
    enable_ai_fraud_actions: true,
    enable_ai_recommendations: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Try to fetch as key-value pairs first (new schema)
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');

      if (!error && data && data.length > 0) {
        const newSettings = { ...settings };
        data.forEach((row: any) => {
          if (Object.prototype.hasOwnProperty.call(newSettings, row.setting_key)) {
            try {
              // Try parsing JSON values (booleans, numbers)
              const parsed = JSON.parse(row.setting_value);
              (newSettings as any)[row.setting_key] = parsed;
            } catch {
              // Fallback to string
              (newSettings as any)[row.setting_key] = row.setting_value;
            }
          }
        });
        setSettings(newSettings);
      } else {
        // Fallback to single-row (legacy schema)
        const { data: legacyData, error: legacyError } = await supabase
          .from('system_settings')
          .select('*')
          .single();

        if (legacyError && legacyError.code !== 'PGRST116') {
          throw legacyError;
        }

        if (legacyData) {
          setSettings({ ...settings, ...legacyData });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save as key-value pairs
      const updates = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates, { onConflict: 'setting_key' });

      if (error) {
        // If key-value write fails, try legacy single-row update
        console.warn('Key-value update failed, trying legacy update', error);
        const { error: legacyError } = await supabase
          .from('system_settings')
          .upsert([{ id: 1, ...settings, updated_at: new Date().toISOString() }]);
        
        if (legacyError) throw legacyError;
      }

      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure platform-wide settings and preferences</p>
        </div>
        <Settings className="h-8 w-8 text-indigo-600" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Auction Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" />
            Auction Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Bid Increment (₹)
              </label>
              <input
                type="number"
                name="min_bid_increment"
                value={settings.min_bid_increment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auction Extension Time (minutes)
              </label>
              <input
                type="number"
                name="auction_extension_time"
                value={settings.auction_extension_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Active Auctions per User
              </label>
              <input
                type="number"
                name="max_active_auctions"
                value={settings.max_active_auctions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Deposit Amount (₹)
              </label>
              <input
                type="number"
                name="min_deposit_amount"
                value={settings.min_deposit_amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
          </div>
        </motion.div>

        {/* Financial Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-indigo-600" />
            Financial Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="commission_rate"
                  value={settings.commission_rate}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform Fee (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="platform_fee"
                  value={settings.platform_fee}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Security & Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
            Security & Verification
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require User Verification
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Users must verify their identity before bidding
                </p>
              </div>
              <input
                type="checkbox"
                name="verification_required"
                checked={settings.verification_required}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto Refund Enabled
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically refund losing bidders
                </p>
              </div>
              <input
                type="checkbox"
                name="auto_refund_enabled"
                checked={settings.auto_refund_enabled}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-indigo-600" />
            Notification Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Send email notifications to users
                </p>
              </div>
              <input
                type="checkbox"
                name="email_notifications"
                checked={settings.email_notifications}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SMS Notifications
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Send SMS notifications to users
                </p>
              </div>
              <input
                type="checkbox"
                name="sms_notifications"
                checked={settings.sms_notifications}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Feature Flags / Kill Switches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center text-amber-600">
            <Shield className="h-5 w-5 mr-2" />
            Feature Flags / Kill Switches
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Live Webcast
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Controls live streaming capabilities
                </p>
              </div>
              <input
                type="checkbox"
                name="enable_live_webcast"
                checked={settings.enable_live_webcast}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Auto Bidding
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow automated bidding agents
                </p>
              </div>
              <input
                type="checkbox"
                name="enable_auto_bidding"
                checked={settings.enable_auto_bidding}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable AI Fraud Actions
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automated blocking based on risk scores
                </p>
              </div>
              <input
                type="checkbox"
                name="enable_ai_fraud_actions"
                checked={settings.enable_ai_fraud_actions}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable AI Recommendations
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Personalized suggestions for users
                </p>
              </div>
              <input
                type="checkbox"
                name="enable_ai_recommendations"
                checked={settings.enable_ai_recommendations}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Maintenance Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-indigo-600" />
            Platform Status
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Maintenance Mode
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Put the platform in maintenance mode
              </p>
            </div>
            <input
              type="checkbox"
              name="maintenance_mode"
              checked={settings.maintenance_mode}
              onChange={handleChange}
              className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
            />
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
