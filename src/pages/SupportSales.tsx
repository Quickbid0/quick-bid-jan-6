import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const SupportSales: React.FC = () => {
  const [topics, setTopics] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setTopicsLoading(true);
      try {
        const res = await fetch('/api/support/topics?sales=true');
        if (!res.ok) {
          throw new Error('Unable to load topics');
        }
        const data = await res.json();
        setTopics(Array.isArray(data) ? data : []);
        if (!topic && Array.isArray(data) && data.length > 0) {
          setTopic(data[0]);
        }
      } catch (err) {
        console.error('fetch support topics', err);
        setTopicsError((err as Error).message);
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, [topic]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setTicketId(null);

    try {
      const res = await fetch('/api/support/sales-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          topic,
          details,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to submit ticket');
      }

      const payload = await res.json();
      setTicketId(payload?.ticketId || payload?.id || null);
      toast.success('Sales ticket created. Expect a response soon.');
      setName('');
      setEmail('');
      setDetails('');
    } catch (err) {
      console.error('submit sales ticket', err);
      toast.error((err as Error).message || 'Unable to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const staticTopics = useMemo(
    () => [
      'Campaign performance',
      'Lead assignment',
      'Payout / settlements',
      'Crediting issues',
      'Other sales support',
    ],
    []
  );

  const topicOptions = topics.length ? topics : staticTopics;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-2">
        <section className="rounded-3xl bg-slate-50 dark:bg-slate-900/80 p-8 shadow-xl">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sales Support</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Support for high-touch deals</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            Submit a sales-specific ticket and a specialist will triage your request within business hours.
          </p>
          <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
            <p>
              <strong>1.</strong> Log in to <Link to="/sales/login" className="text-indigo-600">Sales Login</Link> to reach the dashboard and monitor pipelines.
            </p>
            <p>
              <strong>2.</strong> Explore <Link to="/campaigns" className="text-indigo-600">campaign insights</Link> for performance numbers.
            </p>
            <p>
              <strong>3.</strong> Use the form to submit anything that needs operations, finance, or marketing attention.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <a className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-white text-sm font-semibold" href="mailto:sales-support@quickbid.example.com">
              Email Sales Support
            </a>
            <Link className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-900" to="/support">
              Open Support Center
            </Link>
          </div>
        </section>

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create a sales ticket</h2>
          <p className="text-xs text-slate-500">We will surface this request to the ops, finance, and marketing pods.</p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Aarthi - Enterprise Sales"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="aarthi@quickbid.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Topic</label>
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {topicOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Details</label>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Describe the assistance you need, attach relevant campaign IDs or auction references."
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {submitting ? 'Submitting…' : 'Submit ticket'}
            </button>
          </form>
          {ticketId && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Ticket created #{ticketId}. Our team will respond shortly.
            </div>
          )}
          {topicsLoading ? (
            <p className="mt-4 text-xs text-slate-500">Loading curated topics…</p>
          ) : topicsError ? (
            <p className="mt-4 text-xs text-red-600">{topicsError}</p>
          ) : (
            <div className="mt-4 text-xs text-slate-500">
              Hot topics: {topicOptions.slice(0, 3).join(' · ')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupportSales;
