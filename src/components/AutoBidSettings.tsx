import React, { useState } from 'react';

const AutoBidSettings: React.FC = () => {
  const [maxAmount, setMaxAmount] = useState(10000);
  const [increment, setIncrement] = useState(100);
  const [winProbabilityThreshold, setWinProbabilityThreshold] = useState(0.45);
  const [fraudRiskThreshold, setFraudRiskThreshold] = useState(0.6);
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    console.log('Saving auto-bid settings', { maxAmount, increment, winProbabilityThreshold, fraudRiskThreshold });
    // TODO: Implement API call to save settings
    setSaving(false);
  };

  return (
    <div className="auto-bid-settings bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Auto-Bid Configuration</h3>
      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Max Bid Amount (₹)</span>
          <input
            type="number"
            value={maxAmount}
            onChange={e => setMaxAmount(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Bid Increment (₹)</span>
          <input
            type="number"
            value={increment}
            onChange={e => setIncrement(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Min Win Probability Threshold</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={winThreshold}
            onChange={e => setWinThreshold(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Max Fraud Risk Threshold</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={fraudThreshold}
            onChange={e => setFraudThreshold(Number(e.target.value))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </label>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AutoBidSettings;
