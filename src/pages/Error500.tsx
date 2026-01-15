import React from 'react';

const Error500: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">500 - Server Error</h1>
        <p className="text-gray-600 mb-4">We are working to fix this. Please try again later.</p>
        <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded">Back to Home</a>
      </div>
    </div>
  );
};

export default Error500;
