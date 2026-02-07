// 🎯 USER FEEDBACK TRIGGER
// src/components/UserFeedbackTrigger.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, AlertTriangle, DollarSign } from 'lucide-react';
import ProductOwnerService from '../services/productOwner.service';

interface UserFeedbackTriggerProps {
  journeyType: 'buyer' | 'seller' | 'admin';
  currentStep: string;
  isVisible: boolean;
  onClose: () => void;
}

const UserFeedbackTrigger: React.FC<UserFeedbackTriggerProps> = ({
  journeyType,
  currentStep,
  isVisible,
  onClose
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const productOwnerService = new ProductOwnerService();

  const feedbackOptions = [
    {
      id: 'confusion',
      label: "I'm confused",
      icon: AlertCircle,
      color: 'orange',
      description: "I don't understand what to do here"
    },
    {
      id: 'trust',
      label: "I don't trust this",
      icon: AlertTriangle,
      color: 'red',
      description: "I'm concerned about safety or security"
    },
    {
      id: 'pricing',
      label: "Pricing concerns",
      icon: DollarSign,
      color: 'blue',
      description: "I have questions about costs or fees"
    }
  ];

  const handleSubmit = async () => {
    if (!selectedOption || !description.trim()) return;

    setIsSubmitting(true);

    try {
      // Record feedback
      await productOwnerService.recordFeedback(
        'anonymous', // Would be actual user ID in production
        journeyType,
        currentStep,
        selectedOption as 'confusion' | 'trust' | 'pricing',
        description.trim()
      );

      // Show thank you message
      setShowThankYou(true);
      
      // Reset form
      setTimeout(() => {
        setSelectedOption('');
        setDescription('');
        setShowThankYou(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              What blocked you just now?
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showThankYou ? (
            <>
              {/* Feedback Options */}
              <div className="space-y-3 mb-4">
                {feedbackOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      selectedOption === option.id
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <option.icon className={`w-5 h-5 text-${option.color}-500`} />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Description */}
              <div className="mb-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about what happened..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption || !description.trim() || isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Skip
                </button>
              </div>
            </>
          ) : (
            /* Thank You Message */
            <div className="text-center py-8">
              <div className="text-green-500 text-4xl mb-2">✓</div>
              <p className="text-gray-700 font-medium">Thank you for your feedback!</p>
              <p className="text-gray-500 text-sm mt-1">This helps us improve QuickBid</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserFeedbackTrigger;
