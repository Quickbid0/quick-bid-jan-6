// Enhanced Settings & Notifications - Gaming Excitement + Fintech Trust + SaaS Intelligence
// Intelligent settings experience with premium interactions, smart defaults, and personalized controls

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Bell,
  User,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Smartphone,
  Mail,
  MessageSquare,
  Zap,
  Target,
  Trophy,
  Crown,
  Sparkles,
  CheckCircle,
  X,
  ChevronRight,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info,
  AlertTriangle,
  Star,
  Heart,
  ThumbsUp,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  Camera
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// Smart Toggle Component
interface SmartToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: React.ComponentType<any>;
  recommended?: boolean;
  aiSuggestion?: string;
  impact?: 'high' | 'medium' | 'low';
}

const SmartToggle: React.FC<SmartToggleProps> = ({
  label,
  description,
  value,
  onChange,
  icon: Icon,
  recommended,
  aiSuggestion,
  impact
}) => {
  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${value ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className={`w-5 h-5 ${value ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{label}</h3>
            {recommended && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                Recommended
              </span>
            )}
            {impact && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(impact)}`}>
                {impact} impact
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">{description}</p>

          {aiSuggestion && (
            <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-purple-900 text-sm font-medium">AI Suggestion</div>
                <div className="text-purple-700 text-sm">{aiSuggestion}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </motion.div>
  );
};

// Notification Preference Component
interface NotificationPreferenceProps {
  category: string;
  preferences: Array<{
    id: string;
    label: string;
    description: string;
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  }>;
  onUpdate: (preferenceId: string, type: 'email' | 'push' | 'sms' | 'frequency', value: boolean | string) => void;
}

const NotificationPreference: React.FC<NotificationPreferenceProps> = ({
  category,
  preferences,
  onUpdate
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
          <p className="text-gray-600 text-sm">Manage your notification preferences</p>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-4"
          >
            {preferences.map((pref) => (
              <div key={pref.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{pref.label}</h4>
                    <p className="text-gray-600 text-sm">{pref.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="checkbox"
                      checked={pref.email}
                      onChange={(e) => onUpdate(pref.id, 'email', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Push</label>
                    <input
                      type="checkbox"
                      checked={pref.push}
                      onChange={(e) => onUpdate(pref.id, 'push', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMS</label>
                    <input
                      type="checkbox"
                      checked={pref.sms}
                      onChange={(e) => onUpdate(pref.id, 'sms', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={pref.frequency}
                      onChange={(e) => onUpdate(pref.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Privacy & Security Settings
interface PrivacySettingsProps {
  settings: {
    profileVisibility: 'public' | 'private' | 'contacts';
    dataSharing: boolean;
    analyticsTracking: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    loginAlerts: boolean;
  };
  onUpdate: (key: string, value: any) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ settings, onUpdate }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-emerald-600" />
        <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
          <select
            value={settings.profileVisibility}
            onChange={(e) => onUpdate('profileVisibility', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="public">Public - Anyone can see my profile</option>
            <option value="contacts">Contacts - Only approved contacts</option>
            <option value="private">Private - Only I can see my profile</option>
          </select>
        </div>

        <div className="space-y-4">
          <SmartToggle
            label="Data Sharing"
            description="Allow anonymized data sharing for platform improvements"
            value={settings.dataSharing}
            onChange={(value) => onUpdate('dataSharing', value)}
            icon={Globe}
            aiSuggestion="Recommended for better personalized recommendations"
            impact="medium"
          />

          <SmartToggle
            label="Analytics Tracking"
            description="Help us improve by sharing usage analytics"
            value={settings.analyticsTracking}
            onChange={(value) => onUpdate('analyticsTracking', value)}
            icon={Target}
            aiSuggestion="Opt-in for personalized insights and better support"
            impact="low"
          />

          <SmartToggle
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onChange={(value) => onUpdate('twoFactorAuth', value)}
            icon={Lock}
            aiSuggestion="Highly recommended for account security"
            impact="high"
            recommended
          />

          <SmartToggle
            label="Login Alerts"
            description="Get notified of new login attempts"
            value={settings.loginAlerts}
            onChange={(value) => onUpdate('loginAlerts', value)}
            icon={Bell}
            aiSuggestion="Essential for account security monitoring"
            impact="high"
            recommended
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => onUpdate('sessionTimeout', parseInt(e.target.value))}
            min="5"
            max="480"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="text-xs text-gray-500 mt-1">Automatically log out after this period of inactivity</p>
        </div>
      </div>
    </Card>
  );
};

// Enhanced Settings & Notifications Component
export const EnhancedSettingsNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [settings, setSettings] = useState({
    // Profile Settings
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+91 98765 43210',
      bio: 'Passionate auction enthusiast with 5+ years of experience.',
      avatar: null as File | null,
      location: 'Mumbai, India',
      timezone: 'Asia/Kolkata'
    },

    // Notification Preferences
    notifications: {
      auctions: [
        {
          id: 'bid_received',
          label: 'New Bid Received',
          description: 'When someone bids on your auction',
          email: true,
          push: true,
          sms: false,
          frequency: 'immediate' as const
        },
        {
          id: 'auction_ending',
          label: 'Auction Ending Soon',
          description: 'Reminders for auctions ending in 24 hours',
          email: true,
          push: true,
          sms: false,
          frequency: 'daily' as const
        },
        {
          id: 'outbid',
          label: 'Outbid Alert',
          description: 'When someone outbids you',
          email: true,
          push: true,
          sms: true,
          frequency: 'immediate' as const
        }
      ],
      marketing: [
        {
          id: 'promotions',
          label: 'Promotional Offers',
          description: 'Special deals and promotions',
          email: false,
          push: true,
          sms: false,
          frequency: 'weekly' as const
        },
        {
          id: 'product_updates',
          label: 'Product Updates',
          description: 'New features and improvements',
          email: true,
          push: false,
          sms: false,
          frequency: 'monthly' as const
        }
      ]
    },

    // Privacy & Security
    privacy: {
      profileVisibility: 'public' as const,
      dataSharing: true,
      analyticsTracking: true,
      twoFactorAuth: false,
      sessionTimeout: 60,
      loginAlerts: true
    },

    // Appearance
    appearance: {
      theme: 'light' as 'light' | 'dark' | 'auto',
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata'
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setHasUnsavedChanges(false);
    // Show success message
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateNotificationPreference = (category: string, preferenceId: string, type: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [category]: prev.notifications[category as keyof typeof prev.notifications].map((pref: any) =>
          pref.id === preferenceId ? { ...pref, [type]: value } : pref
        )
      }
    }));
    setHasUnsavedChanges(true);
  };

  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              ⚙️ Settings & Preferences
            </h1>
            <p className="text-gray-600">
              Customize your experience and manage your account
            </p>
          </div>

          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-orange-600"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </motion.div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-lg w-fit"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Grid cols={2} gap="lg">
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                          <input
                            type="text"
                            value={settings.profile.firstName}
                            onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                          <input
                            type="text"
                            value={settings.profile.lastName}
                            onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={settings.profile.phone}
                          onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          value={settings.profile.bio}
                          onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Tell others about yourself..."
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Location & Preferences</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={settings.profile.location}
                          onChange={(e) => updateSetting('profile', 'location', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="City, Country"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={settings.profile.timezone}
                          onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Picture</h3>

                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                      </div>

                      <Button variant="outline" className="gap-2">
                        <Camera className="w-4 h-4" />
                        Change Photo
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Status</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Verification Status</span>
                        <StatusBadge status="completed" />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Trust Score</span>
                        <TrustScore score={92} size="sm" />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Member Since</span>
                        <span className="text-gray-900 font-medium">January 2024</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </Grid>
            </motion.div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <NotificationPreference
                category="Auction Notifications"
                preferences={settings.notifications.auctions}
                onUpdate={(id, type, value) => updateNotificationPreference('auctions', id, type, value)}
              />

              <NotificationPreference
                category="Marketing & Updates"
                preferences={settings.notifications.marketing}
                onUpdate={(id, type, value) => updateNotificationPreference('marketing', id, type, value)}
              />

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Notification AI</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Our AI learns your preferences and optimizes when and how you receive notifications.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-blue-900">Smart Timing</div>
                    <div className="text-sm text-blue-700">Sends notifications at optimal times</div>
                  </div>

                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <Zap className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="font-semibold text-emerald-900">Priority Alerts</div>
                    <div className="text-sm text-emerald-700">Highlights important updates</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="font-semibold text-purple-900">AI Insights</div>
                    <div className="text-sm text-purple-700">Learns from your behavior</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Privacy & Security */}
          {activeTab === 'privacy' && (
            <motion.div
              key="privacy"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <PrivacySettings
                settings={settings.privacy}
                onUpdate={(key, value) => updateSetting('privacy', key, value)}
              />
            </motion.div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Appearance Preferences</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'auto', label: 'Auto', icon: Smartphone }
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <button
                            key={theme.value}
                            onClick={() => updateSetting('appearance', 'theme', theme.value)}
                            className={`p-4 border-2 rounded-lg text-center transition-all ${
                              settings.appearance.theme === theme.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{theme.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={settings.appearance.language}
                        onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="mr">Marathi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={settings.appearance.currency}
                        onChange={(e) => updateSetting('appearance', 'currency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Billing & Subscription</h3>
                  <Button variant="outline" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Manage Payment Methods
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-emerald-900">Professional Plan</div>
                        <div className="text-sm text-emerald-700">₹2,499/month • Next billing: Dec 15, 2024</div>
                      </div>
                      <StatusBadge status="active" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Payment Methods</h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                            <div className="text-sm text-gray-600">Expires 12/26</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-emerald-600 font-medium">Primary</span>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <Button variant="outline" className="w-full gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Download Billing History
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8"
          >
            <Button
              onClick={handleSave}
              loading={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </motion.div>
        )}
      </div>
    </Container>
  );
};

export default EnhancedSettingsNotifications;
