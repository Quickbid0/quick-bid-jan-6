/**
 * Updated Dashboard Components with Real API Integration
 * 
 * These are updated versions of the redesigned dashboards
 * that use the useDashboardAPIs hooks for real data
 * 
 * Key changes from previous versions:
 * - Replace mock data with API hooks
 * - Add loading states (spinner)
 * - Add error states (retry button)
 * - Add automatic refetch capability
 */

import React from 'react';
import { useBuyerDashboard, useSellerDashboard, useDealerDashboard, useAdminDashboard } from '@/hooks/useDashboardAPIs';
import { 
  KPICard, 
  AuctionCard, 
  StatusBadge, 
  ActionMenu, 
  DataTable, 
  StatCounter 
} from '@/components/design-system/EnhancedComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

// ============================================================================
// LOADING & ERROR COMPONENTS
// ============================================================================

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full" />
          </div>
        </div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-red-900">Failed to load dashboard</h3>
        <p className="text-sm text-red-700 mt-1">{error.message}</p>
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// BUYER DASHBOARD WITH API INTEGRATION
// ============================================================================

export function BuyerDashboardWithAPI({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useBuyerDashboard(userId);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState error={error || new Error('No data')} onRetry={refetch} />;

  const { user, activeBids, wonAuctions, stats, recommendations, spending } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with refresh */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}</h1>
            <p className="text-gray-600 mt-1">Your auction dashboard</p>
          </div>
          <button
            onClick={refetch}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Active Bids Hero Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Active Bids</h2>
          {activeBids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeBids.map(bid => (
                <AuctionCard
                  key={bid.id}
                  title={bid.title}
                  image={bid.image}
                  currentPrice={bid.currentBid}
                  yourBid={bid.yourBid}
                  status={bid.status}
                  timeRemaining={bid.timeRemaining}
                  sellerRating={bid.sellerRating}
                  mode="buyer"
                  onAction={() => {
                    // Handle bid action
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">No active bids. Start bidding to see auctions here!</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Browse Auctions
              </button>
            </div>
          )}
        </section>

        {/* KPI Cards */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Wallet Balance"
              value={`₹${user.walletBalance.toLocaleString()}`}
              trend="+12%"
              variant="blue"
              icon="Wallet"
            />
            <KPICard
              label="Active Bids"
              value={stats.activeCount}
              trend={`${(stats.activeCount > 0 ? '+' : '')}${stats.activeCount}`}
              variant="green"
              icon="Zap"
            />
            <KPICard
              label="Won Auctions"
              value={stats.wonCount}
              trend={`${((stats.wonCount / (stats.wonCount + stats.activeCount)) * 100).toFixed(1)}% win rate`}
              variant="amber"
              icon="Trophy"
            />
            <KPICard
              label="This Month"
              value={`₹${spending.thisMonth.toLocaleString()}`}
              trend={`vs ₹${spending.thisYear.toLocaleString()} this year`}
              variant="purple"
              icon="TrendingUp"
            />
          </div>
        </section>

        {/* Won Auctions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Won Auctions</h2>
          {wonAuctions.length > 0 ? (
            <DataTable
              columns={[
                { key: 'title', label: 'Item', width: '35%' },
                { key: 'winAmount', label: 'Price', width: '15%' },
                { key: 'paymentStatus', label: 'Payment', width: '15%' },
                { key: 'deliveryStatus', label: 'Delivery', width: '15%' },
                { key: 'purchaseDate', label: 'Date', width: '20%' },
              ]}
              data={wonAuctions.map(auction => ({
                ...auction,
                actions: [
                  { label: 'View Details', onClick: () => {} },
                  { label: 'Contact Seller', onClick: () => {} },
                ]
              }))}
              sortable
              filterable
            />
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600">You haven't won any auctions yet</p>
            </div>
          )}
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                <img src={rec.image} alt={rec.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 flex-1">{rec.title}</h3>
                    <StatusBadge 
                      status={`${Math.round(rec.confidence * 100)}% match`}
                      variant="green"
                    />
                  </div>
                  <p className="text-2xl font-bold text-green-600 mb-2">{rec.price}</p>
                  <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    View Auction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spending Chart */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">7-Day Spending</h2>
          <div className="bg-white rounded-lg p-6 shadow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spending.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// SELLER DASHBOARD WITH API INTEGRATION
// ============================================================================

export function SellerDashboardWithAPI({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useSellerDashboard(userId);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState error={error || new Error('No data')} onRetry={refetch} />;

  const { seller, analytics, products, liveAuctions, feedback, performance } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{seller.shopName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.floor(seller.rating))}
                </div>
                <span className="text-sm text-gray-600">{seller.rating}/5.0</span>
                {seller.goldBadge && (
                  <StatusBadge status="Gold Seller" variant="gold" />
                )}
              </div>
            </div>
          </div>
          <button
            onClick={refetch}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Analytics KPIs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Monthly Revenue"
              value={`₹${analytics.monthlyRevenue.toLocaleString()}`}
              trend="+18%"
              variant="green"
              icon="TrendingUp"
            />
            <KPICard
              label="Shop Rating"
              value={`${analytics.rating}/5.0`}
              trend="+0.2 this month"
              variant="blue"
              icon="Star"
            />
            <KPICard
              label="Avg Response Time"
              value={`${analytics.responseTime}min`}
              trend="Industry avg 2h"
              variant="purple"
              icon="Clock"
            />
            <KPICard
              label="Active Listings"
              value={analytics.activeListings}
              trend={`${analytics.newOrders} new orders`}
              variant="amber"
              icon="Package"
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              + Add Product
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
              + Create Auction
            </button>
          </div>
        </section>

        {/* Products Table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Products ({products.length})</h2>
          <DataTable
            columns={[
              { key: 'name', label: 'Product Name', width: '35%' },
              { key: 'status', label: 'Status', width: '15%' },
              { key: 'price', label: 'Price', width: '15%' },
              { key: 'bids', label: 'Bids', width: '10%' },
              { key: 'endDate', label: 'Ends', width: '25%' },
            ]}
            data={products}
            sortable
            filterable
          />
        </section>

        {/* Live Auctions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Auctions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveAuctions.map(auction => (
              <AuctionCard
                key={auction.id}
                title={auction.title}
                image={auction.image}
                currentPrice={auction.currentBid}
                status="active"
                timeRemaining={auction.timeRemaining}
                onAction={() => {}}
              />
            ))}
          </div>
        </section>

        {/* Recent Feedback */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Feedback</h2>
          <div className="space-y-3">
            {feedback.slice(0, 5).map(f => (
              <div key={f.id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{f.customerName}</p>
                    <p className="text-sm text-gray-600">{f.product}</p>
                  </div>
                  <div className="text-yellow-400">{'★'.repeat(f.rating)}</div>
                </div>
                <p className="text-gray-700">{f.comment}</p>
                <p className="text-xs text-gray-500 mt-2">{f.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Chart */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Revenue Trend</h2>
          <div className="bg-white rounded-lg p-6 shadow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performance.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// DEALER DASHBOARD WITH API INTEGRATION
// ============================================================================

export function DealerDashboardWithAPI({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useDealerDashboard(userId);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState error={error || new Error('No data')} onRetry={refetch} />;

  const { dealer, inventory, vehicles, commissions, categoryPerformance } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{dealer.companyName}</h1>
            <p className="text-gray-600 mt-1">Dealer Vehicle Management</p>
          </div>
          <button
            onClick={refetch}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Inventory Overview */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="Total Vehicles"
              value={inventory.totalVehicles}
              trend={`${inventory.soldThisMonth} sold this month`}
              variant="blue"
              icon="Truck"
            />
            <KPICard
              label="Active Auctions"
              value={inventory.activeAuctions}
              trend={`${dealer.conversionRate}% conversion`}
              variant="green"
              icon="Zap"
            />
            <KPICard
              label="Monthly Revenue"
              value={`₹${dealer.monthlyRevenue.toLocaleString()}`}
              trend="+22%"
              variant="purple"
              icon="TrendingUp"
            />
            <KPICard
              label="Pending Approval"
              value={inventory.pendingApproval}
              trend="Review required"
              variant="amber"
              icon="Clock"
            />
          </div>
        </section>

        {/* Vehicle Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                {vehicle.photos?.[0] && (
                  <img src={vehicle.photos[0]} alt={`${vehicle.year} ${vehicle.make}`} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <StatusBadge 
                      status={vehicle.status}
                      variant={vehicle.status === 'active' ? 'green' : 'gray'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                    <div>📍 {vehicle.location}</div>
                    <div>📊 {vehicle.bids} bids</div>
                    <div>⏱️ {vehicle.mileage.toLocaleString()} km</div>
                    <div>📈 {vehicle.category}</div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-3">₹{vehicle.price.toLocaleString()}</p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commission Tracking */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Commission Tracking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Commission</h3>
              <p className="text-3xl font-bold text-amber-600">₹{commissions.pending.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">{commissions.pendingCount} transactions pending</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Paid Commission</h3>
              <p className="text-3xl font-bold text-green-600">₹{commissions.paid.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">{commissions.paidCount} transactions completed</p>
            </div>
          </div>
        </section>

        {/* Category Performance */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Performance</h2>
          <DataTable
            columns={[
              { key: 'category', label: 'Category', width: '30%' },
              { key: 'views', label: 'Views', width: '20%' },
              { key: 'conversions', label: 'Conversions', width: '20%' },
              { key: 'revenue', label: 'Revenue', width: '30%' },
            ]}
            data={categoryPerformance.map(cat => ({
              ...cat,
              revenue: `₹${cat.revenue.toLocaleString()}`
            }))}
            sortable
          />
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD WITH API INTEGRATION
// ============================================================================

export function AdminDashboardWithAPI({ adminId }: { adminId: string }) {
  const { data, loading, error, refetch } = useAdminDashboard(adminId);

  if (loading) return <LoadingSpinner />;
  if (error || !data) return <ErrorState error={error || new Error('No data')} onRetry={refetch} />;

  const { alerts, systemHealth, businessMetrics, pendingApprovals, disputes } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform oversight and management</p>
          </div>
          <button
            onClick={refetch}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Critical Alerts */}
        {alerts.length > 0 && (
          <section className="bg-red-50 border-2 border-red-600 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-4">🚨 Critical Alerts ({alerts.length})</h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge 
                          status={alert.severity.toUpperCase()}
                          variant={alert.severity === 'critical' ? 'red' : 'amber'}
                        />
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 whitespace-nowrap text-sm font-medium">
                      {alert.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* System Health */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">API Status</p>
              <StatusBadge 
                status={systemHealth.apiStatus}
                variant={systemHealth.apiStatus === 'healthy' ? 'green' : 'red'}
              />
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Database</p>
              <StatusBadge 
                status={systemHealth.dbStatus}
                variant={systemHealth.dbStatus === 'healthy' ? 'green' : 'red'}
              />
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Payment Gateway</p>
              <StatusBadge 
                status={systemHealth.paymentStatus}
                variant={systemHealth.paymentStatus === 'healthy' ? 'green' : 'red'}
              />
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Storage</p>
              <StatusBadge 
                status={systemHealth.storageStatus}
                variant={systemHealth.storageStatus === 'healthy' ? 'green' : 'red'}
              />
            </div>
          </div>
        </section>

        {/* Business Metrics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              label="GMV Today"
              value={`₹${businessMetrics.gmvToday.toLocaleString()}`}
              trend="+5%"
              variant="green"
              icon="TrendingUp"
            />
            <KPICard
              label="Active Auctions"
              value={businessMetrics.activeAuctions}
              trend="Real-time"
              variant="blue"
              icon="Zap"
            />
            <KPICard
              label="Completed Today"
              value={businessMetrics.completedToday}
              trend="+12% vs yesterday"
              variant="purple"
              icon="CheckCircle"
            />
            <KPICard
              label="Total Users"
              value={businessMetrics.totalUsers}
              trend="+250 new this week"
              variant="amber"
              icon="Users"
            />
          </div>
        </section>

        {/* Pending Approvals */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Approvals ({pendingApprovals.length})</h2>
          <DataTable
            columns={[
              { key: 'type', label: 'Type', width: '20%' },
              { key: 'itemName', label: 'Item', width: '25%' },
              { key: 'submittedBy', label: 'Submitted By', width: '20%' },
              { key: 'submittedDate', label: 'Date', width: '20%' },
              { key: 'priority', label: 'Priority', width: '15%' },
            ]}
            data={pendingApprovals}
            sortable
          />
        </section>

        {/* Disputes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Disputes ({disputes.filter(d => d.status === 'open').length} open)</h2>
          <DataTable
            columns={[
              { key: 'buyerName', label: 'Buyer', width: '20%' },
              { key: 'sellerName', label: 'Seller', width: '20%' },
              { key: 'amount', label: 'Amount', width: '15%' },
              { key: 'status', label: 'Status', width: '15%' },
              { key: 'createdDate', label: 'Created', width: '30%' },
            ]}
            data={disputes}
            sortable
          />
        </section>
      </div>
    </div>
  );
}

/**
 * USAGE IN APP.TSX:
 * 
 * import { BuyerDashboardWithAPI, SellerDashboardWithAPI, etc. } from '@/pages';
 * 
 * <Route path="/dashboard/buyer" element={
 *   <FeatureGate flag="dashboard_buyer_v2" fallback={<OldDashboard />}>
 *     <BuyerDashboardWithAPI userId={user.id} />
 *   </FeatureGate>
 * } />
 */
