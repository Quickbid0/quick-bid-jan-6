import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const placeholderAudiences = [
  'Enterprise buyers',
  'Auction VIP list',
  'Recurring bidders',
  'New deposits this month',
];

const CampaignCreatePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState(placeholderAudiences[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('Highlight your premium stock and special delivery assurances.');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const scheduleLabel = useMemo(() => {
    if (!startDate) return 'Select start';
    return `Starts ${new Date(startDate).toLocaleDateString()}`;
  }, [startDate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !audience || !startDate || !endDate) {
      toast.error('Provide title, audience, and schedule to continue.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          audience,
          startDate,
          endDate,
          budget: Number(budget) || undefined,
          message,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Unable to create campaign');
      }

      const data = await res.json();
      const newId = data?.id || data?.campaignId;
      if (newId) {
        toast.success('Campaign drafted successfully.');
        navigate(`/campaigns/launch?id=${encodeURIComponent(newId)}`);
      } else {
        throw new Error('Missing campaign identifier');
      }
    } catch (err) {
      console.error('create campaign', err);
      toast.error((err as Error).message || 'Campaign creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto bg-white/90 dark:bg-slate-900/80 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Campaign studio</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Create a responsive campaign</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Outline your objective, targeting, schedule, and creative that will run across QuickBid inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
            Campaign title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Festival Spotlight: Luxury SUVs"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </label>

          <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
            Target audience
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {placeholderAudiences.map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
              Start date
              <input
                type="datetime-local"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </label>
            <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
              End date
              <input
                type="datetime-local"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </label>
          </div>

          <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
            Budget (₹)
            <input
              type="number"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="E.g. 250000"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </label>

          <label className="block space-y-1 text-sm text-slate-600 dark:text-slate-300">
            Message or template
            <textarea
              rows={3}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </label>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>{scheduleLabel}</span>
            {endDate && startDate && new Date(endDate) < new Date(startDate) && (
              <span className="text-red-500">End must be after start</span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-40"
            >
              {submitting ? 'Saving...' : 'Save & continue'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/marketing')}
              className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-900 dark:text-white"
            >
              Explore marketing services
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignCreatePage;
