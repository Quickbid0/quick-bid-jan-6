import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Link } from 'react-router-dom';
import { UserCircle2, Plus, Search, Filter, MoreVertical, Phone, Mail, Calendar, DollarSign, Building2, MapPin, BarChart3, Loader2 } from 'lucide-react';
import PageContainer from '../../components/layout/PageFrame';

interface SalesLead {
  id: string;
  source: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  company: string | null;
  owner_user_id: string | null;
  status: string;
  value_gmv: number | null;
  notes: string | null;
  next_follow_up_at: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadsResponse {
  items: SalesLead[];
  total: number;
}

const STATUS_OPTIONS = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
];

const AdminSalesLeads: React.FC = () => {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'unassigned'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    source: 'seller',
    phone: '',
    email: '',
    city: '',
    state: '',
    company: '',
    value_gmv: '',
    notes: '',
  });

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('AdminSalesLeads: getSession error', sessionError);
      }
      const token = sessionData.session?.access_token;
      if (!token) {
        setError('You must be logged in as admin to view sales leads.');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const resp = await fetch(`/api/sales/leads?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error('AdminSalesLeads: backend error', body);
        setError(body.error || body.message || 'Failed to load leads');
        setLoading(false);
        return;
      }

      const body = (await resp.json()) as LeadsResponse;
      setLeads(body.items || []);
      setTotal(body.total || 0);
    } catch (e) {
      console.error('AdminSalesLeads: unexpected error', e);
      setError('Unexpected error while loading leads');
    } finally {
      setLoading(false);
    }
  };

  const displayLeads = leads.filter((lead) => {
    if (ownerFilter === 'mine' && currentUserId) {
      return lead.owner_user_id === currentUserId;
    }
    if (ownerFilter === 'unassigned') {
      return !lead.owner_user_id;
    }
    return true;
  });

  const getFollowUpLabel = (dateStr: string | null) => {
    if (!dateStr) return { label: 'Not set', className: 'bg-gray-100 text-gray-600' } as const;
    const dt = new Date(dateStr);
    if (Number.isNaN(dt.getTime())) return { label: 'Invalid date', className: 'bg-gray-100 text-gray-600' } as const;
    const now = new Date();
    const diffMs = dt.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < -0.5) {
      return { label: 'Overdue', className: 'bg-red-50 text-red-700 border border-red-200' } as const;
    }
    if (Math.abs(diffDays) <= 0.5) {
      return { label: 'Due today', className: 'bg-amber-50 text-amber-700 border border-amber-200' } as const;
    }
    if (diffDays <= 7) {
      return { label: 'Upcoming', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' } as const;
    }
    return { label: 'Later', className: 'bg-gray-50 text-gray-600 border border-gray-200' } as const;
  };

  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'won') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (s === 'lost') {
      return 'bg-red-50 text-red-700 border border-red-200';
    }
    if (s === 'qualified' || s === 'proposal') {
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
    if (s === 'contacted') {
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    }
    // default for 'new' or others
    return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  };

  useEffect(() => {
    // Best-effort current user id for owner assignment and filtering
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setCurrentUserId(data.user?.id ?? null);
      } catch (e) {
        console.warn('AdminSalesLeads: failed to load current user', e);
        setCurrentUserId(null);
      }
    })();

    loadLeads();
  }, []);

  const handleQuickFilterApply = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadLeads();
  };

  const handleUpdateLead = async (id: string, patch: Partial<SalesLead>) => {
    try {
      setSaving(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const resp = await fetch(`/api/sales/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error('AdminSalesLeads: update error', body);
        return;
      }

      const updated = (await resp.json()) as SalesLead;
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch (e) {
      console.error('AdminSalesLeads: update exception', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name.trim()) return;

    try {
      setSaving(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const payload: any = {
        source: newLead.source,
        name: newLead.name.trim(),
        phone: newLead.phone || null,
        email: newLead.email || null,
        city: newLead.city || null,
        state: newLead.state || null,
        company: newLead.company || null,
        value_gmv: newLead.value_gmv ? Number(newLead.value_gmv) : null,
        notes: newLead.notes || null,
      };

      const resp = await fetch('/api/sales/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error('AdminSalesLeads: create error', body);
        return;
      }

      const created = (await resp.json()) as SalesLead;
      setLeads((prev) => [created, ...prev]);
      setTotal((prev) => prev + 1);
      setNewLead({
        name: '',
        source: 'seller',
        phone: '',
        email: '',
        city: '',
        state: '',
        company: '',
        value_gmv: '',
        notes: '',
      });
      setCreating(false);
    } catch (e) {
      console.error('AdminSalesLeads: create exception', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCircle2 className="h-7 w-7 text-indigo-500" />
            Sales Leads
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lightweight CRM for seller, partner and investor leads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/sales-dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
          <Link
            to="/admin/payouts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Payouts
          </Link>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            disabled={saving}
          >
            <Plus className="h-4 w-4" />
            New lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleQuickFilterApply}
        className="flex flex-wrap items-end gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm"
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value as 'all' | 'mine' | 'unassigned')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
        >
          <option value="all">All owners</option>
          <option value="mine">My leads</option>
          <option value="unassigned">Unassigned</option>
        </select>

        <div className="flex-1 min-w-[180px] flex items-center gap-2">
          <div className="relative w-full">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, company or city"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-800"
        >
          <BarChart3 className="h-4 w-4" />
          Apply
        </button>
      </form>

      {/* Create lead modal (simple inline card) */}
      {creating && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New lead</h2>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleCreateLead}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Source</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead((p) => ({ ...p, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                >
                  <option value="seller">Seller</option>
                  <option value="partner">Partner</option>
                  <option value="investor">Investor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={newLead.phone}
                  onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  value={newLead.city}
                  onChange={(e) => setNewLead((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  value={newLead.state}
                  onChange={(e) => setNewLead((p) => ({ ...p, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Expected GMV (₹)</label>
                <input
                  type="number"
                  value={newLead.value_gmv}
                  onChange={(e) => setNewLead((p) => ({ ...p, value_gmv: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={newLead.notes}
                onChange={(e) => setNewLead((p) => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="px-3 py-2 text-xs rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create lead
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leads table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead pipeline</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {total} lead{total === 1 ? '' : 's'} in the current view.
            </p>
          </div>
        </div>
        <div className="px-6 py-4 overflow-x-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading leads…
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : displayLeads.length === 0 ? (
            <p className="text-sm text-gray-500">No leads found for the selected filters.</p>
          ) : (
            <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Source</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Location</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Company</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Owner</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Expected GMV</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Next follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {displayLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-gray-500">
                        {lead.phone || lead.email || 'No contact set'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs capitalize">{lead.source}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                      {lead.city || '-'}, {lead.state || '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">{lead.company || '-'}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                      <div className="flex flex-col gap-1">
                        <span>
                          {lead.owner_user_id
                            ? lead.owner_user_id === currentUserId
                              ? 'You'
                              : 'Assigned'
                            : 'Unassigned'}
                        </span>
                        {!lead.owner_user_id && currentUserId && (
                          <button
                            type="button"
                            onClick={() => handleUpdateLead(lead.id, { owner_user_id: currentUserId })}
                            className="inline-flex items-center px-2 py-0.5 rounded-md border border-indigo-200 text-[11px] text-indigo-700 hover:bg-indigo-50"
                          >
                            Assign to me
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                      <select
                        value={lead.status}
                        onChange={(e) => handleUpdateLead(lead.id, { status: e.target.value })}
                        className={`px-2 py-1 rounded-full text-[11px] font-medium ${getStatusClass(lead.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                      {lead.value_gmv != null ? `₹${lead.value_gmv.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span>
                          {lead.next_follow_up_at
                            ? new Date(lead.next_follow_up_at).toLocaleString()
                            : '-'}
                        </span>
                        {(() => {
                          const chip = getFollowUpLabel(lead.next_follow_up_at);
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] ${chip.className}`}>
                              {chip.label}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {!loading && !error && leads.length === 0 && (
        <div className="text-center py-16">
          <UserCircle2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No leads found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting the filters or create your first lead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setStatusFilter('')}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setCreating(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </button>
            <Link
              to="/admin/sales-dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
    </PageContainer>
  );
};

export default AdminSalesLeads;
