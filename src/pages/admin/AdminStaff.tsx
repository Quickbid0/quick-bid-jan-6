import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';
import LocationFilter from '../../components/admin/LocationFilter';
// import { StaffProfile } from '../../types/admin';

interface StaffProfile {
  _id?: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  primary_branch_id?: string;
  primary_department_id?: string;
  location_scope?: {
    type: string;
    id: string;
    name: string;
  };
  assigned_categories?: string[];
  [key: string]: any;
}

interface DepartmentOption {
  _id: string;
  name: string;
  key: string;
}

interface BranchOption {
  _id: string;
  name: string;
  code: string;
}

interface RoleOption {
  _id: string;
  name: string;
  key: string;
}

const AdminStaff: React.FC = () => {
  const { isAdmin } = useSession();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'disabled'>('all');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const isDemo = localStorage.getItem('demo-session') !== null;

  const [form, setForm] = useState({
    user_id: '',
    full_name: '',
    phone: '',
    email: '',
    primary_branch_id: '',
    primary_department_id: '',
    role: '',
    location_scope_type: 'branch', // Default
    location_scope_name: '',
    assigned_categories: '',
  });

  useEffect(() => {
    if (!isAdmin) return;
    loadLookups();
    loadStaff();
  }, [isAdmin]);

  const loadLookups = async () => {
    try {
      if (isDemo) {
        setDepartments([
            { _id: '1', name: 'Sales', key: 'sales' },
            { _id: '2', name: 'Operations', key: 'operations' },
            { _id: '3', name: 'Finance', key: 'finance' },
            { _id: '4', name: 'Support', key: 'support' },
            { _id: '5', name: 'Verification', key: 'verification' }
        ]);
        setBranches([
            { _id: '1', name: 'Mumbai HQ', code: 'MUM01' },
            { _id: '2', name: 'Delhi Branch', code: 'DEL01' },
            { _id: '3', name: 'Bangalore Hub', code: 'BLR01' }
        ]);
        setRoles([
            { _id: 'sales_executive', name: 'Sales Executive', key: 'sales_executive' },
            { _id: 'support_agent', name: 'Support Agent', key: 'support_agent' },
            { _id: 'field_verifier', name: 'Field Verifier', key: 'field_verifier' },
            { _id: 'content_staff', name: 'Content / Creative Staff', key: 'content_staff' },
            { _id: 'manager', name: 'Manager', key: 'manager' }
        ]);
        return;
      }

      const [deptRes, branchRes, roleRes] = await Promise.all([
        fetch('/api/departments', { credentials: 'include' }),
        fetch('/api/branches', { credentials: 'include' }),
        fetch('/api/rbac/roles', { credentials: 'include' }),
      ]);

      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments((data || []).filter((d: any) => d.isActive));
      }
      if (branchRes.ok) {
        const data = await branchRes.json();
        setBranches((data || []).filter((b: any) => b.isActive));
      }
      if (roleRes.ok) {
        const data = await roleRes.json();
        setRoles(data || []);
      }
    } catch (err) {
      console.error('loadLookups error', err);
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemo) {
        // Mock data for demo
        setStaff([
          { 
            id: '1', 
            user_id: 'demo-user-1', 
            full_name: 'Rajesh Kumar', 
            phone: '9876543210', 
            email: 'rajesh.k@quickmela.com', 
            primary_branch_id: '1', 
            status: 'active',
            role: 'sales_executive',
            location_scope: { type: 'district', name: 'Mumbai Suburban', id: 'd1' },
            assigned_categories: ['Electronics', 'Vehicles'],
            task_load: 75,
            created_at: new Date().toISOString()
          },
          { 
            id: '2', 
            user_id: 'demo-user-2', 
            full_name: 'Priya Singh', 
            phone: '9876543211', 
            email: 'priya.s@quickmela.com', 
            primary_branch_id: '2', 
            status: 'active',
            role: 'support_agent',
            location_scope: { type: 'branch', name: 'Delhi Branch', id: 'b1' },
            assigned_categories: [],
            task_load: 45,
            created_at: new Date().toISOString()
          },
          { 
            id: '3', 
            user_id: 'demo-user-3', 
            full_name: 'Amit Patel', 
            phone: '9876543212', 
            email: 'amit.p@quickmela.com', 
            primary_branch_id: '1', 
            status: 'active',
            role: 'field_verifier',
            location_scope: { type: 'city', name: 'Pune', id: 'c1' },
            assigned_categories: ['Real Estate'],
            task_load: 90,
            created_at: new Date().toISOString()
          },
           { 
            id: '4', 
            user_id: 'demo-user-4', 
            full_name: 'Sneha Gupta', 
            phone: '9876543213', 
            email: 'sneha.g@quickmela.com', 
            primary_branch_id: '3', 
            status: 'suspended',
            role: 'content_creative',
            location_scope: { type: 'state', name: 'Karnataka', id: 's1' },
            assigned_categories: ['Art', 'Collectibles'],
            task_load: 0,
            created_at: new Date().toISOString()
          },
        ]);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/staff', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load staff');
      const data = await res.json();
      // Map API response to new type if needed, assuming API returns camelCase
      const mappedData = data.map((d: any) => ({
        id: d._id || d.id,
        user_id: d.supabaseUserId || d.user_id,
        full_name: d.fullName || d.full_name,
        email: d.email,
        phone: d.phone,
        role: d.role,
        status: d.status,
        primary_branch_id: d.primaryBranchId || d.primary_branch_id,
        location_scope: d.locationScope || d.location_scope,
        assigned_categories: d.assignedCategories || d.assigned_categories,
        task_load: d.taskLoad || d.task_load || 0,
        created_at: d.createdAt || d.created_at || new Date().toISOString()
      }));
      setStaff(mappedData || []);
    } catch (err: any) {
      console.error('loadStaff error', err);
      setError(err.message || 'Failed to load staff');
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
        toast.error('This action is disabled in demo mode');
        return;
    }
    if (!form.user_id || !form.role) {
      toast.error('Supabase user ID and role are required');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          supabaseUserId: form.user_id,
          fullName: form.full_name || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
          primaryBranchId: form.primary_branch_id || undefined,
          primaryDepartmentId: form.primary_department_id || undefined,
          roleId: form.role,
          locationScope: {
            type: form.location_scope_type,
            name: form.location_scope_name
          },
          assignedCategories: form.assigned_categories ? form.assigned_categories.split(',').map(s => s.trim()) : [],
          isPrimary: true,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to create staff');
      }
      toast.success('Staff profile created and role assigned');
      setForm({
        user_id: '',
        full_name: '',
        phone: '',
        email: '',
        primary_branch_id: '',
        primary_department_id: '',
        role: '',
        location_scope_type: 'branch',
        location_scope_name: '',
        assigned_categories: '',
      });
      await loadStaff();
    } catch (err: any) {
      console.error('create staff error', err);
      toast.error(err.message || 'Failed to create staff');
    } finally {
      setSaving(false);
    }
  };

  const handleDisable = async (id: string) => {
    if (isDemo) {
        toast.error('This action is disabled in demo mode');
        return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/staff/${id}/disable`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to disable staff');
      toast.success('Staff disabled');
      await loadStaff();
    } catch (err: any) {
      console.error('disable staff error', err);
      toast.error(err.message || 'Failed to disable staff');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (filterLocation) {
        const matchesScope = s.location_scope?.id === filterLocation;
        const matchesBranch = s.primary_branch_id === filterLocation;
        if (!matchesScope && !matchesBranch) return false;
      }
      if (!search) return true;
      const haystack = `${s.full_name || ''} ${s.email || ''} ${s.phone || ''} ${s.user_id}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [staff, statusFilter, search, filterLocation]);

  const branchName = (id?: string) => branches.find((b) => String(b._id) === String(id))?.name || '';
  const departmentName = (id?: string) => departments.find((d) => String(d._id) === String(id))?.name || '';
  const roleName = (roleKey: string) => roles.find((r) => r.key === roleKey)?.name || roleKey;
  
  const getTaskLoadColor = (load: number) => {
    if (load < 50) return 'bg-emerald-500';
    if (load < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add staff, assign roles and map them to departments and branches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Add Staff</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Supabase User ID</label>
              <input
                type="text"
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Copy from profiles.id"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Department</label>
              <select
                name="primary_department_id"
                value={form.primary_department_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Branch</label>
              <select
                name="primary_branch_id"
                value={form.primary_branch_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select role</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.key})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location Scope</label>
                  <select
                    name="location_scope_type"
                    value={form.location_scope_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="state">State</option>
                    <option value="district">District</option>
                    <option value="city">City</option>
                    <option value="village">Village</option>
                    <option value="branch">Branch</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Scope Name</label>
                  <input
                    type="text"
                    name="location_scope_name"
                    value={form.location_scope_name}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
               </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Categories (Optional)</label>
              <input
                type="text"
                name="assigned_categories"
                value={form.assigned_categories}
                onChange={handleChange}
                placeholder="Comma separated (e.g. Electronics, Vehicles)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Create Staff & Assign Role'}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Existing Staff</h2>
            <div className="flex items-center gap-2 text-xs">
              <LocationFilter onFilterChange={setFilterLocation} className="min-w-[150px]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <input
                type="text"
                placeholder="Search by name, email, phone or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-w-[200px]"
              />
            </div>
          </div>

          {loading && <div className="py-6 text-sm text-gray-500">Loading...</div>}
          {error && !loading && <div className="py-2 text-xs text-red-600">{error}</div>}
          {!loading && !filtered.length && !error && (
            <div className="py-6 text-sm text-gray-500">No staff found. Add staff using the form on the left.</div>
          )}

          {!loading && !!filtered.length && (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Name / Contact</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Role & Scope</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Load</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 text-xs">
                      <div className="text-gray-900 dark:text-white font-medium">{s.full_name || '—'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{s.email || '—'}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-[10px]">{s.phone}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <div className="font-medium text-indigo-600 dark:text-indigo-400">{roleName(s.role)}</div>
                      {s.location_scope && (
                        <div className="flex items-center gap-1 mt-0.5">
                           <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                             {s.location_scope.type}
                           </span>
                           <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[100px]" title={s.location_scope.name}>
                             {s.location_scope.name}
                           </span>
                        </div>
                      )}
                      {s.assigned_categories && s.assigned_categories.length > 0 && (
                        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                          {s.assigned_categories.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs align-middle">
                      {s.task_load !== undefined ? (
                        <div className="w-24">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-gray-500">Load</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{s.task_load}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${getTaskLoadColor(s.task_load)}`} 
                              style={{ width: `${s.task_load}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px]">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={
                          'inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ' +
                          (s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200')
                        }
                      >
                        {s.status === 'active' ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      {s.status === 'active' && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleDisable(s.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStaff;
