'use client';

import { useState } from 'react';
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  RefreshCw,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import DataExportModal from '@/components/DataExportModal';
import DataImportModal from '@/components/DataImportModal';
import { ImportResult } from '@/lib/data-import';

export default function DataManagementPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);

  const handleImportComplete = (result: ImportResult) => {
    setLastImportResult(result);
    // Optionally refresh the page or update data
    if (result.success) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Data Management
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Export your data for backup or import data from previous exports
        </p>
      </div>

      {/* Last Import Result */}
      {lastImportResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          lastImportResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {lastImportResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <h3 className={`font-medium ${
              lastImportResult.success 
                ? 'text-green-900 dark:text-green-100' 
                : 'text-red-900 dark:text-red-100'
            }`}>
              Import {lastImportResult.success ? 'Completed Successfully' : 'Failed'}
            </h3>
          </div>
          <p className={`text-sm ${
            lastImportResult.success 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {lastImportResult.success 
              ? `${lastImportResult.summary.totalImported} items imported, ${lastImportResult.summary.skipped} skipped`
              : 'Please check the error details and try again'
            }
          </p>
        </div>
      )}

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Export Data
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create a backup of your data in JSON or CSV format. Choose which data types to include and optionally filter by date range.
          </p>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Data
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Import data from a previous export. Choose which data types to import and how to handle conflicts with existing data.
          </p>
          <button
            onClick={() => setShowImportModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            Import Data
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Data Types */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Data Types</h3>
          </div>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Projects & Tasks</li>
            <li>• Research Papers</li>
            <li>• Workout Plans</li>
            <li>• Time Tracking</li>
            <li>• User Preferences</li>
            <li>• Notifications</li>
          </ul>
        </div>

        {/* Security */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-medium text-green-900 dark:text-green-100">Security</h3>
          </div>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• Data stays on your device</li>
            <li>• No data sent to external servers</li>
            <li>• Secure file handling</li>
            <li>• User authentication required</li>
          </ul>
        </div>

        {/* Formats */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-medium text-purple-900 dark:text-purple-100">Formats</h3>
          </div>
          <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
            <li>• JSON (Complete data)</li>
            <li>• CSV (Spreadsheet ready)</li>
            <li>• Metadata included</li>
            <li>• Version tracking</li>
          </ul>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-medium text-yellow-900 dark:text-yellow-100">
            Best Practices
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-yellow-800 dark:text-yellow-200">
          <div>
            <h4 className="font-medium mb-2">For Exports:</h4>
            <ul className="space-y-1">
              <li>• Export regularly for backup</li>
              <li>• Use date ranges for large datasets</li>
              <li>• Store exports in a safe location</li>
              <li>• Keep multiple backup versions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Imports:</h4>
            <ul className="space-y-1">
              <li>• Test imports on a small dataset first</li>
              <li>• Use "Skip" for safe imports</li>
              <li>• Review import results carefully</li>
              <li>• Keep original export files</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DataExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
      <DataImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
} 