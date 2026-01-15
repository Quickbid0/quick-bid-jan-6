import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { marketingService } from '../services/marketingService';

const CampaignLaunchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('id');
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject: '', body: '' });
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) {
      setError('Campaign ID is missing from the URL.');
      setLoading(false);
      return;
    }

    const fetchCampaign = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/marketing/campaigns/${campaignId}`);
        if (!res.ok) {
          throw new Error(`Failed to load campaign (${res.status})`);
        }
        const data = await res.json();
        setCampaign(data);
      } catch (err) {
        console.error('campaign fetch', err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  const status = useMemo(() => {
    if (!campaign) return 'draft';
    return campaign.status || 'draft';
  }, [campaign]);

  const handleLaunch = async () => {
    if (!campaignId) return;
    setLaunching(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'launch' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Launch failed (${res.status})`);
      }
      const updated = await res.json();
      setCampaign(updated);
      toast.success('Campaign launched. Monitoring live spend...');
      if (emailDraft.subject && emailDraft.body) {
        try {
          await marketingService.sendEmailDraft({
            campaignId,
            subject: emailDraft.subject,
            body: emailDraft.body,
          });
          setEmailStatus('Email automation queued');
        } catch (sendErr) {
          console.error('email send error', sendErr);
          setEmailStatus('Email automation failed to queue');
        }
      }
    } catch (err) {
      console.error('launch error', err);
      toast.error((err as Error).message || 'Launch failed');
    } finally {
      setLaunching(false);
    }
  };

  const summaryStart = campaign?.startDate ? new Date(campaign.startDate).toLocaleString() : '-';
  const summaryEnd = campaign?.endDate ? new Date(campaign.endDate).toLocaleString() : '-';

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Campaign launch</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Launch your campaign</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Coordinate approvals, assign automations, and trigger campaign-enabling events from a single control center.
          </p>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading || !campaign ? (
          <div className="rounded-2xl border border-dashed border-slate-500/60 bg-slate-900/60 px-4 py-6 text-center text-slate-300">
            {loading ? 'Loading campaign...' : 'Campaign information is still unavailable.'}
          </div>
        ) : (
          <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Campaign #{campaignId}</p>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{campaign.title || 'Untitled launch'}</h2>
                <p className="text-xs text-slate-500">Status: <span className="font-semibold text-slate-900 dark:text-white">{status}</span></p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{summaryStart}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{summaryEnd}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
                <p className="text-xs text-slate-500">Audience</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{campaign.audience}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
                <p className="text-xs text-slate-500">Budget</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">₹{campaign.budget?.toLocaleString() || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
                <p className="text-xs text-slate-500">Template</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{campaign.message?.slice(0, 40) || 'No template yet'}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p><strong>Launch checklist</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Review creative + messaging</li>
                <li>Confirm target slots and timing</li>
                <li>Notify finance/ops if budget changes</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLaunch}
                disabled={launching || status === 'launched'}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-40"
              >
                {status === 'launched' ? 'Already Launched' : launching ? 'Launching…' : 'Launch Campaign Now'}
              </button>
              <Link to="/campaigns/new" className="rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-900 dark:text-white">
                Return to builder
              </Link>
            </div>
            <section className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email automation</p>
              <input
                type="text"
                placeholder="Subject"
                value={emailDraft.subject}
                onChange={(event) => setEmailDraft((prev) => ({ ...prev, subject: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <textarea
                rows={3}
                placeholder="Draft message for the automation"
                value={emailDraft.body}
                onChange={(event) => setEmailDraft((prev) => ({ ...prev, body: event.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              {emailStatus && <p className="text-xs text-slate-500">{emailStatus}</p>}
            </section>
          </section>
        )}
      </div>
    </div>
  );
};

export default CampaignLaunchPage;
