import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { logAdminEvent } from '../../utils/adminAudit';

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  kyc_status?: string | null;
  created_at?: string | null;
};

const AdminKYCReview: React.FC = () => {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending'|'submitted'|'rejected'|'verified'|'all'>('pending');
  const [reason, setReason] = useState<Record<string,string>>({});

  const load = async () => {
    try {
      setLoading(true);
      let query = supabase.from('profiles').select('id, full_name, email, kyc_status, created_at').order('created_at', { ascending: false }).limit(200);
      if (filter !== 'all') query = query.eq('kyc_status', filter);
      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (e:any) {
      toast.error(e.message || 'Failed to load KYC');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const act = async (profile: Profile, action: 'approved'|'rejected') => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminId = session?.user?.id;
      if (!adminId) { toast.error('Not authenticated'); return; }
      const newStatus = action === 'approved' ? 'verified' : 'rejected';
      const reasonText = action === 'rejected' ? (reason[profile.id] || '') : null;

      const { error: upErr } = await supabase.from('profiles').update({ kyc_status: newStatus }).eq('id', profile.id);
      if (upErr) throw upErr;

      await supabase.from('kyc_audit_logs').insert({ profile_id: profile.id, admin_id: adminId, action, reason: reasonText });

      // Fire-and-forget admin audit log (do not block UI on failure)
      logAdminEvent({
        actionType: action === 'approved' ? 'KYC_APPROVE' : 'KYC_REJECT',
        targetType: 'user',
        targetId: profile.id,
        beforeState: { kyc_status: profile.kyc_status },
        afterState: { kyc_status: newStatus },
      });

      toast.success(`KYC ${newStatus}`);
      setItems(prev => prev.filter(p => p.id !== profile.id));
    } catch (e:any) {
      toast.error(e.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">KYC Review</h1>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e)=>setFilter(e.target.value as any)} className="border rounded px-3 py-2">
            <option value="pending">pending</option>
            <option value="submitted">submitted</option>
            <option value="verified">verified</option>
            <option value="rejected">rejected</option>
            <option value="all">all</option>
          </select>
          <button onClick={load} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse h-10 bg-gray-200 rounded" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-sm">{p.full_name || '—'}</td>
                  <td className="px-4 py-2 text-sm">{p.email || '—'}</td>
                  <td className="px-4 py-2 text-sm">{p.kyc_status || '—'}</td>
                  <td className="px-4 py-2 text-sm">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>act(p,'approved')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                      <input value={reason[p.id]||''} onChange={(e)=>setReason({...reason, [p.id]: e.target.value})} placeholder="Reason (for reject)" className="border rounded px-2 py-1" />
                      <button onClick={()=>act(p,'rejected')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminKYCReview;
