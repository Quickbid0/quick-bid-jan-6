import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { adsService } from '../../services/adsService';
import { Users, MousePointerClick, Eye, Clock, Download } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

interface AnalyticsSummary {
  impressions: number;
  clicks: number;
  watchTimeMs: number;
  ctr: number;
}

interface AnalyticsPoint {
  date: string;
  impressions: number;
  clicks: number;
  watchTimeMs: number;
}

const AdminAdAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [series, setSeries] = useState<AnalyticsPoint[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    sponsorId: '',
    campaignId: '',
    days: '7',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [spons, camps] = await Promise.all([
          adsService.listSponsors(),
          adsService.listCampaigns(),
        ]);
        setSponsors(spons);
        setCampaigns(camps);
      } catch (e) {
        console.error('Failed to load sponsors/campaigns', e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [filters.sponsorId, filters.campaignId, filters.days]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.sponsorId) params.append('sponsorId', filters.sponsorId);
    if (filters.campaignId) params.append('campaignId', filters.campaignId);
    const days = Number(filters.days) || 7;
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    params.append('from', from.toISOString());
    params.append('to', to.toISOString());
    return params.toString();
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const query = buildQuery();
      const [summaryRes, reportRes] = await Promise.all([
        adsService.getAdsAnalyticsSummary(query),
        adsService.getAdsAnalyticsReport(query),
      ]);
      setSummary(summaryRes);
      setSeries(reportRes || []);
    } catch (e) {
      console.error('Failed to load ads analytics', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const query = buildQuery();
      await adsService.exportAdsAnalyticsCsv(query);
    } catch (e) {
      console.error('Failed to export ads analytics CSV', e);
    }
  };

  const labels = series.map((p) => p.date);
  const impressionsData = series.map((p) => p.impressions);
  const clicksData = series.map((p) => p.clicks);

  const impressionsChart = {
    labels,
    datasets: [
      {
        label: 'Impressions',
        data: impressionsData,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const clicksChart = {
    labels,
    datasets: [
      {
        label: 'Clicks',
        data: clicksData,
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        borderWidth: 1,
      },
    ],
  };

  const totalWatchHours = summary ? summary.watchTimeMs / (1000 * 60 * 60) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ads Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Impressions, clicks, and watch time for sponsored campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filters.days}
            onChange={(e) => setFilters({ ...filters, days: e.target.value })}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium mb-1">Sponsor</label>
          <select
            value={filters.sponsorId}
            onChange={(e) => setFilters({ ...filters, sponsorId: e.target.value, campaignId: '' })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All sponsors</option>
            {sponsors.map((s) => (
              <option key={s.sponsorId} value={s.sponsorId}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Campaign</label>
          <select
            value={filters.campaignId}
            onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All campaigns</option>
            {campaigns
              .filter((c) => !filters.sponsorId || c.sponsorId === filters.sponsorId)
              .map((c) => (
                <option key={c.campaignId} value={c.campaignId}>
                  {c.campaignId}
                </option>
              ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={loadAnalytics}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Impressions</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {summary.impressions.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <Eye className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Clicks</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {summary.clicks.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <MousePointerClick className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">CTR</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {(summary.ctr * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Watch Time</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {totalWatchHours.toFixed(1)}h
                </p>
              </div>
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && series.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Impressions over time</h2>
            <div className="h-64">
              <Line
                data={impressionsChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Clicks over time</h2>
            <div className="h-64">
              <Bar
                data={clicksChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!loading && !summary && (
        <div className="text-sm text-gray-500 mt-8">No analytics data yet. Once impressions are recorded, metrics will appear here.</div>
      )}
    </div>
  );
};

export default AdminAdAnalytics;
