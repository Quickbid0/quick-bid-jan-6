import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Share2,
  Eye,
  Zap,
  Timer,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Fuel,
  Gauge,
  Settings,
  SlidersHorizontal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Mock auction data
const mockAuctions = [
  {
    id: '1',
    title: 'BMW X3 2020 Excellent Condition',
    make: 'BMW',
    model: 'X3',
    year: 2020,
    mileage: 45000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    location: 'Mumbai, Maharashtra',
    currentBid: 1850000,
    reservePrice: 1750000,
    startingBid: 1650000,
    bidCount: 23,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    type: 'timed',
    images: ['/api/placeholder/400/300'],
    dealer: {
      name: 'Elite Motors',
      verified: true,
      rating: 4.8,
      auctions: 127
    },
    trust: {
      inspected: true,
      warranty: true,
      riskGrade: 'A',
      inspectionScore: 85
    },
    loanAvailable: true,
    emiPreview: {
      monthly: 38750,
      tenure: 60
    }
  },
  {
    id: '2',
    title: 'Mercedes C-Class 2019 Premium Luxury',
    make: 'Mercedes',
    model: 'C-Class',
    year: 2019,
    mileage: 28000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    location: 'Delhi, NCR',
    currentBid: 2250000,
    reservePrice: 2100000,
    startingBid: 2000000,
    bidCount: 34,
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    type: 'timed',
    images: ['/api/placeholder/400/300'],
    dealer: {
      name: 'Premium Cars Delhi',
      verified: true,
      rating: 4.9,
      auctions: 89
    },
    trust: {
      inspected: true,
      warranty: false,
      riskGrade: 'A',
      inspectionScore: 92
    },
    loanAvailable: true,
    emiPreview: {
      monthly: 47000,
      tenure: 60
    }
  },
  {
    id: '3',
    title: 'Audi Q5 2021 SUV - Low Mileage',
    make: 'Audi',
    model: 'Q5',
    year: 2021,
    mileage: 15000,
    fuel: 'Petrol',
    transmission: 'Automatic',
    location: 'Bangalore, Karnataka',
    currentBid: 3200000,
    reservePrice: 3000000,
    startingBid: 2900000,
    bidCount: 18,
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    type: 'flash',
    images: ['/api/placeholder/400/300'],
    dealer: {
      name: 'Audi Bangalore',
      verified: true,
      rating: 4.7,
      auctions: 56
    },
    trust: {
      inspected: true,
      warranty: true,
      riskGrade: 'A',
      inspectionScore: 88
    },
    loanAvailable: true,
    emiPreview: {
      monthly: 66700,
      tenure: 60
    }
  },
  // Add more mock auctions...
];

interface FilterOptions {
  make: string[];
  priceRange: [number, number];
  yearRange: [number, number];
  mileageRange: [number, number];
  fuelType: string[];
  transmission: string[];
  location: string[];
  auctionType: string[];
  condition: string[];
  loanRequired: boolean;
}

const AuctionListingPage: React.FC = () => {
  const [auctions, setAuctions] = useState(mockAuctions);
  const [filteredAuctions, setFilteredAuctions] = useState(mockAuctions);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('endingSoon');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    make: [],
    priceRange: [0, 10000000],
    yearRange: [2015, 2024],
    mileageRange: [0, 200000],
    fuelType: [],
    transmission: [],
    location: [],
    auctionType: [],
    condition: [],
    loanRequired: false
  });

  // Filter and search logic
  useEffect(() => {
    let filtered = auctions.filter(auction => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = (
          auction.title.toLowerCase().includes(query) ||
          auction.make.toLowerCase().includes(query) ||
          auction.model.toLowerCase().includes(query) ||
          auction.location.toLowerCase().includes(query)
        );
        if (!matches) return false;
      }

      // Filters
      if (filters.make.length > 0 && !filters.make.includes(auction.make)) return false;
      if (auction.currentBid < filters.priceRange[0] || auction.currentBid > filters.priceRange[1]) return false;
      if (auction.year < filters.yearRange[0] || auction.year > filters.yearRange[1]) return false;
      if (auction.mileage < filters.mileageRange[0] || auction.mileage > filters.mileageRange[1]) return false;
      if (filters.fuelType.length > 0 && !filters.fuelType.includes(auction.fuel)) return false;
      if (filters.transmission.length > 0 && !filters.transmission.includes(auction.transmission)) return false;
      if (filters.location.length > 0 && !filters.location.some(loc => auction.location.includes(loc))) return false;
      if (filters.auctionType.length > 0 && !filters.auctionType.includes(auction.type)) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'endingSoon':
          return a.endTime.getTime() - b.endTime.getTime();
        case 'priceLow':
          return a.currentBid - b.currentBid;
        case 'priceHigh':
          return b.currentBid - a.currentBid;
        case 'newest':
          return b.endTime.getTime() - a.endTime.getTime();
        case 'mostBids':
          return b.bidCount - a.bidCount;
        default:
          return 0;
      }
    });

    setFilteredAuctions(filtered);
  }, [auctions, searchQuery, filters, sortBy]);

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  const getAuctionTypeBadge = (type: string) => {
    switch (type) {
      case 'timed':
        return { icon: Clock, text: 'Timed', color: 'bg-blue-100 text-blue-800' };
      case 'flash':
        return { icon: Zap, text: 'Flash', color: 'bg-orange-100 text-orange-800' };
      case 'live':
        return { icon: Timer, text: 'Live', color: 'bg-green-100 text-green-800' };
      default:
        return { icon: Clock, text: 'Timed', color: 'bg-blue-100 text-blue-800' };
    }
  };

  const AuctionCard = ({ auction }: { auction: typeof mockAuctions[0] }) => {
    const timeRemaining = formatTimeRemaining(auction.endTime);
    const auctionType = getAuctionTypeBadge(auction.type);

    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Image */}
        <div className="relative">
          <img
            src={auction.images[0]}
            alt={auction.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${auctionType.color}`}>
              <auctionType.icon className="h-3 w-3 inline mr-1" />
              {auctionType.text}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Time remaining badge */}
          <div className="absolute bottom-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="h-3 w-3 inline mr-1" />
            {timeRemaining}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title and dealer */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
              {auction.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{auction.dealer.name}</span>
              {auction.dealer.verified && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span>★ {auction.dealer.rating}</span>
              <span>({auction.dealer.auctions} auctions)</span>
            </div>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="text-center">
              <Gauge className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <div className="font-medium">{auction.mileage.toLocaleString()} km</div>
            </div>
            <div className="text-center">
              <Fuel className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <div className="font-medium">{auction.fuel}</div>
            </div>
            <div className="text-center">
              <Settings className="h-4 w-4 mx-auto mb-1 text-gray-400" />
              <div className="font-medium">{auction.transmission}</div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-2 mb-4">
            {auction.trust.inspected && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                ✓ Inspected
              </span>
            )}
            {auction.trust.warranty && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                ✓ Warranty
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              auction.trust.riskGrade === 'A' ? 'bg-green-100 text-green-800' :
              auction.trust.riskGrade === 'B' ? 'bg-blue-100 text-blue-800' :
              auction.trust.riskGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Risk Grade {auction.trust.riskGrade}
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{auction.currentBid.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">
                ({auction.bidCount} bids)
              </span>
            </div>
            {auction.loanAvailable && (
              <div className="text-sm text-gray-600">
                EMI: ₹{auction.emiPreview.monthly.toLocaleString()}/month
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <MapPin className="h-4 w-4" />
            <span>{auction.location}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Place Bid
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Auctions</h1>
              <p className="text-gray-600 mt-1">Find your perfect vehicle at the best price</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{filteredAuctions.length}</p>
                <p className="text-sm text-gray-600">Active Auctions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make, model, location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort */}
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="endingSoon">Ending Soon</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="mostBids">Most Bids</option>
            </select>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300">
              <button
                className={`px-4 py-3 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`px-4 py-3 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Active Filters */}
          {(filters.make.length > 0 || searchQuery) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.make.map(make => (
                <span key={make} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                  {make}
                  <button className="ml-2 text-gray-600 hover:text-gray-800">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Make */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <div className="space-y-2">
                  {['BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda'].map(make => (
                    <label key={make} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.make.includes(make)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, make: [...prev.make, make] }));
                          } else {
                            setFilters(prev => ({ ...prev, make: prev.make.filter(m => m !== make) }));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm">{make}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    className="w-full"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }))}
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹0</span>
                    <span>₹{(filters.priceRange[1] / 100000).toFixed(0)}L</span>
                  </div>
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <div className="space-y-2">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(fuel => (
                    <label key={fuel} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.fuelType.includes(fuel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, fuelType: [...prev.fuelType, fuel] }));
                          } else {
                            setFilters(prev => ({ ...prev, fuelType: prev.fuelType.filter(f => f !== fuel) }));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm">{fuel}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Auction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auction Type</label>
                <div className="space-y-2">
                  {[
                    { value: 'timed', label: 'Timed Auction' },
                    { value: 'flash', label: 'Flash Auction' },
                    { value: 'live', label: 'Live Auction' }
                  ].map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filters.auctionType.includes(type.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, auctionType: [...prev.auctionType, type.value] }));
                          } else {
                            setFilters(prev => ({ ...prev, auctionType: prev.auctionType.filter(t => t !== type.value) }));
                          }
                        }}
                      />
                      <span className="ml-2 text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Auction Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredAuctions.map(auction => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredAuctions.length >= 12 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Button variant="outline" size="lg">
            Load More Auctions
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuctionListingPage;
