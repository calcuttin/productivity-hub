'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  Target, 
  Clock, 
  Settings, 
  Bell,
  X,
  Loader2,
  Info
} from 'lucide-react';
import { ExportOptions } from '@/lib/data-export';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataExportModal({ isOpen, onClose }: DataExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeProjects: true,
    includeTodos: true,
    includeResearch: true,
    includeWorkouts: true,
    includeTimeSessions: true,
    includePreferences: true,
    includeNotifications: false
  });
  
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [stats, setStats] = useState<{
    totalItems: number;
    breakdown: Record<string, number>;
    estimatedSize: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch export statistics when options change
  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, options]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'stats',
        includeProjects: options.includeProjects?.toString() || 'true',
        includeTodos: options.includeTodos?.toString() || 'true',
        includeResearch: options.includeResearch?.toString() || 'true',
        includeWorkouts: options.includeWorkouts?.toString() || 'true',
        includeTimeSessions: options.includeTimeSessions?.toString() || 'true',
        includePreferences: options.includePreferences?.toString() || 'true',
        includeNotifications: options.includeNotifications?.toString() || 'false'
      });

      const response = await fetch(`/api/data-export?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching export stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportOptions = {
        ...options,
        dateRange: dateRange.from || dateRange.to ? {
          from: dateRange.from ? new Date(dateRange.from) : undefined,
          to: dateRange.to ? new Date(dateRange.to) : undefined
        } : undefined
      };

      const response = await fetch('/api/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportOptions)
      });

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'export.json';

        // Download the file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        onClose();
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Statistics */}
          {stats && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Export Summary</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-blue-700 dark:text-blue-300 font-medium">
                    {stats.totalItems}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">Total Items</div>
                </div>
                <div>
                  <div className="text-blue-700 dark:text-blue-300 font-medium">
                    {stats.estimatedSize}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">Estimated Size</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-blue-700 dark:text-blue-300 font-medium mb-1">
                    Breakdown
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.breakdown).map(([type, count]) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs"
                      >
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Export Format
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOptions(prev => ({ ...prev, format: 'json' }))}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  options.format === 'json'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-6 h-6 mb-2" />
                <div className="font-medium">JSON</div>
                <div className="text-sm opacity-75">Complete data structure</div>
              </button>
              <button
                onClick={() => setOptions(prev => ({ ...prev, format: 'csv' }))}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  options.format === 'csv'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <FileText className="w-6 h-6 mb-2" />
                <div className="font-medium">CSV</div>
                <div className="text-sm opacity-75">Spreadsheet compatible</div>
              </button>
            </div>
          </div>

          {/* Data Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Data Types to Export
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'includeProjects', label: 'Projects', icon: BookOpen },
                { key: 'includeTodos', label: 'Todos', icon: CheckSquare },
                { key: 'includeResearch', label: 'Research', icon: FileText },
                { key: 'includeWorkouts', label: 'Workouts', icon: Target },
                { key: 'includeTimeSessions', label: 'Time Sessions', icon: Clock },
                { key: 'includePreferences', label: 'Preferences', icon: Settings },
                { key: 'includeNotifications', label: 'Notifications', icon: Bell }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleOption(key as keyof ExportOptions)}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    options[key as keyof ExportOptions]
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Date Range (Optional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 