// src/components/bulk-upload/BulkUploadWizard.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  File,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  RefreshCw,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface BulkUploadWizardProps {
  onComplete: (results: any) => void;
  onCancel: () => void;
  companyId: string;
  maxFileSize?: number; // MB
  maxFiles?: number;
  supportedFormats?: string[];
}

type WizardStep = 'upload' | 'validation' | 'processing' | 'review' | 'complete';

interface UploadState {
  files: File[];
  validation: {
    isValidating: boolean;
    errors: any[];
    warnings: any[];
    suggestions: any[];
  };
  processing: {
    isProcessing: boolean;
    currentStage: string;
    progress: number;
    estimatedTimeRemaining: number;
  };
  results: {
    successfulUploads: number;
    failedUploads: number;
    createdProducts: any[];
    createdAuctions: any[];
  };
}

const BulkUploadWizard: React.FC<BulkUploadWizardProps> = ({
  onComplete,
  onCancel,
  companyId,
  maxFileSize = 50,
  maxFiles = 10,
  supportedFormats = ['.csv', '.xlsx', '.xls'],
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [uploadState, setUploadState] = useState<UploadState>({
    files: [],
    validation: {
      isValidating: false,
      errors: [],
      warnings: [],
      suggestions: [],
    },
    processing: {
      isProcessing: false,
      currentStage: 'idle',
      progress: 0,
      estimatedTimeRemaining: 0,
    },
    results: {
      successfulUploads: 0,
      failedUploads: 0,
      createdProducts: [],
      createdAuctions: [],
    },
  });

  const wizardSteps: Array<{ id: WizardStep; name: string; description: string }> = [
    { id: 'upload', name: 'Upload Files', description: 'Select and upload your data files' },
    { id: 'validation', name: 'Validate Data', description: 'Review and fix any data issues' },
    { id: 'processing', name: 'Process Data', description: 'Import and create products/auctions' },
    { id: 'review', name: 'Review Results', description: 'Check import results and make adjustments' },
    { id: 'complete', name: 'Complete', description: 'Import completed successfully' },
  ];

  const handleFilesSelected = useCallback((files: File[]) => {
    setUploadState(prev => ({
      ...prev,
      files: [...prev.files, ...files].slice(0, maxFiles),
    }));
  }, [maxFiles]);

  const startUpload = async () => {
    if (uploadState.files.length === 0) return;

    setCurrentStep('validation');

    // Simulate validation process
    setUploadState(prev => ({
      ...prev,
      validation: { ...prev.validation, isValidating: true },
    }));

    // Mock validation results
    setTimeout(() => {
      setUploadState(prev => ({
        ...prev,
        validation: {
          isValidating: false,
          errors: [
            { row: 5, field: 'price', value: 'invalid', error: 'Invalid price format' },
            { row: 12, field: 'year', value: '2025', error: 'Future year not allowed' },
          ],
          warnings: [
            { row: 8, field: 'mileage', message: 'Mileage seems high for vehicle age' },
          ],
          suggestions: [
            { row: 3, field: 'price', originalValue: 500000, suggestedValue: 550000, confidence: 0.85 },
          ],
        },
      }));
    }, 2000);
  };

  const startProcessing = () => {
    setCurrentStep('processing');

    setUploadState(prev => ({
      ...prev,
      processing: { ...prev.processing, isProcessing: true },
    }));

    // Simulate processing stages
    const stages = [
      { stage: 'file_validation', duration: 1000 },
      { stage: 'data_extraction', duration: 2000 },
      { stage: 'schema_validation', duration: 1500 },
      { stage: 'business_rule_validation', duration: 1000 },
      { stage: 'duplicate_detection', duration: 800 },
      { stage: 'ai_enrichment', duration: 1200 },
      { stage: 'product_creation', duration: 2500 },
      { stage: 'auction_setup', duration: 1800 },
      { stage: 'notification_dispatch', duration: 500 },
      { stage: 'completion', duration: 300 },
    ];

    let totalProgress = 0;

    stages.forEach((stage, index) => {
      setTimeout(() => {
        totalProgress += (1 / stages.length) * 100;
        setUploadState(prev => ({
          ...prev,
          processing: {
            ...prev.processing,
            currentStage: stage.stage,
            progress: Math.round(totalProgress),
            estimatedTimeRemaining: (stages.length - index - 1) * 1.5, // Rough estimate
          },
        }));

        if (index === stages.length - 1) {
          // Complete processing
          setUploadState(prev => ({
            ...prev,
            processing: { ...prev.processing, isProcessing: false },
            results: {
              successfulUploads: 48,
              failedUploads: 2,
              createdProducts: Array(48).fill(null).map((_, i) => ({ id: `prod_${i}`, title: `Product ${i}` })),
              createdAuctions: Array(48).fill(null).map((_, i) => ({ id: `auction_${i}`, productId: `prod_${i}` })),
            },
          }));
          setCurrentStep('review');
        }
      }, stages.slice(0, index + 1).reduce((sum, s) => sum + s.duration, 0));
    });
  };

  const finalizeUpload = () => {
    setCurrentStep('complete');
    onComplete(uploadState.results);
  };

  const canProceedFromValidation = uploadState.validation.errors.length === 0;
  const canProceedFromReview = true; // Assume user can always proceed after review

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Wizard</h2>
            <p className="text-gray-600 mt-1">
              Import vehicle data and create auctions in bulk
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = wizardSteps.findIndex(s => s.id === currentStep) > index;
              const isAccessible = index <= wizardSteps.findIndex(s => s.id === currentStep);

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    isAccessible ? 'bg-gray-300 text-gray-600' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>

                  <div className={`ml-3 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className="text-sm font-medium">{step.name}</div>
                    {isActive && <div className="text-xs">{step.description}</div>}
                  </div>

                  {index < wizardSteps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'upload' && (
            <FileSelectionStep
              files={uploadState.files}
              onFilesSelected={handleFilesSelected}
              maxFiles={maxFiles}
              maxFileSize={maxFileSize}
              supportedFormats={supportedFormats}
            />
          )}

          {currentStep === 'validation' && (
            <ValidationStep
              validation={uploadState.validation}
              onRetry={() => startUpload()}
              onSkipToProcessing={startProcessing}
            />
          )}

          {currentStep === 'processing' && (
            <ProcessingStep
              processing={uploadState.processing}
              onCancel={onCancel}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              results={uploadState.results}
              onApprove={finalizeUpload}
              onEdit={() => setCurrentStep('validation')}
              onBack={() => setCurrentStep('processing')}
            />
          )}

          {currentStep === 'complete' && (
            <CompletionStep
              results={uploadState.results}
              onUploadMore={() => {
                setUploadState({
                  files: [],
                  validation: { isValidating: false, errors: [], warnings: [], suggestions: [] },
                  processing: { isProcessing: false, currentStage: 'idle', progress: 0, estimatedTimeRemaining: 0 },
                  results: { successfulUploads: 0, failedUploads: 0, createdProducts: [], createdAuctions: [] },
                });
                setCurrentStep('upload');
              }}
              onClose={onCancel}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Step {wizardSteps.findIndex(s => s.id === currentStep) + 1} of {wizardSteps.length}
          </div>

          <div className="flex gap-3">
            {currentStep !== 'upload' && (
              <button
                onClick={() => {
                  const currentIndex = wizardSteps.findIndex(s => s.id === currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(wizardSteps[currentIndex - 1].id);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {currentStep === 'upload' && (
              <button
                onClick={startUpload}
                disabled={uploadState.files.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Start Upload
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === 'validation' && (
              <>
                <button
                  onClick={startProcessing}
                  disabled={!canProceedFromValidation}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Continue Processing
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {currentStep === 'review' && (
              <button
                onClick={finalizeUpload}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Complete Import
                <CheckCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadWizard;
