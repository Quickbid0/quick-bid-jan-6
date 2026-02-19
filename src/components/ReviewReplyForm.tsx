import React, { useState } from 'react';
import { Send, Loader2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReviewReplyFormProps {
  reviewId: string;
  sellerId: string;
  reviewerName: string;
  reviewRating: number;
  reviewComment: string;
  onReplySubmitted?: () => void;
  isLoading?: boolean;
}

export const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({
  reviewId,
  sellerId,
  reviewerName,
  reviewRating,
  reviewComment,
  onReplySubmitted,
  isLoading: externalIsLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/review/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId,
          comment: replyText,
          isPublic,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setReplyText('');
        toast.success('Reply posted successfully!');
        setTimeout(() => {
          setIsExpanded(false);
          setSubmitted(false);
          onReplySubmitted?.();
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to post reply');
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Error posting reply');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Check className="w-5 h-5 text-green-600" />
        <p className="text-sm text-green-800">Your reply has been posted!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Review Context */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{reviewerName}</h4>
            <div className="mt-1">{getRatingStars(reviewRating)}</div>
          </div>
        </div>
        <p className="text-sm text-gray-600">{reviewComment}</p>
      </div>

      {/* Reply Section */}
      <div className="p-4">
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full px-4 py-2 text-left text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            Reply to this review
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Reply Text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Share your thoughts or address the customer's concern..."
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {replyText.length}/500 characters
              </p>
            </div>

            {/* Visibility Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Post reply publicly (visible to all buyers)
              </span>
            </label>
            {!isPublic && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                📧 Private reply - Only visible to the reviewer
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || externalIsLoading || !replyText.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {isLoading || externalIsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Reply
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setReplyText('');
                  setIsPublic(true);
                }}
                disabled={isLoading || externalIsLoading}
                className="px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>

            {/* Helpful Tips */}
            <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded mt-3 space-y-1">
              <p className="font-semibold">💡 Tips for a great reply:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Be professional and courteous</li>
                <li>Address the customer's specific concern</li>
                <li>Offer solutions or next steps if applicable</li>
                <li>Keep replies concise and clear</li>
              </ul>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
