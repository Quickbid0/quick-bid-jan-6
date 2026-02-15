// src/components/trust/EscrowIndicator.tsx
import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface EscrowIndicatorProps {
  escrowId: string;
  amount: number;
  status: 'held' | 'released' | 'disputed' | 'cancelled';
  timeline: Array<{
    id: string;
    eventType: 'created' | 'held' | 'delivery_confirmed' | 'released' | 'disputed';
    title: string;
    description: string;
    timestamp: Date;
  }>;
  progressPercentage: number;
  estimatedCompletion?: Date;
  nextAction?: {
    title: string;
    description: string;
    deadline?: Date;
    actionType: 'confirm_delivery' | 'await_release' | 'resolve_dispute' | 'contact_support';
  };
  onAction?: (actionType: string, escrowId: string) => void;
  onViewTimeline?: (escrowId: string) => void;
  showDetails?: boolean;
  className?: string;
}

const EscrowIndicator: React.FC<EscrowIndicatorProps> = ({
  escrowId,
  amount,
  status,
  timeline,
  progressPercentage,
  estimatedCompletion,
  nextAction,
  onAction,
  onViewTimeline,
  showDetails = false,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(showDetails);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Calculate time left for deadlines
  useEffect(() => {
    if (nextAction?.deadline) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const deadline = nextAction.deadline!.getTime();
        const remaining = Math.max(0, deadline - now);
        setTimeLeft(Math.floor(remaining / (1000 * 60 * 60 * 24))); // days
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [nextAction?.deadline]);

  const statusConfig = {
    held: {
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Shield,
      title: 'Funds Secured',
      description: 'Your payment is safely held in escrow',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    released: {
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      title: 'Funds Released',
      description: 'Transaction completed successfully',
      badgeColor: 'bg-green-100 text-green-800',
    },
    disputed: {
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: AlertTriangle,
      title: 'Under Review',
      description: 'Dispute resolution in progress',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    cancelled: {
      color: 'gray',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: Clock,
      title: 'Escrow Cancelled',
      description: 'Escrow has been cancelled',
      badgeColor: 'bg-gray-100 text-gray-800',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getProgressColor = () => {
    if (status === 'released') return 'bg-green-500';
    if (status === 'disputed') return 'bg-yellow-500';
    if (progressPercentage < 50) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <Icon className={`h-6 w-6 text-${config.color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(amount)}
            </div>
            <div className="text-sm text-gray-500">Escrow Amount</div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.badgeColor}`}>
            <Icon className="h-4 w-4 mr-2" />
            {config.title}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Transaction Progress</span>
            <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {estimatedCompletion && status !== 'released' && (
            <p className="text-xs text-gray-500 mt-2">
              Estimated completion: {formatDate(estimatedCompletion)}
            </p>
          )}
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className={`mb-6 p-4 rounded-lg ${
            nextAction.actionType === 'confirm_delivery' ? 'bg-green-50 border border-green-200' :
            nextAction.actionType === 'await_release' ? 'bg-blue-50 border border-blue-200' :
            nextAction.actionType === 'resolve_dispute' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{nextAction.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{nextAction.description}</p>

                {nextAction.deadline && timeLeft !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className={`text-sm ${
                      timeLeft <= 1 ? 'text-red-600 font-medium' :
                      timeLeft <= 3 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {timeLeft === 0 ? 'Overdue' :
                       timeLeft === 1 ? '1 day left' :
                       `${timeLeft} days left`}
                    </span>
                  </div>
                )}
              </div>

              {onAction && (
                <button
                  onClick={() => onAction(nextAction.actionType, escrowId)}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                >
                  {nextAction.actionType === 'confirm_delivery' ? 'Confirm Delivery' :
                   nextAction.actionType === 'await_release' ? 'View Status' :
                   nextAction.actionType === 'resolve_dispute' ? 'View Dispute' :
                   'Take Action'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timeline Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {expanded ? 'Hide' : 'View'} Timeline
          </button>

          {onViewTimeline && (
            <button
              onClick={() => onViewTimeline(escrowId)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              View Full Details
            </button>
          )}
        </div>
      </div>

      {/* Expanded Timeline */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6">
            <h4 className="font-medium text-gray-900 mb-4">Escrow Timeline</h4>

            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      event.eventType === 'released' ? 'bg-green-500' :
                      event.eventType === 'disputed' ? 'bg-yellow-500' :
                      event.eventType === 'created' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`} />
                    {index < timeline.length - 1 && (
                      <div className="w-px h-8 bg-gray-300 mt-3 ml-1.5" />
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {timeline.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No timeline events yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowIndicator;
