// src/components/bulk-upload/steps/ProcessingStep.tsx
import React from 'react';
import {
  Loader,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface ProcessingStepProps {
  processing: {
    isProcessing: boolean;
    currentStage: string;
    progress: number;
    estimatedTimeRemaining: number;
  };
  onCancel: () => void;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
  processing,
  onCancel,
}) => {
  const processingStages = [
    {
      id: 'file_validation',
      name: 'File Validation',
      description: 'Validating file formats and basic structure',
      estimatedDuration: 10,
    },
    {
      id: 'data_extraction',
      name: 'Data Extraction',
      description: 'Reading and parsing data from files',
      estimatedDuration: 20,
    },
    {
      id: 'schema_validation',
      name: 'Schema Validation',
      description: 'Validating data types and required fields',
      estimatedDuration: 15,
    },
    {
      id: 'business_rule_validation',
      name: 'Business Rules',
      description: 'Applying business logic and constraints',
      estimatedDuration: 10,
    },
    {
      id: 'duplicate_detection',
      name: 'Duplicate Detection',
      description: 'Identifying and handling duplicate records',
      estimatedDuration: 8,
    },
    {
      id: 'ai_enrichment',
      name: 'AI Enrichment',
      description: 'Enhancing data with AI-powered insights',
      estimatedDuration: 12,
    },
    {
      id: 'product_creation',
      name: 'Product Creation',
      description: 'Creating product records in the system',
      estimatedDuration: 25,
    },
    {
      id: 'auction_setup',
      name: 'Auction Setup',
      description: 'Setting up auctions for created products',
      estimatedDuration: 18,
    },
    {
      id: 'notification_dispatch',
      name: 'Notifications',
      description: 'Sending notifications and alerts',
      estimatedDuration: 5,
    },
    {
      id: 'completion',
      name: 'Finalization',
      description: 'Completing the import process',
      estimatedDuration: 3,
    },
  ];

  const getStageStatus = (stageId: string) => {
    const currentIndex = processingStages.findIndex(s => s.id === processing.currentStage);
    const stageIndex = processingStages.findIndex(s => s.id === stageId);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'processing';
    return 'pending';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Processing Your Data
        </h3>
        <p className="text-gray-600">
          Importing and validating your vehicle data...
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">Overall Progress</h4>
            <p className="text-sm text-gray-600">
              {processing.currentStage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{processing.progress}%</div>
            {processing.estimatedTimeRemaining > 0 && (
              <div className="text-sm text-gray-500">
                {formatTime(processing.estimatedTimeRemaining)} remaining
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${processing.progress}%` }}
          />
        </div>

        {/* Current Stage Indicator */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader className="h-5 w-5 text-blue-600 animate-spin" />
          <div>
            <div className="font-medium text-blue-900">
              {processingStages.find(s => s.id === processing.currentStage)?.name}
            </div>
            <div className="text-sm text-blue-700">
              {processingStages.find(s => s.id === processing.currentStage)?.description}
            </div>
          </div>
        </div>
      </div>

      {/* Processing Pipeline */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900">Processing Pipeline</h4>
          <p className="text-sm text-gray-600 mt-1">
            Following our secure multi-stage import process
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {processingStages.map((stage, index) => {
            const status = getStageStatus(stage.id);
            const isLast = index === processingStages.length - 1;

            return (
              <ProcessingStageItem
                key={stage.id}
                stage={stage}
                status={status}
                isLast={isLast}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          This process cannot be interrupted once started. Please wait for completion.
        </div>

        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel Import
        </button>
      </div>
    </div>
  );
};

// Processing Stage Item Component
interface ProcessingStageItemProps {
  stage: {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
  };
  status: 'pending' | 'processing' | 'completed';
  isLast: boolean;
}

const ProcessingStageItem: React.FC<ProcessingStageItemProps> = ({
  stage,
  status,
  isLast,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-900 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-900 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-900 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      <div
        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getStatusColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-gray-900">{stage.name}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  status === 'completed' ? 'bg-green-100 text-green-800' :
                  status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{stage.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              ~{stage.estimatedDuration}s
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 bg-gray-25">
          <div className="pt-3 border-t border-gray-200 mt-4">
            <div className="text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Estimated Duration:</span>
                  <span className="ml-2">{stage.estimatedDuration} seconds</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <span className="ml-2 capitalize">{status}</span>
                </div>
              </div>

              {status === 'processing' && (
                <div className="mt-3">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    Currently processing this stage...
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {status === 'completed' && (
                <div className="mt-3 text-sm text-green-600 font-medium">
                  ✓ This stage has been completed successfully
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isLast && <div className="w-px h-4 bg-gray-200 ml-7" />}
    </div>
  );
};

export default ProcessingStep;
