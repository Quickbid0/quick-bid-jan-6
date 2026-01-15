import { useState, useEffect } from 'react';
import { aiService, AIRecommendation } from '../services/aiService';

export const useAIRecommendations = (userId: string) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const recs = await aiService.getPersonalizedRecommendations(userId);
      setRecommendations(recs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = () => {
    fetchRecommendations();
  };

  return { recommendations, loading, error, refreshRecommendations };
};