import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign,
  Tag,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Eye,
  Heart,
  Package,
  Users,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';

interface InspectionRow {
  id: string;
  product_id: string;
  status: string | null;
  final_status: string | null;
  final_decision: string | null;
  final_grade?: string | null;
  created_at: string | null;
}

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceMin: '',
    priceMax: '',
    location: '',
    condition: '',
    sellerType: '',
    auctionType: '',
    endingWithin: '',
    hasReserve: false,
    verifiedOnly: false,
    premiumOnly: false,
    sortBy: 'relevance'
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [inspectionByProductId, setInspectionByProductId] = useState<Record<string, InspectionRow | null>>({});

  useEffect(() => {
    const loadSavedSearches = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          return;
        }

        const { data, error } = await supabase
          .from('saved_searches')
          .select('id, name, query, filters, created_at')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Failed to load saved searches:', error);
          return;
        }

        setSavedSearches(data || []);
      } catch (err) {
        console.error('Failed to load saved searches:', err);
      }
    };

    loadSavedSearches();
  }, []);

  const categories = [
    'Vehicles', 'Art & Paintings', 'Jewelry & Watches', 'Antiques & Collectibles',
    'Industrial Equipment', 'Electronics', 'Handmade & Creative', 'Real Estate',
    'Furniture & Home', 'Books & Manuscripts', 'Sports & Recreation', 'Fashion & Accessories',
    'Musical Instruments', 'Coins & Currency', 'Stamps & Philately', 'Toys & Games'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
    'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna'
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles(name, is_verified),
          auctions:auctions(auction_type, end_date, status)
        `)
        .eq('status', 'active');

      if (searchQuery) {
        const q = `%${searchQuery.toLowerCase()}%`;
        query = query.or(
          `title.ilike.${q},description.ilike.${q},category.ilike.${q}`
        );
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.location) {
        const loc = `%${filters.location.toLowerCase()}%`;
        query = query.ilike('location', loc);
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      if (filters.priceMin) {
        query = query.gte('current_price', Number(filters.priceMin));
      }

      if (filters.priceMax) {
        query = query.lte('current_price', Number(filters.priceMax));
      }

      if (filters.premiumOnly) {
        query = query.eq('is_premium', true);
      }

      const { data, error } = await query.limit(60);

      if (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
        return;
      }

      let rows: any[] = data || [];

      if (filters.auctionType) {
        rows = rows.filter((p: any) =>
          (p.auctions || []).some((a: any) => a.auction_type === filters.auctionType)
        );
      }

      if (filters.verifiedOnly) {
        rows = rows.filter((p: any) => p.seller?.is_verified);
      }

      if (filters.sellerType) {
        rows = rows.filter((p: any) => p.seller_type === filters.sellerType);
      }

      if (filters.endingWithin) {
        const now = Date.now();
        let maxDiffMs: number | null = null;

        if (filters.endingWithin === '24h') {
          maxDiffMs = 24 * 60 * 60 * 1000;
        } else if (filters.endingWithin === '3d') {
          maxDiffMs = 3 * 24 * 60 * 60 * 1000;
        } else if (filters.endingWithin === '7d') {
          maxDiffMs = 7 * 24 * 60 * 60 * 1000;
        }

        if (maxDiffMs) {
          rows = rows.filter((p: any) => {
            const auction = (p.auctions || [])[0];
            const endDate = auction?.end_date || p.end_date;
            if (!endDate) return false;
            const end = new Date(endDate).getTime();
            const diff = end - now;
            return diff > 0 && diff <= maxDiffMs;
          });
        }
      }

      let mapped = rows.map((p: any) => {
        const auction = (p.auctions || [])[0] || null;
        const auctionType = auction?.auction_type || 'timed';
        const endDate = auction?.end_date || p.end_date;
        const now = Date.now();
        const end = endDate ? new Date(endDate).getTime() : now;
        const diff = end - now;
        let time_left = '—';
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          if (days > 0) time_left = `${days}d ${hours}h`;
          else if (hours > 0) time_left = `${hours}h ${minutes}m`;
          else time_left = `${minutes}m`;
        } else {
          time_left = 'Ended';
        }

        return {
          id: p.id,
          title: p.title,
          image_url: p.image_url || p.images?.[0] || '',
          current_price: p.current_price,
          starting_price: p.starting_price,
          location: p.location,
          time_left,
          seller_verified: !!p.seller?.is_verified,
          seller_name: p.seller?.name || 'Seller',
          seller_type: p.seller_type || 'individual',
          category: p.category,
          condition: p.condition,
          auction_type: auctionType,
          bid_count: p.bid_count || 0,
          views: p.view_count || 0,
          is_premium: p.is_premium ?? false,
          rating: 4.5,
        };
      });

      mapped = mapped.sort((a: any, b: any) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.current_price - b.current_price;
          case 'price_high':
            return b.current_price - a.current_price;
          case 'ending_soon': {
            const aEnded = a.time_left === 'Ended';
            const bEnded = b.time_left === 'Ended';
            if (aEnded && !bEnded) return 1;
            if (!aEnded && bEnded) return -1;
            return 0;
          }
          case 'relevance':
          default:
            return 0;
        }
      });

      try {
        const ids = mapped.map((m: any) => m.id).filter(Boolean);
        if (ids.length > 0) {
          const { data: inspRows, error: inspErr } = await supabase
            .from('inspections')
            .select('id,product_id,status,final_status,final_decision,final_grade,created_at')
            .in('product_id', ids);

          if (!inspErr && inspRows) {
            const map: Record<string, InspectionRow | null> = {};
            (inspRows || []).forEach((row: any) => {
              const r = row as InspectionRow;
              const existing = map[r.product_id];
              if (!existing) {
                map[r.product_id] = r;
                return;
              }
              const a = existing.created_at ? new Date(existing.created_at).getTime() : 0;
              const b = r.created_at ? new Date(r.created_at).getTime() : 0;
              if (b > a) map[r.product_id] = r;
            });
            setInspectionByProductId(map);
          } else {
            setInspectionByProductId({});
          }
        } else {
          setInspectionByProductId({});
        }
      } catch (inspError) {
        console.warn('AdvancedSearch: failed to load inspections for results', inspError);
        setInspectionByProductId({});
      }

      setResults(mapped);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceMin: '',
      priceMax: '',
      location: '',
      condition: '',
      sellerType: '',
      auctionType: '',
      endingWithin: '',
      hasReserve: false,
      verifiedOnly: false,
      premiumOnly: false,
      sortBy: 'relevance'
    });
    setSearchQuery('');
    setResults([]);
  };

  const saveSearch = async () => {
    if (!searchName.trim()) {
      toast.error('Please enter a name for this search');
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        toast.error('Please sign in to save searches');
        return;
      }

      const payload = {
        user_id: authData.user.id,
        name: searchName.trim(),
        query: searchQuery,
        filters: filters,
      };

      const { data, error } = await supabase
        .from('saved_searches')
        .insert(payload)
        .select('id, name, query, filters, created_at')
        .single();

      if (error) {
        console.error('Failed to save search:', error);
        toast.error('Could not save search. Please try again.');
        return;
      }

      setSavedSearches(prev => [data, ...prev]);
      setShowSaveModal(false);
      setSearchName('');
      toast.success('Search saved successfully!');
    } catch (err) {
      console.error('Failed to save search:', err);
      toast.error('Could not save search. Please try again.');
    }
  };

  const loadSavedSearch = (search: any) => {
    setSearchQuery(search.query);
    setFilters(search.filters);
    toast.success('Search loaded');
  };

  const renderInspectionBadge = (productId: string) => {
    const insp = inspectionByProductId[productId];
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ';

    if (!insp) {
      return <span className={base + 'bg-gray-100 text-gray-600'}>No inspection</span>;
    }

    const finalStatus = (insp.final_status || '').toLowerCase();
    const finalDecision = (insp.final_decision || '').toLowerCase();
    const status = (insp.status || '').toLowerCase();

    if (finalDecision === 'pass' || finalStatus === 'approved') {
      return <span className={base + 'bg-emerald-100 text-emerald-800'}>Inspection Approved</span>;
    }
    if (finalStatus === 'rejected' || finalDecision === 'fail') {
      return <span className={base + 'bg-rose-100 text-rose-800'}>Inspection Rejected</span>;
    }
    if (status === 'pending' || status === 'in_progress' || !status) {
      return <span className={base + 'bg-yellow-100 text-yellow-800'}>Inspection Pending</span>;
    }

    return <span className={base + 'bg-gray-100 text-gray-700'}>Inspection: {insp.status}</span>;
  };

  const renderGradeBadge = (productId: string) => {
    const insp = inspectionByProductId[productId];
    if (!insp || !insp.final_grade) return null;
    const g = insp.final_grade.toUpperCase();
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ';

    if (g === 'A+' && (insp.final_decision?.toLowerCase() === 'pass' || insp.final_status?.toLowerCase() === 'approved')) {
      return <span className={base + 'bg-emerald-50 text-emerald-700 border border-emerald-200'}>Certified A+</span>;
    }
    if (g === 'A' && (insp.final_decision?.toLowerCase() === 'pass' || insp.final_status?.toLowerCase() === 'approved')) {
      return <span className={base + 'bg-blue-50 text-blue-700 border border-blue-200'}>Verified A</span>;
    }
    if (g === 'B' || g === 'C') {
      return <span className={base + 'bg-gray-50 text-gray-700 border border-gray-200'}>AI Grade {g}</span>;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Advanced Search</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Find exactly what you're looking for with powerful filters</p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="space-y-6">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands, or keywords..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                  placeholder="Min"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                  placeholder="Max"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auction Type
              </label>
              <select
                value={filters.auctionType}
                onChange={(e) => setFilters(prev => ({ ...prev, auctionType: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="live">Live Auctions</option>
                <option value="timed">Timed Auctions</option>
                <option value="tender">Tender Auctions</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
              ) : (
                <Search className="h-5 w-5" />
              )}
              Search
            </button>
            <button
              onClick={clearFilters}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="border border-indigo-300 text-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-50"
            >
              Save Search
            </button>
          </div>
        </div>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Saved Searches</h2>
            <span className="text-sm text-gray-500">{savedSearches.length} saved</span>
          </div>
          <div className="space-y-3">
            {savedSearches.map((s: any) => (
              <button
                key={s.id}
                onClick={() => loadSavedSearch(s)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              >
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {s.query || 'All items'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Search Results ({results.length})</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Showing results for: "{searchQuery}"</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={result.image_url}
                    alt={result.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {result.is_premium && (
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        Premium
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      result.auction_type === 'live' ? 'bg-red-100 text-red-800' :
                      result.auction_type === 'timed' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {result.auction_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {result.views}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                    {result.bid_count} bids
                  </div>
                  {result.seller_verified && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{result.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <span className="text-gray-600">{result.seller_name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      result.seller_type === 'company' ? 'bg-blue-100 text-blue-800' :
                      result.seller_type === 'third_party' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {result.seller_type}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-xs">{result.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Current Price</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{result.current_price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Time Left</p>
                      <p className="text-sm font-medium text-red-600">{result.time_left}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                    {renderInspectionBadge(result.id)}
                    {renderGradeBadge(result.id)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <MapPin className="h-3 w-3" />
                    <span>{result.location}</span>
                    <span>•</span>
                    <span>{result.condition}</span>
                    <span>•</span>
                    <span>{result.category}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/product/${result.id}`}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-center hover:bg-indigo-700 text-sm"
                    >
                      View Details
                    </Link>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Save Search</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Enter a name for this search"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Query:</strong> {searchQuery || 'All items'}</p>
                <p><strong>Filters:</strong> {Object.values(filters).filter(Boolean).length} active</p>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveSearch}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Advanced Search Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl mb-4 inline-block">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Use Keywords</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Search by brand, model, material, or specific features
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
              <Filter className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Combine Filters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use multiple filters to narrow down to exactly what you want
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
              <Heart className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Save Searches</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Save your searches and get notified when new items match
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;