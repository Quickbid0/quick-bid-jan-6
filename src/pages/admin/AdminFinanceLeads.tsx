import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { RefreshCw, Filter, Eye } from 'lucide-react';

interface FinanceLead {
  id: string;
  created_at: string;
  user_id: string | null;
  product_id: string | null;
  product_title: string | null;
  lead_type: 'loan' | 'insurance';
  status: 'new' | 'in_progress' | 'closed';
  name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  source: string | null;
}

const AdminFinanceLeads: React.FC = () => {
  const [rows, setRows] = useState<FinanceLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'closed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'loan' | 'insurance'>('all');

  const load = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('finance_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('lead_type', typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRows((data as FinanceLead[]) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to load finance leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter, typeFilter]);

  const updateStatus = async (id: string, status: FinanceLead['status']) => {
    try {
      const { error } = await supabase.from('finance_leads').update({ status }).eq('id', id);
      if (error) throw error;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success('Status updated');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Finance &amp; Insurance Leads</h1>
        <button
          onClick={load}
          disabled={loading}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" /> Reload
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Status</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Type</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="loan">Loan</option>
            <option value="insurance">Insurance</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Contact</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Notes</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  {loading ? 'Loading leads...' : 'No finance or insurance leads yet.'}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-2 align-top">
                  <div className="text-xs text-gray-700 dark:text-gray-200">
                    {new Date(row.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      row.lead_type === 'loan'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {row.lead_type === 'loan' ? 'Loan' : 'Insurance'}
                  </span>
                </td>
                <td className="p-2 align-top max-w-xs">
                  <div className="text-gray-900 dark:text-gray-100 font-medium truncate">
                    {row.product_title || '—'}
                  </div>
                  {row.product_id && (
                    <div className="text-xs text-gray-500">ID: {row.product_id}</div>
                  )}
                </td>
                <td className="p-2 align-top max-w-xs">
                  <div className="text-xs text-gray-700 dark:text-gray-200 break-all">
                    {row.user_id || 'Guest / unknown'}
                  </div>
                </td>
                <td className="p-2 align-top max-w-xs">
                  <div className="text-xs text-gray-900 dark:text-gray-100">
                    {row.name || '—'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 break-all">
                    {row.phone || '—'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 break-all">
                    {row.email || '—'}
                  </div>
                </td>
                <td className="p-2 align-top">
                  <select
                    className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-900"
                    value={row.status}
                    onChange={(e) => updateStatus(row.id, e.target.value as any)}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td className="p-2 align-top max-w-xs">
                  <div className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {row.notes || '—'}
                  </div>
                </td>
                <td className="p-2 align-top max-w-xs">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {row.source || 'product_detail_cta'}
                  </div>
                </td>
                <td className="p-2 align-top text-right">
                  {row.email && (
                    <a
                      href={`mailto:${row.email}`}
                      className="inline-flex items-center px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-3 w-3 mr-1" /> Email
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFinanceLeads;
