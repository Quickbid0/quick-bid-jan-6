import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Bell,
  Share2,
  Calendar,
  Users,
  TrendingUp,
  Send,
  Eye,
  Target,
  BarChart3,
  Plus,
  Settings,
  MessageSquare,
  Smartphone,
  Globe
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

// Mock marketing data
const mockMarketingData = {
  campaigns: [
    {
      id: '1',
      name: 'Welcome Series',
      type: 'email',
      status: 'active',
      sent: 2450,
      opened: 1837,
      clicked: 456,
      converted: 89
    },
    {
      id: '2',
      name: 'Auction Reminders',
      type: 'push',
      status: 'scheduled',
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0
    },
    {
      id: '3',
      name: 'Referral Campaign',
      type: 'social',
      status: 'completed',
      sent: 5200,
      opened: 3120,
      clicked: 780,
      converted: 156
    }
  ],
  performance: {
    totalSubscribers: 15420,
    activeUsers: 8934,
    emailOpenRate: 74.8,
    pushClickRate: 23.4,
    socialEngagement: 15.6
  },
  upcomingCampaigns: [
    { name: 'Weekly Auction Digest', type: 'email', scheduled: '2024-02-18 10:00' },
    { name: 'Live Auction Push', type: 'push', scheduled: '2024-02-20 14:30' },
    { name: 'Social Media Boost', type: 'social', scheduled: '2024-02-22 09:00' }
  ]
};

const MarketingAutomation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'create'>('overview');
  const [loading, setLoading] = useState(false);

  const createCampaign = async (campaignData: any) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Campaign created successfully!');
    setLoading(false);
    setActiveTab('campaigns');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'create', label: 'Create Campaign', icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Automation</h1>
              <p className="text-gray-600 mt-1">Automate campaigns and engage your audience</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                      <p className="text-2xl font-bold text-gray-900">{mockMarketingData.performance.totalSubscribers.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Email Open Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{mockMarketingData.performance.emailOpenRate}%</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Push Click Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{mockMarketingData.performance.pushClickRate}%</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Share2 className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Social Engagement</p>
                      <p className="text-2xl font-bold text-gray-900">{mockMarketingData.performance.socialEngagement}%</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Campaign Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Performance</h3>
                <div className="space-y-4">
                  {mockMarketingData.campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          campaign.type === 'email' ? 'bg-blue-100' :
                          campaign.type === 'push' ? 'bg-purple-100' : 'bg-green-100'
                        }`}>
                          {campaign.type === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                          {campaign.type === 'push' && <Bell className="h-4 w-4 text-purple-600" />}
                          {campaign.type === 'social' && <Share2 className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-600">{campaign.type} campaign</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Sent</p>
                          <p className="font-semibold">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Opened</p>
                          <p className="font-semibold">{campaign.opened.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Clicked</p>
                          <p className="font-semibold">{campaign.clicked.toLocaleString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">All Campaigns</h3>
              <Button onClick={() => setActiveTab('create')} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMarketingData.campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-full ${
                      campaign.type === 'email' ? 'bg-blue-100' :
                      campaign.type === 'push' ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                      {campaign.type === 'email' && <Mail className="h-5 w-5 text-blue-600" />}
                      {campaign.type === 'push' && <Bell className="h-5 w-5 text-purple-600" />}
                      {campaign.type === 'social' && <Share2 className="h-5 w-5 text-green-600" />}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{campaign.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{campaign.type} campaign</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent:</span>
                      <span className="font-medium">{campaign.sent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Open Rate:</span>
                      <span className="font-medium">
                        {campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Click Rate:</span>
                      <span className="font-medium">
                        {campaign.sent > 0 ? Math.round((campaign.clicked / campaign.sent) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Campaign</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                createCampaign({});
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter campaign name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="email">Email Campaign</option>
                    <option value="push">Push Notification</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                    <option value="buyers">Recent Buyers</option>
                    <option value="sellers">Sellers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your campaign message..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Creating...' : 'Create Campaign'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab('campaigns')}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketingAutomation;
