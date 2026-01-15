import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adsService } from '../services/adsService';
import { TargetsOKR } from '../components/sales/TargetsOKR';
import { IncentiveCalculator } from '../components/sales/IncentiveCalculator';
import { Leaderboard } from '../components/sales/Leaderboard';

interface SalesDashboardPayload {
  period: { month: number; year: number; start: string; end: string };
  totals: { auctions: number; gmv: number; netPayout: number; newSellers: number };
  pipeline: {
    completedCount: number;
    inProgressCount: number;
    pendingCount: number;
    completedValue: number;
    inProgressValue: number;
    pendingValue: number;
    unpaidGMV: number;
  };
}

interface SalesLead {
  id: string;
  name: string;
  status: string;
  value_gmv?: number;
  owner_user_id?: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at?: string;
}

const SalesDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<SalesDashboardPayload | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{ impressions: number; clicks: number; conversions: number } | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [dashboardRes, leadsRes] = await Promise.all([
          fetch('/api/sales/dashboard'),
          fetch('/api/sales/leads?limit=5&status=active'),
        ]);

        if (!dashboardRes.ok) {
          throw new Error('Unable to load dashboard');
        }

        if (!leadsRes.ok) {
          throw new Error('Unable to load leads');
        }

        const [dashboardData, leadsData] = await Promise.all([
          dashboardRes.json(),
          leadsRes.json(),
        ]);

        if (mounted) {
          setDashboard(dashboardData as SalesDashboardPayload);
          setLeads(leadsData.items || []);
          setError(null);
        }
      } catch (err) {
        console.error('sales dashboard entity error', err);
        if (mounted) {
          setError((err as Error).message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const summary = await adsService.getAdsAnalyticsSummary('summary=1');
      setAnalytics({
        impressions: summary.impressions ?? 0,
        clicks: summary.clicks ?? 0,
        conversions: summary.conversions ?? 0,
      });
      setAnalyticsError(null);
    } catch (err) {
      console.error('analytics fetch error', err);
      setAnalyticsError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sales enablement</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Sales Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Live metrics pulled directly from the Supabase-backed sales APIs.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/campaigns"
              className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow"
            >
              Open campaigns
            </Link>
            <Link
              to="/campaigns/new"
              className="rounded-full bg-white border border-indigo-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-600"
            >
              Create campaign
            </Link>
            <Link
              to="/campaigns/launch"
              className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white"
            >
              Launch campaigns
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-slate-500">
            Loading sales metrics…
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 p-6 text-sm text-red-800">
            {error}
          </div>
        ) : dashboard ? (
          <section className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Auctions" value={dashboard.totals.auctions} />
              <StatCard label="GMV" value={`₹${dashboard.totals.gmv.toLocaleString()}`} />
              <StatCard label="Net payout" value={`₹${dashboard.totals.netPayout.toLocaleString()}`} />
              <StatCard label="New sellers" value={dashboard.totals.newSellers} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <PipelineCard title="Completed" stats={dashboard.pipeline.completedCount} amount={dashboard.pipeline.completedValue} />
              <PipelineCard title="In progress" stats={dashboard.pipeline.inProgressCount} amount={dashboard.pipeline.inProgressValue} />
              <PipelineCard title="Pending" stats={dashboard.pipeline.pendingCount} amount={dashboard.pipeline.pendingValue} />
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Unpaid pipeline</p>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">₹{dashboard.pipeline.unpaidGMV.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-400">Focus on unpaid GMV to close more deals this week.</p>
            </div>
          </section>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-500">
            No dashboard data available.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TargetsOKR />
          <IncentiveCalculator />
          <Leaderboard />
        </section>

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Advertisement analytics</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Engagement snapshot</h2>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-indigo-600"
              onClick={fetchAnalytics}
            >
              Refresh stats
            </button>
          </div>
          {analyticsError && <p className="text-xs text-red-600">{analyticsError}</p>}
          {analytics ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AnalyticsCard label="Impressions" value={analytics.impressions} />
              <AnalyticsCard label="Clicks" value={analytics.clicks} />
              <AnalyticsCard label="Conversions" value={analytics.conversions} />
            </div>
          ) : (
            <p className="text-xs text-slate-500">No analytics data available yet.</p>
          )}
        </section>

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Lead activity</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Latest leads</h2>
            </div>
            <Link to="/support/sales" className="text-xs font-semibold text-indigo-600">
              View support docs
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="text-sm text-slate-500">No active leads yet. Check back after refreshed data.</p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <LeadRow lead={lead} key={lead.id} />
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/campaigns/launch"
              className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
            >
              Launch new campaign
            </Link>
            <Link
              to="/support"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-white"
            >
              Open support ticket
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-center">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const PipelineCard: React.FC<{ title: string; stats: number; amount: number }> = ({ title, stats, amount }) => (
  <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
    <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats} leads</p>
    <p className="text-sm text-slate-500">₹{amount.toLocaleString()}</p>
  </div>
);

const LeadRow: React.FC<{ lead: SalesLead }> = ({ lead }) => (
  <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.name}</p>
      <p className="text-xs text-slate-500">{lead.email || lead.phone || 'Contact info pending'}</p>
    </div>
    <div className="flex items-center gap-3 text-xs">
      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{lead.status}</span>
      <span className="text-slate-500">₹{(lead.value_gmv || 0).toLocaleString()}</span>
      <span className="text-slate-500">{lead.notes ? 'Notes attached' : 'No notes'}</span>
    </div>
  </div>
);

const AnalyticsCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 text-center">
    <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
  </div>
);

export default SalesDashboardPage;
