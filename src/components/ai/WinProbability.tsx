import React, { useEffect, useState } from 'react';

interface WinProbabilityProps {
  userId: string;
  auctionId: string;
}

const WinProbability: React.FC<WinProbabilityProps> = ({ userId, auctionId }) => {
  const [probability, setProbability] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/win-probability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, auctionId }),
    })
      .then(res => res.json())
      .then(data => {
        setProbability(data.probability);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId, auctionId]);

  if (loading) return <div className="text-center p-4">Loading AI prediction...</div>;

  if (probability === null) return <div className="text-center p-4 text-red-500">Failed to load prediction</div>;

  return (
    <div className="win-probability bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-lg shadow-md border">
      <h3 className="text-xl font-bold text-gray-800 mb-2">AI Win Probability</h3>
      <div className="text-3xl font-extrabold text-indigo-600">
        {(probability * 100).toFixed(1)}%
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Based on your bidding history and auction dynamics
      </p>
    </div>
  );
};

export default WinProbability;
