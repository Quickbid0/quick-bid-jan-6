import React, { useState } from 'react';
import { useAI } from '../../context/AIContext';

const AutoBidSettings: React.FC = () => {
  const { settings, setSettings } = useAI();
  const [maxAmount, setMaxAmount] = useState(settings.maxAmount);
  const [increment, setIncrement] = useState(settings.increment);
  const [winThreshold, setWinThreshold] = useState(settings.winProbabilityThreshold);
  const [fraudThreshold, setFraudThreshold] = useState(settings.fraudRiskThreshold);
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    setSettings({
      ...settings,
      maxAmount,
      increment,
      winProbabilityThreshold: winThreshold,
      fraudRiskThreshold: fraudThreshold,
    });

    try {
      const response = await fetch('/api/ai/auto-bid-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxAmount,
          increment,
          winProbabilityThreshold: winThreshold,
          fraudRiskThreshold: fraudThreshold,
        }),
      });
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    }
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
