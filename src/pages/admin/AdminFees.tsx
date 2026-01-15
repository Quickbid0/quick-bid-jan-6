import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

interface FeeRule {
  id: string;
  name: string;
  scope_category_id: string | null;
  scope_partner_id: string | null;
  commission_percent: number;
  listing_fee: number;
  convenience_fee: number;
  penalty_fee: number;
  start_at: string;
  end_at: string | null;
  active: boolean;
}

const AdminFees: React.FC = () => {
  const [rules, setRules] = useState<FeeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FeeRule>>({
    name: '',
    scope_category_id: null,
    scope_partner_id: '',
    commission_percent: 5,
    listing_fee: 99,
    convenience_fee: 2,
    penalty_fee: 499,
    start_at: new Date().toISOString(),
    end_at: null,
    active: true,
  });

  const load = async () => {
    setLoading(true); setError(null);
    const { data, error } = await supabase.from('fee_rules').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    setRules((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setError(null);
    if (!form.name) { setError('Name required'); return; }
    const payload: any = {
      name: form.name,
      scope_category_id: form.scope_category_id || null,
      scope_partner_id: form.scope_partner_id || null,
      commission_percent: Number(form.commission_percent) || 0,
      listing_fee: Number(form.listing_fee) || 0,
      convenience_fee: Number(form.convenience_fee) || 0,
      penalty_fee: Number(form.penalty_fee) || 0,
      start_at: form.start_at || new Date().toISOString(),
      end_at: form.end_at || null,
      active: !!form.active,
    };
    const { error } = await supabase.from('fee_rules').insert([payload]);
    if (error) { setError(error.message); return; }
    setForm({ name: '', scope_category_id: null, scope_partner_id: '', commission_percent: 5, listing_fee: 99, convenience_fee: 2, penalty_fee: 499, start_at: new Date().toISOString(), end_at: null, active: true });
    await load();
  };

  const remove = async (id: string) => {
    setError(null);
    const { error } = await supabase.from('fee_rules').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dynamic Fee Engine</h1>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-3">Create Fee Rule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Name" value={form.name || ''} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Category ID (optional)" value={form.scope_category_id || ''} onChange={(e) => setForm(s => ({ ...s, scope_category_id: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Partner Code (optional)" value={form.scope_partner_id || ''} onChange={(e) => setForm(s => ({ ...s, scope_partner_id: e.target.value }))} />
          <input className="border rounded px-3 py-2" placeholder="Commission %" type="number" value={form.commission_percent as any} onChange={(e) => setForm(s => ({ ...s, commission_percent: Number(e.target.value) }))} />
          <input className="border rounded px-3 py-2" placeholder="Listing fee" type="number" value={form.listing_fee as any} onChange={(e) => setForm(s => ({ ...s, listing_fee: Number(e.target.value) }))} />
          <input className="border rounded px-3 py-2" placeholder="Convenience fee (flat or % as number)" type="number" value={form.convenience_fee as any} onChange={(e) => setForm(s => ({ ...s, convenience_fee: Number(e.target.value) }))} />
          <input className="border rounded px-3 py-2" placeholder="Penalty fee" type="number" value={form.penalty_fee as any} onChange={(e) => setForm(s => ({ ...s, penalty_fee: Number(e.target.value) }))} />
          <input className="border rounded px-3 py-2" placeholder="Start at" type="datetime-local" value={form.start_at ? form.start_at.substring(0,16) : ''} onChange={(e) => setForm(s => ({ ...s, start_at: new Date(e.target.value).toISOString() }))} />
          <input className="border rounded px-3 py-2" placeholder="End at (optional)" type="datetime-local" value={form.end_at ? form.end_at.substring(0,16) : ''} onChange={(e) => setForm(s => ({ ...s, end_at: e.target.value ? new Date(e.target.value).toISOString() : null }))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.active} onChange={(e) => setForm(s => ({ ...s, active: e.target.checked }))} /> Active</label>
        </div>
        <div className="mt-3">
          <button onClick={save} className="px-4 py-2 bg-indigo-600 text-white rounded">Save Rule</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
        <h2 className="font-semibold mb-3">Existing Rules</h2>
        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : rules.length === 0 ? (
          <div className="text-sm text-gray-500">No rules yet.</div>
        ) : (
          <div className="space-y-2">
            {rules.map(r => (
              <div key={r.id} className="flex items-center justify-between border rounded px-3 py-2">
                <div>
                  <div className="font-medium">{r.name} {r.active ? '' : '(inactive)'}</div>
                  <div className="text-xs text-gray-500">{r.commission_percent}% commission • Listing ₹{r.listing_fee} • Convenience {r.convenience_fee} • Penalty ₹{r.penalty_fee}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => remove(r.id)} className="text-xs px-2 py-1 border rounded text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFees;
