// Modern Product Catalog Page
import React, { useState, useEffect } from 'react';
import { BetaUserService } from '../services/betaUserService';
import { EnvironmentBadge } from '../components/EnvironmentBadge';
import { BetaUserIndicator } from '../components/BetaUserIndicator';
import { BetaVersionBanner } from '../components/BetaVersionBanner';

interface Product {
  id: string;
  title: string;
  currentBid: number;
  startingPrice: number;
  timeLeft: string;
  imageUrl: string;
  category: string;
  seller: string;
  isRealProduct: boolean;
  bids: number;
  description: string;
}

interface FilterOptions {
  category: string;
  priceRange: string;
  sortBy: string;
  showRealOnly: boolean;
}

export const ModernProductCatalog: React.FC = () => {
  const [userRole, setUserRole] = useState<'guest' | 'beta_buyer' | 'beta_seller' | 'admin'>('guest');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    priceRange: 'all',
    sortBy: 'trending',
    showRealOnly: false
  });

  const categories = ['all', 'Electronics', 'Fashion', 'Home & Garden', 'Art', 'Vehicles', 'Jewelry'];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-1000', label: 'Under ₹1,000' },
    { value: '1000-5000', label: '₹1,000 - ₹5,000' },
    { value: '5000-20000', label: '₹5,000 - ₹20,000' },
    { value: '20000+', label: 'Over ₹20,000' }
  ];

  useEffect(() => {
    const loadCatalogData = async () => {
      try {
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        const role = await BetaUserService.getUserRole(userId);
        setUserRole(role);

        // Mock product data
        const mockProducts: Product[] = [
          {
            id: '1',
            title: 'Premium Wireless Headphones',
            currentBid: 3500,
            startingPrice: 2000,
            timeLeft: '2h 15m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Electronics',
            seller: 'Tech Store',
            isRealProduct: true,
            bids: 12,
            description: 'High-quality wireless headphones with noise cancellation'
          },
          {
            id: '2',
            title: 'Designer Handbag',
            currentBid: 8500,
            startingPrice: 5000,
            timeLeft: '5h 30m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Fashion',
            seller: 'Luxury Fashion',
            isRealProduct: true,
            bids: 8,
            description: 'Authentic designer handbag in excellent condition'
          },
          {
            id: '3',
            title: 'Smart Watch Pro',
            currentBid: 12000,
            startingPrice: 8000,
            timeLeft: '1d 3h',
            imageUrl: '/api/placeholder/300/200',
            category: 'Electronics',
            seller: 'Gadget World',
            isRealProduct: false,
            bids: 15,
            description: 'Latest smartwatch with health tracking features'
          },
          {
            id: '4',
            title: 'Vintage Camera',
            currentBid: 6500,
            startingPrice: 4000,
            timeLeft: '3h 45m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Art',
            seller: 'Vintage Collectibles',
            isRealProduct: true,
            bids: 6,
            description: 'Classic vintage camera in working condition'
          },
          {
            id: '5',
            title: 'Modern Sofa Set',
            currentBid: 25000,
            startingPrice: 15000,
            timeLeft: '2d 6h',
            imageUrl: '/api/placeholder/300/200',
            category: 'Home & Garden',
            seller: 'Furniture Hub',
            isRealProduct: false,
            bids: 4,
            description: 'Comfortable 3-seater sofa set with cushions'
          },
          {
            id: '6',
            title: 'Gold Necklace',
            currentBid: 45000,
            startingPrice: 35000,
            timeLeft: '4h 20m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Jewelry',
            seller: 'Jewelry Store',
            isRealProduct: true,
            bids: 10,
            description: '22k gold necklace with intricate design'
          }
        ];

        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (err) {
        console.error('Error loading catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCatalogData();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Apply price filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
      filtered = filtered.filter(p => {
        if (max) {
          return p.currentBid >= parseInt(min) && p.currentBid <= parseInt(max);
        } else {
          return p.currentBid >= parseInt(min);
        }
      });
    }

    // Apply real products filter
    if (filters.showRealOnly) {
      filtered = filtered.filter(p => p.isRealProduct);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'trending':
        filtered.sort((a, b) => b.bids - a.bids);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.currentBid - b.currentBid);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.currentBid - a.currentBid);
        break;
      case 'ending_soon':
        filtered.sort((a, b) => a.timeLeft.localeCompare(b.timeLeft));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isRealProduct && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Live Product
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-700">{product.timeLeft} left</span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">{product.title}</h3>
            <p className="text-sm text-gray-500">{product.category} • {product.seller}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{product.currentBid.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{product.bids} bids • Started at ₹{product.startingPrice.toLocaleString()}</p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium">
            {userRole === 'guest' ? 'View' : 'Bid Now'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Beta Version Banner */}
      <BetaVersionBanner />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickMela
              </h1>
              <div className="hidden md:flex space-x-6">
                <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="#" className="text-blue-600 font-medium">Browse</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">How it Works</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BetaUserIndicator userAccessLevel={userRole} />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Amazing Items
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover unique treasures and incredible deals from verified sellers across India
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="trending">Trending</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="ending_soon">Ending Soon</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showRealOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, showRealOnly: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Live Products Only</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredProducts.length}</span> items
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or browse all categories</p>
            <button 
              onClick={() => setFilters({ category: 'all', priceRange: 'all', sortBy: 'trending', showRealOnly: false })}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Load More */}
      {filteredProducts.length > 0 && (
        <div className="text-center pb-12">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors">
            Load More Items
          </button>
        </div>
      )}
    </div>
  );
};
