import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSession } from '../../context/SessionContext';

interface Department {
  _id: string;
  name: string;
  key: string;
  description?: string;
  isActive: boolean;
}

const AdminDepartments: React.FC = () => {
  const { isAdmin } = useSession();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Department>>({ name: '', key: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    loadDepartments();
  }, [isAdmin]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/departments', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load departments');
      const data = await res.json();
      setItems(data || []);
    } catch (err: any) {
      console.error('loadDepartments error', err);
      setError(err.message || 'Failed to load departments');
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.key) {
      toast.error('Name and key are required');
      return;
    }
    try {
      setSaving(true);
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name,
          key: form.key,
          description: form.description,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to create department');
      }
      toast.success('Department created');
      setForm({ name: '', key: '', description: '' });
      await loadDepartments();
    } catch (err: any) {
      console.error('create department error', err);
      toast.error(err.message || 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (dept: Department) => {
    try {
      setSaving(true);
      if (dept.isActive) {
        // Soft-disable via DELETE
        const res = await fetch(`/api/departments/${dept._id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to disable department');
      } else {
        const res = await fetch(`/api/departments/${dept._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isActive: true }),
        });
        if (!res.ok) throw new Error('Failed to enable department');
      }
      toast.success('Department updated');
      await loadDepartments();
    } catch (err: any) {
      console.error('toggle department error', err);
      toast.error(err.message || 'Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage departments and assign them later to staff and roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:col-span-1">
          <h2 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Add Department</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key</label>
              <input
                type="text"
                name="key"
                value={form.key || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="operations, finance, support..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Create Department'}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Existing Departments</h2>
          </div>

          {loading && <div className="py-6 text-sm text-gray-500">Loading...</div>}
          {error && !loading && <div className="py-2 text-xs text-red-600">{error}</div>}
          {!loading && !items.length && !error && (
            <div className="py-6 text-sm text-gray-500">No departments yet. Create the first one on the left.</div>
          )}

          {!loading && !!items.length && (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Key</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((d) => (
                  <tr key={d._id}>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{d.name}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{d.key}</td>
                    <td className="px-3 py-2 text-xs">
                      <span
                        className={
                          'inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ' +
                          (d.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200')
                        }
                      >
                        {d.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleToggleActive(d)}
                        className="inline-flex items-center px-2 py-1 rounded-md border text-[11px] hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        {d.isActive ? 'Disable' : 'Enable'}
                      </button>
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

export default AdminDepartments;
