import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Link } from 'react-router-dom';
import { BarChart3, MapPin, Users, Activity, IndianRupee, Loader2 } from 'lucide-react';

interface SalesTotals {
  auctions: number;
  gmv: number;
  netPayout: number;
  newSellers: number;
}

interface GeoStat {
  city: string;
  auctions: number;
  gmv: number;
}

interface PayoutPipeline {
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  completedValue: number;
  inProgressValue: number;
  pendingValue: number;
  unpaidGMV: number;
}

interface DashboardResponse {
  period: { month: number; year: number; start: string; end: string };
  totals: SalesTotals;
  geo: GeoStat[];
  reps?: RepPerformance[];
  pipeline?: PayoutPipeline;
}

interface RepPerformance {
  owner_user_id: string;
  name: string;
  email: string | null;
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  pipelineGMV: number;
  wonGMV: number;
}

const AdminSalesDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('AdminSalesDashboard: getSession error', sessionError);
        }
        const token = sessionData.session?.access_token;
        if (!token) {
          setError('You must be logged in as admin to view sales dashboard.');
          setLoading(false);
          return;
        }

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const resp = await fetch(`/api/sales/dashboard?month=${month}&year=${year}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          console.error('AdminSalesDashboard: backend error', body);
          setError(body.error || body.message || 'Failed to load sales dashboard');
          setLoading(false);
          return;
        }

        const body = (await resp.json()) as DashboardResponse;
        setData(body);
      } catch (e) {
        console.error('AdminSalesDashboard: unexpected error', e);
        setError('Unexpected error while loading sales dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const monthLabel = (n: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[n - 1] || '';
  };

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sales Dashboard</h1>
        <p className="text-sm text-gray-500">No data available for this period.</p>
      </div>
    );
  }

  const { period, totals, geo, reps = [], pipeline } = data;

  const funnelTotals = reps.reduce(
    (acc, rep) => {
      acc.totalLeads += rep.totalLeads;
      acc.wonLeads += rep.wonLeads;
      acc.activeLeads += rep.activeLeads;
      acc.pipelineGMV += rep.pipelineGMV;
      acc.wonGMV += rep.wonGMV;
      return acc;
    },
    { totalLeads: 0, wonLeads: 0, activeLeads: 0, pipelineGMV: 0, wonGMV: 0 },
  );

  const overallWinRate = funnelTotals.totalLeads
    ? (funnelTotals.wonLeads / funnelTotals.totalLeads) * 100
    : 0;

  const topByWonGmv = reps.length
    ? reps.reduce((best, rep) => (rep.wonGMV > best.wonGMV ? rep : best), reps[0])
    : null;

  const topGeoCity = geo.length
    ? geo.reduce((best, row) => (row.gmv > best.gmv ? row : best), geo[0])
    : null;

  const topGeoCityShare = topGeoCity && totals.gmv > 0
    ? (topGeoCity.gmv / totals.gmv) * 100
    : null;

  const minLeadsForWinRate = 5;
  const repsWithEnoughLeads = reps.filter((r) => r.totalLeads >= minLeadsForWinRate);
  const topByWinRate = repsWithEnoughLeads.length
    ? repsWithEnoughLeads.reduce((best, rep) => {
        const bestRate = best.totalLeads ? best.wonLeads / best.totalLeads : 0;
        const repRate = rep.totalLeads ? rep.wonLeads / rep.totalLeads : 0;
        return repRate > bestRate ? rep : best;
      }, repsWithEnoughLeads[0])
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Performance overview for {monthLabel(period.month)} {period.year}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/sales-leads"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Leads
          </Link>
          <Link
            to="/admin/payouts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <IndianRupee className="h-4 w-4 mr-2" />
            Payouts
          </Link>
        </div>
      </div>

      {/* Payout pipeline */}
      {pipeline && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payout pipeline</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Completed vs in-progress vs pending seller payouts, plus unpaid GMV for this period.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completed payouts</div>
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                {pipeline.completedCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Value: ₹{pipeline.completedValue.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">In-progress payouts</div>
              <div className="text-lg font-semibold text-amber-600 dark:text-amber-300">
                {pipeline.inProgressCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Value: ₹{pipeline.inProgressValue.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pending payouts</div>
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {pipeline.pendingCount}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Value: ₹{pipeline.pendingValue.toLocaleString()}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unpaid GMV</div>
              <div className="text-lg font-semibold text-rose-600 dark:text-rose-300">
                ₹{pipeline.unpaidGMV.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Approx. GMV where payouts are not yet initiated.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total GMV</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              ₹{totals.gmv.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
            <IndianRupee className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Auctions</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totals.auctions}</p>
          </div>
          <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Net payout</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              ₹{totals.netPayout.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/30">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">New sellers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{totals.newSellers}</p>
          </div>
          <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/30">
            <Users className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Geo breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              Geo performance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Top cities by auction GMV this month
            </p>
          </div>
          {topGeoCity && (
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[11px]">
              Top city:{' '}
              <span className="ml-1 font-semibold">{topGeoCity.city}</span>
              <span className="ml-1">(₹{topGeoCity.gmv.toLocaleString()}</span>
              {topGeoCityShare != null && (
                <span className="ml-0.5">· {topGeoCityShare.toFixed(1)}% of GMV</span>
              )}
              <span>)</span>
            </div>
          )}
        </div>
        <div className="px-6 py-4">
          {geo.length === 0 ? (
            <p className="text-sm text-gray-500">No geo data available for this period.</p>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {geo.map((row) => (
                  <div key={row.city} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{row.city}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">₹{row.gmv.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{row.auctions} auctions</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/40">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">City</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Auctions</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">GMV (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {geo.map((row) => (
                      <tr key={row.city}>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{row.city}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{row.auctions}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                          ₹{row.gmv.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rep performance (leads-based) */}
      {reps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rep performance</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Leads and GMV pipeline by owner for this period.
            </p>
            <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
              <span>
                Total leads: <span className="font-semibold text-gray-800 dark:text-gray-100">{funnelTotals.totalLeads}</span>
              </span>
              <span>
                Won: <span className="font-semibold text-emerald-600 dark:text-emerald-300">{funnelTotals.wonLeads}</span>
              </span>
              <span>
                Win rate:{' '}
                <span className="font-semibold">
                  {overallWinRate.toFixed(1)}%
                </span>
              </span>
              <span>
                Pipeline GMV:{' '}
                <span className="font-semibold">
                  ₹{funnelTotals.pipelineGMV.toLocaleString()}
                </span>
              </span>
              <span>
                Won GMV:{' '}
                <span className="font-semibold">
                  ₹{funnelTotals.wonGMV.toLocaleString()}
                </span>
              </span>
            </div>
            {(topByWonGmv || topByWinRate) && (
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {topByWonGmv && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Top by won GMV:{' '}
                    <span className="ml-1 font-semibold">{topByWonGmv.name}</span>
                    <span className="ml-1">
                      (₹{topByWonGmv.wonGMV.toLocaleString()})
                    </span>
                  </span>
                )}
                {topByWinRate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Best win rate (≥{minLeadsForWinRate} leads):{' '}
                    <span className="ml-1 font-semibold">{topByWinRate.name}</span>
                    <span className="ml-1">
                      ({((topByWinRate.wonLeads / topByWinRate.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="px-6 py-4">
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {reps.map((rep) => (
                <div key={rep.owner_user_id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{rep.name}</div>
                      {rep.email && <div className="text-xs text-gray-500">{rep.email}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">₹{rep.wonGMV.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Won GMV</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="text-xs text-gray-500">Leads</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{rep.totalLeads}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Won</div>
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400">{rep.wonLeads}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Rate</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {rep.totalLeads ? `${((rep.wonLeads / rep.totalLeads) * 100).toFixed(0)}%` : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                       Avg: {rep.wonLeads ? `₹${Math.round(rep.wonGMV / rep.wonLeads).toLocaleString()}` : '—'}
                    </div>
                    {rep.owner_user_id !== 'unassigned' ? (
                      <Link
                        to={`/admin/sales/leads?owner=${encodeURIComponent(rep.owner_user_id)}`}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      >
                        View Leads
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/40">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Rep</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Total leads</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Active</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Won</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Pipeline GMV</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Won GMV</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Win rate</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Avg deal</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Leads view</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {reps.map((rep) => (
                    <tr key={rep.owner_user_id}>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                        <div className="font-medium">{rep.name}</div>
                        {rep.email && (
                          <div className="text-xs text-gray-500">{rep.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{rep.totalLeads}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{rep.activeLeads}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">{rep.wonLeads}</td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        ₹{rep.pipelineGMV.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                        ₹{rep.wonGMV.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                        {rep.totalLeads
                          ? `${((rep.wonLeads / rep.totalLeads) * 100).toFixed(1)}%`
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                        {rep.wonLeads
                          ? `₹${Math.round(rep.wonGMV / rep.wonLeads).toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-200 text-xs">
                        {rep.owner_user_id !== 'unassigned' ? (
                          <Link
                            to={`/admin/sales/leads?owner=${encodeURIComponent(rep.owner_user_id)}`}
                            className="inline-flex items-center px-2 py-1 rounded-md border border-indigo-200 text-[11px] text-indigo-700 hover:bg-indigo-50"
                          >
                            View leads
                          </Link>
                        ) : (
                          <span className="text-[11px] text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalesDashboard;
