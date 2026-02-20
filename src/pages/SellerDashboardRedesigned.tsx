import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Gavel,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Edit,
  BarChart3,
  Clock,
  CheckCircle,
  Star,
  ChevronRight,
  Settings,
  MessageSquare,
  MoreVertical,
  Archive,
  Zap
} from 'lucide-react';
import { KPICard, StatusBadge, ActionMenu, DataTable } from '@/components/design-system/EnhancedComponents';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * REDESIGNED SELLER DASHBOARD
 * 
 * Key Features:
 * - Shop status overview
 * - Large KPI metrics
 * - Quick actions prominent
 * - Products & auctions management
 * - Real-time performance metrics
 * - Mobile optimized
 */

interface ShopStats {
  monthlyRevenue: number;
  activeAuctions: number;
  totalProducts: number;
  averageRating: number;
  responseTime: number;
  returnRate: number;
}

interface Product {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'archived';
  price: number;
  views: number;
  likes: number;
  image: string;
  category: string;
}

interface Auction {
  id: string;
  title: string;
  startPrice: number;
  currentBid: number;
  status: 'active' | 'ending_soon' | 'ended';
  endTime: string;
  bidCount: number;
  viewCount: number;
  image: string;
}

export default function RedesignedSellerDashboard() {
  const [stats, setStats] = useState<ShopStats>({
    monthlyRevenue: 250000,
    activeAuctions: 12,
    totalProducts: 48,
    averageRating: 4.8,
    responseTime: 2,
    returnRate: 1.2
  });

  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      title: 'Premium Leather Handbag',
      status: 'active',
      price: 4500,
      views: 234,
      likes: 45,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      category: 'Fashion'
    },
    {
      id: '2',
      title: 'Smart Watch Pro',
      status: 'active',
      price: 12000,
      views: 456,
      likes: 89,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      category: 'Electronics'
    },
    {
      id: '3',
      title: 'Yoga Mat Premium',
      status: 'draft',
      price: 1200,
      views: 0,
      likes: 0,
      image: 'https://images.unsplash.com/photo-1517836357463-d25ddfcb85c0?w=400',
      category: 'Fitness'
    }
  ]);

  const [auctions, setAuctions] = useState<Auction[]>([
    {
      id: 'A1',
      title: 'Vintage Camera Collection',
      startPrice: 5000,
      currentBid: 18500,
      status: 'ending_soon',
      endTime: '2h 30m',
      bidCount: 12,
      viewCount: 234,
      image: 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400'
    },
    {
      id: 'A2',
      title: 'Designer Sunglasses',
      startPrice: 2000,
      currentBid: 5200,
      status: 'active',
      endTime: '8h 45m',
      bidCount: 23,
      viewCount: 456,
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'
    }
  ]);

  const [performanceData] = useState([
    { day: 'Mon', revenue: 18000, bids: 12, conversions: 3 },
    { day: 'Tue', revenue: 22000, bids: 15, conversions: 4 },
    { day: 'Wed', revenue: 28000, bids: 18, conversions: 6 },
    { day: 'Thu', revenue: 35000, bids: 22, conversions: 7 },
    { day: 'Fri', revenue: 42000, bids: 28, conversions: 9 },
    { day: 'Sat', revenue: 52000, bids: 35, conversions: 11 },
    { day: 'Sun', revenue: 53000, bids: 38, conversions: 12 }
  ]);

  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Shop</h1>
              <p className="text-gray-600 text-sm mt-1">Manage products, auctions & orders</p>
            </div>
            <div className="flex gap-3">
              <Link to="/seller/add-product">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link to="/seller/create-auction">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Gavel className="w-4 h-4 mr-2" />
                  Create Auction
                </Button>
              </Link>
            </div>
          </div>

          {/* Shop Status Bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-900">Shop Status</p>
                <p className="text-xs text-blue-700">Gold Seller • Top {stats.averageRating}% in category</p>
              </div>
            </div>
            <Link to="/seller/settings" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-semibold">Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* SECTION 1: KEY METRICS - 4 LARGE KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Monthly Revenue"
            value={`₹${(stats.monthlyRevenue / 100000).toFixed(1)}L`}
            icon={DollarSign}
            color="green"
            trend={12}
            trendDirection="up"
            comparison="+₹25,000 vs last month"
          />
          <KPICard
            title="Shop Rating"
            value={stats.averageRating}
            icon={Star}
            color="amber"
            subtext="Based on 156 reviews"
          />
          <KPICard
            title="Response Time"
            value={`${stats.responseTime}h`}
            icon={Clock}
            color="blue"
            subtext="Average response to queries"
          />
          <KPICard
            title="Active Listings"
            value={stats.activeAuctions}
            icon={Zap}
            color="purple"
            subtext="Currently selling"
            trend={3}
            trendDirection="up"
          />
        </div>

        {/* SECTION 2: PRODUCTS & AUCTIONS MANAGEMENT */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Listings</h2>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {['active', 'draft', 'inventory', 'archived'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Active Products Grid */}
            {activeTab === 'active' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter(p => p.status === 'active')
                  .map(product => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                    >
                      <div className="relative overflow-hidden bg-gray-100 aspect-square">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {product.views}
                        </div>
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {product.status}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{product.category}</p>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                          <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                          <div className="flex items-center gap-1 text-red-500">
                            <Star className="w-4 h-4 fill-red-500" />
                            {product.likes}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 h-10">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <ActionMenu
                            actions={[
                              { icon: MoreVertical, label: 'Reprice', onClick: () => {} },
                              { icon: Zap, label: 'Feature', onClick: () => {} },
                              { icon: Archive, label: 'Archive', onClick: () => {}, variant: 'danger' }
                            ]}
                            position="right"
                            trigger={<MoreVertical className="w-4 h-4" />}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            {/* Draft Products */}
            {activeTab === 'draft' && (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">No draft products</p>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Button>
              </div>
            )}
          </div>

          {/* Active Auctions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Live Auctions</h2>
              <Link to="/seller/auctions" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auctions.map(auction => (
                <Card key={auction.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <img src={auction.image} alt={auction.title} className="w-24 h-24 rounded object-cover" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{auction.title}</h3>
                        <StatusBadge
                          status={auction.status === 'ending_soon' ? 'warning' : 'active'}
                          size="sm"
                        />
                      </div>

                      <div className="space-y-2 mb-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Current Bid</span>
                          <span className="font-bold text-gray-900">₹{auction.currentBid.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bids / Views</span>
                          <span className="font-semibold text-gray-900">{auction.bidCount} / {auction.viewCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time Left</span>
                          <span className="font-semibold text-gray-900">{auction.endTime}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 h-8">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: ANALYTICS & INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 7-Day Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">7-Day Performance</h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {performanceData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:from-blue-600 hover:to-blue-400 transition-colors cursor-pointer group-hover:shadow-lg"
                    style={{ height: `${(item.revenue / 60000) * 100}%` }}
                    title={`₹${item.revenue.toLocaleString('en-IN')}`}
                  />
                  <span className="text-xs text-gray-600 font-semibold">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">₹2,50,000</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Total Bids</p>
                <p className="text-xl font-bold text-gray-900">169</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">Conversions</p>
                <p className="text-xl font-bold text-gray-900">52</p>
              </div>
            </div>
          </Card>

          {/* Customer Reviews & Feedback */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Feedback</h3>
            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Excellent quality</span>
                </div>
                <p className="text-sm text-gray-600">"Fast delivery and great condition. Highly recommend!"</p>
                <p className="text-xs text-gray-500 mt-2">from Priya K. • 2 days ago</p>
              </div>

              <div className="pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">Good product</span>
                </div>
                <p className="text-sm text-gray-600">"As described, quick process"</p>
                <p className="text-xs text-gray-500 mt-2">from Amit S. • 1 week ago</p>
              </div>

              <Link to="/seller/reviews" className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold pt-2 border-t border-gray-100">
                View All Reviews <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
