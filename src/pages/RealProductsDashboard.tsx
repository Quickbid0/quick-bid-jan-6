// Real Products Dashboard with Environment Indicators
import React, { useState, useEffect } from 'react';
import { RealProduct, ProductService } from '../services/productService';
import { UserAccessService } from '../services/userAccessService';
import { EnvironmentBadge } from '../components/EnvironmentBadge';
import { BetaUserIndicator } from '../components/BetaUserIndicator';
import { SandboxWalletBanner } from '../components/SandboxWalletBanner';
import { RealProductCard } from '../components/RealProductCard';

export const RealProductsDashboard: React.FC = () => {
  const [products, setProducts] = useState<RealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAccessLevel, setUserAccessLevel] = useState<'internal' | 'beta' | 'public'>('public');
  const [environment, setEnvironment] = useState<'test' | 'beta' | 'live'>('beta');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        // Check user access level
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        const accessLevel = await UserAccessService.getUserAccessLevel(userId);
        setUserAccessLevel(accessLevel);
        
        // Load products based on environment
        const productsData = await ProductService.getProducts(environment);
        setProducts(productsData);
        
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [environment]);

  const handleBid = async (productId: string, amount: number) => {
    try {
      const userId = localStorage.getItem('sb-user-id') || 'guest';
      const canUserBid = await UserAccessService.canBid(userId);
      
      if (!canUserBid) {
        alert('You do not have permission to bid');
        return;
      }

      // Navigate to product detail or show bid modal
      window.location.href = `/product/${productId}`;
    } catch (err) {
      alert('Error checking bid permissions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error}
          </h1>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const realProducts = products.filter(p => p.environment?.isRealProduct);
  const demoProducts = products.filter(p => !p.environment?.isRealProduct);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with User Access and Environment */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <BetaUserIndicator userAccessLevel={userAccessLevel} />
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Environment:</span>
              <EnvironmentBadge type="system" environment={{ isRealProduct: true, environment }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sandbox Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SandboxWalletBanner />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Real Products Section */}
        {realProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Live Products ({realProducts.length})
              </h2>
              <span className="text-sm text-green-600">
                Real items from verified sellers
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {realProducts.map((product) => (
                <RealProductCard
                  key={product.id}
                  product={product}
                  onBid={handleBid}
                />
              ))}
            </div>
          </div>
        )}

        {/* Demo Products Section */}
        {demoProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Demo Products ({demoProducts.length})
              </h2>
              <span className="text-sm text-yellow-600">
                Sample items for testing
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {demoProducts.map((product) => (
                <RealProductCard
                  key={product.id}
                  product={product}
                  onBid={handleBid}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              No products available in this environment
            </div>
            <div className="text-sm text-gray-400">
              Try switching environments or contact support
            </div>
          </div>
        )}

        {/* Access Control Notice */}
        {userAccessLevel === 'public' && (
          <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Beta Access Required:</strong> Some features may require beta access. 
                  Contact support to join the beta program.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
