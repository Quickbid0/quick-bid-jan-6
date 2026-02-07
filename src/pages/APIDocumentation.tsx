import React, { useState } from 'react';
import { Code, Play, Book, Users, Zap, Shield, Globe, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import PageFrame from '../components/layout/PageFrame';

const APIDocumentation = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string>('');

  const copyToClipboard = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const apiEndpoints = [
    {
      category: 'Authentication',
      endpoints: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Authenticate user with email and password',
          parameters: ['email: string', 'password: string'],
          response: '{ token: string, user: User }',
          example: `fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
})`
        },
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register new user account',
          parameters: ['email: string', 'password: string', 'name: string'],
          response: '{ user: User, token: string }',
          example: `fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
})`
        }
      ]
    },
    {
      category: 'Auctions',
      endpoints: [
        {
          method: 'GET',
          path: '/api/products',
          description: 'Get all active auctions',
          parameters: ['page?: number', 'limit?: number', 'category?: string'],
          response: '{ products: Product[], total: number }',
          example: `fetch('/api/products?page=1&limit=10&category=electronics')
  .then(res => res.json())`
        },
        {
          method: 'GET',
          path: '/api/products/:id',
          description: 'Get auction details by ID',
          parameters: ['id: string'],
          response: 'Product',
          example: `fetch('/api/products/123')
  .then(res => res.json())`
        },
        {
          method: 'POST',
          path: '/api/products',
          description: 'Create new auction (sellers only)',
          parameters: ['title: string', 'description: string', 'startingPrice: number', 'auctionType: AuctionType'],
          response: 'Product',
          example: `fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: 'Vintage Watch',
    description: 'Beautiful vintage watch',
    startingPrice: 10000,
    auctionType: { type: 'standard', bidIncrement: 1000 }
  })
})`
        }
      ]
    },
    {
      category: 'Bidding',
      endpoints: [
        {
          method: 'POST',
          path: '/api/bids',
          description: 'Place a bid on an auction',
          parameters: ['auctionId: string', 'amount: number'],
          response: 'Bid',
          example: `fetch('/api/bids', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    auctionId: '123',
    amount: 15000
  })
})`
        },
        {
          method: 'GET',
          path: '/api/auctions/:id/bids',
          description: 'Get all bids for an auction',
          parameters: ['id: string'],
          response: 'Bid[]',
          example: `fetch('/api/auctions/123/bids', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(res => res.json())`
        }
      ]
    },
    {
      category: 'Wallet',
      endpoints: [
        {
          method: 'GET',
          path: '/api/wallet/balance',
          description: 'Get user wallet balance',
          parameters: [],
          response: '{ balance: number, currency: string }',
          example: `fetch('/api/wallet/balance', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
  .then(res => res.json())`
        },
        {
          method: 'POST',
          path: '/api/wallet/add',
          description: 'Add funds to wallet',
          parameters: ['amount: number'],
          response: '{ success: boolean, newBalance: number }',
          example: `fetch('/api/wallet/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ amount: 5000 })
})`
        }
      ]
    }
  ];

  const auctionTypes = [
    {
      type: 'standard',
      title: 'Standard Auction',
      description: 'Traditional auction where highest bid wins',
      rules: ['Higher bids win', 'Fixed bid increment', 'Time-based ending']
    },
    {
      type: 'reserve',
      title: 'Reserve Auction',
      description: 'Auction with minimum price guarantee',
      rules: ['Item won\'t sell below reserve price', 'Reserve price hidden until bidding starts', 'Standard bidding rules apply']
    },
    {
      type: 'dutch',
      title: 'Dutch Auction',
      description: 'Price decreases over time until someone bids',
      rules: ['Price starts high and decreases', 'First bidder at current price wins', 'Price updates automatically']
    },
    {
      type: 'tender',
      title: 'Tender Auction',
      description: 'Lowest bid wins (reverse auction)',
      rules: ['Lower bids win', 'Maximum bid limit may apply', 'Best value selection']
    }
  ];

  return (
    <PageFrame title="API Documentation" description="Complete API reference for QuickMela platform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center mb-6"
          >
            <Code className="h-12 w-12 text-indigo-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
          </motion.div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Complete API reference for integrating with QuickMela's auction platform.
            Build powerful applications and automate auction processes.
          </p>
        </div>

        {/* Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center mb-6">
            <Zap className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Start</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Authentication</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-gray-600 dark:text-gray-400 mb-2">// Get API token</div>
                <div className="text-blue-600">POST /api/auth/login</div>
                <div className="text-gray-500 mt-2">Authorization: Bearer YOUR_TOKEN</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Base URL</h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-green-600">https://api.quickmela.com</div>
                <div className="text-gray-500 mt-2">All API endpoints are relative to this URL</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Auction Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
            <Book className="h-8 w-8 text-indigo-600 mr-3" />
            Auction Types
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctionTypes.map((auctionType, index) => (
              <motion.div
                key={auctionType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    auctionType.type === 'standard' ? 'bg-blue-500' :
                    auctionType.type === 'reserve' ? 'bg-purple-500' :
                    auctionType.type === 'dutch' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}></div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{auctionType.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{auctionType.description}</p>
                <ul className="space-y-2">
                  {auctionType.rules.map((rule, ruleIndex) => (
                    <li key={ruleIndex} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* API Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
            <Globe className="h-8 w-8 text-indigo-600 mr-3" />
            API Endpoints
          </h2>

          {apiEndpoints.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + categoryIndex * 0.1 }}
              className="mb-12"
            >
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Shield className="h-6 w-6 text-indigo-600 mr-3" />
                {category.category}
              </h3>

              <div className="space-y-6">
                {category.endpoints.map((endpoint, endpointIndex) => (
                  <div key={endpointIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Endpoint Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-lg font-mono text-gray-900 dark:text-white">{endpoint.path}</code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(endpoint.path, `${category.category}-${endpointIndex}`)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {copiedEndpoint === `${category.category}-${endpointIndex}` ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">{endpoint.description}</p>
                    </div>

                    {/* Parameters */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Parameters</h4>
                      <div className="flex flex-wrap gap-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <code key={paramIndex} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                            {param}
                          </code>
                        ))}
                      </div>
                    </div>

                    {/* Response */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
                      <code className="block p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm">
                        {endpoint.response}
                      </code>
                    </div>

                    {/* Example */}
                    <div className="p-6">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Example</h4>
                      <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm">
                        <code>{endpoint.example}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* SDKs & Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center mb-6">
            <Download className="h-8 w-8 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SDKs & Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Code className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">JavaScript SDK</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Official JavaScript SDK for easy integration</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Play className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Explorer</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Interactive API testing tool</p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Explorer
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Book className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documentation</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Complete developer guides and tutorials</p>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                <Book className="h-4 w-4 mr-2" />
                View Docs
              </button>
            </div>
          </div>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
        >
          <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our developer community for support, share your integrations, and get help from fellow developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Join Developer Community
            </button>
            <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </PageFrame>
  );
};

export default APIDocumentation;