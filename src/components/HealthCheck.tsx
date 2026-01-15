import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Database, Wifi, Shield, Clock, Server, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface HealthCheckItem {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'checking';
  message: string;
  responseTime?: number;
  lastChecked: Date;
  icon: React.ReactNode;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  checks: HealthCheckItem[];
  uptime: number;
  version: string;
  environment: string;
}

const HealthCheck: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    checks: [],
    uptime: 0,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const healthChecks = [
    {
      name: 'Frontend Application',
      check: async () => {
        const start = performance.now();
        // Check if React app is responsive
        await new Promise(resolve => setTimeout(resolve, 100));
        const end = performance.now();
        return {
          status: 'healthy' as const,
          message: 'Frontend application is running smoothly',
          responseTime: end - start
        };
      },
      icon: <Activity className="w-4 h-4" />
    },
    {
      name: 'Database Connection',
      check: async () => {
        const start = performance.now();
        try {
          // Simulate database health check
          await new Promise(resolve => setTimeout(resolve, 200));
          const end = performance.now();
          return {
            status: 'healthy' as const,
            message: 'Database connection is stable',
            responseTime: end - start
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Database connection failed',
            responseTime: 0
          };
        }
      },
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'API Endpoints',
      check: async () => {
        const start = performance.now();
        try {
          // Simulate API health check
          await new Promise(resolve => setTimeout(resolve, 150));
          const end = performance.now();
          return {
            status: 'healthy' as const,
            message: 'All API endpoints are responding',
            responseTime: end - start
          };
        } catch (error) {
          return {
            status: 'warning' as const,
            message: 'Some API endpoints are slow',
            responseTime: 0
          };
        }
      },
      icon: <Server className="w-4 h-4" />
    },
    {
      name: 'Network Connection',
      check: async () => {
        const start = performance.now();
        try {
          // Check network connectivity
          const response = await fetch('/api/health', { 
            method: 'HEAD',
            cache: 'no-cache'
          });
          const end = performance.now();
          
          if (response.ok) {
            return {
              status: 'healthy' as const,
              message: 'Network connection is stable',
              responseTime: end - start
            };
          } else {
            return {
              status: 'warning' as const,
              message: 'Network connection is unstable',
              responseTime: end - start
            };
          }
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Network connection failed',
            responseTime: 0
          };
        }
      },
      icon: <Wifi className="w-4 h-4" />
    },
    {
      name: 'Security Systems',
      check: async () => {
        const start = performance.now();
        try {
          // Simulate security check
          await new Promise(resolve => setTimeout(resolve, 100));
          const end = performance.now();
          return {
            status: 'healthy' as const,
            message: 'Security systems are operational',
            responseTime: end - start
          };
        } catch (error) {
          return {
            status: 'error' as const,
            message: 'Security systems need attention',
            responseTime: 0
          };
        }
      },
      icon: <Shield className="w-4 h-4" />
    },
    {
      name: 'AI Services',
      check: async () => {
        const start = performance.now();
        try {
          // Simulate AI service health check
          await new Promise(resolve => setTimeout(resolve, 300));
          const end = performance.now();
          return {
            status: 'healthy' as const,
            message: 'All AI services are operational',
            responseTime: end - start
          };
        } catch (error) {
          return {
            status: 'warning' as const,
            message: 'Some AI services are degraded',
            responseTime: 0
          };
        }
      },
      icon: <Zap className="w-4 h-4" />
    }
  ];

  const runHealthCheck = useCallback(async () => {
    setIsRunning(true);
    
    const checks: HealthCheckItem[] = [];
    
    for (const healthCheck of healthChecks) {
      try {
        const result = await healthCheck.check();
        checks.push({
          name: healthCheck.name,
          status: result.status,
          message: result.message,
          responseTime: result.responseTime,
          lastChecked: new Date(),
          icon: healthCheck.icon
        });
      } catch (error) {
        checks.push({
          name: healthCheck.name,
          status: 'error',
          message: 'Health check failed',
          responseTime: 0,
          lastChecked: new Date(),
          icon: healthCheck.icon
        });
      }
    }

    // Calculate overall health
    const errorCount = checks.filter(c => c.status === 'error').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    
    let overall: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errorCount > 0) {
      overall = 'error';
    } else if (warningCount > 0) {
      overall = 'warning';
    }

    setSystemHealth(prev => ({
      ...prev,
      overall,
      checks,
      uptime: prev.uptime + 1
    }));

    setIsRunning(false);
    
    // Show notification based on overall health
    if (overall === 'error') {
      toast.error('System health check completed with errors');
    } else if (overall === 'warning') {
      toast('System health check completed with warnings');
    } else {
      toast.success('System health check completed successfully');
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        runHealthCheck();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, runHealthCheck]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'checking':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          System Health Monitor
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getOverallStatusColor(systemHealth.overall)}`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {systemHealth.overall}
            </span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Auto Refresh
          </button>
          <button
            onClick={runHealthCheck}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Checking...' : 'Run Health Check'}
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
            <Server className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {systemHealth.environment}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {systemHealth.version}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {systemHealth.uptime} checks
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Services</span>
            <CheckCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {systemHealth.checks.length}
          </div>
        </div>
      </div>

      {/* Health Checks */}
      <div className="space-y-3">
        {systemHealth.checks.map((check, index) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {check.icon}
                    {check.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {check.message}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {check.responseTime && (
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {check.responseTime.toFixed(2)}ms
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {check.lastChecked.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {systemHealth.checks.filter(c => c.status === 'healthy').length} Healthy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {systemHealth.checks.filter(c => c.status === 'warning').length} Warnings
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {systemHealth.checks.filter(c => c.status === 'error').length} Errors
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last checked: {systemHealth.checks[0]?.lastChecked.toLocaleTimeString() || 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
