'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  BarChart3,
  Gauge,
  HardDrive,
  Wifi
} from 'lucide-react';
import { performanceMonitor, getMemoryUsage } from '@/utils/performance';

interface PerformanceData {
  lcp: number;
  fid: number;
  cls: number;
  networkRequests: number;
  dbQueries: number;
  memoryUsage: unknown;
  recentMetrics: PerformanceMetric[];
}

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    lcp: 0,
    fid: 0,
    cls: 0,
    networkRequests: 0,
    dbQueries: 0,
    memoryUsage: null,
    recentMetrics: []
  });
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updatePerformanceData = () => {
      const lcp = performanceMonitor.getAverageMetric('LCP', 60000);
      const fid = performanceMonitor.getAverageMetric('FID', 60000);
      const cls = performanceMonitor.getAverageMetric('CLS', 60000);
      const networkRequests = performanceMonitor.getAverageMetric('Network Request', 60000);
      const dbQueries = performanceMonitor.getAverageMetric('DB Query', 60000);
      const memoryUsage = getMemoryUsage();
      const recentMetrics = performanceMonitor.getMetrics(undefined, 10);

      setPerformanceData({
        lcp,
        fid,
        cls,
        networkRequests,
        dbQueries,
        memoryUsage,
        recentMetrics
      });
    };

    // Initial update
    updatePerformanceData();

    // Set up observer for real-time updates
    const observer = {
      onMetric: () => {
        if (autoRefresh) {
          updatePerformanceData();
        }
      }
    };

    performanceMonitor.addObserver(observer);

    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        updatePerformanceData();
      }
    }, 5000);

    return () => {
      performanceMonitor.removeObserver(observer);
      clearInterval(interval);
    };
  }, [autoRefresh]);

  const getPerformanceColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600 dark:text-green-400';
    if (value <= thresholds.poor) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'Good';
    if (value <= thresholds.poor) return 'Needs Improvement';
    return 'Poor';
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200"
        title="Performance Dashboard"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Performance
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-1 rounded ${
              autoRefresh 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
        {/* Core Web Vitals */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Core Web Vitals
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">LCP</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  getPerformanceColor(performanceData.lcp, { good: 2500, poor: 4000 })
                }`}>
                  {performanceData.lcp.toFixed(0)}ms
                </span>
                <span className="text-xs text-gray-500">
                  {getPerformanceStatus(performanceData.lcp, { good: 2500, poor: 4000 })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">FID</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  getPerformanceColor(performanceData.fid, { good: 100, poor: 300 })
                }`}>
                  {performanceData.fid.toFixed(0)}ms
                </span>
                <span className="text-xs text-gray-500">
                  {getPerformanceStatus(performanceData.fid, { good: 100, poor: 300 })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">CLS</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  getPerformanceColor(performanceData.cls, { good: 0.1, poor: 0.25 })
                }`}>
                  {performanceData.cls.toFixed(3)}
                </span>
                <span className="text-xs text-gray-500">
                  {getPerformanceStatus(performanceData.cls, { good: 0.1, poor: 0.25 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Network & Database */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Network & Database
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Network</span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {performanceData.networkRequests.toFixed(0)}ms avg
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Database</span>
              </div>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {performanceData.dbQueries.toFixed(0)}ms avg
              </span>
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        {performanceData.memoryUsage && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Memory Usage
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Used</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {(performanceData.memoryUsage.used / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(performanceData.memoryUsage.percentage, 100)}%` 
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Total</span>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {(performanceData.memoryUsage.total / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Metrics */}
        {performanceData.recentMetrics.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recent Activity
            </h4>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {performanceData.recentMetrics.slice(-5).map((metric, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 truncate">
                    {metric.name}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {metric.value.toFixed(0)}{metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => {
            performanceMonitor.clearMetrics();
            setPerformanceData({
              lcp: 0,
              fid: 0,
              cls: 0,
              networkRequests: 0,
              dbQueries: 0,
              memoryUsage: null,
              recentMetrics: []
            });
          }}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Clear Metrics
        </button>
      </div>
    </div>
  );
} 