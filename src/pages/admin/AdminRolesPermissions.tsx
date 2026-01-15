import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';

type Role = {
  _id: string;
  key: string;
  name: string;
  description?: string;
  level?: string;
  isSystem?: boolean;
};

type Permission = {
  _id: string;
  key: string;
  module: string;
  action: string;
  label?: string;
  description?: string;
};

type RolePermissionMatrix = {
  roles: Role[];
  permissions: Permission[];
  rolePermissions: Array<{
    _id: string;
    roleId: string;
    permissionId: string;
    allowed: boolean;
  }>;
};

type RoleUserCount = {
  roleId: string;
  count: number;
};

const AdminRolesPermissions: React.FC = () => {
  const { isSuperAdmin, session } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<RolePermissionMatrix | null>(null);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<Partial<Role>>({ name: '', key: '', description: '', isSystem: false });
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadData();
  }, [isSuperAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes, matrixRes, countsRes] = await Promise.all([
        fetch('/api/rbac/roles', {
          credentials: 'include',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        }),
        fetch('/api/rbac/permissions', {
          credentials: 'include',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        }),
        fetch('/api/rbac/roles/matrix', {
          credentials: 'include',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        }),
        fetch('/api/rbac/roles/user-counts', {
          credentials: 'include',
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
        }),
      ]);
      if (!rolesRes.ok || !permsRes.ok || !matrixRes.ok || !countsRes.ok) {
        throw new Error('Failed to load RBAC data');
      }
      const rolesData = await rolesRes.json();
      const permsData = await permsRes.json();
      const matrixData = await matrixRes.json();
      const countsData: RoleUserCount[] = await countsRes.json();
      setRoles(rolesData || []);
      setPermissions(permsData || []);
      setMatrix(matrixData || null);
      setUserCounts(Object.fromEntries((countsData || []).map((c) => [String(c.roleId), c.count])));
    } catch (e: any) {
      console.error('load RBAC error', e);
      toast.error(e.message || 'Failed to load RBAC');
    } finally {
      setLoading(false);
    }
  };

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of permissions) {
      const key = p.module || 'misc';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  }, [permissions]);

  const rolePermSet = useMemo(() => {
    const set = new Set<string>();
    if (!matrix || !editingRole) return set;
    for (const rp of matrix.rolePermissions) {
      if (rp.roleId === editingRole._id && rp.allowed) {
        set.add(rp.permissionId);
      }
    }
    return set;
  }, [matrix, editingRole]);

  useEffect(() => {
    setSelectedPermIds(new Set(rolePermSet));
  }, [rolePermSet]);

  const openCreate = () => {
    setEditingRole(null);
    setRoleForm({ name: '', key: '', description: '', isSystem: false });
    setSelectedPermIds(new Set());
    setDrawerOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, key: role.key, description: role.description, isSystem: role.isSystem });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleRoleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRoleForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePerm = (permId: string, checked: boolean) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permId);
      else next.delete(permId);
      return next;
    });
  };

  const saveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name) {
      toast.error('Role name is required');
      return;
    }
    const payload: any = {
      name: roleForm.name,
      description: roleForm.description || '',
      isSystem: !!roleForm.isSystem,
    };
    if (!editingRole) {
      payload.key = roleForm.key || roleForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      payload.level = 'global';
    }
    try {
      setSaving(true);
      const res = await fetch(editingRole ? `/api/rbac/roles/${editingRole._id}` : '/api/rbac/roles', {
        method: editingRole ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const reqId = res.headers.get('x-request-id') || '';
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to save role');
      }
      toast.success(`Role ${editingRole ? 'updated' : 'created'}${reqId ? ` · ${reqId}` : ''}`);
      await loadData();
      setDrawerOpen(false);
    } catch (e: any) {
      console.error('saveRole error', e);
      toast.error(e.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const savePermissions = async () => {
    if (!editingRole) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/rbac/roles/${editingRole._id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ permissionIds: Array.from(selectedPermIds), allowed: true }),
      });
      const reqId = res.headers.get('x-request-id') || '';
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to assign permissions');
      }
      toast.success(`Permissions saved${reqId ? ` · ${reqId}` : ''}`);
      await loadData();
    } catch (e: any) {
      console.error('savePermissions error', e);
      toast.error(e.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles &amp; Permissions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Super Admin can create roles, assign permissions, and manage user-role mapping.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          + Create Role
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Existing Roles</h2>
        </div>
        {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Role Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Users</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Description</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {roles.map((r) => (
                  <tr key={r._id}>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{r.name}</td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={
                          'inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ' +
                          (r.isSystem
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                        }
                      >
                        {r.isSystem ? 'System' : 'Custom'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">{userCounts[String(r._id)] || 0}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{r.description || '—'}</td>
                    <td className="px-3 py-2 text-right text-xs">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="px-2 py-1 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          {r.isSystem ? 'View' : 'Edit'}
                        </button>
                        {!r.isSystem && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                              try {
                                setSaving(true);
                                const res = await fetch(`/api/rbac/roles/${r._id}`, {
                                  method: 'DELETE',
                                  headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
                                  credentials: 'include',
                                });
                                const reqId = res.headers.get('x-request-id') || '';
                                if (!res.ok) {
                                  const body = await res.json().catch(() => ({}));
                                  throw new Error(body.message || 'Failed to delete role');
                                }
                                toast.success(`Role deleted${reqId ? ` · ${reqId}` : ''}`);
                                await loadData();
                              } catch (e: any) {
                                console.error('delete role error', e);
                                toast.error(e.message || 'Failed to delete role');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="px-2 py-1 rounded-md border hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={closeDrawer}>
          <div
            className="absolute top-0 right-0 h-full w-full max-w-3xl bg-white dark:bg-gray-900 shadow-xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h2>
              <button onClick={closeDrawer} className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs">
                Close
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-56px)]">
              <form onSubmit={saveRole} className="space-y-3">
                {!editingRole && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role Key</label>
                    <input
                      type="text"
                      name="key"
                      value={roleForm.key || ''}
                      onChange={handleRoleField}
                      placeholder="finance_admin, support_lead…"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                  <input
                    type="text"
                    name="name"
                    value={roleForm.name || ''}
                    onChange={handleRoleField}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={roleForm.description || ''}
                    onChange={handleRoleField}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isSystem"
                    type="checkbox"
                    checked={!!roleForm.isSystem}
                    onChange={(e) => setRoleForm((prev) => ({ ...prev, isSystem: e.target.checked }))}
                  />
                  <label htmlFor="isSystem" className="text-xs text-gray-700 dark:text-gray-300">
                    System role (locked)
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : editingRole ? 'Save Role' : 'Create Role'}
                  </button>
                </div>
              </form>

              {editingRole && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Assign Permissions</h3>
                  <div className="space-y-3">
                    {Object.entries(groupedPermissions).map(([group, perms]) => (
                      <details key={group} className="rounded-md border p-3 dark:border-gray-700">
                        <summary className="text-xs font-semibold cursor-pointer select-none">
                          {group.replace(/[_\-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </summary>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((p) => {
                            const restricted = p.key === 'rbac.manage';
                            const checked = selectedPermIds.has(p._id);
                            return (
                              <label key={p._id} className="flex items-start gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={restricted}
                                  onChange={(e) => togglePerm(p._id, e.target.checked)}
                                />
                                <span className="text-gray-900 dark:text-gray-200">
                                  {p.key}
                                  {restricted && (
                                    <span className="ml-2 text-[11px] text-orange-600">(Super Admin only)</span>
                                  )}
                                  {p.description && <span className="ml-2 text-[11px] text-gray-500">— {p.description}</span>}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </details>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={savePermissions}
                      className="inline-flex items-center px-3 py-2 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save Permissions'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRolesPermissions;
