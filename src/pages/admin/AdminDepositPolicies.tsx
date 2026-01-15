import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Plus, RefreshCw, Trash2, Edit3, Save, Sparkles } from 'lucide-react';

interface PolicyRow {
  id: string;
  active: boolean;
  product_id: string | null;
  product_category: string | null;
  state: string | null;
  district: string | null;
  mandal: string | null;
  amount: number;
  refundable: boolean;
  priority: number;
  notes?: string | null;
}

const AdminDepositPolicies: React.FC = () => {
  const [rows, setRows] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<Partial<PolicyRow>>({ active: true, refundable: true, priority: 0, amount: 5000 });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    recommendedPercentMin?: number;
    recommendedPercentMax?: number;
    recommendedPercentDefault?: number;
    reason?: string;
  } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deposit_policies')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setRows((data as PolicyRow[]) || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAiSuggest = async () => {
    try {
      if (!form.amount || form.amount <= 0) {
        toast.error('Set a rough amount first (used as product price for suggestion)');
        return;
      }
      setAiLoading(true);
      setAiSuggestion(null);

      const price = form.amount;
      const category = form.product_category || 'general';
      const refundable = form.refundable ?? true;

      const res = await fetch('/api/ai/deposit-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, category, refundable }),
      });
      if (!res.ok) {
        toast.error('AI could not suggest a deposit right now');
        return;
      }
      const data = await res.json();
      if (!data?.suggestion) {
        toast('No suggestion returned');
        return;
      }
      setAiSuggestion(data.suggestion);

      // If we have a default percent, prefill amount as a hint (price * percent)
      if (typeof data.suggestion.recommendedPercentDefault === 'number') {
        const pct = data.suggestion.recommendedPercentDefault;
        const suggestedAmount = Math.round((price * pct) / 100);
        setForm((prev) => ({ ...prev, amount: suggestedAmount }));
      }
      toast.success('AI suggestion loaded');
    } catch (e) {
      console.error('AI deposit suggest error', e);
      toast.error('Failed to get AI deposit suggestion');
    } finally {
      setAiLoading(false);
    }
  };

  const createPolicy = async () => {
    if (!form?.amount || form.amount <= 0) return toast.error('Amount must be > 0');
    setLoading(true);
    try {
      const { error } = await supabase.from('deposit_policies').insert([{
        active: form.active ?? true,
        product_id: form.product_id ?? null,
        product_category: form.product_category ?? null,
        state: form.state ?? null,
        district: form.district ?? null,
        mandal: form.mandal ?? null,
        amount: form.amount,
        refundable: form.refundable ?? true,
        priority: form.priority ?? 0,
        notes: form.notes ?? null,
      }]);
      if (error) throw error;
      toast.success('Policy created');
      setForm({ active: true, refundable: true, priority: 0, amount: 5000 });
      load();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to create policy');
    } finally { setLoading(false); }
  };

  const updatePolicy = async (row: PolicyRow) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('deposit_policies')
        .update({
          active: row.active,
          product_id: row.product_id,
          product_category: row.product_category,
          state: row.state,
          district: row.district,
          mandal: row.mandal,
          amount: row.amount,
          refundable: row.refundable,
          priority: row.priority,
          notes: row.notes ?? null,
        })
        .eq('id', row.id);
      if (error) throw error;
      toast.success('Policy updated');
      setEditing({ ...editing, [row.id]: false });
      load();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update policy');
    } finally { setLoading(false); }
  };

  const deletePolicy = async (id: string) => {
    if (!confirm('Delete this policy?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('deposit_policies').delete().eq('id', id);
      if (error) throw error;
      toast.success('Policy deleted');
      setRows(rows.filter(r => r.id !== id));
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to delete policy');
    } finally { setLoading(false); }
  };

  const onField = (row: PolicyRow, key: keyof PolicyRow, value: any) => {
    setRows(rows.map(r => r.id === row.id ? { ...r, [key]: value } : r));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Deposit Policies</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAiSuggest}
            disabled={aiLoading}
            className="px-3 py-2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 text-xs flex items-center gap-1"
          >
            <Sparkles className="h-4 w-4" />
            {aiLoading ? 'AI suggesting…' : 'AI suggest'}
          </button>
          <button onClick={load} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2"><RefreshCw className="h-4 w-4"/>Reload</button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <input className="border rounded px-3 py-2" placeholder="Product ID (optional)" value={form.product_id ?? ''} onChange={e=>setForm({...form, product_id: e.target.value || null as any})}/>
        <input className="border rounded px-3 py-2" placeholder="Category (optional)" value={form.product_category ?? ''} onChange={e=>setForm({...form, product_category: e.target.value || null})}/>
        <input className="border rounded px-3 py-2" placeholder="State" value={form.state ?? ''} onChange={e=>setForm({...form, state: e.target.value || null})}/>
        <input className="border rounded px-3 py-2" placeholder="District" value={form.district ?? ''} onChange={e=>setForm({...form, district: e.target.value || null})}/>
        <input className="border rounded px-3 py-2" placeholder="Mandal" value={form.mandal ?? ''} onChange={e=>setForm({...form, mandal: e.target.value || null})}/>
        <input type="number" min={1} className="border rounded px-3 py-2" placeholder="Amount" value={form.amount ?? 5000} onChange={e=>setForm({...form, amount: Number(e.target.value)})}/>
        <select className="border rounded px-3 py-2" value={String(form.refundable ?? true)} onChange={e=>setForm({...form, refundable: e.target.value === 'true'})}>
          <option value="true">Refundable</option>
          <option value="false">Non-refundable</option>
        </select>
        <input type="number" className="border rounded px-3 py-2" placeholder="Priority" value={form.priority ?? 0} onChange={e=>setForm({...form, priority: Number(e.target.value)})}/>
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Notes" value={form.notes ?? ''} onChange={e=>setForm({...form, notes: e.target.value})}/>
        <button disabled={loading} onClick={createPolicy} className="md:col-span-4 bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 flex items-center justify-center gap-2"><Plus className="h-4 w-4"/>Create Policy</button>
      </div>

      {aiSuggestion && (
        <div className="mb-6 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 text-xs">
          <div className="font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-500" />
            AI recommendation (review before saving)
          </div>
          <div className="text-gray-700 dark:text-gray-200 mb-1">
            Recommended range:
            {' '}
            {typeof aiSuggestion.recommendedPercentMin === 'number' && typeof aiSuggestion.recommendedPercentMax === 'number'
              ? `${aiSuggestion.recommendedPercentMin}% - ${aiSuggestion.recommendedPercentMax}%`
              : 'n/a'}
          </div>
          {typeof aiSuggestion.recommendedPercentDefault === 'number' && (
            <div className="text-gray-700 dark:text-gray-200 mb-1">
              Suggested default: {aiSuggestion.recommendedPercentDefault}%
              {form.amount && (
                <>
                  {' '}(
                  ≈ {Math.round((form.amount / (aiSuggestion.recommendedPercentDefault / 100)) || 0).toLocaleString()} product price basis)
                </>
              )}
            </div>
          )}
          {aiSuggestion.reason && (
            <div className="text-gray-600 dark:text-gray-300">
              Reason: {aiSuggestion.reason}
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Active</th>
              <th className="p-2 text-left">Product ID</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">State</th>
              <th className="p-2 text-left">District</th>
              <th className="p-2 text-left">Mandal</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Refundable</th>
              <th className="p-2 text-left">Priority</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-2"><input type="checkbox" checked={r.active} onChange={e=>onField(r, 'active', e.target.checked)} /></td>
                <td className="p-2"><input className="border rounded px-2 py-1 w-48" value={r.product_id ?? ''} onChange={e=>onField(r, 'product_id', e.target.value || null)} /></td>
                <td className="p-2"><input className="border rounded px-2 py-1 w-36" value={r.product_category ?? ''} onChange={e=>onField(r, 'product_category', e.target.value || null)} /></td>
                <td className="p-2"><input className="border rounded px-2 py-1 w-28" value={r.state ?? ''} onChange={e=>onField(r, 'state', e.target.value || null)} /></td>
                <td className="p-2"><input className="border rounded px-2 py-1 w-28" value={r.district ?? ''} onChange={e=>onField(r, 'district', e.target.value || null)} /></td>
                <td className="p-2"><input className="border rounded px-2 py-1 w-28" value={r.mandal ?? ''} onChange={e=>onField(r, 'mandal', e.target.value || null)} /></td>
                <td className="p-2"><input type="number" className="border rounded px-2 py-1 w-24" value={r.amount} onChange={e=>onField(r, 'amount', Number(e.target.value))} /></td>
                <td className="p-2">
                  <select className="border rounded px-2 py-1" value={String(r.refundable)} onChange={e=>onField(r, 'refundable', e.target.value === 'true')}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </td>
                <td className="p-2"><input type="number" className="border rounded px-2 py-1 w-20" value={r.priority} onChange={e=>onField(r, 'priority', Number(e.target.value))} /></td>
                <td className="p-2 flex gap-2">
                  <button className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200" onClick={()=>updatePolicy(r)}><Save className="h-4 w-4"/></button>
                  <button className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={()=>deletePolicy(r.id)}><Trash2 className="h-4 w-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDepositPolicies;
