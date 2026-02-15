// src/components/trust/KYCProgressTracker.tsx
import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Camera, FileText, Shield, User } from 'lucide-react';

interface KYCProgressTrackerProps {
  status: 'not_started' | 'pending' | 'under_review' | 'verified' | 'rejected';
  completionPercentage: number;
  steps: Array<{
    name: string;
    status: 'pending' | 'completed' | 'rejected' | 'in_progress';
    description?: string;
    actionRequired?: boolean;
  }>;
  nextAction?: {
    title: string;
    description: string;
    action: () => void;
  };
  onComplete?: () => void;
  onViewStatus?: () => void;
  className?: string;
}

const KYCProgressTracker: React.FC<KYCProgressTrackerProps> = ({
  status,
  completionPercentage,
  steps,
  nextAction,
  onComplete,
  onViewStatus,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    not_started: {
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: Clock,
      title: 'KYC Not Started',
      message: 'Complete your verification to unlock full features',
    },
    pending: {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Clock,
      title: 'KYC In Progress',
      message: 'Your verification is being processed',
    },
    under_review: {
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: AlertCircle,
      title: 'Under Review',
      message: 'Our team is reviewing your documents',
    },
    verified: {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      title: 'KYC Verified',
      message: 'Your identity has been verified successfully',
    },
    rejected: {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertCircle,
      title: 'KYC Rejected',
      message: 'Please review and resubmit your documents',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const getStepIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return CheckCircle;
      case 'in_progress':
        return Clock;
      case 'rejected':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-6 w-6 ${config.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              <p className="text-sm text-gray-600">{config.message}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                status === 'verified' ? 'bg-green-500' :
                status === 'rejected' ? 'bg-red-500' :
                status === 'under_review' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Steps Overview */}
        <div className="space-y-3 mb-6">
          {steps.slice(0, expanded ? undefined : 3).map((step, index) => {
            const StepIcon = getStepIcon(step.status);
            const stepColor = getStepColor(step.status);

            return (
              <div key={index} className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${stepColor}`}>
                  <StepIcon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status.replace('_', ' ')}
                    </span>
                  </div>

                  {step.description && (
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  )}

                  {step.actionRequired && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                        Action Required
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Expand/Collapse */}
        {steps.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? 'Show Less' : `Show ${steps.length - 3} More Steps`}
          </button>
        )}

        {/* Next Action */}
        {nextAction && (
          <div className={`mt-6 p-4 rounded-lg ${
            nextAction.title.includes('Complete') ? 'bg-blue-50 border border-blue-200' :
            nextAction.title.includes('Review') ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <h4 className="font-medium text-gray-900 mb-1">{nextAction.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{nextAction.description}</p>
            <button
              onClick={nextAction.action}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              {nextAction.title.includes('Complete') ? 'Start Verification' :
               nextAction.title.includes('Review') ? 'Review Documents' :
               'Take Action'}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          {status !== 'verified' && onComplete && (
            <button
              onClick={onComplete}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              {status === 'not_started' ? 'Start KYC' :
               status === 'pending' ? 'Continue Verification' :
               'Update Documents'}
            </button>
          )}

          {onViewStatus && (
            <button
              onClick={onViewStatus}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCProgressTracker;
