import React from 'react';

const AutoBidSettings: React.FC = () => {
  return (
    <div className="auto-bid-settings border rounded-lg p-6 bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Auto Bidding Preferences</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Bid Limit
          </label>
          <input
            type="number"
            placeholder="Set your maximum bid amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled
          />
          <p className="mt-1 text-xs text-gray-500">Configure auto-bidding limits</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bid Increment Strategy
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled>
            <option>Conservative</option>
            <option>Standard</option>
            <option>Aggressive</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">Choose how aggressively to bid</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <input type="checkbox" className="mr-2" disabled />
            Enable AI-Powered Recommendations
          </label>
          <p className="text-xs text-gray-500">Let AI suggest optimal bid amounts based on market trends</p>
        </div>
      </div>

      <button
        disabled
        className="mt-6 w-full px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
      >
        Save Settings
      </button>
    </div>
  );
};

export default AutoBidSettings;
