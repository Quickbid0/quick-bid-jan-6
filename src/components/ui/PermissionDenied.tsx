import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PermissionDenied: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-6">
        <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
      </p>
      <Link 
        to="/dashboard" 
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};
