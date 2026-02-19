import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

interface AIOverlayProps {
  sessionId: string;
  userId: string;
}

const AIOverlay: React.FC<AIOverlayProps> = ({ sessionId, userId }) => {
  const [insights, setInsights] = useState({
    winProbability: 0,
    riskLevel: 'low',
    recommendedBid: 0,
    volatility: 'medium',
    timeRemaining: '2h 15m'
  });

  useEffect(() => {
    socket.on('winProbabilityUpdate', (data) => {
      setInsights(prev => ({ ...prev, ...data }));
    });

    socket.emit('getWinProbability', { sessionId, userId });

    const interval = setInterval(() => {
      socket.emit('getWinProbability', { sessionId, userId });
    }, 3000);

    return () => {
      socket.off('winProbabilityUpdate');
      clearInterval(interval);
    };
  }, [sessionId, userId]);

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg shadow-lg z-10">
      <h3 className="font-bold mb-2">🤖 Live AI Insights</h3>
      <div className="space-y-1 text-sm">
        <p>Win Probability: <span className="font-semibold">{insights.winProbability}%</span></p>
        <p>Risk Level: <span className="font-semibold">{insights.riskLevel}</span></p>
        <p>Volatility: <span className="font-semibold">{insights.volatility}</span></p>
        <p>Recommended Next: <span className="font-semibold">₹{insights.recommendedBid}</span></p>
        <p>Time Remaining: <span className="font-semibold">{insights.timeRemaining}</span></p>
      </div>
    </div>
  );
};

export default AIOverlay;
