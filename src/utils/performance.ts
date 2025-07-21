import React from 'react';

// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceObserver {
  onMetric: (metric: PerformanceMetric) => void;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime, 'ms', {
            element: (lastEntry as any).element?.tagName,
            url: (lastEntry as any).url
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as any;
            this.recordMetric('FID', fidEntry.processingStart - entry.startTime, 'ms', {
              name: entry.name,
              type: entry.entryType
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue, 'score', {
            entries: entries.length
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }

      // Navigation timing
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric('Navigation', entry.loadEventEnd - entry.loadEventStart, 'ms', {
              type: entry.entryType,
              name: entry.name
            });
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Navigation observer not supported');
      }
    }
  }

  recordMetric(name: string, value: number, unit: string, metadata?: Record<string, unknown>) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.notifyObservers(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private notifyObservers(metric: PerformanceMetric) {
    this.observers.forEach(observer => {
      try {
        observer.onMetric(metric);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }

  addObserver(observer: PerformanceObserver) {
    this.observers.push(observer);
  }

  removeObserver(observer: PerformanceObserver) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  getMetrics(name?: string, limit = 100): PerformanceMetric[] {
    let filtered = this.metrics;
    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }
    return filtered.slice(-limit);
  }

  getAverageMetric(name: string, timeWindow = 60000): number {
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter(m => 
      m.name === name && m.timestamp > cutoff
    );

    if (recentMetrics.length === 0) return 0;

    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for measuring specific operations
export function measureTime<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const end = performance.now();
    performanceMonitor.recordMetric(name, end - start, 'ms');
  }
}

export async function measureAsyncTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const end = performance.now();
    performanceMonitor.recordMetric(name, end - start, 'ms');
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };
}

// Network performance monitoring
export function monitorNetworkPerformance() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const start = performance.now();
    try {
      const response = await originalFetch(...args);
      const end = performance.now();
      
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      performanceMonitor.recordMetric('Network Request', end - start, 'ms', {
        url,
        method: (args[1] as RequestInit)?.method || 'GET',
        status: response.status
      });
      
      return response;
    } catch (error) {
      const end = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      performanceMonitor.recordMetric('Network Error', end - start, 'ms', {
        url,
        method: (args[1] as RequestInit)?.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };
}

// Component render performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function PerformanceMonitoredComponent(props: P) {
    const start = performance.now();
    
    React.useEffect(() => {
      const end = performance.now();
      performanceMonitor.recordMetric(`${componentName} Render`, end - start, 'ms');
    });

    return React.createElement(Component, props);
  };
}

// Database query performance monitoring
export function monitorDatabaseQuery(queryName: string) {
  return function<T extends any[], R>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: T): Promise<R> {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const end = performance.now();
        performanceMonitor.recordMetric(`DB Query: ${queryName}`, end - start, 'ms', {
          method: propertyKey,
          args: args.length
        });
        return result;
      } catch (error) {
        const end = performance.now();
        performanceMonitor.recordMetric(`DB Error: ${queryName}`, end - start, 'ms', {
          method: propertyKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    };

    return descriptor;
  };
}

// Performance reporting
export function reportPerformanceMetrics() {
  const metrics = performanceMonitor.getMetrics();
  const report = {
    timestamp: Date.now(),
    metrics: metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push({
        value: metric.value,
        unit: metric.unit,
        timestamp: metric.timestamp
      });
      return acc;
    }, {} as Record<string, any[]>),
    averages: {
      LCP: performanceMonitor.getAverageMetric('LCP'),
      FID: performanceMonitor.getAverageMetric('FID'),
      CLS: performanceMonitor.getAverageMetric('CLS'),
      'Network Request': performanceMonitor.getAverageMetric('Network Request'),
      'DB Query': performanceMonitor.getAverageMetric('DB Query')
    },
    memory: getMemoryUsage()
  };

  // Send to analytics or log
  console.log('Performance Report:', report);
  
  // You can send this to your analytics service
  // analytics.track('performance_metrics', report);
  
  return report;
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Monitor network performance
  monitorNetworkPerformance();
  
  // Report metrics every 5 minutes
  setInterval(reportPerformanceMetrics, 5 * 60 * 1000);
  
  // Report on page unload
  window.addEventListener('beforeunload', () => {
    reportPerformanceMetrics();
  });
} 