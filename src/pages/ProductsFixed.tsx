import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Heart, 
  Eye, 
  Gavel, 
  Clock, 
  MapPin, 
  Star,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  X
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  current_price: number;
  starting_bid: number;
  bid_count: number;
  end_date: string;
  category: string;
  status: string;
  location?: string;
  seller_name?: string;
  seller_rating?: number;
}

export default function ProductsFixed() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'ending_soon',
    location: ''
  });

  // Sample product data
  const sampleProducts: Product[] = [
    {
      id: '1',
      title: 'iPhone 14 Pro Max - Excellent Condition',
      description: 'Like new iPhone 14 Pro Max, 256GB, Deep Purple. Includes original box, charger, and warranty.',
      image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
      current_price: 65000,
      starting_bid: 45000,
      bid_count: 23,
      end_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      status: 'active',
      location: 'Mumbai',
      seller_name: 'TechStore',
      seller_rating: 4.8
    },
    {
      id: '2',
      title: 'MacBook Pro 16" - M1 Max',
      description: 'Powerful MacBook Pro with M1 Max chip, 32GB RAM, 1TB SSD. Perfect for creative professionals.',
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
      current_price: 120000,
      starting_bid: 95000,
      bid_count: 18,
      end_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      status: 'active',
      location: 'Delhi',
      seller_name: 'AppleHub',
      seller_rating: 4.9
    },
    {
      id: '3',
      title: 'Vintage Rolex Submariner',
      description: 'Classic Rolex Submariner from 1970s, excellent condition, fully serviced. Collector\'s item.',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      current_price: 850000,
      starting_bid: 750000,
      bid_count: 45,
      end_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      category: 'Watches',
      status: 'active',
      location: 'Bangalore',
      seller_name: 'LuxuryTime',
      seller_rating: 4.7
    },
    {
      id: '4',
      title: 'Tesla Model 3 Long Range',
      description: '2022 Tesla Model 3 Long Range, 15,000 km, Autopilot, premium interior. Like new condition.',
      image_url: 'https://images.unsplash.com/photo-1617654112368-307921291f42?auto=format&fit=crop&w=600&q=80',
      current_price: 2800000,
      starting_bid: 2500000,
      bid_count: 67,
      end_date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      category: 'Vehicles',
      status: 'active',
      location: 'Pune',
      seller_name: 'AutoWorld',
      seller_rating: 4.6
    },
    {
      id: '5',
      title: 'Sony A7R IV Camera Body',
      description: 'Professional mirrorless camera, 61MP, excellent condition. Perfect for photography enthusiasts.',
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
      current_price: 185000,
      starting_bid: 150000,
      bid_count: 12,
      end_date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      status: 'active',
      location: 'Chennai',
      seller_name: 'PhotoPro',
      seller_rating: 4.8
    },
    {
      id: '6',
      title: 'Diamond Ring 2 Carat',
      description: 'Stunning 2 carat diamond ring, 18k white gold, certified. Perfect for special occasions.',
      image_url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac84?auto=format&fit=crop&w=600&q=80',
      current_price: 450000,
      starting_bid: 350000,
      bid_count: 34,
      end_date: new Date(Date.now() + 0.5 * 60 * 60 * 1000).toISOString(),
      category: 'Jewelry',
      status: 'active',
      location: 'Mumbai',
      seller_name: 'JewelBox',
      seller_rating: 4.9
    },
    {
      id: '7',
      title: 'Gaming PC - RTX 4090',
      description: 'High-end gaming PC with RTX 4090, Intel i9-13900K, 32GB DDR5, 2TB NVMe. Ready to ship.',
      image_url: 'https://images.unsplash.com/photo-1587202372748-b99e150069c2?auto=format&fit=crop&w=600&q=80',
      current_price: 95000,
      starting_bid: 75000,
      bid_count: 8,
      end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      category: 'Electronics',
      status: 'active',
      location: 'Hyderabad',
      seller_name: 'GameZone',
      seller_rating: 4.7
    },
    {
      id: '8',
      title: 'Designer Handbag Collection',
      description: 'Collection of 3 authentic designer handbags including Louis Vuitton, Gucci, and Chanel.',
      image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
      current_price: 75000,
      starting_bid: 50000,
      bid_count: 15,
      end_date: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      category: 'Fashion',
      status: 'active',
      location: 'Delhi',
      seller_name: 'FashionHub',
      seller_rating: 4.8
    }
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setLoadError(null);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoadError('Failed to load products. Please try again later.');
      toast.error('Failed to load products.');
      // Fallback to sample data
      setProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array means this effect runs once on mount

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(product => product.location === filters.location);
    }

    // Sort
    switch (filters.sortBy) {
      case 'ending_soon':
        filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      case 'price_low':
        filtered.sort((a, b) => a.current_price - b.current_price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.current_price - a.current_price);
        break;
      case 'most_bids':
        filtered.sort((a, b) => b.bid_count - a.bid_count);
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, products]);

  const totalPages = useMemo(() => Math.ceil(filteredProducts.length / itemsPerPage), [filteredProducts.length, itemsPerPage]);
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);
  const currentProducts = useMemo(() => filteredProducts.slice(startIndex, endIndex), [filteredProducts, startIndex, endIndex]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff < 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const categories = [...new Set(products.map(p => p.category))];
  const locations = [...new Set(products.map(p => p.location).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 mb-4">{loadError}</div>
        <button
          onClick={fetchProducts}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Auctions</h1>
            <p className="text-gray-600">Discover and bid on amazing products</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {Object.values(filters).some(v => v) && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setFilters({ category: '', priceRange: '', sortBy: 'ending_soon', location: '' })}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ending_soon">Ending Soon</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="most_bids">Most Bids</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Showing <span className="font-medium">{filteredProducts.length}</span> products
        </p>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      {/* Products Grid/List */}
      {currentProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" :
            "space-y-4"
          }>
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'aspect-square bg-gray-100'}>
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {product.category}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">{product.title}</h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to watchlist logic
                        toast.success('Added to watchlist');
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{product.location}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{product.seller_rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Current Bid</p>
                      <p className="text-lg font-bold text-gray-900">{formatPrice(product.current_price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Ends in</p>
                      <p className="text-sm font-medium text-orange-600">{formatTimeLeft(product.end_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Gavel className="w-4 h-4" />
                      <span>{product.bid_count} bids</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
