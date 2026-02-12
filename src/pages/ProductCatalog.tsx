import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Heart, 
  Eye, 
  Clock,
  MapPin,
  Tag,
  TrendingUp,
  Zap,
  Shield,
  Award,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowRight,
  Package,
  DollarSign,
  Users,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuctionCard } from '@/components/AuctionCard';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  starting_price: number;
  category: string;
  make?: string;
  location: string;
  end_date: string;
  auction_status?: 'live' | 'upcoming' | 'sold' | 'expired';
  seller: {
    name: string;
    type: 'individual' | 'company' | 'third_party';
    verified: boolean;
    rating: number;
    avatar_url: string;
  };
  bid_count: number;
  watchers: number;
  views: number;
  is_trending: boolean;
  is_certified?: boolean;
  is_premium?: boolean;
  condition: string;
  auction_type: 'live' | 'timed' | 'tender';
  images?: string[];
  created_at: string;
}

interface Filters {
  category: string;
  brand: string;
  fuelType: string;
  bodyType: string;
  location: string;
  minYear: string;
  maxYear: string;
  condition: string;
  auctionStatus: string;
  auctionType: string;
  sortBy: string;
  showTrending: boolean;
  showPremium: boolean;
  showFeatured: boolean;
  verifiedOnly: boolean;
}

const ProductCatalog = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [endingSoonProducts, setEndingSoonProducts] = useState<Product[]>([]);
  const [newListings, setNewListings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [page, setPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<Filters>({
    category: searchParams.get('category') || '',
    brand: '',
    fuelType: '',
    bodyType: '',
    location: '',
    minYear: '',
    maxYear: '',
    condition: '',
    auctionStatus: '',
    auctionType: '',
    sortBy: 'created_at',
    showTrending: false,
    showPremium: false,
    showFeatured: false,
    verifiedOnly: false
  });

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (searchTerm) params.set('search', searchTerm);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      navigate(newUrl, { replace: true });
    }
  }, [filters, searchTerm, priceRange, navigate]);

  useEffect(() => {
    document.title = 'Product Catalog - QuickMela Auction Platform';
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const productsData = data || [];
      setProducts(productsData);
      
      // Set discovery collections
      setTrendingProducts(productsData.filter(p => p.is_trending).slice(0, 8));
      setEndingSoonProducts(productsData
        .filter(p => p.auction_status === 'live')
        .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
        .slice(0, 8));
      setNewListings(productsData.slice(0, 8));
      
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.current_price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Auction type filter
    if (filters.auctionType) {
      filtered = filtered.filter(product => product.auction_type === filters.auctionType);
    }

    // Verified seller filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(product => product.seller.verified);
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
      case 'most_viewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'most_bids':
        filtered.sort((a, b) => b.bid_count - a.bid_count);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const getCardVariant = (item: Product): 'live' | 'timed' | 'tender' | 'catalog' => {
    if (item.auction_status === 'live') return 'live';
    if (item.auction_status === 'sold' || item.auction_status === 'expired') return 'catalog';
    if (item.auction_type === 'timed') return 'timed';
    if (item.auction_type === 'tender') return 'tender';
    return 'catalog';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Product Catalog</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search auctions, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 transition-all"
                  aria-label="Search auctions, brands, categories"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm flex items-center gap-2 transition-colors ${
                  showFilters || Object.values(filters).filter(Boolean).length > 1 
                    ? 'btn-primary shadow-md' 
                    : 'btn-outline bg-white dark:bg-gray-800'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {Object.values(filters).filter(Boolean).length > 1 && (
                  <span className="bg-white text-primary-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                    {Object.values(filters).filter(Boolean).length - 1}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1.5">
                      <label htmlFor="category-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                      <select
                        id="category-select"
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="">All Categories</option>
                        <option value="Vehicles">Vehicles</option>
                        <option value="Art & Paintings">Art & Paintings</option>
                        <option value="Jewelry & Watches">Jewelry & Watches</option>
                        <option value="Industrial Equipment">Industrial Equipment</option>
                        <option value="Handmade & Creative">Handmade & Creative</option>
                        <option value="Antiques & Collectibles">Antiques & Collectibles</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                          aria-label="Minimum price"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min Year"
                          value={filters.minYear}
                          onChange={(e) => setFilters(prev => ({ ...prev, minYear: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                          aria-label="Minimum year"
                        />
                        <input
                          type="number"
                          placeholder="Max Year"
                          value={filters.maxYear}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxYear: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                          aria-label="Maximum year"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="auction-type-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Auction Type</label>
                      <select
                        id="auction-type-select"
                        value={filters.auctionType}
                        onChange={(e) => setFilters(prev => ({ ...prev, auctionType: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="">All Types</option>
                        <option value="live">Live Auctions</option>
                        <option value="timed">Timed Auctions</option>
                        <option value="tender">Tender Auctions</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="sort-by-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort By</label>
                      <select
                        id="sort-by-select"
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors"
                      >
                        <option value="ending_soon">Ending Soon</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="most_viewed">Most Viewed</option>
                        <option value="most_bids">Most Bids</option>
                        <option value="newest">Newest First</option>
                      </select>
                    </div>
                  </div>
                 
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500">
                      Showing results based on selected criteria
                    </div>
                    <button 
                      onClick={() => setFilters({
                        category: '',
                        brand: '',
                        fuelType: '',
                        bodyType: '',
                        location: '',
                        minYear: '',
                        maxYear: '',
                        condition: '',
                        auctionStatus: '',
                        auctionType: '',
                        sortBy: 'created_at',
                        showTrending: false,
                        showPremium: false,
                        showFeatured: false,
                        verifiedOnly: false
                      })}
                      className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Discovery Sections */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        
        {/* Trending Auctions */}
        {trendingProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Auctions</h2>
                  <p className="text-gray-600 dark:text-gray-400">Hot deals everyone's bidding on</p>
                </div>
              </div>
              <Link 
                to="?sort=trending" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {trendingProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="flex-none w-80">
                  <AuctionCard
                    variant="live"
                    id={product.id}
                    title={product.title}
                    image={product.image_url}
                    currentBid={product.current_price}
                    bidCount={product.bid_count}
                    onPrimaryAction={() => navigate(`/product/${product.id}`)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ending Soon */}
        {endingSoonProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Ending Soon</h2>
                  <p className="text-gray-600 dark:text-gray-400">Last chance to place your bids</p>
                </div>
              </div>
              <Link 
                to="?filter=ending_soon" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {endingSoonProducts.slice(0, 8).map((product) => (
                <div key={product.id} className="flex-none w-80">
                  <AuctionCard
                    variant="live"
                    id={product.id}
                    title={product.title}
                    image={product.image_url}
                    currentBid={product.current_price}
                    bidCount={product.bid_count}
                    timeRemaining={product.end_date}
                    onPrimaryAction={() => navigate(`/product/${product.id}`)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New Listings */}
        {newListings.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">New Listings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Fresh items just listed</p>
                </div>
              </div>
              <Link 
                to="?sort=newest" 
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                View All <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {newListings.slice(0, 8).map((product) => (
                <div key={product.id} className="flex-none w-80">
                  <AuctionCard
                    variant="catalog"
                    id={product.id}
                    title={product.title}
                    image={product.image_url}
                    currentBid={product.current_price}
                    bidCount={product.bid_count}
                    onPrimaryAction={() => navigate(`/product/${product.id}`)}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Product Grid */}
      <div className="container mx-auto px-4 pb-12">
        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
          </div>
        </div>

        {/* Products Grid/List */}
        {paginatedProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {paginatedProducts.map((product) => (
              <AuctionCard
                key={product.id}
                variant={getCardVariant(product)}
                id={product.id}
                title={product.title}
                image={product.image_url}
                currentBid={product.current_price}
                bidCount={product.bid_count}
                watchers={product.watchers}
                views={product.views}
                location={product.location}
                seller={product.seller}
                timeRemaining={product.end_date}
                isLive={product.auction_status === 'live'}
                isTrending={product.is_trending}
                isPremium={product.is_premium}
                isCertified={product.is_certified}
                onClick={() => navigate(`/product/${product.id}`)}
                onPrimaryAction={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <button 
              onClick={() => setFilters({
                category: '',
                brand: '',
                fuelType: '',
                bodyType: '',
                location: '',
                minYear: '',
                maxYear: '',
                condition: '',
                auctionStatus: '',
                auctionType: '',
                sortBy: 'created_at',
                showTrending: false,
                showPremium: false,
                showFeatured: false,
                verifiedOnly: false
              })}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
