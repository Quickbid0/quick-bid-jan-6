import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mx-auto mb-6 w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center"
        >
          <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You don't have permission to access this page. Please contact your administrator or login with appropriate credentials.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg"
            >
              <User className="w-5 h-5" />
              Login with Different Account
            </Link>
          </motion.div>

          <div className="flex gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <button
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </motion.div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Need help?</strong> If you believe this is an error, please contact our support team or check your account permissions.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
