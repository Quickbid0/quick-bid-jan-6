import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Activity,
  Eye,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  totalUsers: number;
  totalRevenue: number;
  totalAuctions: number;
  totalBids: number;
  conversionRate: number;
  avgSessionDuration: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface BidPoint {
  created_at: string;
  amount: number | null;
}

interface InspectionStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  passRate: number;
  avgApprovalHours: number;
}

interface InspectorSummary {
  inspectorId: string;
  approvedCount: number;
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalRevenue: 0,
    totalAuctions: 0,
    totalBids: 0,
    conversionRate: 0,
    avgSessionDuration: 0,
    userGrowth: 0,
    revenueGrowth: 0
  });
  
  const [timeframe, setTimeframe] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    revenue: { labels: [], datasets: [] },
    users: { labels: [], datasets: [] },
    categories: { labels: [], datasets: [] },
    performance: { labels: [], datasets: [] }
  });
  const [inspectionStats, setInspectionStats] = useState<InspectionStats>({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    passRate: 0,
    avgApprovalHours: 0,
  });
  const [inspectionGradeChart, setInspectionGradeChart] = useState({ labels: [], datasets: [] });
  const [inspectionInspectorChart, setInspectionInspectorChart] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      // Determine timeframe window
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - (days - 1));

      // Fetch basic analytics + bid series for selected timeframe
      const [usersData, auctionsData, bidsData, bidsSeries, inspectionsData] = await Promise.all([
        supabase.from('profiles').select('created_at', { count: 'exact' }),
        supabase.from('auctions').select('id, final_price', { count: 'exact' }),
        supabase.from('bids').select('id', { count: 'exact' }),
        supabase
          .from('bids')
          .select('created_at, amount')
          .gte('created_at', fromDate.toISOString()),
        supabase
          .from('inspections')
          .select('id, status, final_status, final_decision, final_grade, created_at, reviewed_at, assigned_inspector_id')
          .gte('created_at', fromDate.toISOString()),
      ]);

      const totalUsers = usersData.count || 0;
      const totalAuctions = auctionsData.count || 0;
      const totalBids = bidsData.count || 0;
      const totalRevenue = auctionsData.data?.reduce((sum, auction) => sum + (auction.final_price || 0), 0) || 0;

      setAnalytics({
        totalUsers,
        totalRevenue,
        totalAuctions,
        totalBids,
        conversionRate: totalAuctions > 0 ? (totalBids / totalAuctions) * 100 : 0,
        avgSessionDuration: 24.5, // Mock data
        userGrowth: 12.5, // Mock data
        revenueGrowth: 18.3 // Mock data
      });

      // Generate chart data from bids series
      generateChartData(days, (bidsSeries.data || []) as BidPoint[]);

      const inspections = (inspectionsData.data || []) as any[];
      const totalInspections = inspections.length;
      if (totalInspections === 0) {
        setInspectionStats({
          total: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
          passRate: 0,
          avgApprovalHours: 0,
        });
        setInspectionGradeChart({ labels: [], datasets: [] });
        setInspectionInspectorChart({ labels: [], datasets: [] });
      } else {
        let approved = 0;
        let rejected = 0;
        let pending = 0;
        const gradeCounts: Record<string, number> = {};
        const inspectorMap: Record<string, number> = {};
        let totalApprovalHours = 0;
        let approvalSamples = 0;

        inspections.forEach((insp) => {
          const finalStatus = (insp.final_status || '').toLowerCase();
          const finalDecision = (insp.final_decision || '').toLowerCase();
          const status = (insp.status || '').toLowerCase();

          const isApproved = finalDecision === 'pass' || finalStatus === 'approved';
          const isRejected = finalDecision === 'fail' || finalStatus === 'rejected';

          if (isApproved) approved += 1;
          else if (isRejected) rejected += 1;
          else pending += 1;

          const grade = (insp.final_grade || '').toUpperCase();
          if (grade) {
            gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
          }

          if (isApproved && insp.assigned_inspector_id) {
            inspectorMap[insp.assigned_inspector_id] = (inspectorMap[insp.assigned_inspector_id] || 0) + 1;
          }

          if (isApproved && insp.created_at && insp.reviewed_at) {
            const created = new Date(insp.created_at).getTime();
            const reviewed = new Date(insp.reviewed_at).getTime();
            if (reviewed > created) {
              const hours = (reviewed - created) / (1000 * 60 * 60);
              totalApprovalHours += hours;
              approvalSamples += 1;
            }
          }
        });

        const passRate = totalInspections > 0 ? (approved / totalInspections) * 100 : 0;
        const avgApprovalHours = approvalSamples > 0 ? totalApprovalHours / approvalSamples : 0;

        setInspectionStats({
          total: totalInspections,
          approved,
          rejected,
          pending,
          passRate,
          avgApprovalHours,
        });

        const gradeLabels = Object.keys(gradeCounts).sort();
        const gradeValues = gradeLabels.map((g) => gradeCounts[g]);
        setInspectionGradeChart({
          labels: gradeLabels,
          datasets: [
            {
              label: 'Inspections by Grade',
              data: gradeValues,
              backgroundColor: ['#059669', '#2563EB', '#6B7280', '#F59E0B', '#EF4444'],
            },
          ],
        });

        const inspectorEntries: InspectorSummary[] = Object.keys(inspectorMap).map((id) => ({
          inspectorId: id,
          approvedCount: inspectorMap[id],
        }));
        inspectorEntries.sort((a, b) => b.approvedCount - a.approvedCount);
        const topInspectors = inspectorEntries.slice(0, 5);
        setInspectionInspectorChart({
          labels: topInspectors.map((i) => i.inspectorId.slice(0, 8)),
          datasets: [
            {
              label: 'Approved Inspections',
              data: topInspectors.map((i) => i.approvedCount),
              backgroundColor: '#4F46E5',
            },
          ],
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (days: number, bids: BidPoint[]) => {
    const labels: string[] = [];
    const volumePerDay: number[] = Array(days).fill(0);
    const countPerDay: number[] = Array(days).fill(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      labels.push(d.toLocaleDateString());
    }

    bids.forEach((b) => {
      const created = new Date(b.created_at);
      created.setHours(0, 0, 0, 0);
      const diffDays = Math.round((created.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const idx = days - 1 + diffDays;
      if (idx >= 0 && idx < days) {
        countPerDay[idx] += 1;
        volumePerDay[idx] += b.amount || 0;
      }
    });

    const revenueData = {
      labels,
      datasets: [{
        label: 'Bid Volume (₹)',
        data: volumePerDay,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    const usersData = {
      labels,
      datasets: [{
        label: 'Number of Bids',
        data: countPerDay,
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        borderWidth: 1
      }]
    };

    // Categories chart
    const categoriesData = {
      labels: ['Electronics', 'Art', 'Collectibles', 'Vehicles', 'Jewelry', 'Others'],
      datasets: [{
        data: [30, 25, 20, 15, 7, 3],
        backgroundColor: [
          '#4F46E5',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#6B7280'
        ]
      }]
    };

    // Performance radar chart
    const performanceData = {
      labels: ['User Engagement', 'Conversion Rate', 'Revenue Growth', 'User Retention', 'Platform Stability'],
      datasets: [{
        label: 'Current Period',
        data: [85, 72, 88, 79, 95],
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        borderColor: '#4F46E5',
        pointBackgroundColor: '#4F46E5'
      }, {
        label: 'Previous Period',
        data: [78, 68, 82, 75, 92],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10B981',
        pointBackgroundColor: '#10B981'
      }]
    };

    setChartData({
      revenue: revenueData,
      users: usersData,
      categories: categoriesData,
      performance: performanceData
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'text-gray-900' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-2 flex items-center text-sm">
          {trend > 0 ? (
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(trend)}% from last period
          </span>
        </div>
      )}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          icon={Users}
          trend={analytics.userGrowth}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={analytics.revenueGrowth}
          color="text-green-600"
        />
        <StatCard
          title="Total Auctions"
          value={analytics.totalAuctions.toLocaleString()}
          icon={Package}
          trend={8.2}
        />
        <StatCard
          title="Total Bids"
          value={analytics.totalBids.toLocaleString()}
          icon={TrendingUp}
          trend={15.7}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Conversion Rate"
          value={`${analytics.conversionRate.toFixed(1)}%`}
          icon={Target}
          trend={2.3}
        />
        <StatCard
          title="Avg Session Duration"
          value={`${analytics.avgSessionDuration} min`}
          icon={Clock}
          trend={-1.2}
        />
        <StatCard
          title="Page Views"
          value="1.2M"
          icon={Eye}
          trend={22.1}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Inspection Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Inspections"
            value={inspectionStats.total.toLocaleString()}
            icon={Activity}
            trend={0}
          />
          <StatCard
            title="Pass Rate"
            value={`${inspectionStats.passRate.toFixed(1)}%`}
            icon={Target}
            trend={0}
          />
          <StatCard
            title="Pending Inspections"
            value={inspectionStats.pending.toLocaleString()}
            icon={Clock}
            trend={0}
          />
          <StatCard
            title="Avg Approval Time"
            value={inspectionStats.avgApprovalHours > 0 ? `${inspectionStats.avgApprovalHours.toFixed(1)} h` : '—'}
            icon={Calendar}
            trend={0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grade Distribution</h3>
            <div className="h-64">
              <Doughnut
                data={inspectionGradeChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Inspectors by Approvals</h3>
            <div className="h-64">
              <Bar
                data={inspectionInspectorChart}
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
          <div className="h-64">
            <Line
              data={chartData.revenue}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">New Users</h2>
          <div className="h-64">
            <Bar
              data={chartData.users}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          <div className="h-64">
            <Doughnut
              data={chartData.categories}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <div className="h-64">
            <Radar
              data={chartData.performance}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.1)' }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200">User Growth</h3>
            <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
              User registration increased by 12.5% this period, driven by mobile app adoption.
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-200">Revenue Performance</h3>
            <p className="text-green-600 dark:text-green-300 text-sm mt-1">
              Revenue growth of 18.3% indicates strong market demand and effective pricing.
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-800 dark:text-purple-200">Category Trends</h3>
            <p className="text-purple-600 dark:text-purple-300 text-sm mt-1">
              Electronics and Art categories show highest engagement and conversion rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;