// Beta User Request Form Component
import React, { useState } from 'react';
import { BetaUserService, BetaUserRequest } from '../services/betaUserService';

interface BetaRequestFormProps {
  onSuccess?: (request: BetaUserRequest) => void;
  className?: string;
}

export const BetaRequestForm: React.FC<BetaRequestFormProps> = ({
  onSuccess,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    requestedRole: 'buyer' as 'buyer' | 'seller',
    requestReason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const request = await BetaUserService.requestBetaAccess(
        formData.email,
        formData.name,
        formData.requestedRole,
        formData.requestReason
      );

      setSuccess(true);
      onSuccess?.(request);
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        requestedRole: 'buyer',
        requestReason: ''
      });
    } catch (err) {
      setError('Failed to submit beta request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-green-600 mb-2">
            <svg className="h-12 w-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-green-800 mb-2">
            Beta Request Submitted!
          </h3>
          <p className="text-green-700">
            We'll review your request and get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          Request Beta Access
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Join our closed beta and help shape QuickMela's future.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="requestedRole" className="block text-sm font-medium text-gray-700 mb-2">
            I want to join as: *
          </label>
          <select
            id="requestedRole"
            name="requestedRole"
            value={formData.requestedRole}
            onChange={handleInputChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="buyer">Beta Buyer</option>
            <option value="seller">Beta Seller</option>
          </select>
        </div>

        <div>
          <label htmlFor="requestReason" className="block text-sm font-medium text-gray-700 mb-2">
            Why do you want to join the beta? *
          </label>
          <textarea
            id="requestReason"
            name="requestReason"
            value={formData.requestReason}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us why you're interested in joining our beta program..."
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Beta Program Details:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Limited to 20 beta users initially</li>
            <li>• No real money involved (sandbox mode)</li>
            <li>• Full access to test real features</li>
            <li>• Direct feedback channel with our team</li>
            <li>• Early access to new features</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {submitting ? 'Submitting...' : 'Request Beta Access'}
        </button>
      </form>
    </div>
  );
};
