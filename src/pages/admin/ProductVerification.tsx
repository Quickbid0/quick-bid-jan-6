import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Shield, CheckCircle, X, Eye, AlertCircle, FileText, Image, Calendar, User, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { aiService, FakeProductDetectionResult } from '../../services/aiService';

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  image_urls: string[];
  document_urls: string[];
  current_price: number;
  category: string;
  brand?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  seller: {
    id: string;
    name: string;
    email: string;
    is_verified: boolean;
  };
}

const ProductVerification = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [aiFilter, setAiFilter] = useState<'all' | 'with' | 'without' | 'weak'>('all');
  const [aiMediaMap, setAiMediaMap] = useState<Record<string, { approved: number; total: number }>>({});
  const [aiAnalysis, setAiAnalysis] = useState<FakeProductDetectionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filter, aiFilter]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:profiles(id, name, email, is_verified)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const baseProducts = data || [];
      const ids = baseProducts.map((p: any) => p.id).filter(Boolean);
      const nextAiMap: Record<string, { approved: number; total: number }> = {};

      if (ids.length > 0) {
        const { data: verifs } = await supabase
          .from('product_verifications')
          .select('product_id,status')
          .in('product_id', ids);

        (verifs || []).forEach((row: any) => {
          if (!row.product_id) return;
          if (!nextAiMap[row.product_id]) {
            nextAiMap[row.product_id] = { approved: 0, total: 0 };
          }
          nextAiMap[row.product_id].total += 1;
          if (row.status === 'approved') {
            nextAiMap[row.product_id].approved += 1;
          }
        });
      }

      setAiMediaMap(nextAiMap);

      let filteredProducts = baseProducts;
      if (aiFilter !== 'all') {
        filteredProducts = baseProducts.filter((p: any) => {
          const info = nextAiMap[p.id];
          if (!info || !info.total) {
            return aiFilter === 'without';
          }
          const ratio = info.approved / info.total;
          if (aiFilter === 'with') return info.total > 0;
          if (aiFilter === 'weak') return ratio < 0.66 || info.approved === 0;
          return false;
        });
      }

      setProducts(filteredProducts);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (productId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const updateData: any = { verification_status: status };
      if (status === 'rejected' && reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;
      
      toast.success(`Product ${status === 'approved' ? 'approved' : 'rejected'}`);
      
      // Send notification to seller
      const product = products.find(p => p.id === productId);
      if (product) {
        await supabase.from('notifications').insert([{
          user_id: product.seller.id,
          title: `Product ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: status === 'approved' 
            ? `Your product "${product.title}" has been approved and is now live.`
            : `Your product "${product.title}" was rejected. ${reason || 'Please review and resubmit.'}`,
          type: 'product_update'
        }]);
      }

      fetchProducts();
      setShowModal(false);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const openProductModal = async (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setAiAnalysis(null);
    setAnalyzing(true);

    try {
      const result = await aiService.detectFakeProduct({
        title: product.title,
        description: product.description,
        price: product.current_price,
        brand: product.brand,
        category: product.category,
        sellerId: product.seller.id
      });
      setAiAnalysis(result);
    } catch (err) {
      console.error('AI analysis failed', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Verification</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and verify product listings</p>
        </div>
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-indigo-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Products</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={aiFilter}
            onChange={(e) => setAiFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All media</option>
            <option value="with">With AI media</option>
            <option value="without">Without AI media</option>
            <option value="weak">Weak AI media</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found for verification</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1588499756884-d72584d84df5?auto=format&fit=crop&w=2000&q=80'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.verification_status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : product.verification_status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.verification_status.charAt(0).toUpperCase() + product.verification_status.slice(1)}
                  </span>
                </div>
                {!product.seller.is_verified && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Unverified Seller
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-green-600">
                      ₹{product.current_price.toLocaleString()}
                    </span>
                    {aiMediaMap[product.id] ? (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700">
                        AI media {aiMediaMap[product.id].approved}/{aiMediaMap[product.id].total}
                      </span>
                    ) : (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600">
                        No AI media
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{product.seller.name}</span>
                  <Calendar className="h-4 w-4 ml-2" />
                  <span>{new Date(product.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => openProductModal(product)}
                    className="flex items-center text-indigo-600 hover:text-indigo-700"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  {product.verification_status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerification(product.id, 'approved')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openProductModal(product)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Product Verification Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  {selectedProduct.image_urls && selectedProduct.image_urls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.image_urls.slice(1, 4).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Product ${index + 2}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                      {selectedProduct.description}
                    </p>

                    {/* AI Analysis Section */}
                    {analyzing ? (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                    ) : aiAnalysis && (
                      <div className={`mt-4 p-4 rounded-lg border ${
                        aiAnalysis.recommendation === 'reject' 
                          ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                          : aiAnalysis.recommendation === 'manual_review' 
                          ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' 
                          : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className={`h-5 w-5 ${
                            aiAnalysis.recommendation === 'reject' ? 'text-red-600' :
                            aiAnalysis.recommendation === 'manual_review' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} />
                          <h3 className="font-semibold text-gray-900 dark:text-white">AI Authenticity Check</h3>
                          <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                            aiAnalysis.recommendation === 'reject' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : aiAnalysis.recommendation === 'manual_review' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            Risk Score: {aiAnalysis.riskScore}/100
                          </span>
                        </div>
                        
                        {aiAnalysis.flags.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Flags Detected:</p>
                            <ul className="space-y-1">
                              {aiAnalysis.flags.map((flag, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                            <CheckCircle className="h-4 w-4" />
                            No significant risk flags detected.
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Recommendation: </span>
                            <span className={`capitalize ${
                              aiAnalysis.recommendation === 'reject' ? 'text-red-600 font-bold' :
                              aiAnalysis.recommendation === 'manual_review' ? 'text-yellow-600 font-bold' :
                              'text-green-600 font-bold'
                            }`}>
                              {aiAnalysis.recommendation.replace('_', ' ')}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price</label>
                      <p className="text-lg font-bold text-green-600">
                        ₹{selectedProduct.current_price.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-gray-900 dark:text-white">{selectedProduct.category}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Seller Information</label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium">{selectedProduct.seller.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProduct.seller.email}</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                        selectedProduct.seller.is_verified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.seller.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  {selectedProduct.document_urls && selectedProduct.document_urls.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Supporting Documents</label>
                      <div className="mt-2 space-y-2">
                        {selectedProduct.document_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-indigo-600 hover:text-indigo-700"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Document {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedProduct.verification_status === 'pending' && (
                <div className="mt-6 border-t pt-6">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleVerification(selectedProduct.id, 'approved')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approve Product
                    </button>
                    <div className="flex-1">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection (optional)"
                        className="w-full px-3 py-2 border rounded-lg mb-2"
                        rows={2}
                      />
                      <button
                        onClick={() => handleVerification(selectedProduct.id, 'rejected', rejectionReason)}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 flex items-center justify-center"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Reject Product
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVerification;
