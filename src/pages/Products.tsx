import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabaseClient';
import BidModal from '../components/BidModal';

// Basic Product type for now
interface Product {
  id: string;
  title: string;
  description?: string;
  image_urls?: string[];
  image_url?: string;
  current_bid?: number;
  starting_bid?: number;
  end_date?: string;
  is_premium?: boolean;
  category?: string;
  status?: string;
}

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    sortBy: 'ending_soon'
  });

  // 2. ALL derived state via useMemo
  const totalPages = useMemo(() => Math.ceil(filteredProducts.length / itemsPerPage), [filteredProducts.length, itemsPerPage]);
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);
  const currentProducts = useMemo(() => filteredProducts.slice(startIndex, endIndex), [filteredProducts, startIndex, endIndex]);

  // 3. NO try/catch inside JSX
  // 4. NO duplicated state names

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setLoadError(null);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const productsData = data || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setLoadError('Failed to load products');
      toast.error('Failed to load products');
      setProducts([]);
      setFilteredProducts([]);
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
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Other filters...
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleBidClick = (product: Product) => {
    setSelectedProduct(product);
    setShowBidModal(true);
  };

  const handleViewDetails = (id: string) => {
    navigate(`/product/${id}`);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getBrandForProduct = (product: Product): string | null => {
  const make = (product as any)?.make || (product as any)?.brand || '';
  const title = product?.title || '';
  const lower = title.toLowerCase();
  
  // Simple brand detection
  const brands = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Tata', 'Maruti'];
  for (const brand of brands) {
    if (lower.includes(brand.toLowerCase())) return brand;
  }
  return null;
};

  // 5. Clean JSX with NO nested try/catch
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        
        {/* Search and Filters */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Automobiles">Automobiles</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
          </select>

          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="BMW">BMW</option>
          </select>

          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {currentProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="relative aspect-[4/3] overflow-hidden">
              {product.image_urls && product.image_urls.length > 0 && (
                <img
                  src={product.image_urls[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              {product.is_premium && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Premium
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 leading-tight">{product.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">{product.description}</p>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ₹{product.current_bid || product.starting_bid}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {getTimeRemaining(product.end_date || '')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleViewDetails(product.id)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleBidClick(product)}
                  className="primary flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
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
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && selectedProduct && (
        <BidModal
          product={selectedProduct}
          onClose={() => setShowBidModal(false)}
          onBidPlaced={() => {
            setShowBidModal(false);
            fetchProducts(); // Refresh products after bid
          }}
        />
      )}
    </div>
  );
}
