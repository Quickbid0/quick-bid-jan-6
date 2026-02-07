import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';

const SavedSearchesPage: React.FC = () => {
  // Mock saved searches data
  const savedSearches = [
    { id: '1', query: 'Vintage watches', category: 'Watches', created: '2 days ago' },
    { id: '2', query: 'iPhone 13', category: 'Electronics', created: '1 week ago' },
    { id: '3', query: 'Classic cars', category: 'Vehicles', created: '2 weeks ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
            <p className="text-gray-600 mt-1">Manage your saved search queries</p>
          </div>
          <Link 
            to="/auctions"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            New Search
          </Link>
        </div>

        {/* Saved Searches List */}
        {savedSearches.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="divide-y divide-gray-200">
              {savedSearches.map((search) => (
                <div key={search.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{search.query}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">Category: {search.category}</span>
                        <span className="text-sm text-gray-500">Created: {search.created}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/auctions?q=${encodeURIComponent(search.query)}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Run Search
                      </Link>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved searches</h3>
            <p className="text-gray-600 mb-6">Save your search queries to quickly find items you're interested in</p>
            <Link 
              to="/auctions"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Start Searching
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearchesPage;
