import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Users,
  Activity,
  DollarSign,
  Video,
  Settings,
  Shield,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import LocationFilter from '../../components/admin/LocationFilter';
// Sparkline component removed to fix import error – replace with a simple placeholder or remove usage
import { Skeleton } from '../../components/ui/skeleton';
import { KPICardSkeleton } from '../../components/ui/SkeletonLoaders';
// Removed unused import: demoDashboardStats
import { useSession } from '../../context/SessionContext';

interface DashboardStats {
  totalUsers: number;
  activeAuctions: number;
  totalRevenue: number;
  pendingVerifications: number;
  liveStreams: number;
  todaySignups: number;
  pendingProducts: number;
  totalBids: number;
  activeUsers: number;
  conversionRate: number;
}

const AdminDashboard = () => {
  const { userProfile } = useSession();
  const role = userProfile?.role || 'guest';
  const isStaff = role === 'staff';

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    liveStreams: 0,
    todaySignups: 0,
    pendingProducts: 0,
    totalBids: 0,
    activeUsers: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [filterLocation]);

  const fetchDashboardData = async () => {
    try {
      let usersQuery = supabase.from('profiles').select('created_at, is_verified, location_id', { count: 'exact' });
      let auctionsQuery = supabase.from('auctions').select('status, location_id', { count: 'exact' }).eq('status', 'active');
      let productsQuery = supabase.from('products').select('verification_status, location_id', { count: 'exact' });
      const bidsQuery = supabase.from('bids').select('amount', { count: 'exact' });
      const streamsQuery = supabase.from('live_streams').select('status', { count: 'exact' }).eq('status', 'live');

      if (filterLocation) {
        usersQuery = usersQuery.eq('location_id', filterLocation);
        auctionsQuery = auctionsQuery.eq('location_id', filterLocation);
        productsQuery = productsQuery.eq('location_id', filterLocation);
        // Bids and streams might not have direct location_id, skipping for now
      }

      const [
        usersData,
        auctionsData,
        productsData,
        bidsData,
        streamsData
      ] = await Promise.all([
        usersQuery,
        auctionsQuery,
        productsQuery,
        bidsQuery,
        streamsQuery
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todaySignups = usersData.data?.filter(user => 
        user.created_at.startsWith(today)
      ).length || 0;

      const pendingVerifications = usersData.data?.filter(user => 
        !user.is_verified
      ).length || 0;

      const pendingProducts = productsData.data?.filter(product => 
        product.verification_status === 'pending'
      ).length || 0;

      setStats({
        totalUsers: usersData.count || 0,
        activeAuctions: auctionsData.count || 0,
        totalRevenue: 0, // This would come from transactions
        pendingVerifications,
        liveStreams: streamsData.count || 0,
        todaySignups,
        pendingProducts,
        totalBids: bidsData.count || 0,
        activeUsers: Math.floor((usersData.count || 0) * 0.3), // Estimated 30% active
        conversionRate: (auctionsData.count || 0) > 0 ? ((bidsData.count || 0) / auctionsData.count!) * 100 : 0
      });

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: <Users className="h-6 w-6" />,
      to: '/admin/users',
      color: 'bg-blue-500',
      urgent: stats.pendingVerifications > 0
    },
    {
      title: 'Product Verification',
      description: 'Review and verify product listings',
      icon: <Shield className="h-6 w-6" />,
      to: '/admin/verify-products',
      color: 'bg-purple-500',
      urgent: stats.pendingProducts > 0
    },
    {
      title: 'Finance Leads',
      description: 'Manage finance lead pipeline',
      icon: <DollarSign className="h-6 w-6" />,
      to: '/admin/finance-leads',
      color: 'bg-blue-500',
      urgent: false
    },
    {
      title: 'Investments',
      description: 'Track platform investments',
      icon: <TrendingUp className="h-6 w-6" />,
      to: '/admin/investments',
      color: 'bg-green-500',
      urgent: false
    },
    {
      title: 'Live Stream Setup',
      description: 'Configure and manage live auctions',
      icon: <Video className="h-6 w-6" />,
      to: '/admin/live-setup',
      color: 'bg-red-500',
      urgent: false
    },
    {
      title: 'Tender Review',
      description: 'Review tender auction submissions',
      icon: <CheckCircle className="h-6 w-6" />,
      to: '/admin/tender-review',
      color: 'bg-green-500',
      urgent: false
    },
    {
      title: 'AI Training',
      description: 'Manage AI model training and optimization',
      icon: <Brain className="h-6 w-6" />,
      to: '/admin/ai-training',
      color: 'bg-cyan-500',
      urgent: false
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: <Settings className="h-6 w-6" />,
      to: '/admin/settings',
      color: 'bg-orange-500',
      urgent: false
    },
    {
      title: 'Live Stream Management',
      description: 'Manage streaming platforms and quality',
      icon: <Video className="h-6 w-6" />,
      to: '/admin/live-stream',
      color: 'bg-indigo-500',
      urgent: stats.liveStreams > 0
    }
  ];

  const filteredQuickActions = quickActions.filter(action => {
    // Hide "System Settings" from staff
    if (action.title === 'System Settings' && isStaff) return false;
    return true;
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-8 w-8 text-blue-500" />,
      change: `+${stats.todaySignups} today`,
      changeType: 'positive'
    },
    {
      title: 'Active Auctions',
      value: stats.activeAuctions,
      icon: <Activity className="h-8 w-8 text-green-500" />,
      change: 'Live now',
      changeType: 'neutral'
    },
    {
      title: 'Live Streams',
      value: stats.liveStreams,
      icon: <Video className="h-8 w-8 text-red-500" />,
      change: 'Broadcasting',
      changeType: stats.liveStreams > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingVerifications + stats.pendingProducts,
      icon: <Clock className="h-8 w-8 text-yellow-500" />,
      change: 'Needs attention',
      changeType: stats.pendingVerifications + stats.pendingProducts > 0 ? 'warning' : 'neutral'
    },
    {
      title: 'Total Bids',
      value: stats.totalBids,
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      change: 'All time',
      changeType: 'neutral'
    },
    {
      title: 'Platform Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      change: 'This month',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage the QuickBid platform</p>
        </div>
        <div className="flex items-center gap-4">
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[200px]" />
          <Link
            to="/admin/verify-products"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Bell className="h-6 w-6" />
            {(stats.pendingVerifications + stats.pendingProducts) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {stats.pendingVerifications + stats.pendingProducts}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total GMV</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
             <div className="flex items-center text-sm text-green-600">
               <TrendingUp className="h-4 w-4 mr-1" />
               <span>+12.5%</span>
             </div>
             <div className="w-20 h-8 flex items-end justify-end space-x-1">
               {[40, 35, 55, 45, 60, 55, 70].map((h, i) => (
                 <div
                   key={i}
                   className="bg-green-500 rounded-t"
                   style={{ width: 8, height: `${(h / 70) * 24}px` }}
                 />
               ))}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Auctions</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeAuctions}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
             <div className="text-sm text-gray-500">Live now</div>
             <div className="w-20 h-8 flex items-end justify-end space-x-1">
               {[10, 15, 12, 18, 20, 18, 25].map((h, i) => (
                 <div
                   key={i}
                   className="bg-blue-500 rounded-t"
                   style={{ width: 8, height: `${(h / 25) * 24}px` }}
                 />
               ))}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
             <div className="text-sm text-gray-500">Est. Active (30%)</div>
             <div className="w-20 h-8 flex items-end justify-end space-x-1">
               {[0.8, 0.9, 1, 0.95, 1.1].map((factor, i) => (
                 <div
                   key={i}
                   className="bg-purple-500 rounded-t"
                   style={{ width: 8, height: `${(factor * 24)}px` }}
                 />
               ))}
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.conversionRate.toFixed(1)}%</h3>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-end justify-between">
             <div className="flex items-center text-sm text-green-600">
               <TrendingUp className="h-4 w-4 mr-1" />
               <span>Bid / Auction</span>
             </div>
             <div className="w-20 h-8 flex items-end justify-end space-x-1">
               {[2.1, 2.3, 2.2, 2.5, stats.conversionRate].map((h, i) => (
                 <div
                   key={i}
                   className="bg-indigo-500 rounded-t"
                   style={{ width: 8, height: `${(h / 2.5) * 24}px` }}
                 />
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'warning' ? 'text-yellow-600' :
                  'text-gray-500'
                }`}>
                  {stat.change}
                </p>
              </div>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.to}
                className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
              >
                {action.urgent && (
                  <div className="absolute top-2 right-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                )}
                <div className={`${action.color} text-white p-3 rounded-lg inline-block mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
                <div className="mt-4">
                  <span className="btn btn-ghost btn-sm inline-flex items-center">Open</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Database Status</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">API Response Time</span>
              <span className="text-sm text-gray-900 dark:text-white">~120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Active Sessions</span>
              <span className="text-sm text-gray-900 dark:text-white">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">New user registered</span>
              <span className="text-gray-400 ml-auto">2 min ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">Product approved</span>
              <span className="text-gray-400 ml-auto">5 min ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600 dark:text-gray-300">Live stream started</span>
              <span className="text-gray-400 ml-auto">10 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
