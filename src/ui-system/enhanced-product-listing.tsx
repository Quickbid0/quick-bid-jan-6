// Enhanced Product Listing - Gaming Excitement + Fintech Trust + SaaS Intelligence
// AI-driven product listing with premium layout, conversion optimization, and smart suggestions

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Camera,
  Upload,
  Edit,
  Trash2,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Zap,
  Star,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  MapPin,
  Tag,
  BarChart3,
  Target,
  Sparkles,
  Crown,
  Trophy,
  Award,
  Lightbulb,
  RefreshCw,
  Settings,
  ChevronRight,
  ChevronDown,
  X,
  Info
} from 'lucide-react';

// Import enhanced design system
import { Card, Button, Container, Grid, Flex, Stack } from '../ui-system';
import { colors, getGradient, getEmotionColor } from '../ui-system/colors';
import { textStyles, getTextStyle } from '../ui-system/typography';
import { StatusBadge, TrustScore, ProgressIndicator } from '../ui-system/simplified-status';
import { OptimizedImage, LoadingSpinner } from '../ui-system/performance-mobile-trust';

// AI-Powered Suggestions Component
interface AISuggestionProps {
  type: 'pricing' | 'title' | 'description' | 'category' | 'timing';
  suggestion: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  icon: React.ComponentType<any>;
  onApply: () => void;
}

const AISuggestion: React.FC<AISuggestionProps> = ({
  type,
  suggestion,
  confidence,
  impact,
  icon: Icon,
  onApply
}) => {
  const impactColors = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div
}
}
}
      className={`p-4 rounded-lg border ${impactColors[impact]} relative overflow-hidden`}
    >
      {/* AI Badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-purple-600">
        <Sparkles className="w-3 h-3" />
        AI
      </div>

      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/50 rounded-lg">
          <Icon className={`w-5 h-5 ${impact === 'high' ? 'text-emerald-600' : impact === 'medium' ? 'text-blue-600' : 'text-gray-600'}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 capitalize">{type} Suggestion</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${impactColors[impact]}`}>
              {confidence}% confidence
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{suggestion}</p>

          <Button size="sm" onClick={onApply} className="bg-white/50 hover:bg-white/70">
            Apply Suggestion
          </Button>
        </div>
      </div>
    </div>
  );
};

// Smart Pricing Optimizer Component
interface PricingOptimizerProps {
  currentPrice: number;
  suggestedPrice: number;
  marketData: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    competingItems: number;
  };
  onPriceChange: (price: number) => void;
}

const PricingOptimizer: React.FC<PricingOptimizerProps> = ({
  currentPrice,
  suggestedPrice,
  marketData,
  onPriceChange
}) => {
  const priceDifference = ((suggestedPrice - currentPrice) / currentPrice) * 100;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-900">Smart Pricing</h3>
          <p className="text-sm text-blue-700">AI-optimized for maximum bids</p>
        </div>
        <div className="flex items-center gap-1 text-purple-600">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium">AI Optimized</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Your Price</label>
          <div className="text-2xl font-bold text-blue-600">₹{(currentPrice / 100000).toFixed(1)}L</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">AI Suggestion</label>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-emerald-600">₹{(suggestedPrice / 100000).toFixed(1)}L</div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              priceDifference > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Market Range:</span>
          <span className="font-medium text-blue-900">
            ₹{(marketData.minPrice / 100000).toFixed(1)}L - ₹{(marketData.maxPrice / 100000).toFixed(1)}L
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Average Price:</span>
          <span className="font-medium text-blue-900">₹{(marketData.avgPrice / 100000).toFixed(1)}L</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-blue-700">Competing Items:</span>
          <span className="font-medium text-blue-900">{marketData.competingItems}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onPriceChange(suggestedPrice)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Apply AI Price
        </Button>
        <Button variant="outline" className="px-6">
          Customize
        </Button>
      </div>
    </Card>
  );
};

// Performance Analytics Component
interface PerformanceAnalyticsProps {
  listing: {
    views: number;
    bids: number;
    favorites: number;
    timeLeft: number;
    currentPrice: number;
    startingPrice: number;
  };
}

const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ listing }) => {
  const performanceScore = Math.min(100, Math.round(
    (listing.views / 100) * 30 +
    (listing.bids / 10) * 40 +
    (listing.favorites / 5) * 20 +
    ((listing.currentPrice / listing.startingPrice - 1) * 100) * 10
  ));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Live Performance</h3>
        <div className="flex items-center gap-2">
          <div className={`text-lg font-bold ${
            performanceScore >= 80 ? 'text-emerald-600' :
            performanceScore >= 60 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {performanceScore}%
          </div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <Grid cols={2} gap="md" className="mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{listing.views}</div>
          <div className="text-sm text-blue-700">Views</div>
        </div>

        <div className="text-center p-4 bg-emerald-50 rounded-lg">
          <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-emerald-900">{listing.bids}</div>
          <div className="text-sm text-emerald-700">Bids</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-900">{listing.favorites}</div>
          <div className="text-sm text-purple-700">Favorites</div>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-900">
            {((listing.currentPrice / listing.startingPrice - 1) * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-orange-700">Above Start</div>
        </div>
      </Grid>

      <div className="space-y-3">
        <div className="flex justify-between text-sm mb-2">
          <span>Performance Score</span>
          <span className="font-medium">{performanceScore}/100</span>
        </div>
        <ProgressIndicator current={performanceScore} total={100} showPercentage />
      </div>
    </Card>
  );
};

// Enhanced Product Listing Component
export const EnhancedProductListing: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [listingData, setListingData] = useState({
    title: '',
    description: '',
    category: '',
    startingPrice: 0,
    reservePrice: 0,
    buyNowPrice: 0,
    images: [] as File[],
    location: '',
    condition: 'excellent' as 'excellent' | 'good' | 'fair' | 'poor',
    auctionDuration: 7, // days
    shipping: 'pickup' as 'pickup' | 'shipping' | 'both'
  });

  const [aiSuggestions, setAiSuggestions] = useState<AISuggestionProps[]>([
    {
      type: 'pricing',
      suggestion: 'Based on similar BMW X5 listings, increase starting price by 15% to attract serious bidders.',
      confidence: 92,
      impact: 'high',
      icon: DollarSign,
      onApply: () => setListingData(prev => ({ ...prev, startingPrice: prev.startingPrice * 1.15 }))
    },
    {
      type: 'title',
      suggestion: 'Add "Premium Luxury SUV" and mileage to make your listing more attractive.',
      confidence: 87,
      impact: 'medium',
      icon: Edit,
      onApply: () => setListingData(prev => ({ ...prev, title: prev.title + ' - Premium Luxury SUV' }))
    },
    {
      type: 'description',
      suggestion: 'Include service history, accident-free status, and warranty information to build trust.',
      confidence: 95,
      impact: 'high',
      icon: FileText,
      onApply: () => setListingData(prev => ({ ...prev, description: prev.description + ' Service history available. Accident-free. Under warranty.' }))
    }
  ]);

  const [performanceData] = useState({
    views: 247,
    bids: 12,
    favorites: 8,
    timeLeft: 345600, // seconds
    currentPrice: 875000,
    startingPrice: 750000
  });

  const tabs = [
    { id: 'create', label: 'Create Listing', icon: Plus },
    { id: 'manage', label: 'Manage Listings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb }
  ];

  const handleNext = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep(prev => Math.min(prev + 1, 4));
    setIsLoading(false);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageUpload = (files: FileList) => {
    const newImages = Array.from(files);
    setListingData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10) // Max 10 images
    }));
  };

  const renderCreateTab = () => (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
}
            >
              {step}
            </div>
            {step < 4 && (
              <div className={`w-12 h-1 mx-2 rounded ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <Fragment mode="wait">
        {currentStep === 1 && (
          <div
            key="step1"
}
}
}
}
            className="space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
                  <input
                    type="text"
                    value={listingData.title}
                    onChange={(e) => setListingData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., BMW X5 2020 Luxury SUV"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={listingData.category}
                    onChange={(e) => setListingData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    <option value="cars">Cars & Vehicles</option>
                    <option value="motorcycles">Motorcycles</option>
                    <option value="machinery">Industrial Machinery</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="art">Art & Collectibles</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Starting Price</label>
                    <input
                      type="number"
                      value={listingData.startingPrice / 100000}
                      onChange={(e) => setListingData(prev => ({ ...prev, startingPrice: Number(e.target.value) * 100000 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="7.5"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">in Lakhs</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reserve Price (Optional)</label>
                    <input
                      type="number"
                      value={listingData.reservePrice / 100000}
                      onChange={(e) => setListingData(prev => ({ ...prev, reservePrice: Number(e.target.value) * 100000 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="9.0"
                    />
                    <span className="text-xs text-gray-500 mt-1 block">in Lakhs</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Suggestions for Step 1 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Suggestions
              </h4>
              {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                <AISuggestion key={index} {...suggestion} />
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div
            key="step2"
}
}
}
}
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Photos & Details</h3>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos (up to 10)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <div className="text-lg font-medium text-gray-900 mb-2">Add Photos</div>
                    <p className="text-gray-600 mb-4">Upload high-quality photos to attract more bidders</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button as="span">Choose Files</Button>
                    </label>
                  </div>

                  {listingData.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-4 mt-4">
                      {listingData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setListingData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={listingData.description}
                    onChange={(e) => setListingData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Describe your item in detail..."
                  />
                </div>

                {/* Condition & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                    <select
                      value={listingData.condition}
                      onChange={(e) => setListingData(prev => ({ ...prev, condition: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={listingData.location}
                      onChange={(e) => setListingData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <div
            key="step3"
}
}
}
}
          >
            <PricingOptimizer
              currentPrice={listingData.startingPrice}
              suggestedPrice={900000}
              marketData={{
                minPrice: 650000,
                maxPrice: 1200000,
                avgPrice: 850000,
                competingItems: 23
              }}
              onPriceChange={(price) => setListingData(prev => ({ ...prev, startingPrice: price }))}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div
            key="step4"
}
}
}
}
            className="space-y-6"
          >
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Review & Publish</h3>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{listingData.title || 'Untitled Listing'}</h4>
                  <p className="text-gray-600 text-sm mb-4">{listingData.description || 'No description provided'}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Starting: ₹{(listingData.startingPrice / 100000).toFixed(1)}L</span>
                    <span>Duration: {listingData.auctionDuration} days</span>
                    <span>Photos: {listingData.images.length}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-medium text-emerald-900">Ready to Publish!</div>
                    <div className="text-sm text-emerald-700">Your listing meets all requirements</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Fragment>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          onClick={handleBack}
          disabled={currentStep === 1}
          variant="outline"
        >
          Back
        </Button>

        <Button
          onClick={handleNext}
          loading={isLoading}
          disabled={currentStep === 4}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {currentStep === 4 ? 'Publish Listing' : 'Continue'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderManageTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Listings</h3>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </Button>
        </div>

        <div className="space-y-4">
          {[
            {
              id: 1,
              title: 'BMW X5 2020',
              status: 'active',
              currentBid: 875000,
              bids: 12,
              timeLeft: '2h 30m',
              views: 247
            },
            {
              id: 2,
              title: 'Honda City 2019',
              status: 'ended',
              finalPrice: 650000,
              bids: 8,
              winner: 'Alex Chen',
              views: 189
            }
          ].map((listing) => (
            <div key={listing.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <OptimizedImage
                  src="/api/placeholder/80/60"
                  alt={listing.title}
                  className="w-20 h-12 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{listing.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{listing.views} views</span>
                    <span>{listing.bids} bids</span>
                    {'timeLeft' in listing && <span>{listing.timeLeft} left</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  {'currentBid' in listing && (
                    <div className="font-semibold text-emerald-600">
                      ₹{(listing.currentBid / 100000).toFixed(1)}L
                    </div>
                  )}
                  {'finalPrice' in listing && (
                    <div className="font-semibold text-blue-600">
                      ₹{(listing.finalPrice / 100000).toFixed(1)}L
                    </div>
                  )}
                  <StatusBadge status={listing.status} />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <PerformanceAnalytics listing={performanceData} />
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
        </div>

        <div className="space-y-4">
          {aiSuggestions.map((suggestion, index) => (
            <AISuggestion key={index} {...suggestion} />
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <Container className="py-8">
      {/* Header */}
      <div
}
}
}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              🚀 Product Listings
            </h1>
            <p className="text-gray-600">
              Create, manage, and optimize your auction listings with AI assistance
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
}
}
}
        className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-lg w-fit"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <Fragment mode="wait">
        {activeTab === 'create' && (
          <div
            key="create"
}
}
}
}
          >
            {renderCreateTab()}
          </div>
        )}

        {activeTab === 'manage' && (
          <div
            key="manage"
}
}
}
}
          >
            {renderManageTab()}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div
            key="analytics"
}
}
}
}
          >
            {renderAnalyticsTab()}
          </div>
        )}

        {activeTab === 'insights' && (
          <div
            key="insights"
}
}
}
}
          >
            {renderInsightsTab()}
          </div>
        )}
      </Fragment>
    </Container>
  );
};

export default EnhancedProductListing;
