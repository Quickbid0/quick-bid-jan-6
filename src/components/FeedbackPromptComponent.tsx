// Feedback Prompt Component
import React, { useState, useEffect } from 'react';
import { BetaFeedbackService, FeedbackPrompt } from '../services/betaFeedbackService';

interface FeedbackPromptComponentProps {
  prompt: FeedbackPrompt;
  onResponse: (response: string) => void;
  onDismiss: () => void;
}

export const FeedbackPromptComponent: React.FC<FeedbackPromptComponentProps> = ({
  prompt,
  onResponse,
  onDismiss
}) => {
  const [visible, setVisible] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Show prompt after a delay to avoid interrupting user
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (!selectedResponse.trim()) return;

    setSubmitting(true);
    try {
      await BetaFeedbackService.recordFeedback(prompt.id, selectedResponse);
      onResponse(selectedResponse);
      setVisible(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    BetaFeedbackService.markPromptShown(prompt.id);
    onDismiss();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Question
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Dismiss feedback"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-700 mb-4">
          {prompt.question}
        </p>

        {prompt.options ? (
          <div className="space-y-2 mb-4">
            {prompt.options.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`feedback-${prompt.id}`}
                  value={option}
                  checked={selectedResponse === option}
                  onChange={(e) => setSelectedResponse(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            value={selectedResponse}
            onChange={(e) => setSelectedResponse(e.target.value)}
            rows={3}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your thoughts..."
          />
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedResponse.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          This helps us improve QuickMela. Your feedback makes a difference.
        </div>
      </div>
    </div>
  );
};
