import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Users, Settings, Play, X, Calendar, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLiveSetup = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [auctionName, setAuctionName] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .not('id', 'in', '(select product_id from live_auctions where status = \'active\')');

      if (error) {
        toast.error('Error fetching products');
        console.error(error.message);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!selectedProduct || !startTime || !endTime || !auctionName) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('live_auctions')
        .insert([
          {
            auction_name: auctionName,
            product_id: selectedProduct,
            start_time: startTime,
            end_time: endTime,
            reserve_price: reservePrice ? parseFloat(reservePrice) : null,
            status: 'scheduled',
          },
        ]);

      if (error) throw error;

      toast.success('Live auction created successfully');
      navigate('/admin/live-setup');
    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error('Failed to create auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Video className="h-8 w-8 text-indigo-600" />
          Setup Live Auction
        </h1>
        <Link
          to="/admin/live-stream"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
        >
          <Settings className="h-5 w-5" />
          Stream Settings
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Auction Details */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Auction Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auction Name
                </label>
                <input
                  type="text"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Eg. Mumbai Premium Vehicle Live Auction"
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 2: Location & Product Selection */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Location & Product</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Narrow down by state, district, city and branch, then pick a product from the filtered list.
              These filters are purely for convenience and do not change product data.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                placeholder="State"
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                placeholder="District"
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="City"
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                placeholder="Branch / Yard"
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Filter by category"
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title / registration / brand"
                className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 md:col-span-2"
              />
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto border rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
              {products
                .filter((p) =>
                  stateFilter ? (p.state || '').toLowerCase().includes(stateFilter.toLowerCase()) : true
                )
                .filter((p) =>
                  districtFilter ? (p.district || '').toLowerCase().includes(districtFilter.toLowerCase()) : true
                )
                .filter((p) =>
                  cityFilter ? (p.city || '').toLowerCase().includes(cityFilter.toLowerCase()) : true
                )
                .filter((p) =>
                  branchFilter ? (p.branch || p.yard_id || '').toLowerCase().includes(branchFilter.toLowerCase()) : true
                )
                .filter((p) =>
                  categoryFilter ? (p.category || '').toLowerCase().includes(categoryFilter.toLowerCase()) : true
                )
                .filter((p) =>
                  searchTerm
                    ? `${p.title || ''} ${p.registration_number || ''} ${p.brand || ''}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    : true
                )
                .map((product) => {
                  const isActive = selectedProduct === product.id;
                  return (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`w-full text-left px-4 py-3 flex flex-col gap-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-900 transition-colors ${
                        isActive ? 'border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.title}
                        </div>
                        <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ₹{(product.current_price || product.base_price || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {product.category && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-full">
                            {product.category}
                          </span>
                        )}
                        {product.state && product.city && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-full">
                            {product.city}, {product.state}
                          </span>
                        )}
                        {product.branch && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-full">
                            {product.branch}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

              {products.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No eligible products available for live auction.
                </div>
              )}
            </div>

            {!selectedProduct && (
              <p className="mt-2 text-xs text-red-500">Please select a product for this auction.</p>
            )}
          </div>

          {/* Step 3: Schedule & Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Opening Bid (minimum amount required to enter the auction)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Opening bid amount"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reserve Price (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Minimum price to accept"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link
              to="/admin"
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Create Auction
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Live Auction Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-indigo-600 mt-1" />
              <p className="text-gray-600 dark:text-gray-300">
                Ensure your stream URL is from a supported platform (YouTube, Twitch)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-indigo-600 mt-1" />
              <p className="text-gray-600 dark:text-gray-300">
                Test your stream setup before the scheduled start time
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-indigo-600 mt-1" />
              <p className="text-gray-600 dark:text-gray-300">
                Configure stream settings for optimal quality and latency
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-indigo-600 mt-1" />
              <p className="text-gray-600 dark:text-gray-300">
                Schedule auctions during peak hours for maximum engagement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLiveSetup;