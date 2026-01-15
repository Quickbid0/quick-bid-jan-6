import React, { useState } from 'react';
import { Code, Book, Key, Globe, Database, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const APIDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('authentication');

  const endpoints = {
    authentication: {
      title: 'Authentication',
      description: 'User authentication and session management',
      methods: [
        {
          method: 'POST',
          endpoint: '/api/auth/login',
          description: 'User login',
          request: `{
  "email": "user@example.com",
  "password": "password123"
}`,
          response: `{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user"
  }
}`
        }
      ]
    },
    auctions: {
      title: 'Auctions',
      description: 'Auction management and bidding',
      methods: [
        {
          method: 'GET',
          endpoint: '/api/auctions',
          description: 'Get all active auctions',
          response: `{
  "auctions": [
    {
      "id": "auction_id",
      "title": "Vintage Watch",
      "current_price": 25000,
      "end_time": "2024-02-01T10:00:00Z"
    }
  ]
}`
        }
      ]
    },
    products: {
      title: 'Products',
      description: 'Product listing and management',
      methods: [
        {
          method: 'POST',
          endpoint: '/api/products',
          description: 'Create new product listing',
          request: `{
  "title": "Product Title",
  "description": "Product description",
  "starting_price": 1000,
  "category": "Electronics"
}`
        }
      ]
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Code className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          API Documentation
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Integrate QuickBid into your applications with our RESTful API
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold mb-4">Endpoints</h3>
            <nav className="space-y-2">
              {Object.entries(endpoints).map(([key, endpoint]) => (
                <button
                  key={key}
                  onClick={() => setSelectedEndpoint(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedEndpoint === key
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {endpoint.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-2">{endpoints[selectedEndpoint].title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {endpoints[selectedEndpoint].description}
            </p>

            {endpoints[selectedEndpoint].methods.map((method, index) => (
              <div key={index} className="mb-8 border-b pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    method.method === 'GET' ? 'bg-green-100 text-green-800' :
                    method.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    method.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {method.method}
                  </span>
                  <code className="text-lg font-mono">{method.endpoint}</code>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{method.description}</p>

                {method.request && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Request Body:</h4>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                      <code>{method.request}</code>
                    </pre>
                  </div>
                )}

                {method.response && (
                  <div>
                    <h4 className="font-semibold mb-2">Response:</h4>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                      <code>{method.response}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Key className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">1. Get API Key</h3>
            <p className="text-sm text-gray-600">Register and get your API key from the developer dashboard</p>
          </div>
          <div className="text-center">
            <Book className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">2. Read Documentation</h3>
            <p className="text-sm text-gray-600">Explore our comprehensive API documentation</p>
          </div>
          <div className="text-center">
            <Globe className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">3. Start Building</h3>
            <p className="text-sm text-gray-600">Integrate QuickBid into your applications</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocumentation;