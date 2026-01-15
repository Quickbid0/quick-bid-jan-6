import React, { useEffect, useState } from 'react';
import { sponsorAuthService } from '../../services/sponsorAuthService';
import { useNavigate } from 'react-router-dom';
import { adsService } from '../../services/adsService';
import { toast } from 'react-hot-toast';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { LogOut } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SponsorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const auth = sponsorAuthService.loadAuth();

  const [summary, setSummary] = useState<any | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!auth) {
      navigate('/sponsor/login');
      return;
    }
    const query = new URLSearchParams({ sponsorId: auth.sponsorId }).toString();
    const load = async () => {
      try {
        const [summaryRes, reportRes, allCampaigns, invs] = await Promise.all([
          adsService.getAdsAnalyticsSummary(query),
          adsService.getAdsAnalyticsReport(query),
          adsService.listCampaigns(),
          adsService.listInvoices(auth.sponsorId),
        ]);
        setSummary(summaryRes);
        setSeries(reportRes || []);
        setCampaigns((allCampaigns || []).filter((c: any) => c.sponsorId === auth.sponsorId));
        setInvoices(invs || []);
      } catch (e) {
        console.error('Failed to load sponsor dashboard', e);
        toast.error('Failed to load sponsor dashboard');
      }
    };
    load();
  }, [auth, navigate]);

  if (!auth) return null;

  const handleLogout = () => {
    sponsorAuthService.clearAuth();
    navigate('/sponsor/login');
  };

  const labels = series.map((p) => p.date);
  const impressionsData = series.map((p) => p.impressions);
  const clicksData = series.map((p) => p.clicks);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Impressions',
        data: impressionsData,
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
      },
      {
        label: 'Clicks',
        data: clicksData,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  };

  const totalWatchHours = summary ? summary.watchTimeMs / (1000 * 60 * 60) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sponsor Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Campaign performance and billing overview.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500">Impressions</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {summary.impressions.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500">Clicks</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {summary.clicks.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500">CTR</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {(summary.ctr * 100).toFixed(2)}%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-gray-500">Watch Time</div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {totalWatchHours.toFixed(1)}h
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Impressions & Clicks</h2>
            {series.length === 0 ? (
              <div className="text-xs text-gray-500">No analytics data yet.</div>
            ) : (
              <div className="h-64">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { beginAtZero: true, grid: { display: false } },
                    },
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Active Campaigns</h2>
            {campaigns.length === 0 ? (
              <div className="text-xs text-gray-500">No campaigns yet.</div>
            ) : (
              <ul className="space-y-2 text-xs">
                {campaigns.map((c) => (
                  <li key={c.campaignId} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-1">
                    <div>
                      <div className="font-medium">{c.campaignId}</div>
                      <div className="text-gray-500">
                        {c.startDate?.slice(0, 10)} → {c.endDate?.slice(0, 10)}
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      {c.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Invoices</h2>
          {invoices.length === 0 ? (
            <div className="text-xs text-gray-500">No invoices yet.</div>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 text-left">Invoice</th>
                    <th className="py-2 text-left">Amount</th>
                    <th className="py-2 text-left">Due</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceId} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 font-mono">{inv.invoiceId}</td>
                      <td className="py-2">₹{inv.totalAmount.toLocaleString()}</td>
                      <td className="py-2">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-2 text-xs">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;
