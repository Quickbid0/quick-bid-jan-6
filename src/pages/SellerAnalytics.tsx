import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link } from 'react-router-dom';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, DollarSign, Package, Users, ArrowUp, ArrowDown, Eye, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SellerAnalytics = () => {
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: []
  });
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    averagePrice: 0,
    totalItems: 0,
    activeAuctions: 0,
    totalViews: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch sales data
      const { data: sales, error: salesError } = await supabase
        .from('auctions')
        .select(`
          id,
          final_price,
          end_time,
          status,
          products (
            title,
            category,
            view_count
          )
        `)
        .eq('seller_id', user.id)
        .order('end_time', { ascending: true });

      if (salesError) throw salesError;

      // Process data for charts
      const processedSalesData = processSalesChartData(sales);
      setSalesData(processedSalesData);

      const processedCategoryData = processCategoryData(sales);
      setCategoryData(processedCategoryData);

      // Calculate metrics
      const completedSales = sales.filter(sale => sale.status === 'completed');
      const totalSales = completedSales.reduce((sum, sale) => sum + (sale.final_price || 0), 0);
      const averagePrice = completedSales.length > 0 ? totalSales / completedSales.length : 0;
      const totalViews = sales.reduce((sum, sale) => {
        const products = sale.products as any;
        if (!products) return sum;
        if (Array.isArray(products)) {
          return sum + products.reduce((acc, p: any) => acc + (p.view_count || 0), 0);
        }
        return sum + ((products as any)?.view_count || 0);
      }, 0);
      const conversionRate = totalViews > 0 ? (completedSales.length / totalViews) * 100 : 0;

      // Fetch active auctions count
      const { count: activeCount } = await supabase
        .from('auctions')
        .select('id', { count: 'exact' })
        .eq('seller_id', user.id)
        .eq('status', 'active');

      setMetrics({
        totalSales,
        averagePrice,
        totalItems: sales.length,
        activeAuctions: activeCount || 0,
        totalViews,
        conversionRate
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const processSalesChartData = (sales) => {
    const completedSales = sales.filter(sale => sale.status === 'completed');
    const groupedSales = completedSales.reduce((acc, sale) => {
      const date = new Date(sale.end_time).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += sale.final_price || 0;
      return acc;
    }, {});

    return {
      labels: Object.keys(groupedSales),
      datasets: [
        {
          label: 'Sales Revenue',
          data: Object.values(groupedSales),
          fill: true,
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const processCategoryData = (sales) => {
    const categoryCount = sales.reduce((acc, sale) => {
      const category = sale.products?.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(categoryCount),
      datasets: [{
        label: 'Items by Category',
        data: Object.values(categoryCount),
        backgroundColor: [
          'rgba(79, 70, 229, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(139, 92, 246, 0.6)'
        ]
      }]
    };
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'text-gray-900' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
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
            {Math.abs(trend)}% from last {timeframe}
          </span>
        </div>
      )}
    </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seller Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your auction performance and sales</p>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {metrics.totalItems === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first product to see analytics here.</p>
          <Link
            to="/add-product"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <React.Fragment>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${metrics.totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend={15}
          color="text-green-600"
        />
        <StatCard
          title="Average Price"
          value={`₹${Math.round(metrics.averagePrice).toLocaleString()}`}
          icon={TrendingUp}
          trend={5}
        />
        <StatCard
          title="Total Items"
          value={metrics.totalItems}
          icon={Package}
          trend={-2}
        />
        <StatCard
          title="Active Auctions"
          value={metrics.activeAuctions}
          icon={Users}
          trend={8}
        />
        <StatCard
          title="Total Views"
          value={metrics.totalViews.toLocaleString()}
          icon={Eye}
          trend={12}
        />
        <StatCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={Star}
          trend={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
          <div className="h-64">
            <Line
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      display: false
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          <div className="h-64">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200">Best Performing Category</h3>
            <p className="text-blue-600 dark:text-blue-300">
              {categoryData.labels?.[0] || 'No data'}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-800 dark:text-green-200">Success Rate</h3>
            <p className="text-green-600 dark:text-green-300">
              {((metrics.totalItems > 0 ? (metrics.totalItems - metrics.activeAuctions) / metrics.totalItems : 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Avg. Views per Item</h3>
            <p className="text-yellow-600 dark:text-yellow-300">
              {metrics.totalItems > 0 ? Math.round(metrics.totalViews / metrics.totalItems) : 0}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-800 dark:text-purple-200">Revenue per Item</h3>
            <p className="text-purple-600 dark:text-purple-300">
              ₹{metrics.totalItems > 0 ? Math.round(metrics.totalSales / metrics.totalItems).toLocaleString() : 0}
            </p>
          </div>
        </div>
      </div>
    </React.Fragment>
      )}
    </div>
  );
};

export default SellerAnalytics;