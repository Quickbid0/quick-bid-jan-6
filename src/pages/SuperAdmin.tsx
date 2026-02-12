import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Shield, 
  UserX, 
  CheckCircle, 
  XCircle, 
  Crown,
  Settings,
  Database,
  Activity,
  Users,
  BarChart3,
  AlertTriangle,
  Trash2,
  Edit,
  Plus,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator' | 'superadmin';
  created_at: string;
  is_verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  last_login?: string;
}

interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalProducts: number;
  totalAuctions: number;
  totalRevenue: number;
  activeUsers: number;
}

interface ProductRow {
  id: string;
  title: string;
  verification_status: string | null;
  status?: string | null;
  created_at: string;
}

const SuperAdmin = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalAuctions: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'settings' | 'products' | 'categories'>('users');
  const [recentProducts, setRecentProducts] = useState<ProductRow[]>([]);
  const [productFilter, setProductFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchUsers();
    fetchSystemStats();
    fetchRecentProducts();
    
    // Set active tab based on pathname
    if (location.pathname === '/admin/categories') {
      setActiveTab('categories');
    } else if (location.pathname === '/admin/product-verification/bulk') {
      setActiveTab('products');
    } else {
      setActiveTab('users');
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, created_at, is_verified, status')
        .order('created_at', { ascending: false })
        .range(0, 49); // limit to first 50 for initial view

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const [
        totalUsersRes,
        totalAdminsRes,
        activeUsersRes,
        productsRes,
        auctionsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'superadmin']),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('auctions').select('*', { count: 'exact', head: true })
      ]);

      const totalUsers = totalUsersRes.count || 0;
      const totalAdmins = totalAdminsRes.count || 0;
      const activeUsers = activeUsersRes.count || 0;

      setStats({
        totalUsers,
        totalAdmins,
        totalProducts: productsRes.count || 0,
        totalAuctions: auctionsRes.count || 0,
        totalRevenue: 0, // This would come from transactions table
        activeUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, verification_status, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentProducts((data || []) as ProductRow[]);
    } catch (error) {
      console.error('Error fetching products for super admin:', error);
    }
  };

  const updateProductVerification = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ verification_status: status })
        .eq('id', productId);

      if (error) throw error;
      toast.success(`Product ${status}`);
      await fetchRecentProducts();
    } catch (error) {
      toast.error('Failed to update product status');
      console.error('updateProductVerification error', error);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
      console.error(error);
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const toggleUserVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${!currentStatus ? 'verified' : 'unverified'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update verification status');
      console.error(error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'moderator':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'suspended':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-500" />
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Complete system administration and control</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'categories', label: 'Categories', icon: Package },
          { id: 'stats', label: 'System Statistics', icon: BarChart3 },
          { id: 'products', label: 'Products & Auctions', icon: Package },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* System Statistics */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAdmins}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
              </div>
              <Database className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Auctions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAuctions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Products & Auctions Overview */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" />
                Products & Auctions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Review recent listings and jump into the detailed verification workflow.
              </p>
            </div>
            <Link
              to="/admin/verify-products"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Go to Product Verification
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Products</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Showing latest {recentProducts.length} products
                </span>
              </div>
              <div className="flex gap-2">
                <button data-testid="bulk-upload" className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Upload
                </button>
                <button data-testid="bulk-verify" className="px-3 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700">
                  Verify
                </button>
              </div>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value as any)}
                className="text-xs px-3 py-1 border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div data-testid="verification-queue" className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentProducts
                    .filter((p) => {
                      if (productFilter === 'all') return true;
                      const v = (p.verification_status || '').toLowerCase();
                      if (productFilter === 'pending') return v === 'pending' || !v;
                      return v === productFilter;
                    })
                    .map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={p.title}>
                        {p.title || 'Untitled product'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                          {p.verification_status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                        {p.status || 'n/a'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateProductVerification(p.id, 'approved')}
                            className="px-2 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProductVerification(p.id, 'rejected')}
                            className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No products found. Once sellers list products, they will appear here for quick review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="ml-2 text-sm border-none bg-transparent focus:ring-0"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.status}
                        onChange={(e) => updateUserStatus(user.id, e.target.value)}
                        className={`text-sm border-none bg-transparent focus:ring-0 ${getStatusColor(user.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserVerification(user.id, user.is_verified)}
                        className={`flex items-center ${
                          user.is_verified
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {user.is_verified ? (
                          <CheckCircle className="h-5 w-5 mr-1" />
                        ) : (
                          <XCircle className="h-5 w-5 mr-1" />
                        )}
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Management */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-500" />
                Categories Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage product categories and organization
              </p>
            </div>
            <button
              data-testid="add-category"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Product Categories</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Managing categories for product organization
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table data-testid="category-list" className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 categories-table">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      Vehicles
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                      Cars, motorcycles, and other vehicles
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      Electronics
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">
                      Computers, phones, and electronic devices
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">System Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Database className="h-6 w-6 text-blue-500" />
                <h3 className="text-lg font-medium">Database Management</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Manage database backups, migrations, and maintenance
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Access Database Tools
              </button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-medium">System Maintenance</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Enable maintenance mode and system updates
              </p>
              <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{selectedUser.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Joined</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;