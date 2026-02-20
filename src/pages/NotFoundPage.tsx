import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundPageProps {
  message?: string;
}

/**
 * FIX R-08: Branded 404 Page
 * Shows proper 404 instead of infinite loading spinner
 */
const NotFoundPage: React.FC<NotFoundPageProps> = ({
  message = 'Page not found',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center">
        {/* 404 Display */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-2xl font-semibold text-gray-700 mb-2">Oops!</p>
          <p className="text-lg text-gray-600">{message}</p>
        </div>

        {/* Decorative element */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved. Let's get you
          back on track!
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Home
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Support link */}
        <p className="text-sm text-gray-500 mt-8">
          Need help?{' '}
          <Link to="/help" className="text-indigo-600 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
