import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useUnifiedAuth } from '../context/UnifiedAuthContext';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Video,
  Timer,
  Save,
  ArrowLeft,
  Package,
  Users,
  Shield,
  AlertCircle
} from 'lucide-react';

interface AuctionFormData {
  title: string;
  description: string;
  productId: string;
  type: 'live' | 'timed' | 'tender';
  startPrice: number;
  endTime: string;
  duration: number; // in hours for timed auctions
  requiresTokenDeposit: boolean;
  minimumBidders: number;
  buyNowPrice: number;
  reservePrice: number;
}

const AuctionCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState<AuctionFormData>({
    title: '',
    description: '',
    productId: '',
    type: 'timed',
    startPrice: 1000,
    endTime: '',
    duration: 24,
    requiresTokenDeposit: false,
    minimumBidders: 0,
    buyNowPrice: 0,
    reservePrice: 0
  });

  const auctionTypes = [
    {
      value: 'timed',
      label: 'Timed Auction',
      description: 'Standard auction with fixed time duration',
      icon: Timer,
      features: ['Anti-sniping', 'Auto-extension', 'Standard bidding']
    },
    {
      value: 'live',
      label: 'Live Auction',
      description: 'Interactive live streaming auction',
      icon: Video,
      features: ['Live streaming', 'Real-time chat', 'Token deposit required']
    },
    {
      value: 'tender',
      label: 'Tender Auction',
      description: 'Business-to-business competitive bidding',
      icon: FileText,
      features: ['Business only', 'Qualification required', 'Lower bid wins']
    }
  ];

  useEffect(() => {
    if (user?.role !== 'seller') {
      toast.error('Only sellers can create auctions');
      navigate('/dashboard');
      return;
    }

    fetchSellerProducts();
  }, [user]);

  const fetchSellerProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/my-products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load your products');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error('Please select a product');
      return;
    }

    if (formData.startPrice <= 0) {
      toast.error('Starting price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const auctionData = {
        title: formData.title,
        productId: formData.productId,
        sellerId: user?.id,
        startPrice: formData.startPrice,
        endTime: formData.type === 'timed'
          ? new Date(Date.now() + formData.duration * 60 * 60 * 1000).toISOString()
          : new Date(formData.endTime).toISOString(),
        status: 'draft',
        type: formData.type,
        requiresTokenDeposit: formData.requiresTokenDeposit,
        minimumBidders: formData.minimumBidders,
        buyNowPrice: formData.buyNowPrice || null,
        reservePrice: formData.reservePrice || null
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auctions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(auctionData)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Auction created successfully!');
        navigate(`/auction-preview`);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create auction');
      }
    } catch (error: any) {
      console.error('Auction creation error:', error);
      toast.error(error.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof AuctionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-set title if product is selected
    if (field === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct && !formData.title) {
        setFormData(prev => ({ ...prev, title: selectedProduct.title }));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/seller/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Auction
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up an auction for your product and reach more buyers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Auction Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Choose Auction Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {auctionTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateFormData('type', type.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.type === type.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-6 w-6 text-indigo-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {type.description}
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {type.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Product
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose from your products
              </label>
              <select
                value={formData.productId}
                onChange={(e) => updateFormData('productId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                required
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} - ₹{product.starting_price?.toLocaleString()}
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  No products found. Please add a product first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Auction Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Auction Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auction Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                placeholder="Enter auction title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Starting Price (₹)
              </label>
              <input
                type="number"
                value={formData.startPrice}
                onChange={(e) => updateFormData('startPrice', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                min="1"
                required
              />
            </div>

            {formData.type === 'timed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (hours)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                >
                  <option value="1">1 hour</option>
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                  <option value="168">7 days</option>
                </select>
              </div>
            )}

            {(formData.type === 'live' || formData.type === 'tender') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => updateFormData('endTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buy Now Price (₹) <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                value={formData.buyNowPrice}
                onChange={(e) => updateFormData('buyNowPrice', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                min="0"
                placeholder="Leave empty for no buy now option"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reserve Price (₹) <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                value={formData.reservePrice}
                onChange={(e) => updateFormData('reservePrice', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                min="0"
                placeholder="Minimum price to sell"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
              rows={4}
              placeholder="Describe your auction..."
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Advanced Settings
          </h2>
          <div className="space-y-4">
            {formData.type === 'live' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="tokenDeposit"
                  checked={formData.requiresTokenDeposit}
                  onChange={(e) => updateFormData('requiresTokenDeposit', e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="tokenDeposit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Require token deposit for bidders (₹5,000)
                </label>
              </div>
            )}

            {formData.type === 'tender' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Bidders Required
                </label>
                <input
                  type="number"
                  value={formData.minimumBidders}
                  onChange={(e) => updateFormData('minimumBidders', Number(e.target.value))}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                  min="0"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of bidders required before auction can proceed
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/seller/dashboard')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.productId}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Auction...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Create Auction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuctionCreatePage;
