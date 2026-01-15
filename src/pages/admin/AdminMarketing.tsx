import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { format } from 'date-fns';

interface MarketingEvent {
  id: string;
  created_at: string;
  event_type: string | null;
  path: string | null;
  source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  route_param: string | null;
  user_id: string | null;
}

interface Automation {
  id: string;
  name: string;
  trigger: any;
  filters: Record<string, any> | null;
  actions: any[] | null;
  active: boolean;
  created_at: string;
}

interface AutomationExecution {
  id: string;
  automation_id: string;
  automation_name: string;
  event_id: string;
  user_id: string | null;
  status: string | null;
  error: string | null;
  created_at: string;
}

const AdminMarketing: React.FC = () => {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loadingAutomations, setLoadingAutomations] = useState(true);
  const [automationsError, setAutomationsError] = useState<string | null>(null);
  const [updatingAutomationId, setUpdatingAutomationId] = useState<string | null>(null);
  const [testingAutomationId, setTestingAutomationId] = useState<string | null>(null);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('marketing_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);

        if (error) {
          console.error('Error loading marketing events:', error);
          return;
        }

        setEvents((data as MarketingEvent[]) || []);
      } catch (e) {
        console.error('Error loading marketing events:', e);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadAutomations = async () => {
      setLoadingAutomations(true);
      setAutomationsError(null);
      try {
        const apiBase = import.meta.env.VITE_SERVER_URL as string | undefined;
        if (!apiBase) {
          setAutomationsError('VITE_SERVER_URL is not configured');
          return;
        }

        const res = await fetch(`${apiBase}/api/marketing/automations`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to load automations (${res.status}): ${text}`);
        }
        const data = (await res.json()) as Automation[];
        setAutomations(data || []);
      } catch (err) {
        console.error('Error loading marketing automations:', err);
        setAutomationsError((err as Error).message || String(err));
      } finally {
        setLoadingAutomations(false);
      }
    };

    loadAutomations();
  }, []);

  useEffect(() => {
    const loadExecutions = async () => {
      setLoadingExecutions(true);
      try {
        const apiBase = import.meta.env.VITE_SERVER_URL as string | undefined;
        if (!apiBase) {
          return;
        }

        const res = await fetch(`${apiBase}/api/marketing/executions`);
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as AutomationExecution[];
        setExecutions(data || []);
      } catch (err) {
        // non-critical; keep silent
        console.error('Error loading automation executions:', err);
      } finally {
        setLoadingExecutions(false);
      }
    };

    loadExecutions();
  }, []);

  const handleToggleAutomation = async (automation: Automation) => {
    const apiBase = import.meta.env.VITE_SERVER_URL as string | undefined;
    if (!apiBase) {
      setAutomationsError('VITE_SERVER_URL is not configured');
      return;
    }

    setUpdatingAutomationId(automation.id);
    setAutomationsError(null);

    try {
      const res = await fetch(`${apiBase}/api/marketing/automations/${automation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: automation.name,
          trigger: automation.trigger,
          filters: automation.filters ?? {},
          actions: automation.actions ?? [],
          active: !automation.active,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update automation (${res.status}): ${text}`);
      }

      const updated = (await res.json()) as Automation;
      setAutomations((prev) => prev.map((a) => (a.id === automation.id ? updated : a)));
    } catch (err) {
      console.error('Error updating automation:', err);
      setAutomationsError((err as Error).message || String(err));
    } finally {
      setUpdatingAutomationId(null);
    }
  };

  const handleTestAutomation = async (automation: Automation) => {
    const apiBase = import.meta.env.VITE_SERVER_URL as string | undefined;
    if (!apiBase) {
      setAutomationsError('VITE_SERVER_URL is not configured');
      return;
    }

    const triggerType = automation.trigger?.type;
    const eventName = triggerType === 'event' ? automation.trigger?.event_name : null;
    if (!eventName) {
      setAutomationsError('Only event-based automations can be test-fired from the UI.');
      return;
    }

    setTestingAutomationId(automation.id);
    setAutomationsError(null);

    try {
      const body = {
        event: eventName,
        metadata: automation.filters ?? {},
        utm: {},
      };

      const res = await fetch(`${apiBase}/api/marketing/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to test automation (${res.status}): ${text}`);
      }
    } catch (err) {
      console.error('Error testing automation:', err);
      setAutomationsError((err as Error).message || String(err));
    } finally {
      setTestingAutomationId(null);
    }
  };

  const filtered = events.filter((e) => {
    if (sourceFilter !== 'all' && (e.source || '').toLowerCase() !== sourceFilter.toLowerCase()) {
      return false;
    }
    if (campaignFilter && !(e.utm_campaign || '').toLowerCase().includes(campaignFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const now = new Date();
  const rangeStart =
    dateRange === '7d'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      : dateRange === '30d'
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : null;

  const isInSelectedRange = (iso: string) => {
    if (!rangeStart || dateRange === 'all') return true;
    const d = new Date(iso);
    return d >= rangeStart;
  };

  const landingViews = events.filter((e) => {
    if (e.event_type !== 'landing_view') {
      return false;
    }
    if (!isInSelectedRange(e.created_at)) {
      return false;
    }
    if (sourceFilter !== 'all' && (e.source || '').toLowerCase() !== sourceFilter.toLowerCase()) {
      return false;
    }
    if (campaignFilter && !(e.utm_campaign || '').toLowerCase().includes(campaignFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  const executionsInRange = executions.filter((ex) => isInSelectedRange(ex.created_at));

  const countSuccessByAutomationName = (name: string) =>
    executionsInRange.filter((ex) => ex.automation_name === name && ex.status === 'success').length;

  const funnelLandingViewsCount = landingViews.length;
  const funnelFirstDepositsCount = countSuccessByAutomationName('First Deposit Welcome Email');
  const funnelBiddersCount = countSuccessByAutomationName('Bid Placed Followup');
  const funnelWinsCount = countSuccessByAutomationName('Auction Won Congrats');
  const funnelLowBalanceCount = countSuccessByAutomationName('Wallet Low Balance Reminder');
  const funnelTopupsCount = countSuccessByAutomationName('Wallet Topup Success');

  const dateRangeLabel =
    dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'All time';
  const sourceLabel = sourceFilter === 'all' ? 'All sources' : `Source: ${sourceFilter}`;
  const campaignLabel = campaignFilter ? `Campaign: ${campaignFilter}` : 'All campaigns';

  const formatRate = (num: number, den: number) => {
    if (!den || den <= 0) return '—';
    const pct = (num / den) * 100;
    return `${pct.toFixed(1)}%`;
  };

  const depositsPerLanding = formatRate(funnelFirstDepositsCount, funnelLandingViewsCount);
  const biddersPerDeposit = formatRate(funnelBiddersCount, funnelFirstDepositsCount);
  const winsPerBidder = formatRate(funnelWinsCount, funnelBiddersCount);
  const winsPerLanding = formatRate(funnelWinsCount, funnelLandingViewsCount);

  const landingViewsByDay = React.useMemo(() => {
    const counts = new Map<string, number>();
    landingViews.forEach((e) => {
      const d = new Date(e.created_at);
      const key = d.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const entries = Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b));
    return entries;
  }, [landingViews]);

  const landingViewsSparklinePoints = React.useMemo(() => {
    const entries = landingViewsByDay;
    if (entries.length === 0) return '';
    const max = Math.max(...entries.map(([, count]) => count));
    const height = 40;
    const lastIndex = Math.max(entries.length - 1, 1);
    return entries
      .map(([, count], index) => {
        const x = entries.length === 1 ? 0 : (index / lastIndex) * 100;
        const y = height - (count / max) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [landingViewsByDay]);

  const perSourceMetrics = React.useMemo(() => {
    type Row = {
      source: string;
      views: number;
      deposits: number;
      bidders: number;
      wins: number;
      overallCr: string;
      depPerView: string;
      bidPerDep: string;
      winPerBid: string;
    };

    const map = new Map<string, { views: number; deposits: number; bidders: number; wins: number }>();

    const normalizedCampaignFilter = campaignFilter.toLowerCase();

    const userLandingEvents = new Map<string, MarketingEvent[]>();

    events.forEach((e) => {
      if (e.event_type !== 'landing_view') return;
      if (!isInSelectedRange(e.created_at)) return;
      if (normalizedCampaignFilter && !(e.utm_campaign || '').toLowerCase().includes(normalizedCampaignFilter)) return;

      const srcKey = (e.source || 'unknown').toLowerCase();
      const bucket = map.get(srcKey) || { views: 0, deposits: 0, bidders: 0, wins: 0 };
      bucket.views += 1;
      map.set(srcKey, bucket);

      if (e.user_id) {
        const arr = userLandingEvents.get(e.user_id) || [];
        arr.push(e);
        userLandingEvents.set(e.user_id, arr);
      }
    });

    userLandingEvents.forEach((arr) => {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    const findAttributedSource = (userId: string | null, executionTimeIso: string): string => {
      if (!userId) return 'unknown';
      const arr = userLandingEvents.get(userId);
      if (!arr || arr.length === 0) return 'unknown';
      const execTime = new Date(executionTimeIso).getTime();
      let chosen: MarketingEvent | null = null;
      for (let i = 0; i < arr.length; i++) {
        const evTime = new Date(arr[i].created_at).getTime();
        if (evTime <= execTime) {
          chosen = arr[i];
        } else {
          break;
        }
      }
      if (!chosen) {
        return 'unknown';
      }
      const src = (chosen.source || 'unknown').toLowerCase();
      return src;
    };

    executionsInRange.forEach((ex) => {
      if (ex.status !== 'success') return;
      const name = ex.automation_name;

      let kind: 'deposit' | 'bidder' | 'win' | null = null;
      if (name === 'First Deposit Welcome Email') kind = 'deposit';
      else if (name === 'Bid Placed Followup') kind = 'bidder';
      else if (name === 'Auction Won Congrats') kind = 'win';

      if (!kind) return;

      const srcKey = findAttributedSource(ex.user_id, ex.created_at);
      const bucket = map.get(srcKey) || { views: 0, deposits: 0, bidders: 0, wins: 0 };
      if (kind === 'deposit') bucket.deposits += 1;
      if (kind === 'bidder') bucket.bidders += 1;
      if (kind === 'win') bucket.wins += 1;
      map.set(srcKey, bucket);
    });

    const rows: Row[] = [];
    map.forEach((bucket, src) => {
      const overallCr = formatRate(bucket.wins, bucket.views);
      const depPerView = formatRate(bucket.deposits, bucket.views);
      const bidPerDep = formatRate(bucket.bidders, bucket.deposits);
      const winPerBid = formatRate(bucket.wins, bucket.bidders);
      rows.push({
        source: src,
        views: bucket.views,
        deposits: bucket.deposits,
        bidders: bucket.bidders,
        wins: bucket.wins,
        overallCr,
        depPerView,
        bidPerDep,
        winPerBid,
      });
    });

    rows.sort((a, b) => b.views - a.views);
    return rows;
  }, [events, executionsInRange, campaignFilter, isInSelectedRange, formatRate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (filtered.length === 0) return;

    const headers = [
      'created_at',
      'path',
      'source',
      'utm_source',
      'utm_campaign',
      'utm_medium',
      'route_param',
      'event_type',
      'user_id',
    ];

    const escape = (value: string | null) => {
      const v = value ?? '';
      // Escape quotes and wrap in double quotes for CSV safety
      return '"' + v.replace(/"/g, '""') + '"';
    };

    const rows = filtered.map((e) => [
      e.created_at,
      e.path,
      e.source,
      e.utm_source,
      e.utm_campaign,
      e.utm_medium,
      e.route_param,
      e.event_type,
      e.user_id,
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `marketing-events-${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPerSourceCsv = () => {
    if (perSourceMetrics.length === 0) return;

    const headers = [
      'source',
      'views',
      'deposits',
      'bidders',
      'wins',
      'dep_per_view',
      'bid_per_dep',
      'win_per_bid',
      'overall_cr',
    ];

    const escape = (value: string | number) => {
      const v = String(value ?? '');
      return '"' + v.replace(/"/g, '""') + '"';
    };

    const rows = perSourceMetrics.map((row) => [
      row.source,
      row.views,
      row.deposits,
      row.bidders,
      row.wins,
      row.depPerView,
      row.bidPerDep,
      row.winPerBid,
      row.overallCr,
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `marketing-funnel-per-source-${timestamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 print:px-0 print:py-4">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap print:gap-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Events</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Recent visits to /campaign and /links with UTM parameters for your ad campaigns.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap text-sm items-end print:hidden">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Date range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | 'all')}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All sources</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="linkedin">LinkedIn</option>
              <option value="links">Links page</option>
              <option value="default">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">UTM Campaign</label>
            <input
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              placeholder="e.g. launch_q4"
              className="px-3 py-1.5 border rounded-lg text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Print
          </button>
        </div>
      </div>

      <div className="mb-8 space-y-3 print:break-inside-avoid">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Funnel &amp; Key Metrics</h2>
          <div className="flex flex-col items-end gap-0.5 text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {dateRangeLabel} · {sourceLabel} · {campaignLabel}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Overall funnel (Wins / Landing Views): {winsPerLanding}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Landing Views</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{funnelLandingViewsCount}</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Unique landing_view events in selected range and filters.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">First Deposits</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{funnelFirstDepositsCount}</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Successful First Deposit Welcome automation executions.</p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">Conversion from Landing Views: {depositsPerLanding}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Bidders</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{funnelBiddersCount}</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Successful Bid Placed Followup automation executions.</p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">Conversion from First Deposits: {biddersPerDeposit}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Auction Wins</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{funnelWinsCount}</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Successful Auction Won Congrats automation executions.</p>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">Conversion from Bidders: {winsPerBidder}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Low Balance Alerts Sent</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{funnelLowBalanceCount}</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Successful Wallet Low Balance Reminder executions.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Wallet Topups</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{funnelTopupsCount}</p>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Successful Wallet Topup Success automation executions.</p>
          </div>
        </div>

        {landingViewsByDay.length > 0 && (
          <div className="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 sm:p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Landing Views by Day</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {landingViewsByDay[0][0]}  {landingViewsByDay[landingViewsByDay.length - 1][0]}
              </p>
            </div>
            <svg viewBox="0 0 100 40" className="w-full h-16 text-indigo-500">
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                points={landingViewsSparklinePoints}
              />
            </svg>
          </div>
        )}

        {perSourceMetrics.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[11px] text-gray-600 dark:text-gray-300">
              <span className="font-medium">Per-source funnel</span>
              <button
                type="button"
                onClick={handleExportPerSourceCsv}
                className="px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 print:hidden"
              >
                Export per-source CSV
              </button>
            </div>
            <table className="min-w-full text-[11px]">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Source</th>
                  <th className="px-3 py-2 text-left font-medium">Views</th>
                  <th className="px-3 py-2 text-left font-medium">Deposits</th>
                  <th className="px-3 py-2 text-left font-medium">Bidders</th>
                  <th className="px-3 py-2 text-left font-medium">Wins</th>
                  <th className="px-3 py-2 text-left font-medium">Dep / Views</th>
                  <th className="px-3 py-2 text-left font-medium">Bid / Dep</th>
                  <th className="px-3 py-2 text-left font-medium">Win / Bid</th>
                  <th className="px-3 py-2 text-left font-medium">Overall CR (Wins / Views)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {perSourceMetrics.map((row) => (
                  <tr key={row.source} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap capitalize">{row.source}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.views}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.deposits}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.bidders}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.wins}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.depPerView}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.bidPerDep}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.winPerBid}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.overallCr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Automations</h2>
          {automationsError && (
            <p className="text-xs text-red-600 dark:text-red-400 max-w-md truncate">
              {automationsError}
            </p>
          )}
        </div>
        {loadingAutomations ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : automations.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl px-4">
            No automations defined yet. Use the marketing backend API to create event-based flows like FirstDepositFlow.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">Trigger</th>
                  <th className="px-3 py-2 text-left font-medium">Filters</th>
                  <th className="px-3 py-2 text-left font-medium">Actions</th>
                  <th className="px-3 py-2 text-left font-medium">Active</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                  <th className="px-3 py-2 text-left font-medium" />
                  <th className="px-3 py-2 text-left font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {automations.map((a) => {
                  const triggerType = a.trigger?.type || 'unknown';
                  const triggerLabel =
                    triggerType === 'event'
                      ? `event: ${a.trigger?.event_name ?? '—'}`
                      : triggerType;

                  const filtersSummary = a.filters && Object.keys(a.filters).length > 0
                    ? Object.entries(a.filters)
                        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                        .join(', ')
                    : '—';

                  const actionsSummary = (a.actions || []).length
                    ? a.actions
                        .map((act) => {
                          const type = act.type || 'action';
                          const delayMs = act.delay_ms || 0;
                          return delayMs ? `${type} (+${delayMs}ms)` : type;
                        })
                        .join(', ')
                    : '—';

                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate" title={a.name}>{a.name}</td>
                      <td className="px-3 py-2 whitespace-nowrap" title={JSON.stringify(a.trigger)}>
                        {triggerLabel}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap max-w-[260px] truncate" title={filtersSummary}>
                        {filtersSummary}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap max-w-[260px] truncate" title={actionsSummary}>
                        {actionsSummary}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={
                            a.active
                              ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                              : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }
                        >
                          {a.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {a.created_at ? format(new Date(a.created_at), 'MMM d, yyyy HH:mm') : ''}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleAutomation(a)}
                          disabled={!!updatingAutomationId}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updatingAutomationId === a.id
                            ? 'Saving...'
                            : a.active
                            ? 'Pause'
                            : 'Activate'}
                        </button>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleTestAutomation(a)}
                          disabled={!!testingAutomationId}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-indigo-500 text-indigo-600 dark:text-indigo-200 bg-white dark:bg-gray-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {testingAutomationId === a.id ? 'Testing...' : 'Test'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Executions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last {executions.length || 0} automation runs.
          </p>
        </div>
        {loadingExecutions ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : executions.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 py-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl px-4">
            No executions recorded yet. When automations fire, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Time</th>
                  <th className="px-3 py-2 text-left font-medium">Automation</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">User ID</th>
                  <th className="px-3 py-2 text-left font-medium">Event ID</th>
                  <th className="px-3 py-2 text-left font-medium">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {executions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {ex.created_at ? format(new Date(ex.created_at), 'MMM d, yyyy HH:mm:ss') : ''}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[220px] truncate" title={ex.automation_name}>
                      {ex.automation_name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={
                          ex.status === 'success'
                            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : ex.status === 'failed'
                            ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                        }
                      >
                        {ex.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[160px] truncate font-mono text-[10px]" title={ex.user_id || ''}>
                      {ex.user_id || '—'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[220px] truncate font-mono text-[10px]" title={ex.event_id}>
                      {ex.event_id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[260px] truncate text-[10px] text-red-600 dark:text-red-300" title={ex.error || ''}>
                      {ex.error || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No marketing events yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Start sending traffic to /campaign/&lt;source&gt; or /links to see events here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Path</th>
                <th className="px-3 py-2 text-left font-medium">Source</th>
                <th className="px-3 py-2 text-left font-medium">UTM Source</th>
                <th className="px-3 py-2 text-left font-medium">UTM Campaign</th>
                <th className="px-3 py-2 text-left font-medium">UTM Medium</th>
                <th className="px-3 py-2 text-left font-medium">Route Param</th>
                <th className="px-3 py-2 text-left font-medium">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {e.created_at ? format(new Date(e.created_at), 'MMM d, yyyy HH:mm:ss') : ''}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.path}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.source}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.utm_source}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.utm_campaign}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.utm_medium}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.route_param}</td>
                  <td className="px-3 py-2 max-w-[160px] truncate font-mono text-[10px]">{e.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Export as CSV
          </button>
        </div>
      )}
      <div className="mt-6 text-[11px] text-gray-500 dark:text-gray-400 hidden print:block">
        Printed on {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default AdminMarketing;
