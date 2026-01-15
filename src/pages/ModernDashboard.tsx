// Modern Dashboard Component - Redesigned to match reference style
import React, { useState, useEffect } from 'react';
import { BetaUserService } from '../services/betaUserService';
import { EnvironmentBadge } from '../components/EnvironmentBadge';
import { BetaUserIndicator } from '../components/BetaUserIndicator';
import { SandboxWalletBanner } from '../components/SandboxWalletBanner';
import { BetaVersionBanner } from '../components/BetaVersionBanner';

interface Product {
  id: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  imageUrl: string;
  category: string;
  seller: string;
  isRealProduct: boolean;
}

export const ModernDashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<'guest' | 'beta_buyer' | 'beta_seller' | 'admin'>('guest');
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [endingSoonProducts, setEndingSoonProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const userId = localStorage.getItem('sb-user-id') || 'guest';
        const role = await BetaUserService.getUserRole(userId);
        setUserRole(role);

        // Mock data for demonstration
        const mockProducts: Product[] = [
          {
            id: '1',
            title: 'Vintage Mechanical Watch',
            currentBid: 4500,
            timeLeft: '2h 15m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Watches',
            seller: 'Vintage Store',
            isRealProduct: true
          },
          {
            id: '2',
            title: 'Modern Laptop',
            currentBid: 32000,
            timeLeft: '5h 30m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Electronics',
            seller: 'Tech Hub',
            isRealProduct: true
          },
          {
            id: '3',
            title: 'Artisan Handbag',
            currentBid: 2800,
            timeLeft: '1h 45m',
            imageUrl: '/api/placeholder/300/200',
            category: 'Fashion',
            seller: 'Artisan Crafts',
            isRealProduct: false
          }
        ];

        setTrendingProducts(mockProducts.slice(0, 3));
        setEndingSoonProducts(mockProducts.slice(1, 4));
        setNewProducts(mockProducts.slice(2, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.isRealProduct && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Live Product
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.title}</h3>
            <p className="text-sm text-gray-500">{product.category} • {product.seller}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{product.currentBid.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{product.timeLeft} left</p>
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
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Browse</a>
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
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Amazing Items at
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Unbeatable Prices
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join India's premier auction platform. Bid on unique items from verified sellers. 
              Safe, secure, and exciting real-time auctions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Bidding
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sandbox Wallet Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SandboxWalletBanner />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trending Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 Trending Now</h2>
              <p className="text-gray-600">Most popular items this week</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Ending Soon Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">⏰ Ending Soon</h2>
              <p className="text-gray-600">Last chance to bid on these items</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {endingSoonProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">✨ New Arrivals</h2>
              <p className="text-gray-600">Fresh items just listed</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Beta Access CTA for Guests */}
        {userRole === 'guest' && (
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Join the Beta Program</h2>
            <p className="text-xl mb-8 opacity-90">
              Get early access to exclusive features and help shape the future of QuickMela
            </p>
            <button 
              onClick={() => window.location.href = '/beta-request'}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200"
            >
              Request Beta Access
            </button>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                QuickMela
              </h3>
              <p className="text-gray-400">India's premier auction platform</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fees</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
