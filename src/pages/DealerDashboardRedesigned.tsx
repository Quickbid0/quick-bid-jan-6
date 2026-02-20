import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Upload,
  Bell,
  Settings,
  Package,
  CreditCard,
  Eye,
  Clock,
  CheckCircle,
  ChevronRight,
  Zap,
  MapPin,
  Calendar
} from 'lucide-react';
import { KPICard, StatusBadge, ActionMenu, DataTable } from '@/components/design-system/EnhancedComponents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * REDESIGNED DEALER DASHBOARD
 * 
 * Key Features:
 * - Inventory overview with stock status
 * - Commission tracking
 * - Vehicle performance metrics
 * - Bulk operations support
 * - Finance integration
 * - Mobile optimized
 */

interface DealerStats {
  thisMonthRevenue: number;
  activeAuctions: number;
  avgVehiclePrice: number;
  commissionOwed: number;
  conversionRate: number;
  inventoryCount: number;
}

interface Vehicle {
  id: string;
  title: string;
  price: number;
  status: 'active' | 'ending_soon' | 'sold' | 'inventory';
  image: string;
  year: number;
  mileage: number;
  location: string;
  views: number;
  bids: number;
  timeLeft?: string;
}

interface CommissionRecord {
  id: string;
  month: string;
  earned: number;
  status: 'pending' | 'paid';
  dueDate: string;
}

export default function RedesignedDealerDashboard() {
  const [stats, setStats] = useState<DealerStats>({
    thisMonthRevenue: 620000,
    activeAuctions: 12,
    avgVehiclePrice: 850000,
    commissionOwed: 18000,
    conversionRate: 82,
    inventoryCount: 45
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'V1',
      title: 'BMW X3 2020 Model',
      price: 1520000,
      status: 'ending_soon',
      image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=400',
      year: 2020,
      mileage: 45000,
      location: 'Mumbai',
      views: 145,
      bids: 23,
      timeLeft: '2h 34m'
    },
    {
      id: 'V2',
      title: 'Audi A4 2019 Sedan',
      price: 980000,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1606611012657-969ee526ce90?w=400',
      year: 2019,
      mileage: 62000,
      location: 'Bangalore',
      views: 98,
      bids: 18
    },
    {
      id: 'V3',
      title: 'Mercedes C-Class 2021',
      price: 1850000,
      status: 'sold',
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c3ff86981?w=400',
      year: 2021,
      mileage: 28000,
      location: 'Delhi',
      views: 203,
      bids: 31
    },
    {
      id: 'V4',
      title: 'Honda Civic 2018',
      price: 580000,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400',
      year: 2018,
      mileage: 78000,
      location: 'Pune',
      views: 156,
      bids: 12
    }
  ]);

  const [commissions, setCommissions] = useState<CommissionRecord[]>([
    { id: '1', month: 'January 2026', earned: 18000, status: 'pending', dueDate: 'Feb 5, 2026' },
    { id: '2', month: 'December 2025', earned: 22000, status: 'paid', dueDate: 'Jan 5, 2026' },
    { id: '3', month: 'November 2025', earned: 19500, status: 'paid', dueDate: 'Dec 5, 2025' }
  ]);

  const [activeTab, setActiveTab] = useState('active');
  const [performanceData] = useState([
    { month: 'Jan', revenue: 180000, auctions: 15, conversion: 72 },
    { month: 'Feb', revenue: 220000, auctions: 18, conversion: 75 },
    { month: 'Mar', revenue: 240000, auctions: 20, conversion: 78 },
    { month: 'Apr', revenue: 260000, auctions: 22, conversion: 80 },
    { month: 'May', revenue: 280000, auctions: 25, conversion: 82 },
    { month: 'Jun', revenue: 300000, auctions: 28, conversion: 85 }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dealer Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Manage inventory, track sales & commissions</p>
            </div>
            <div className="flex gap-3">
              <Link to="/dealer/add-vehicle">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </Link>
              <Link to="/dealer/bulk-upload">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
              </Link>
            </div>
          </div>

          {/* Inventory Status Bar */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-green-600">{stats.inventoryCount}</div>
              <div>
                <p className="text-sm font-semibold text-green-900">Vehicles in Inventory</p>
                <p className="text-xs text-green-700">{stats.activeAuctions} currently listed</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-gray-900">Conversion: {stats.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* SECTION 1: KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="This Month Revenue"
            value={`₹${(stats.thisMonthRevenue / 100000).toFixed(1)}L`}
            icon={DollarSign}
            color="green"
            trend={8}
            trendDirection="up"
            comparison="Vehicles sold: 15"
          />
          <KPICard
            title="Active Auctions"
            value={stats.activeAuctions}
            icon={Package}
            color="blue"
            subtext="Live vehicle listings"
          />
          <KPICard
            title="Avg Vehicle Price"
            value={`₹${(stats.avgVehiclePrice / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="purple"
            comparison="Market avg: ₹8.2L"
          />
          <KPICard
            title="Commission Owed"
            value={`₹${(stats.commissionOwed / 1000).toFixed(0)}K`}
            icon={CreditCard}
            color="amber"
            subtext="Pending payout"
            onClick={() => console.log('view commissions')}
          />
        </div>

        {/* SECTION 2: VEHICLE LISTING & MANAGEMENT */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Listings</h2>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {['active', 'ending_soon', 'inventory', 'sold'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'ending_soon' ? 'Ending Soon' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'active' && ` (${vehicles.filter(v => v.status === 'active').length})`}
                  {tab === 'ending_soon' && ` (${vehicles.filter(v => v.status === 'ending_soon').length})`}
                </button>
              ))}
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles
                .filter(v => activeTab === 'ending_soon' ? v.status === 'ending_soon' : v.status === activeTab)
                .map(vehicle => (
                  <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative overflow-hidden bg-gray-100 aspect-video">
                      <img
                        src={vehicle.image}
                        alt={vehicle.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {vehicle.views}
                      </div>
                      <StatusBadge
                        status={
                          vehicle.status === 'ending_soon'
                            ? 'warning'
                            : vehicle.status === 'sold'
                            ? 'completed'
                            : 'active'
                        }
                        size="sm"
                      />
                      {vehicle.timeLeft && (
                        <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          ⏱ {vehicle.timeLeft}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{vehicle.title}</h3>

                      <div className="text-sm text-gray-600 space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span>{vehicle.year}</span>
                          <span>{vehicle.mileage.toLocaleString()} km</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700">
                          <MapPin className="w-4 h-4" />
                          {vehicle.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <span className="text-2xl font-bold text-gray-900">₹{(vehicle.price / 100000).toFixed(1)}L</span>
                        <div className="text-right text-sm">
                          <p className="font-semibold text-blue-600">{vehicle.bids} bids</p>
                        </div>
                      </div>

                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-10">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>

          {/* Commission Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Commission Tracking</h2>
              <Link to="/dealer/commissions" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commissions.map(record => (
                <Card key={record.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">{record.month}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">₹{record.earned.toLocaleString('en-IN')}</p>
                    </div>
                    <StatusBadge
                      status={record.status === 'pending' ? 'warning' : 'success'}
                      label={record.status === 'pending' ? 'Pending' : 'Paid'}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    {record.status === 'pending' ? 'Payment due' : 'Payment received'}: {record.dueDate}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: PERFORMANCE ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 6-Month Performance Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">6-Month Revenue Trend</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {performanceData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t hover:from-green-600 hover:to-green-400 transition-colors cursor-pointer group-hover:shadow-lg"
                    style={{ height: `${(item.revenue / 350000) * 100}%` }}
                    title={`₹${item.revenue.toLocaleString('en-IN')}`}
                  />
                  <span className="text-xs text-gray-600 font-semibold">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Latest Month</p>
                <p className="text-lg font-bold text-gray-900">₹3,00,000</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Vehicles</p>
                <p className="text-lg font-bold text-gray-900">156</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Avg Per Vehicle</p>
                <p className="text-lg font-bold text-gray-900">₹8.5L</p>
              </div>
            </div>
          </Card>

          {/* Vehicle Performance Heatmap */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-3">
              {[
                { category: 'Sedans', count: 18, revenue: 280000, heat: 'hot' },
                { category: 'SUVs', count: 12, revenue: 180000, heat: 'normal' },
                { category: 'Hatchbacks', count: 8, revenue: 85000, heat: 'slow' },
                { category: 'Luxury', count: 7, revenue: 175000, heat: 'hot' }
              ].map(cat => (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{cat.category}</span>
                      <span className="text-sm text-gray-600">{cat.count} vehicles</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          cat.heat === 'hot'
                            ? 'bg-red-500'
                            : cat.heat === 'normal'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${(cat.revenue / 280000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">₹{(cat.revenue / 100000).toFixed(1)}L</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
