import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Activity, 
  IndianRupee, 
  Loader2,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  UserPlus,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface SalesTotals {
  auctions: number;
  gmv: number;
  netPayout: number;
  newSellers: number;
}

interface GeoStat {
  city: string;
  auctions: number;
  gmv: number;
}

interface PayoutPipeline {
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  completedValue: number;
  inProgressValue: number;
  pendingValue: number;
  unpaidGMV: number;
}

interface UserActivity {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  totalSpent: number;
  joinedDate: string;
}

interface RecentActivity {
  id: string;
  type: string;
  user: string;
  action: string;
  timestamp: string;
  status: string;
}

const AdminSalesDashboardFixed: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const sampleData = {
    period: { month: 1, year: 2024, start: '2024-01-01', end: '2024-01-31' },
    totals: {
      auctions: 1247,
      gmv: 28450000,
      netPayout: 25605000,
      newSellers: 89
    },
    geo: [
      { city: 'Mumbai', auctions: 342, gmv: 8900000 },
      { city: 'Delhi', auctions: 289, gmv: 7200000 },
      { city: 'Bangalore', auctions: 234, gmv: 6800000 },
      { city: 'Chennai', auctions: 198, gmv: 4500000 },
      { city: 'Kolkata', auctions: 184, gmv: 1050000 }
    ],
    pipeline: {
      completedCount: 892,
      inProgressCount: 234,
      pendingCount: 121,
      completedValue: 23450000,
      inProgressValue: 3200000,
      pendingValue: 1800000,
      unpaidGMV: 5000000
    }
  };

  const sampleUsers: UserActivity[] = [
    {
      id: '1',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      role: 'buyer',
      status: 'active',
      lastActive: '2 hours ago',
      totalSpent: 450000,
      joinedDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      role: 'seller',
      status: 'active',
      lastActive: '1 day ago',
      totalSpent: 0,
      joinedDate: '2024-01-10'
    },
    {
      id: '3',
      name: 'Amit Kumar',
      email: 'amit@example.com',
      role: 'buyer',
      status: 'inactive',
      lastActive: '3 days ago',
      totalSpent: 120000,
      joinedDate: '2024-01-05'
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      email: 'sneha@example.com',
      role: 'seller',
      status: 'active',
      lastActive: '5 hours ago',
      totalSpent: 0,
      joinedDate: '2024-01-20'
    }
  ];

  const sampleActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'auction',
      user: 'Rahul Sharma',
      action: 'Placed bid on iPhone 14 Pro',
      timestamp: '10 minutes ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'registration',
      user: 'New User',
      action: 'Registered as buyer',
      timestamp: '25 minutes ago',
      status: 'completed'
    },
    {
      id: '3',
      type: 'payment',
      user: 'Priya Patel',
      action: 'Received payment for auction',
      timestamp: '1 hour ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'listing',
      user: 'Sneha Reddy',
      action: 'Listed new product',
      timestamp: '2 hours ago',
      status: 'pending'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(sampleData);
      setLoading(false);
    }, 1000);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-indigo-100">Manage your auction platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Auctions</p>
                      <p className="text-2xl font-bold">{formatNumber(data.totals.auctions)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">+12% from last month</span>
                      </div>
                    </div>
                    <Package className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">GMV</p>
                      <p className="text-2xl font-bold">{formatPrice(data.totals.gmv)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">+18% from last month</span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Net Payout</p>
                      <p className="text-2xl font-bold">{formatPrice(data.totals.netPayout)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">+15% from last month</span>
                      </div>
                    </div>
                    <IndianRupee className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">New Sellers</p>
                      <p className="text-2xl font-bold">{formatNumber(data.totals.newSellers)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-4 h-4" />
                        <span className="text-sm">+8% from last month</span>
                      </div>
                    </div>
                    <UserPlus className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Geographic Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <div className="space-y-3">
                  {data.geo.map((stat: GeoStat, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{stat.city}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{stat.auctions} auctions</span>
                        <span className="font-medium text-gray-900">{formatPrice(stat.gmv)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {sampleActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{activity.user}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        <p className="text-xs text-gray-400 capitalize">{activity.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Active</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Spent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 capitalize">{user.role}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">{user.lastActive}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {user.totalSpent > 0 ? formatPrice(user.totalSpent) : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="text-indigo-600 hover:text-indigo-800">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Revenue Trends</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Revenue chart would go here</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="font-medium text-gray-900 mb-4">User Growth</h4>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">User growth chart would go here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Admin Settings</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send email notifications for important events</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Auto-approve Listings</p>
                      <p className="text-sm text-gray-600">Automatically approve new listings</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <Users className="w-6 h-6 text-indigo-600" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <Package className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">View Auctions</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Payments</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <Settings className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSalesDashboardFixed;
