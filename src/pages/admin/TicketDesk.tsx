import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { supportService } from '../../services/supportService';
import { Ticket, TicketStatus } from '../../types/support';

const columns: { key: TicketStatus; title: string }[] = [
  { key: 'open', title: 'Open' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'waiting_user', title: 'Waiting User' },
  { key: 'resolved', title: 'Resolved' },
  // Closed could be hidden by default; include for completeness
];

const TicketDesk: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ category: string; priority: string; mine: boolean }>({ category: '', priority: '', mine: false });
  const [adminId, setAdminId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let uid: string | null = null;
      try {
        const demoRaw = localStorage.getItem('demo-session');
        if (demoRaw) {
          const demo = JSON.parse(demoRaw);
          uid = demo?.user?.id || null;
        }
      } catch {}
      if (!uid) {
        const { data: sessionRes } = await supabase.auth.getSession();
        uid = sessionRes.session?.user?.id || null;
      }
      setAdminId(uid);

      const filters: any = {};
      if (filter.category) filters.category = filter.category;
      if (filter.priority) filters.priority = filter.priority;
      if (filter.mine && uid) filters.assigned_to = uid;

      const data = await supportService.getTickets(undefined, filters);
      setTickets(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tickets';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter.category, filter.priority, filter.mine]);

  const grouped = useMemo(() => {
    const g: Record<TicketStatus, Ticket[]> = { open: [], in_progress: [], waiting_user: [], resolved: [], closed: [] };
    tickets.forEach(t => { (g[t.status] ||= []).push(t); });
    return g;
  }, [tickets]);

  const assignToMe = async (id: string) => {
    if (!adminId) return;
    try {
      await supportService.assignTicket(id, adminId);
      load();
    } catch {
      // no-op for now; could add toast
    }
  };

  const updateStatus = async (id: string, status: TicketStatus) => {
    try {
      await supportService.updateStatus(id, status);
      load();
    } catch {
      // no-op for now; could add toast
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Support Ticket Desk</h1>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1" value={filter.category} onChange={(e)=>setFilter(f=>({...f, category: e.target.value}))}>
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="payment">Payment</option>
            <option value="kyc">KYC</option>
            <option value="auction">Auction</option>
            <option value="technical">Technical</option>
          </select>
          <select className="border rounded px-2 py-1" value={filter.priority} onChange={(e)=>setFilter(f=>({...f, priority: e.target.value}))}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={filter.mine} onChange={(e)=>setFilter(f=>({...f, mine: e.target.checked}))}/> My tickets</label>
          <button onClick={load} className="px-3 py-1 border rounded">Refresh</button>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        {columns.map(col => (
          <div key={col.key} className="rounded border dark:border-gray-700 p-3 bg-white dark:bg-gray-900 min-h-[200px]">
            <div className="font-medium mb-2 flex items-center justify-between">
              <span>{col.title}</span>
              <span className="text-xs text-gray-500">{grouped[col.key]?.length || 0}</span>
            </div>
            <div className="space-y-2">
              {grouped[col.key]?.map(t => (
                <div key={t.id} className="rounded border dark:border-gray-700 p-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/admin/support/${t.id}`} className="font-medium hover:underline">{t.subject}</Link>
                      <div className="text-xs text-gray-500">{t.category} • {new Date(t.last_update_at || t.created_at).toLocaleString()}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border">{t.priority}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {!t.assigned_to && adminId && <button onClick={()=>assignToMe(t.id)} className="text-xs px-2 py-1 border rounded">Assign to me</button>}
                    {col.key !== 'open' && <button onClick={()=>updateStatus(t.id, 'open')} className="text-xs px-2 py-1 border rounded">Open</button>}
                    {col.key !== 'in_progress' && <button onClick={()=>updateStatus(t.id, 'in_progress')} className="text-xs px-2 py-1 border rounded">In Progress</button>}
                    {col.key !== 'waiting_user' && <button onClick={()=>updateStatus(t.id, 'waiting_user')} className="text-xs px-2 py-1 border rounded">Waiting</button>}
                    {col.key !== 'resolved' && <button onClick={()=>updateStatus(t.id, 'resolved')} className="text-xs px-2 py-1 border rounded">Resolve</button>}
                  </div>
                </div>
              ))}
              {grouped[col.key]?.length === 0 && (
                <div className="text-xs text-gray-500">No tickets</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketDesk;
