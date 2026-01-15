import React, { useState } from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Key, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const SecurityCenter = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const securityFeatures = [
    {
      icon: <Lock className="h-8 w-8 text-green-500" />,
      title: '256-bit SSL Encryption',
      description: 'All data transmission is encrypted with bank-level security',
      status: 'active'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      status: twoFactorEnabled ? 'active' : 'inactive'
    },
    {
      icon: <Eye className="h-8 w-8 text-purple-500" />,
      title: 'Login Monitoring',
      description: 'Track all login attempts and suspicious activities',
      status: 'active'
    },
    {
      icon: <Key className="h-8 w-8 text-orange-500" />,
      title: 'Secure API Keys',
      description: 'API access with rotating keys and rate limiting',
      status: 'active'
    }
  ];

  const recentActivity = [
    { action: 'Login', location: 'Mumbai, India', time: '2 hours ago', status: 'success' },
    { action: 'Password Change', location: 'Mumbai, India', time: '1 day ago', status: 'success' },
    { action: 'Failed Login', location: 'Unknown', time: '3 days ago', status: 'blocked' }
  ];

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setShowQR(true);
    } else {
      setTwoFactorEnabled(false);
      toast.success('Two-factor authentication disabled');
    }
  };

  const enable2FA = () => {
    setTwoFactorEnabled(true);
    setShowQR(false);
    toast.success('Two-factor authentication enabled');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Shield className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Security Center
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Manage your account security and privacy settings
        </p>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                feature.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {feature.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add extra security to your account</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`px-4 py-2 rounded-lg ${
                  twoFactorEnabled 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Login Alerts</h3>
                <p className="text-sm text-gray-500">Get notified of new login attempts</p>
              </div>
              <button
                onClick={() => setLoginAlerts(!loginAlerts)}
                className={`px-4 py-2 rounded-lg ${
                  loginAlerts 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {loginAlerts ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="border-t pt-4">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
                Change Password
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.location} • {activity.time}</p>
                </div>
                <div className={`p-2 rounded-full ${
                  activity.status === 'success' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Setup Two-Factor Authentication</h2>
            
            <div className="text-center mb-6">
              <div className="bg-white p-4 rounded-lg inline-block">
                <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Scan this QR code with your authenticator app
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={enable2FA}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Security Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Use strong, unique passwords
            </li>
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Enable two-factor authentication
            </li>
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Keep your email secure
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Monitor account activity regularly
            </li>
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Log out from public devices
            </li>
            <li className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Report suspicious activities
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;