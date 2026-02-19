import React from 'react';
import AutoBidSettings from '../components/AutoBidSettings';

const AISettings: React.FC = () => {
  return (
    <div className="ai-settings max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AI Intelligence Settings</h1>
      <p className="text-gray-600 mb-6">
        Configure your AI-powered bidding preferences and thresholds for optimal auction performance.
      </p>
      <div className="grid gap-6">
        <AutoBidSettings />
        {/* Future: Add subscription plan selector, fraud alert preferences, etc. */}
      </div>
    </div>
  );
};

export default AISettings;
