import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Upload,
  Download,
  Bell,
  Settings,
  Home,
  Package,
  BarChart,
  CreditCard,
  MessageSquare,
  LogOut,
  ChevronDown,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock data for dealer dashboard
const mockDealerData = {
  kpis: {
    totalRevenue: 240000,
    activeAuctions: 12,
    conversionRate: 78,
    commissionOwed: 18000
  },
  performanceData: [
    { month: 'Jan', revenue: 180000, auctions: 15, conversion: 72 },
    { month: 'Feb', revenue: 220000, auctions: 18, conversion: 75 },
    { month: 'Mar', revenue: 240000, auctions: 20, conversion: 78 },
    { month: 'Apr', revenue: 260000, auctions: 22, conversion: 80 },
    { month: 'May', revenue: 280000, auctions: 25, conversion: 82 },
    { month: 'Jun', revenue: 300000, auctions: 28, conversion: 85 }
  ],
  auctions: [
    {
      id: 'A001',
      title: 'BMW X3 2020',
      currentBid: 1520000,
      timeLeft: '2h 34m',
      status: 'active',
      bidders: 23,
      views: 145
    },
    {
      id: 'A002',
      title: 'Audi A4 2019',
      currentBid: 980000,
      timeLeft: '5h 12m',
      status: 'active',
      bidders: 18,
      views: 98
    },
    {
      id: 'A003',
      title: 'Mercedes C-Class 2021',
      currentBid: 1850000,
      timeLeft: 'Ended',
      status: 'ended',
      bidders: 31,
      views: 203
    }
  ],
  notifications: [
    { id: 1, message: 'New bid on BMW X3: ₹15.2L', time: '2 min ago', type: 'bid' },
    { id: 2, message: 'Auction ending soon: Audi A4', time: '1 hour ago', type: 'warning' },
    { id: 3, message: 'Commission payout processed', time: '1 day ago', type: 'success' }
  ],
  loanConversions: {
    preApprovedBuyers: 3,
    potentialRevenue: 45000,
    conversionRate: 65
  }
};

const DealerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'auctions', label: 'My Auctions', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'wallet', label: 'Wallet', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QM</span>
            </div>
            {sidebarOpen && <span className="ml-3 font-bold text-gray-900">QuickMela</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button className="w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dealer Dashboard</h1>
              <p className="text-gray-600">Welcome back, Premium Dealer</p>
            </div>
            <div className="flex items-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Auction
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockDealerData.kpis.totalRevenue)}</p>
                        <p className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +12% from last month
                        </p>
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
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                        <p className="text-2xl font-bold text-gray-900">{mockDealerData.kpis.activeAuctions}</p>
                        <p className="text-sm text-blue-600">3 ending soon</p>
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
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{mockDealerData.kpis.conversionRate}%</p>
                        <p className="text-sm text-purple-600">+3% from last month</p>
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
                        <CreditCard className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Commission Owed</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockDealerData.kpis.commissionOwed)}</p>
                        <p className="text-sm text-orange-600">Due in 5 days</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Performance Graph */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Performance</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {mockDealerData.performanceData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${(data.revenue / 350000) * 200}px` }}
                        ></div>
                        <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                        <p className="text-xs font-medium">{formatCurrency(data.revenue / 100000)}L</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Auction Table and Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Auction Table */}
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Auctions</h3>
                    <div className="space-y-3">
                      {mockDealerData.auctions.map((auction) => (
                        <div key={auction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{auction.title}</p>
                              <p className="text-sm text-gray-600">ID: {auction.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Current Bid</p>
                              <p className="font-semibold">{formatCurrency(auction.currentBid)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Time Left</p>
                              <p className={`font-semibold ${auction.status === 'ended' ? 'text-red-600' : 'text-green-600'}`}>
                                {auction.timeLeft}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-600">Bidders</p>
                              <p className="font-semibold">{auction.bidders}</p>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Side Widgets */}
                <div className="space-y-6">
                  {/* Notifications Widget */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      {mockDealerData.notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'bid' ? 'bg-green-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {notification.type === 'bid' && <TrendingUp className="h-4 w-4 text-green-600" />}
                            {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                            {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-600">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Loan Conversion Widget */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Loan Conversions
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{mockDealerData.loanConversions.preApprovedBuyers}</p>
                        <p className="text-sm text-gray-600">Buyers Pre-approved</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(mockDealerData.loanConversions.potentialRevenue)}</p>
                        <p className="text-sm text-gray-600">Potential Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{mockDealerData.loanConversions.conversionRate}%</p>
                        <p className="text-sm text-gray-600">Conversion Rate</p>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        View Loan Leads
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600 mt-2">This section is under development.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default DealerDashboard;
