import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { supportService } from '../services/supportService';
import { Ticket } from '../types/support';

const SupportTickets: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);

  const loadTickets = async () => {
    setLoading(true);
    setListError(null);
    try {
      let userId: string | null = null;
      try {
        const demoRaw = localStorage.getItem('demo-session');
        if (demoRaw) {
          const demo = JSON.parse(demoRaw);
          userId = demo?.user?.id || null;
        }
      } catch {}
      if (!userId) {
        const { data: sessionRes } = await supabase.auth.getSession();
        userId = sessionRes.session?.user?.id || null;
      }
      if (!userId) throw new Error('Not authenticated');
      
      const data = await supportService.getTickets(userId);
      setTickets(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tickets';
      setListError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      let userId: string | null = null;
      try {
        const demoRaw = localStorage.getItem('demo-session');
        if (demoRaw) {
          const demo = JSON.parse(demoRaw);
          userId = demo?.user?.id || null;
        }
      } catch {}
      if (!userId) {
        const { data: sessionRes } = await supabase.auth.getSession();
        userId = sessionRes.session?.user?.id || null;
      }
      if (!userId) throw new Error('Not authenticated');

      await supportService.createTicket({
        user_id: userId,
        subject,
        category,
        description
      });
      
      setSubject('');
      setCategory('general');
      setDescription('');
      setMessage('Ticket created successfully.');
      loadTickets();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create ticket';
      setMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">My Support Tickets</h1>
      <div className="mb-6 flex gap-3">
        <Link to="/help" className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800">Help Center</Link>
      </div>

      <form onSubmit={handleSubmit} className="rounded border dark:border-gray-700 p-4 mb-6 bg-white dark:bg-gray-900">
        <h2 className="font-medium mb-3">Create Ticket</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Subject</label>
            <input
              className="w-full rounded border px-3 py-2 bg-transparent"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="w-full rounded border px-3 py-2 bg-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General</option>
              <option value="payment">Payment</option>
              <option value="kyc">KYC</option>
              <option value="auction">Auction</option>
              <option value="technical">Technical</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full rounded border px-3 py-2 bg-transparent"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
          {message && <span className="text-sm text-gray-600 dark:text-gray-300">{message}</span>}
        </div>
      </form>

      <div className="rounded border dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800 dark:text-gray-100">My Tickets</h3>
          <button onClick={loadTickets} className="text-xs px-2 py-1 border rounded">Refresh</button>
        </div>
        {loading && <div className="text-sm">Loading…</div>}
        {listError && <div className="text-sm text-red-600">{listError}</div>}
        {!loading && !listError && tickets.length === 0 && (
          <div className="text-sm">No tickets yet. Create your first ticket above.</div>
        )}
        {!loading && !listError && tickets.length > 0 && (
          <div className="divide-y dark:divide-gray-700">
            {tickets.map((t) => (
              <Link key={t.id} to={`/support/${t.id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">{t.subject}</div>
                  <div className="text-xs text-gray-500">{t.category} • {new Date(t.last_update_at || t.created_at).toLocaleString()}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border`}>{t.status}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
