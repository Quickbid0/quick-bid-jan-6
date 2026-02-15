// src/components/bulk-upload/steps/ValidationStep.tsx
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, ChevronDown, ChevronUp, X, Wrench, Eye, EyeOff } from 'lucide-react';

interface ValidationStepProps {
  validation: {
    isValidating: boolean;
    errors: Array<{
      row: number;
      field: string;
      value: any;
      errorCode: string;
      message: string;
      severity: 'error' | 'warning';
      suggestion?: string;
      aiFix?: {
        suggestedValue: any;
        confidence: number;
        reasoning: string;
      };
    }>;
    warnings: Array<{
      row: number;
      field: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    suggestions: Array<{
      row: number;
      field: string;
      originalValue: any;
      suggestedValue: any;
      confidence: number;
      reasoning: string;
      category: 'pricing' | 'description' | 'validation' | 'optimization';
    }>;
  };
  onRetry: () => void;
  onSkipToProcessing: () => void;
}

const ValidationStep: React.FC<ValidationStepProps> = ({
  validation,
  onRetry,
  onSkipToProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'errors' | 'warnings' | 'suggestions'>('errors');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const canProceed = validation.errors.length === 0;

  if (validation.isValidating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Validating Your Data</h3>
        <p className="text-gray-600 text-center">
          Checking file formats, data types, and business rules...<br />
          This may take a few moments for large files.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'errors', label: 'Errors', count: validation.errors.length, color: 'red' },
    { id: 'warnings', label: 'Warnings', count: validation.warnings.length, color: 'yellow' },
    { id: 'suggestions', label: 'AI Suggestions', count: validation.suggestions.length, color: 'blue' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Data Validation Complete
        </h3>
        <p className="text-gray-600">
          {validation.errors.length > 0
            ? `${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''} found that need${validation.errors.length === 1 ? 's' : ''} to be fixed`
            : 'Your data looks good! Ready to proceed with processing.'
          }
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard
          title="Total Records"
          value="50"
          subtitle="Across all files"
          color="blue"
        />
        <SummaryCard
          title="Valid Records"
          value="46"
          subtitle="Ready for import"
          color="green"
        />
        <SummaryCard
          title="Issues Found"
          value={`${validation.errors.length + validation.warnings.length}`}
          subtitle={`${validation.errors.length} errors, ${validation.warnings.length} warnings`}
          color={validation.errors.length > 0 ? 'red' : 'yellow'}
        />
      </div>

      {/* Validation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  tab.color === 'red' ? 'bg-red-100 text-red-800' :
                  tab.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'errors' && (
          <ErrorsTab
            errors={validation.errors}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
          />
        )}

        {activeTab === 'warnings' && (
          <WarningsTab warnings={validation.warnings} />
        )}

        {activeTab === 'suggestions' && (
          <SuggestionsTab
            suggestions={validation.suggestions}
            expandedItems={expandedItems}
            onToggleExpanded={toggleExpanded}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {canProceed
            ? 'All validations passed! Ready to proceed with data processing.'
            : `${validation.errors.length} critical error${validation.errors.length > 1 ? 's' : ''} must be fixed before continuing.`
          }
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-validate
          </button>

          {canProceed ? (
            <button
              onClick={onSkipToProcessing}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Continue Processing
            </button>
          ) : (
            <button
              onClick={onSkipToProcessing}
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Skip & Process Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}> = ({ title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="text-xs opacity-75">{subtitle}</div>
    </div>
  );
};

// Errors Tab
const ErrorsTab: React.FC<{
  errors: ValidationStepProps['validation']['errors'];
  expandedItems: Set<string>;
  onToggleExpanded: (id: string) => void;
}> = ({ errors, expandedItems, onToggleExpanded }) => {
  if (errors.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Errors Found</h3>
        <p className="text-gray-600">All records passed validation successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errors.map((error, index) => {
        const itemId = `error-${index}`;
        const isExpanded = expandedItems.has(itemId);

        return (
          <div key={index} className="border border-red-200 rounded-lg bg-red-50">
            <div
              className="p-4 cursor-pointer"
              onClick={() => onToggleExpanded(itemId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-900">
                      Row {error.row} - {error.field}
                    </div>
                    <div className="text-sm text-red-700 mt-1">{error.message}</div>
                    {error.suggestion && (
                      <div className="text-sm text-blue-700 mt-1">
                        💡 {error.suggestion}
                      </div>
                    )}
                  </div>
                </div>

                <button className="text-red-600 hover:text-red-800">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-red-200 bg-white rounded-b-lg">
                <div className="pt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Current Value
                    </label>
                    <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono">
                      {String(error.value)}
                    </div>
                  </div>

                  {error.aiFix && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        AI Suggested Fix
                      </label>
                      <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="text-sm text-blue-900 mb-1">
                          Suggested: <strong>{String(error.aiFix.suggestedValue)}</strong>
                        </div>
                        <div className="text-xs text-blue-700 mb-1">
                          Confidence: {error.aiFix.confidence}%
                        </div>
                        <div className="text-xs text-blue-600">
                          {error.aiFix.reasoning}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      Edit Manually
                    </button>
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                      Skip This Row
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Warnings Tab
const WarningsTab: React.FC<{
  warnings: ValidationStepProps['validation']['warnings'];
}> = ({ warnings }) => {
  if (warnings.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Warnings</h3>
        <p className="text-gray-600">Your data looks clean with no warnings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning, index) => (
        <div key={index} className="border border-yellow-200 rounded-lg bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-yellow-900">
                Row {warning.row} - {warning.field}
              </div>
              <div className="text-sm text-yellow-700 mt-1">{warning.message}</div>
              <div className="text-xs text-yellow-600 mt-1 capitalize">
                Severity: {warning.severity}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Suggestions Tab
const SuggestionsTab: React.FC<{
  suggestions: ValidationStepProps['validation']['suggestions'];
  expandedItems: Set<string>;
  onToggleExpanded: (id: string) => void;
}> = ({ suggestions, expandedItems, onToggleExpanded }) => {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Suggestions</h3>
          <p className="text-gray-600">Your data is already optimized!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => {
        const itemId = `suggestion-${index}`;
        const isExpanded = expandedItems.has(itemId);

        return (
          <div key={index} className="border border-blue-200 rounded-lg bg-blue-50">
            <div
              className="p-4 cursor-pointer"
              onClick={() => onToggleExpanded(itemId)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">
                      Row {suggestion.row} - {suggestion.field}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">{suggestion.reasoning}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {suggestion.category}
                      </span>
                      <span className="text-xs text-blue-600">
                        {suggestion.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>

                <button className="text-blue-600 hover:text-blue-800">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-blue-200 bg-white rounded-b-lg">
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Current Value
                      </label>
                      <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                        {String(suggestion.originalValue)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Suggested Value
                      </label>
                      <div className="mt-1 p-2 bg-blue-100 rounded text-sm text-blue-900">
                        {String(suggestion.suggestedValue)}
                      </div>
                    </div>
                  </div>

                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Apply Suggestion
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ValidationStep;
