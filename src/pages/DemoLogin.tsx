import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield, Store, Crown, Building, Palette, Truck, Award, Zap, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const DemoLogin = () => {
  const [loading, setLoading] = useState(false);
  const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const demoUsers = useMemo(
    () => [
      {
        id: 'demo-buyer',
        name: 'Demo Buyer',
        email: 'buyer@demo.com',
        password: 'demo123',
        role: 'buyer',
        user_type: 'buyer',
        icon: <User className="h-8 w-8" />,
        color: 'bg-blue-500',
        description: 'Experience the platform as a buyer - browse auctions, place bids, manage watchlist',
        features: ['Browse live auctions', 'Place bids in real-time', 'Manage watchlist', 'Wallet management', 'Order tracking', 'AI recommendations'],
        stats: { auctions: '500+', savings: '₹2.5L', rating: '4.8/5' }
      },
      {
        id: 'demo-seller',
        name: 'Demo Seller',
        email: 'seller@demo.com',
        password: 'demo123',
        role: 'seller',
        user_type: 'seller',
        icon: <Store className="h-8 w-8" />,
        color: 'bg-green-500',
        description: 'Experience the platform as a seller - list products, manage auctions, view analytics',
        features: ['List products', 'Manage auctions', 'Sales analytics', 'Revenue tracking', 'Customer management', 'Creative verification'],
        stats: { products: '150+', revenue: '₹12L', rating: '4.9/5' }
      },
      {
        id: 'demo-company',
        name: 'Seized Vehicles (Bank/NBFC pool)',
        email: 'company@demo.com',
        password: 'demo123',
        role: 'company',
        user_type: 'company',
        icon: <Building className="h-8 w-8" />,
        color: 'bg-orange-500',
        description: 'Seized vehicle pool from partner banks/NBFCs (HDFC, ICICI, etc.) with bulk uploads and corporate features',
        features: ['Bulk seized vehicle uploads', 'GST integration', 'Multi-bank seized vehicle auctions', 'Corporate dashboard', 'B2B transactions', 'Compliance tracking'],
        stats: { vehicles: '1,200+', volume: '₹50Cr', clients: '25+' }
      },
      {
        id: 'demo-artist',
        name: 'Creative Artist',
        email: 'artist@demo.com',
        password: 'demo123',
        role: 'seller',
        user_type: 'seller',
        icon: <Palette className="h-8 w-8" />,
        color: 'bg-purple-500',
        description: 'Creative professional - paintings, sculptures, handmade crafts with video verification',
        features: ['Upload creative works', 'Video proof verification', 'AI authenticity check', 'Artist portfolio', 'Custom orders', 'Creative marketplace'],
        stats: { artworks: '85+', verified: '100%', collectors: '200+' }
      },
      {
        id: 'demo-admin',
        name: 'Demo Admin',
        email: 'admin@demo.com',
        password: 'demo123',
        role: 'admin',
        user_type: 'admin',
        icon: <Shield className="h-8 w-8" />,
        color: 'bg-indigo-500',
        description: 'Access admin features - user management, product verification, system settings',
        features: ['User management', 'Product verification', 'Live stream setup', 'System monitoring', 'Content moderation', 'AI model training'],
        stats: { users: '10K+', products: '5K+', streams: '50+' }
      },
      {
        id: 'demo-superadmin',
        name: 'Demo Super Admin',
        email: 'superadmin@demo.com',
        password: 'demo123',
        role: 'superadmin',
        user_type: 'superadmin',
        icon: <Crown className="h-8 w-8" />,
        color: 'bg-yellow-500',
        description: 'Full system access - complete platform control and management',
        features: ['Full system control', 'Role management', 'Database access', 'System settings', 'Platform analytics', 'AI configuration'],
        stats: { revenue: '₹100Cr+', growth: '245%', markets: '5+' }
      },
      {
        id: 'demo-marketing',
        name: 'Marketing Services',
        email: 'marketing@demo.com',
        password: 'demo123',
        role: 'seller',
        user_type: 'seller',
        icon: <Palette className="h-8 w-8" />,
        color: 'bg-fuchsia-500',
        description: 'Run premium brand campaigns with coordinated hero slots and spotlight placements',
        features: ['Hero banner management', 'Campaign analytics', 'Sponsored carousel placements', 'Email nurture builder'],
        stats: { impressions: '1M+', ctr: '7.2%', lift: '3x' }
      },
      {
        id: 'demo-sales',
        name: 'Sales Support',
        email: 'sales@demo.com',
        password: 'demo123',
        role: 'sales',
        user_type: 'sales',
        icon: <Building className="h-8 w-8" />,
        color: 'bg-emerald-500',
        description: 'Experience high-touch sales coordination and enterprise deal flows',
        features: ['Deal desk', 'Escrow coordination', 'Bulk purchase approvals', 'Partner financing'],
        stats: { deals: '280+', revenue: '₹28Cr', nps: '89%' }
      },
      {
        id: 'demo-campaigns',
        name: 'Launch Campaigns',
        email: 'campaigns@demo.com',
        password: 'demo123',
        role: 'company',
        user_type: 'company',
        icon: <Zap className="h-8 w-8" />,
        color: 'bg-red-500',
        description: 'Deploy timed launches, influencer drops, and seasonal blitzes with guided flow',
        features: ['Timed auction planning', 'Influencer integrations', 'Launch checklists', 'Performance playbooks'],
        stats: { launches: '45+', roi: '4.6x', partners: '12+' }
      }
    ],
    []
  );

  const autoDemoUserId = useMemo(() => new URLSearchParams(location.search).get('user'), [location.search]);
  const autoRedirectPath = useMemo(() => new URLSearchParams(location.search).get('redirect') || '', [location.search]);

  const handleDemoLogin = useCallback(async (user, redirectPath?: string) => {
    setLoading(true);
    try {
      // Create demo session
      const demoSession = {
        mode: 'demo',
        user: {
          id: user.id,
          email: user.email,
          user_metadata: { 
            name: user.name, 
            role: user.role, 
            user_type: user.user_type,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
          }
        }
      };

      localStorage.setItem('demo-session', JSON.stringify(demoSession));
      localStorage.setItem('demo-user-role', user.role);
      localStorage.setItem('demo-user-type', user.user_type);
      localStorage.setItem('demo-user-name', user.name);

      window.dispatchEvent(new CustomEvent('demo-login', { detail: demoSession }));
      toast.success(`Welcome ${user.name}! Exploring ${user.user_type} features.`);

      // Navigate based on role
      const defaultDestination = user.role === 'superadmin'
        ? '/super-admin'
        : user.role === 'admin'
          ? '/admin'
          : user.user_type === 'company'
            ? '/company/dashboard'
            : user.user_type === 'seller'
              ? '/seller/dashboard'
              : '/buyer/dashboard';
      navigate(redirectPath || defaultDestination);
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Demo login failed');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!autoDemoUserId || autoLoginTriggered) return;

    const matchingUser = demoUsers.find((user) => user.id === autoDemoUserId);
    if (matchingUser) {
      handleDemoLogin(matchingUser, autoRedirectPath);
      setAutoLoginTriggered(true);
    }
  }, [autoDemoUserId, autoLoginTriggered, demoUsers, handleDemoLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              QuickBid Demo Experience
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-6">
              Explore our comprehensive auction platform with different user roles. 
              From individual buyers to large financial institutions - experience every feature.
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Global Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>AI-Powered</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demoUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className={`${user.color} text-white p-8 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full"></div>
                <div className="relative z-10">
                  <div className="mb-4 transform hover:scale-110 transition-transform">
                    {user.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{user.name}</h3>
                  <p className="text-white/90 text-sm">{user.email}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    {Object.entries(user.stats).map(([key, value]) => (
                      <div key={key} className="bg-white/20 rounded-lg p-2">
                        <div className="font-bold">{value}</div>
                        <div className="capitalize opacity-80">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  {user.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {user.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                    {user.features.length > 4 && (
                      <li className="text-sm text-gray-500 italic">
                        +{user.features.length - 4} more features...
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Demo Credentials:</strong>
                  </div>
                  <div className="text-xs font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Password:</span>
                      <span className="font-medium">{user.password}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDemoLogin(user)}
                  disabled={loading}
                  className={`w-full ${user.color} text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white mr-2"></div>
                      Logging in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Experience as {user.name}</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.div>
                    </div>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Overview */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Complete Platform Features Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-2xl mb-6 inline-block">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="font-bold text-xl mb-4">Individual Users</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• Personal auction participation</li>
                <li>• AI-powered recommendations</li>
                <li>• Wallet & payment management</li>
                <li>• Real-time notifications</li>
                <li>• Order tracking & delivery</li>
                <li>• Profile verification system</li>
                <li>• Watchlist & favorites</li>
                <li>• Mobile app integration</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-2xl mb-6 inline-block">
                <Palette className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-4">Creative Professionals</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• Video proof verification</li>
                <li>• AI authenticity scoring</li>
                <li>• Multi-media portfolio</li>
                <li>• Custom order management</li>
                <li>• Artist profile showcase</li>
                <li>• Creative marketplace</li>
                <li>• Commission tracking</li>
                <li>• Collector network</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-2xl mb-6 inline-block">
                <Building className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="font-bold text-xl mb-4">B2B Companies</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• Bulk product uploads (Excel/CSV)</li>
                <li>• GST & compliance integration</li>
                <li>• Seized asset management</li>
                <li>• Corporate dashboard</li>
                <li>• B2B transaction handling</li>
                <li>• Advanced analytics & reporting</li>
                <li>• Multi-location support</li>
                <li>• API integration</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-6 rounded-2xl mb-6 inline-block">
                <Shield className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-4">Platform Administration</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• User & role management</li>
                <li>• Product verification workflow</li>
                <li>• Live stream setup & control</li>
                <li>• Content moderation tools</li>
                <li>• System monitoring & analytics</li>
                <li>• AI model configuration</li>
                <li>• Security management</li>
                <li>• Revenue optimization</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-2xl mb-6 inline-block">
                <Truck className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="font-bold text-xl mb-4">Specialized Auctions</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• Live streaming auctions</li>
                <li>• Timed bidding system</li>
                <li>• Sealed tender auctions</li>
                <li>• Vehicle liquidation</li>
                <li>• Industrial equipment</li>
                <li>• Government asset disposal</li>
                <li>• Real estate auctions</li>
                <li>• Art & collectibles</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-6 rounded-2xl mb-6 inline-block">
                <Award className="h-12 w-12 text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl mb-4">Advanced Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left">
                <li>• AI-powered recommendations</li>
                <li>• Real-time chat & notifications</li>
                <li>• Multi-currency support</li>
                <li>• Mobile app integration</li>
                <li>• API for third-party integration</li>
                <li>• Advanced security & fraud detection</li>
                <li>• Blockchain verification</li>
                <li>• Global marketplace</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Metrics */}
        <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-12 rounded-3xl">
          <h3 className="text-3xl font-bold mb-8 text-center">Platform Success Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-white/80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">₹100Cr+</div>
              <div className="text-white/80">Transaction Volume</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-white/80">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98.5%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xl mb-6 text-white/90">
              Join thousands of satisfied users who trust QuickBid for their auction needs
            </p>
            <div className="flex justify-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">4.9/5</div>
                <div className="text-sm text-white/80">User Rating</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-white/80">Support</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-white/80">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Powered by Advanced Technology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-xl mb-3 inline-block">
                <span className="text-2xl">🤖</span>
              </div>
              <h4 className="font-semibold mb-1">AI & ML</h4>
              <p className="text-sm text-gray-600">Smart recommendations</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-xl mb-3 inline-block">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="font-semibold mb-1">Blockchain</h4>
              <p className="text-sm text-gray-600">Secure verification</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-xl mb-3 inline-block">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-semibold mb-1">Mobile First</h4>
              <p className="text-sm text-gray-600">Cross-platform apps</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 p-4 rounded-xl mb-3 inline-block">
                <span className="text-2xl">☁️</span>
              </div>
              <h4 className="font-semibold mb-1">Cloud Native</h4>
              <p className="text-sm text-gray-600">Scalable infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
