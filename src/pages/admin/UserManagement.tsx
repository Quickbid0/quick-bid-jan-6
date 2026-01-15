import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import LocationFilter from '../../components/admin/LocationFilter';
import {
  User,
  Shield,
  Ban,
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from '../../context/SessionContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'superadmin' | 'moderator' | 'demo_admin' | 'staff';
  status: 'active' | 'suspended' | 'pending';
  is_verified: boolean;
  created_at: string;
  avatar_url?: string;
  address?: string;
  location_id?: string;
  last_login?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const isDemo = localStorage.getItem('demo-session') !== null;
  const { isSuperAdmin, session } = useSession();

  type RbacRole = { _id: string; key: string; name: string; isSystem?: boolean };
  type RbacUserRole = { _id: string; supabaseUserId: string; roleId: string; isPrimary?: boolean };
  type RbacPermission = { _id: string; key: string; module: string; action: string; label?: string };
  type RbacMatrix = { roles: RbacRole[]; permissions: RbacPermission[]; rolePermissions: Array<{ roleId: string; permissionId: string; allowed: boolean }> };
  const [rbacRoles, setRbacRoles] = useState<RbacRole[]>([]);
  const [rbacUserRoles, setRbacUserRoles] = useState<RbacUserRole[]>([]);
  const [rbacMatrix, setRbacMatrix] = useState<RbacMatrix | null>(null);
  const [stagedRoleIds, setStagedRoleIds] = useState<Set<string>>(new Set());
  const [savingRbac, setSavingRbac] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (isDemo) {
        // Mock data for demo
        setUsers([
          { id: '1', name: 'John Doe', email: 'john@example.com', phone: '1234567890', role: 'user', status: 'active', is_verified: true, created_at: '2023-01-01T10:00:00Z', address: '123 Main St, Mumbai' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321', role: 'admin', status: 'active', is_verified: true, created_at: '2023-02-01T11:00:00Z', address: '456 Oak St, Delhi' },
          { id: '3', name: 'Bob Wilson', email: 'bob@example.com', phone: '1122334455', role: 'moderator', status: 'suspended', is_verified: false, created_at: '2023-03-01T12:00:00Z', address: '789 Pine St, Bangalore' },
          { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '5566778899', role: 'user', status: 'pending', is_verified: false, created_at: '2023-04-01T09:00:00Z', address: '321 Elm St, Chennai' },
          { id: '5', name: 'Demo Admin', email: 'demo@admin.com', phone: '9988776655', role: 'demo_admin', status: 'active', is_verified: true, created_at: '2023-05-01T08:00:00Z', address: 'Admin HQ' },
          { id: '6', name: 'Staff Member', email: 'staff@example.com', phone: '1122334455', role: 'staff', status: 'active', is_verified: true, created_at: '2023-06-01T09:30:00Z', address: 'Warehouse A' },
        ] as UserProfile[]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRbacForUser = async () => {
      if (!isSuperAdmin || !showUserModal || !selectedUser || isDemo) return;
      try {
        const [rolesRes, matrixRes, userRolesRes] = await Promise.all([
          fetch('/api/rbac/roles', {
            credentials: 'include',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
          }),
          fetch('/api/rbac/roles/matrix', {
            credentials: 'include',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
          }),
          fetch(`/api/rbac/users/${selectedUser.id}/roles`, {
            credentials: 'include',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
          }),
        ]);
        if (!rolesRes.ok || !matrixRes.ok || !userRolesRes.ok) {
          throw new Error('Failed to load RBAC for user');
        }
        const rolesData: RbacRole[] = await rolesRes.json();
        const matrixData: RbacMatrix = await matrixRes.json();
        const userRolesData: RbacUserRole[] = await userRolesRes.json();
        setRbacRoles(rolesData || []);
        setRbacMatrix(matrixData || null);
        setRbacUserRoles(userRolesData || []);
        setStagedRoleIds(new Set((userRolesData || []).map((ur) => ur.roleId)));
      } catch (e: any) {
        console.error('loadRbacForUser error', e);
        toast.error(e.message || 'Failed to load RBAC');
      }
    };
    loadRbacForUser();
  }, [isSuperAdmin, showUserModal, selectedUser, isDemo]);

  const effectivePermissions = (() => {
    if (!rbacMatrix) return [];
    const set = new Set<string>();
    for (const rp of rbacMatrix.rolePermissions) {
      if (stagedRoleIds.has(rp.roleId) && rp.allowed) set.add(rp.permissionId);
    }
    const perms = rbacMatrix.permissions.filter((p) => set.has(p._id));
    return perms;
  })();

  const addStagedRole = (roleId: string) => {
    setStagedRoleIds((prev) => new Set(prev).add(roleId));
  };
  const removeStagedRole = (roleId: string) => {
    setStagedRoleIds((prev) => {
      const next = new Set(prev);
      next.delete(roleId);
      return next;
    });
  };

  const initialRoleIds = new Set(rbacUserRoles.map((ur) => ur.roleId));
  const addedRoleIds = Array.from(stagedRoleIds).filter((r) => !initialRoleIds.has(r));
  const removedRoleIds = Array.from(initialRoleIds).filter((r) => !stagedRoleIds.has(r));

  const saveRbacChanges = async () => {
    if (!selectedUser) return;
    try {
      setSavingRbac(true);
      // Apply additions
      for (const roleId of addedRoleIds) {
        const res = await fetch(`/api/rbac/users/${selectedUser.id}/roles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          credentials: 'include',
          body: JSON.stringify({ roleId, isPrimary: false }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to assign role');
        }
      }
      // Apply removals
      for (const roleId of removedRoleIds) {
        const userRole = rbacUserRoles.find((ur) => ur.roleId === roleId);
        if (!userRole) continue;
        const res = await fetch(`/api/rbac/users/${selectedUser.id}/roles/${userRole._id}`, {
          method: 'DELETE',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
          credentials: 'include',
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Failed to remove role');
        }
      }
      toast.success('User roles updated');
      setShowDiff(false);
      // Reload RBAC state
      const updated = await fetch(`/api/rbac/users/${selectedUser.id}/roles`, {
        credentials: 'include',
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      });
      if (updated.ok) {
        const data: RbacUserRole[] = await updated.json();
        setRbacUserRoles(data || []);
        setStagedRoleIds(new Set((data || []).map((ur) => ur.roleId)));
      }
    } catch (e: any) {
      console.error('saveRbacChanges error', e);
      toast.error(e.message || 'Failed to save changes');
    } finally {
      setSavingRbac(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (isDemo) {
      toast.error('This action is disabled in demo mode');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (isDemo) {
      toast.error('This action is disabled in demo mode');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleVerificationToggle = async (userId: string, isVerified: boolean) => {
    if (isDemo) {
      toast.error('This action is disabled in demo mode');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !isVerified })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${!isVerified ? 'verified' : 'unverified'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const deleteUser = async (userId: string) => {
    if (isDemo) {
      toast.error('This action is disabled in demo mode');
      return;
    }
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

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
    }
  };

  const handleAssignLocation = async () => {
    if (!selectedUser) return;
    
    if (isDemo) {
      toast.error('This action is disabled in demo mode');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ location_id: editLocationId })
        .eq('id', selectedUser.id);

      if (error) throw error;
      
      toast.success('Location assigned successfully');
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, location_id: editLocationId || undefined } : u));
      setSelectedUser({ ...selectedUser, location_id: editLocationId || undefined });
    } catch (error) {
      console.error('Error assigning location:', error);
      toast.error('Failed to assign location');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.status === filter || user.role === filter;
    const matchesLocation = !filterLocation || user.location_id === filterLocation;
    return matchesSearch && matchesFilter && matchesLocation;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'demo_admin':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'staff':
        return <UserCheck className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[180px]" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
            <option value="admin">Admins</option>
            <option value="superadmin">Super Admins</option>
            <option value="demo_admin">Demo Admins</option>
            <option value="staff">Staff</option>
            <option value="moderator">Moderators</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Mobile Cards */}
        <div className="md:hidden">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 flex-shrink-0 mr-3">
                  {user.avatar_url ? (
                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url} alt="" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'No name'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Role</label>
                  <div className="flex items-center">
                    {getRoleIcon(user.role)}
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="ml-2 text-xs border-none bg-transparent focus:ring-0 p-0"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                      <option value="demo_admin">Demo Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Status</label>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-none ${getStatusColor(user.status)}`}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerificationToggle(user.id, user.is_verified)}
                    className={`flex items-center text-xs ${
                      user.is_verified ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {user.is_verified ? (
                      <><CheckCircle className="h-4 w-4 mr-1" /> Verified</>
                    ) : (
                      <><Shield className="h-4 w-4 mr-1" /> Verify</>
                    )}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setEditLocationId(user.location_id || null);
                      setShowUserModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.avatar_url}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="ml-2 text-sm border-none bg-transparent focus:ring-0"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="demo_admin">Demo Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleVerificationToggle(user.id, user.is_verified)}
                      className={`flex items-center ${
                        user.is_verified
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {user.is_verified ? (
                        <CheckCircle className="h-5 w-5 mr-1" />
                      ) : (
                        <UserX className="h-5 w-5 mr-1" />
                      )}
                      {user.is_verified ? 'Verified' : 'Unverified'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="btn btn-ghost btn-sm inline-flex items-center"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="btn btn-ghost btn-sm inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                ×
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{selectedUser.role}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedUser.address || 'Not provided'}</p>
              </div>
              <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location Assignment</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    defaultValue={selectedUser.location_id || ""}
                    disabled={isDemo}
                  >
                    <option value="" disabled>Select a location</option>
                    <option value="1">Mumbai Central Yard</option>
                    <option value="2">Delhi North Hub</option>
                    <option value="3">Bangalore Tech Park</option>
                  </select>
                  <button 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    disabled={isDemo}
                    onClick={() => toast.success("Location assigned (stub)")}
                  >
                    Assign
                  </button>
                </div>
                {isDemo && <p className="text-xs text-amber-500 mt-1">Location assignment is disabled in demo mode</p>}
              </div>
              {isSuperAdmin && !isDemo && (
                <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roles</label>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-xs"
                        onChange={(e) => {
                          const roleId = e.target.value;
                          if (roleId) addStagedRole(roleId);
                          e.currentTarget.selectedIndex = 0;
                        }}
                      >
                        <option value="">+ Add role</option>
                        {rbacRoles
                          .filter((r) => !stagedRoleIds.has(r._id))
                          .map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                      <button
                        className="px-3 py-1 rounded-md border text-xs hover:bg-gray-50 dark:hover:bg-gray-900"
                        onClick={() => setShowDiff(true)}
                        disabled={savingRbac || (addedRoleIds.length === 0 && removedRoleIds.length === 0)}
                      >
                        Review changes
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Array.from(stagedRoleIds).map((roleId) => {
                      const role = rbacRoles.find((r) => r._id === roleId);
                      if (!role) return null;
                      return (
                        <span
                          key={roleId}
                          className={
                            'inline-flex items-center gap-2 px-2 py-1 rounded-full border text-[11px] ' +
                            (role.isSystem
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                          }
                        >
                          {role.name}
                          <button
                            className="ml-1 text-xs text-gray-500 hover:text-red-600"
                            onClick={() => removeStagedRole(roleId)}
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                    {stagedRoleIds.size === 0 && <span className="text-xs text-gray-500">No roles assigned</span>}
                  </div>
                  <div className="rounded-md border p-3 dark:border-gray-700">
                    <div className="text-xs font-semibold mb-2">Effective Permissions</div>
                    {effectivePermissions.length === 0 ? (
                      <div className="text-xs text-gray-500">No effective permissions</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {effectivePermissions.map((p) => (
                          <div key={p._id} className="text-xs text-gray-800 dark:text-gray-200">
                            ✔ {p.key}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showDiff && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center" onClick={() => setShowDiff(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">Pending Changes</div>
              <button className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white" onClick={() => setShowDiff(false)}>
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-semibold mb-1 text-emerald-700">Added roles</div>
                {addedRoleIds.length === 0 ? (
                  <div className="text-xs text-gray-500">None</div>
                ) : (
                  addedRoleIds.map((rid) => {
                    const r = rbacRoles.find((x) => x._id === rid);
                    return <div key={rid} className="text-xs">{r?.name || rid}</div>;
                  })
                )}
              </div>
              <div>
                <div className="text-xs font-semibold mb-1 text-red-700">Removed roles</div>
                {removedRoleIds.length === 0 ? (
                  <div className="text-xs text-gray-500">None</div>
                ) : (
                  removedRoleIds.map((rid) => {
                    const r = rbacRoles.find((x) => x._id === rid);
                    return <div key={rid} className="text-xs">{r?.name || rid}</div>;
                  })
                )}
              </div>
            </div>
            <div className="mt-3 text-right">
              <button
                className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={savingRbac}
                onClick={saveRbacChanges}
              >
                {savingRbac ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
