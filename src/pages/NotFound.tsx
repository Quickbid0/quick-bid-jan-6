import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sorry, the page you're looking for doesn't exist or has been moved.
            Don't worry, it happens to the best of us!
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>

          <Link
            to="/buyer/auctions"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-lg ml-4"
          >
            <Search className="h-5 w-5 mr-2" />
            Browse Auctions
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Need help finding something?
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Contact Support
            </Link>
            <Link
              to="/faq"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              FAQ
            </Link>
          </div>
        </div>

        <button
          onClick={() => window.history.back()}
          className="mt-6 inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
