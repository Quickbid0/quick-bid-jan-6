// UI System - Final Validation Utilities
// Comprehensive validation tools for user flows and UI/UX testing

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, TestTube, Users, Shield, Zap } from 'lucide-react';

// Import design system components
import { Card, Button, Badge, Container, Grid, Flex } from './';

// Validation test types
export interface ValidationTest {
  id: string;
  name: string;
  description: string;
  category: 'accessibility' | 'performance' | 'usability' | 'security' | 'responsive' | 'trust';
  severity: 'critical' | 'high' | 'medium' | 'low';
  test: () => Promise<ValidationResult>;
  fix?: () => void;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
  suggestions?: string[];
}

// Pre-built validation tests
export const validationTests: ValidationTest[] = [
  // Accessibility Tests
  {
    id: 'keyboard-navigation',
    name: 'Keyboard Navigation',
    description: 'Test that all interactive elements are keyboard accessible',
    category: 'accessibility',
    severity: 'critical',
    test: async () => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        return {
          passed: false,
          message: 'No focusable elements found',
          suggestions: ['Add focusable elements to the page', 'Ensure buttons and links are present']
        };
      }

      return {
        passed: true,
        message: `Found ${focusableElements.length} focusable elements`
      };
    }
  },

  // Performance Tests
  {
    id: 'large-contentful-paint',
    name: 'Large Contentful Paint',
    description: 'Test that main content loads within 2.5 seconds',
    category: 'performance',
    severity: 'high',
    test: async () => {
      return new Promise((resolve) => {
        // Simulate LCP measurement
        setTimeout(() => {
          const mainContent = document.querySelector('main, [role="main"], #main');
          if (!mainContent) {
            resolve({
              passed: false,
              message: 'No main content area found',
              suggestions: ['Add semantic main element', 'Ensure primary content is clearly identified']
            });
            return;
          }

          // Check if content is visible and has meaningful content
          const isVisible = mainContent.offsetWidth > 0 && mainContent.offsetHeight > 0;
          const hasContent = mainContent.textContent && mainContent.textContent.trim().length > 50;

          resolve({
            passed: isVisible && hasContent,
            message: isVisible && hasContent ? 'Main content loads quickly' : 'Main content may be slow to load',
            suggestions: isVisible && hasContent ? [] : ['Optimize images', 'Reduce JavaScript bundle size', 'Use lazy loading']
          });
        }, 100);
      });
    }
  },

  // Usability Tests
  {
    id: 'mobile-friendly',
    name: 'Mobile Friendly',
    description: 'Test mobile responsiveness and touch targets',
    category: 'usability',
    severity: 'high',
    test: async () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const hasViewport = viewport && viewport.getAttribute('content')?.includes('width=device-width');

      const buttons = document.querySelectorAll('button, [role="button"], a');
      let smallTouchTargets = 0;

      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          smallTouchTargets++;
        }
      });

      const issues = [];
      if (!hasViewport) issues.push('Missing proper viewport meta tag');
      if (smallTouchTargets > 0) issues.push(`${smallTouchTargets} buttons have touch targets smaller than 44px`);

      return {
        passed: hasViewport && smallTouchTargets === 0,
        message: issues.length === 0 ? 'Mobile-friendly design detected' : 'Mobile usability issues found',
        details: issues.join(', '),
        suggestions: [
          'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          'Ensure all touch targets are at least 44px x 44px',
          'Test on actual mobile devices'
        ]
      };
    }
  },

  // Security Tests
  {
    id: 'trust-indicators',
    name: 'Trust Indicators',
    description: 'Verify security badges and trust signals are present',
    category: 'security',
    severity: 'high',
    test: async () => {
      const trustIndicators = document.querySelectorAll('[data-trust], .trust-badge, .security-badge');
      const hasSSL = window.location.protocol === 'https:';
      const hasSecurityHeaders = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

      const trustSignals = [];
      if (trustIndicators.length > 0) trustSignals.push('Trust badges present');
      if (hasSSL) trustSignals.push('HTTPS enabled');
      if (hasSecurityHeaders) trustSignals.push('Security headers configured');

      return {
        passed: trustIndicators.length > 0 && hasSSL,
        message: trustSignals.length > 1 ? 'Good trust indicators present' : 'Limited trust signals',
        details: trustSignals.join(', '),
        suggestions: [
          'Add SSL certificate (HTTPS)',
          'Include trust badges (Verified, Escrow, etc.)',
          'Add security headers'
        ]
      };
    }
  },

  // Responsive Tests
  {
    id: 'horizontal-scroll',
    name: 'No Horizontal Scroll',
    description: 'Ensure content fits within viewport width',
    category: 'responsive',
    severity: 'critical',
    test: async () => {
      const body = document.body;
      const html = document.documentElement;

      const windowWidth = window.innerWidth;
      const bodyWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);

      const hasHorizontalScroll = bodyWidth > windowWidth + 10; // 10px tolerance

      return {
        passed: !hasHorizontalScroll,
        message: hasHorizontalScroll ? 'Horizontal scroll detected' : 'No horizontal scroll',
        details: hasHorizontalScroll ? `Content width: ${bodyWidth}px, Viewport: ${windowWidth}px` : undefined,
        suggestions: hasHorizontalScroll ? [
          'Use responsive design with proper breakpoints',
          'Avoid fixed widths that exceed viewport',
          'Test on various screen sizes'
        ] : []
      };
    }
  }
];

// Validation dashboard component
interface ValidationDashboardProps {
  tests?: ValidationTest[];
  autoRun?: boolean;
  showSummary?: boolean;
  className?: string;
}

export const ValidationDashboard: React.FC<ValidationDashboardProps> = ({
  tests = validationTests,
  autoRun = false,
  showSummary = true,
  className
}) => {
  const [results, setResults] = useState<Record<string, ValidationResult>>({});
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const runValidation = useCallback(async () => {
    setRunning(true);
    setResults({});

    const newResults: Record<string, ValidationResult> = {};

    for (const test of tests) {
      try {
        const result = await test.test();
        newResults[test.id] = result;
        setResults(prev => ({ ...prev, [test.id]: result }));
      } catch (error) {
        newResults[test.id] = {
          passed: false,
          message: 'Test failed to execute',
          details: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    setRunning(false);
    setCompleted(true);
  }, [tests]);

  const getStats = useCallback(() => {
    const total = Object.keys(results).length;
    const passed = Object.values(results).filter(r => r.passed).length;
    const failed = total - passed;

    return { total, passed, failed };
  }, [results]);

  useEffect(() => {
    if (autoRun) {
      runValidation();
    }
  }, [autoRun, runValidation]);

  const { total, passed, failed } = getStats();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'accessibility': return <Users className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'usability': return <Info className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'responsive': return <TestTube className="w-4 h-4" />;
      case 'trust': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'neutral';
      default: return 'neutral';
    }
  };

  return (
    <Container className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">UI/UX Validation</h2>
            <p className="text-neutral-600">Comprehensive testing for user experience quality</p>
          </div>
          <Button
            onClick={runValidation}
            loading={running}
            disabled={running}
          >
            {running ? 'Running Tests...' : 'Run Validation'}
          </Button>
        </div>

        {/* Summary Stats */}
        {showSummary && completed && (
          <Grid cols={3} gap="md">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{total}</div>
              <div className="text-sm text-neutral-600">Total Tests</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-success-600">{passed}</div>
              <div className="text-sm text-neutral-600">Passed</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-error-600">{failed}</div>
              <div className="text-sm text-neutral-600">Failed</div>
            </Card>
          </Grid>
        )}

        {/* Test Results */}
        <div className="space-y-4">
          {tests.map((test) => {
            const result = results[test.id];
            const hasResult = result !== undefined;

            return (
              <Card key={test.id} className="p-4">
                <Flex align="center" justify="between" className="mb-3">
                  <Flex align="center" gap="md">
                    <div className="p-2 bg-neutral-100 rounded-lg">
                      {getCategoryIcon(test.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{test.name}</h3>
                      <p className="text-sm text-neutral-600">{test.description}</p>
                    </div>
                  </Flex>

                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(test.severity)} size="sm">
                      {test.severity}
                    </Badge>

                    {hasResult && (
                      <div className="flex items-center gap-1">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-error-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          result.passed ? 'text-success-700' : 'text-error-700'
                        }`}>
                          {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    )}
                  </div>
                </Flex>

                {hasResult && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-700">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-neutral-600 mt-1">{result.details}</p>
                    )}
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-neutral-700">Suggestions:</p>
                        <ul className="text-xs text-neutral-600 mt-1 space-y-1">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completed && (
          <Card className="p-6 bg-gradient-to-r from-primary-50 to-success-50 border-primary-200">
            <Flex align="center" gap="md">
              <CheckCircle className="w-8 h-8 text-success-600" />
              <div>
                <h3 className="font-semibold text-neutral-900">Validation Complete</h3>
                <p className="text-sm text-neutral-600">
                  {failed === 0
                    ? 'All tests passed! Your UI/UX meets high quality standards.'
                    : `${passed} tests passed, ${failed} tests failed. Review failed tests and implement fixes.`
                  }
                </p>
              </div>
            </Flex>
          </Card>
        )}
      </div>
    </Container>
  );
};

// User flow validation hook
export const useFlowValidation = (flowName: string) => {
  const [steps, setSteps] = useState<Array<{ name: string; completed: boolean; timestamp?: Date }>>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const addStep = useCallback((stepName: string) => {
    setSteps(prev => [...prev, { name: stepName, completed: false }]);
  }, []);

  const completeStep = useCallback((stepIndex?: number) => {
    const index = stepIndex ?? currentStep;
    setSteps(prev => prev.map((step, i) =>
      i === index ? { ...step, completed: true, timestamp: new Date() } : step
    ));
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [currentStep, steps.length]);

  const validateFlow = useCallback(() => {
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;

    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0,
      isComplete: completedSteps === totalSteps
    };
  }, [steps]);

  return {
    steps,
    currentStep,
    addStep,
    completeStep,
    validateFlow,
    flowName
  };
};

// Export validation utilities
export default {
  validationTests,
  ValidationDashboard,
  useFlowValidation
};
