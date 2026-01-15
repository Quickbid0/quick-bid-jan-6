import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Upload, 
  BarChart3, 
  Package, 
  FileText,
  TrendingUp,
  DollarSign,
  Truck,
  Shield,
  Plus,
  Eye,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CompanyStats {
  totalProducts: number;
  activeAuctions: number;
  totalRevenue: number;
  bulkUploads: number;
  seizedVehicles: number;
  complianceScore: number;
}

const CompanyDashboard = () => {
  const [stats, setStats] = useState<CompanyStats>({
    totalProducts: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    bulkUploads: 0,
    seizedVehicles: 0,
    complianceScore: 95
  });
  
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Seized Vehicles (Bank/NBFC pool)',
    gst: 'GST123456789',
    license: 'NBFC/2023/001',
    address: '123 Financial District, Mumbai',
    established: '2015'
  });

  const [recentUploads, setRecentUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      // Mock data for company dashboard
      setStats({
        totalProducts: 1247,
        activeAuctions: 89,
        totalRevenue: 15600000,
        bulkUploads: 23,
        seizedVehicles: 156,
        complianceScore: 95
      });

      setRecentUploads([
        { id: 1, name: 'Vehicle Batch #45', items: 25, date: '2024-01-15', status: 'Processing' },
        { id: 2, name: 'Machinery Lot #12', items: 8, date: '2024-01-14', status: 'Approved' },
        { id: 3, name: 'Property Assets #7', items: 12, date: '2024-01-13', status: 'Live' }
      ]);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = 'text-gray-900',
    trend,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
    trend?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">+{trend}% this month</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">{companyInfo.name} - B2B Auction Platform</p>
        </div>
        <Link
          to="/bulk-upload"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Bulk Upload
        </Link>
      </div>

      {/* Company Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building className="h-6 w-6 text-indigo-600" />
          Company Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500">Company Name</p>
            <p className="font-semibold">{companyInfo.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GST Number</p>
            <p className="font-semibold">{companyInfo.gst}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">License Number</p>
            <p className="font-semibold">{companyInfo.license}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Established</p>
            <p className="font-semibold">{companyInfo.established}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          trend={12}
        />
        <StatCard
          title="Active Auctions"
          value={stats.activeAuctions}
          icon={Calendar}
          color="text-blue-600"
          trend={8}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="text-green-600"
          trend={25}
        />
        <StatCard
          title="Bulk Uploads"
          value={stats.bulkUploads}
          icon={Upload}
          trend={15}
        />
        <StatCard
          title="Seized Vehicles"
          value={stats.seizedVehicles}
          icon={Truck}
          color="text-orange-600"
        />
        <StatCard
          title="Compliance Score"
          value={`${stats.complianceScore}%`}
          icon={Shield}
          color="text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link
          to="/bulk-upload"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-indigo-100 rounded-lg inline-block mb-3">
              <Upload className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Bulk Upload</h3>
            <p className="text-sm text-gray-500">Upload multiple assets</p>
          </div>
        </Link>

        <Link
          to="/seized-vehicles"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-orange-100 rounded-lg inline-block mb-3">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Seized Vehicles</h3>
            <p className="text-sm text-gray-500">Manage vehicle auctions</p>
          </div>
        </Link>

        <Link
          to="/company/analytics"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-block mb-3">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
            <p className="text-sm text-gray-500">Performance insights</p>
          </div>
        </Link>

        <Link
          to="/compliance"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-lg inline-block mb-3">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Compliance</h3>
            <p className="text-sm text-gray-500">Regulatory tracking</p>
          </div>
        </Link>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bulk Uploads</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentUploads.map((upload) => (
            <div key={upload.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{upload.name}</h3>
                    <p className="text-sm text-gray-500">{upload.items} items • {upload.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    upload.status === 'Live' ? 'bg-green-100 text-green-800' :
                    upload.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {upload.status}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;