import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, BarChart3, Cpu, HardDrive, Wifi, Battery } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  connectionSpeed: string;
  batteryLevel: number | null;
  cpuCores: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToInteractive: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    memoryUsage: 0,
    connectionSpeed: 'unknown',
    batteryLevel: null,
    cpuCores: 0
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([]);

  const thresholds = {
    pageLoadTime: 3000,
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    timeToInteractive: 3800,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
    memoryUsage: 50 * 1024 * 1024, // 50MB
  };

  const collectMetrics = useCallback(async () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0];
      const cls = performance.getEntriesByType('layout-shift');
      const fid = performance.getEntriesByType('first-input')[0] as PerformanceEventTiming;

      // Calculate CLS
      let clsValue = 0;
      cls.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      // Get memory usage
      const memory = (performance as any).memory;
      const memoryUsage = memory ? memory.usedJSHeapSize : 0;

      // Get connection info
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const connectionSpeed = connection ? connection.effectiveType : 'unknown';

      // Get battery level
      let batteryLevel: number | null = null;
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        batteryLevel = battery ? battery.level * 100 : null;
      }

      // Get CPU cores
      const cpuCores = navigator.hardwareConcurrency || 0;

      const newMetrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: paint.find((p: any) => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: lcp?.startTime || 0,
        timeToInteractive: navigation.domInteractive - navigation.fetchStart,
        cumulativeLayoutShift: clsValue,
        firstInputDelay: fid?.processingStart - fid?.startTime || 0,
        memoryUsage,
        connectionSpeed,
        batteryLevel,
        cpuCores
      };

      setMetrics(newMetrics);
      setHistoricalData(prev => [...prev.slice(-19), newMetrics]);
      
      checkThresholds(newMetrics);
      
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }, []);

  const checkThresholds = (currentMetrics: PerformanceMetrics) => {
    const newAlerts: Alert[] = [];

    Object.entries(thresholds).forEach(([key, threshold]) => {
      const value = currentMetrics[key as keyof PerformanceMetrics];
      if (typeof value === 'number' && value > threshold) {
        const alert: Alert = {
          id: `${Date.now()}-${key}`,
          type: value > threshold * 1.5 ? 'error' : 'warning',
          message: `${key.replace(/([A-Z])/g, ' $1').trim()} is ${value.toFixed(2)}ms (threshold: ${threshold}ms)`,
          timestamp: new Date(),
          metric: key,
          value,
          threshold
        };
        newAlerts.push(alert);
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(-9)]);
      newAlerts.forEach(alert => {
        if (alert.type === 'error') {
          toast.error(alert.message);
        } else if (alert.type === 'warning') {
          toast(alert.message);
        }
      });
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    collectMetrics();
    
    const interval = setInterval(() => {
      collectMetrics();
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'pageLoadTime': return <Clock className="w-4 h-4" />;
      case 'firstContentfulPaint': return <CheckCircle className="w-4 h-4" />;
      case 'largestContentfulPaint': return <BarChart3 className="w-4 h-4" />;
      case 'timeToInteractive': return <Activity className="w-4 h-4" />;
      case 'cumulativeLayoutShift': return <TrendingUp className="w-4 h-4" />;
      case 'firstInputDelay': return <Zap className="w-4 h-4" />;
      case 'memoryUsage': return <HardDrive className="w-4 h-4" />;
      case 'connectionSpeed': return <Wifi className="w-4 h-4" />;
      case 'batteryLevel': return <Battery className="w-4 h-4" />;
      case 'cpuCores': return <Cpu className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricStatus = (value: number, threshold: number) => {
    if (value > threshold * 1.5) return 'text-red-600 bg-red-100';
    if (value > threshold) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatValue = (metric: string, value: number) => {
    switch (metric) {
      case 'memoryUsage':
        return `${(value / 1024 / 1024).toFixed(1)} MB`;
      case 'cumulativeLayoutShift':
        return value.toFixed(3);
      case 'batteryLevel':
        return `${value.toFixed(0)}%`;
      case 'cpuCores':
        return value.toString();
      default:
        return `${value.toFixed(2)}ms`;
    }
  };

  useEffect(() => {
    collectMetrics();
  }, [collectMetrics]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Performance Monitor
        </h3>
        <div className="flex gap-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMonitoring
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(metrics).map(([key, value]) => {
          if (key === 'connectionSpeed') return null;
          const threshold = thresholds[key as keyof typeof thresholds];
          const isNumeric = typeof value === 'number';
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getMetricIcon(key)}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                {isNumeric && threshold && (
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getMetricStatus(value, threshold)}`}>
                    {value > threshold * 1.5 ? 'Poor' : value > threshold ? 'Fair' : 'Good'}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {isNumeric ? formatValue(key, value) : value}
              </div>
              {isNumeric && threshold && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Threshold: {formatValue(key, threshold)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wifi className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Connection
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">
            {metrics.connectionSpeed}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Battery
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.batteryLevel !== null ? `${metrics.batteryLevel.toFixed(0)}%` : 'N/A'}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              CPU Cores
            </span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {metrics.cpuCores}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            Recent Alerts
          </h4>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  alert.type === 'error'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      alert.type === 'error'
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {alert.type === 'error' ? (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Data */}
      {historicalData.length > 1 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Performance Trend
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-3">
              {Object.keys(thresholds).slice(0, 4).map((key) => {
                const data = historicalData.map(d => d[key as keyof PerformanceMetrics] as number);
                const latest = data[data.length - 1];
                const previous = data[data.length - 2];
                const change = latest - previous;
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatValue(key, latest)}
                      </span>
                      <div className={`flex items-center gap-1 text-xs ${
                        change > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {change > 0 ? '+' : ''}{change.toFixed(2)}ms
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
