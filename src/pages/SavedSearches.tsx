import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  BellOff, 
  Trash2, 
  Edit, 
  Calendar,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Plus
} from 'lucide-react';

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    category?: string;
    priceRange?: { min: number; max: number };
    location?: string;
    condition?: string;
    yearRange?: { min: number; max: number };
  };
  isActive: boolean;
  frequency: 'instant' | 'daily' | 'weekly';
  lastRun?: string;
  newResults: number;
  totalResults: number;
  createdAt: string;
}

export default function SavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Simulate loading saved searches
    setTimeout(() => {
      const mockSearches: SavedSearch[] = [
        {
          id: '1',
          name: 'SUVs under 10L',
          query: 'SUV',
          filters: {
            category: 'SUV',
            priceRange: { min: 0, max: 1000000 },
            condition: 'used'
          },
          isActive: true,
          frequency: 'daily',
          lastRun: '2024-01-20T08:00:00Z',
          newResults: 3,
          totalResults: 47,
          createdAt: '2024-01-10'
        },
        {
          id: '2',
          name: 'Mahindra Vehicles in Mumbai',
          query: 'Mahindra',
          filters: {
            location: 'Mumbai',
            yearRange: { min: 2020, max: 2024 }
          },
          isActive: true,
          frequency: 'instant',
          lastRun: '2024-01-20T14:30:00Z',
          newResults: 1,
          totalResults: 12,
          createdAt: '2024-01-08'
        },
        {
          id: '3',
          name: 'Commercial Trucks',
          query: 'Truck',
          filters: {
            category: 'Commercial',
            priceRange: { min: 500000, max: 2000000 }
          },
          isActive: false,
          frequency: 'weekly',
          lastRun: '2024-01-15T09:00:00Z',
          newResults: 0,
          totalResults: 23,
          createdAt: '2024-01-05'
        }
      ];

      setSavedSearches(mockSearches);
      setLoading(false);
    }, 1000);
  }, []);

  const getFrequencyColor = (frequency: SavedSearch['frequency']) => {
    switch (frequency) {
      case 'instant': return 'bg-green-100 text-green-800';
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyIcon = (frequency: SavedSearch['frequency']) => {
    switch (frequency) {
      case 'instant': return <Bell className="w-4 h-4" />;
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Clock className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const toggleSearchStatus = (id: string) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === id ? { ...search, isActive: !search.isActive } : search
      )
    );
  };

  const deleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Search className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your saved searches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Saved Searches</h1>
                <p className="text-gray-600 mt-1">Manage your automated search alerts</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Search Alert
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              </div>
              <Search className="w-8 h-8 text-indigo-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.filter(s => s.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">New Results</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.reduce((sum, s) => sum + s.newResults, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Matches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.reduce((sum, s) => sum + s.totalResults, 0)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </motion.div>
        </div>

        {/* Saved Searches List */}
        <div className="space-y-6">
          {savedSearches.map((search, index) => (
            <motion.div
              key={search.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{search.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getFrequencyColor(search.frequency)}`}>
                      {getFrequencyIcon(search.frequency)}
                      <span className="ml-1 capitalize">{search.frequency}</span>
                    </span>
                    {search.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        <BellOff className="w-3 h-3 mr-1" />
                        Paused
                      </span>
                    )}
                  </div>

                  <div className="text-gray-600 mb-3">
                    <p className="text-sm">Query: <span className="font-medium">"{search.query}"</span></p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {search.filters.category && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Category: {search.filters.category}
                        </span>
                      )}
                      {search.filters.priceRange && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Price: ₹{search.filters.priceRange.min.toLocaleString()} - ₹{search.filters.priceRange.max.toLocaleString()}
                        </span>
                      )}
                      {search.filters.location && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Location: {search.filters.location}
                        </span>
                      )}
                      {search.filters.yearRange && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Year: {search.filters.yearRange.min} - {search.filters.yearRange.max}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{search.totalResults} total results</span>
                      {search.newResults > 0 && (
                        <span className="text-green-600 font-medium">
                          {search.newResults} new results
                        </span>
                      )}
                      <span>Created {new Date(search.createdAt).toLocaleDateString()}</span>
                      {search.lastRun && (
                        <span>Last run {new Date(search.lastRun).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/advanced-search?saved=${search.id}`}
                        className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Results
                      </Link>
                      <button
                        onClick={() => toggleSearchStatus(search.id)}
                        className={`inline-flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
                          search.isActive 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {search.isActive ? (
                          <>
                            <BellOff className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 mr-1" />
                            Resume
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteSearch(search.id)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {savedSearches.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved searches yet</h3>
            <p className="text-gray-600 mb-6">Create your first saved search to get notified about new listings</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Saved Search
            </button>
          </div>
        )}
      </div>

      {/* Create Search Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Saved Search</h3>
            <p className="text-gray-600 mb-4">
              Save your search criteria to get notified when new matching auctions are listed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Link
                to="/advanced-search"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go to Advanced Search
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
