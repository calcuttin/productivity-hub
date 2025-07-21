'use client';

import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckSquare, 
  BookOpen, 
  Target, 
  Clock, 
  Settings, 
  Bell,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { ImportOptions, ImportResult } from '@/lib/data-import';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: ImportResult) => void;
}

export default function DataImportModal({ isOpen, onClose, onImportComplete }: DataImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any>(null);
  const [options, setOptions] = useState<ImportOptions>({
    importProjects: true,
    importTodos: true,
    importResearch: true,
    importWorkouts: true,
    importTimeSessions: true,
    importPreferences: true,
    importNotifications: false,
    conflictResolution: 'skip'
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationErrors([]);
    setImportResult(null);

    try {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Only JSON files are supported');
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Read and parse file
      const text = await file.text();
      const data = JSON.parse(text);

      // Basic validation
      if (!data.metadata || !data.data) {
        throw new Error('Invalid export file format');
      }

      setImportData(data);
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Invalid file']);
      setSelectedFile(null);
      setImportData(null);
    }
  };

  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    try {
      const response = await fetch('/api/data-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: importData,
          options
        })
      });

      const result: ImportResult = await response.json();
      setImportResult(result);

      if (result.success) {
        onImportComplete?.(result);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        summary: { totalImported: 0, skipped: 0, errors: 1, breakdown: {} },
        errors: [{ type: 'general', id: 'import', message: 'Import failed' }]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const toggleOption = (key: keyof ImportOptions) => {
    if (key === 'conflictResolution') return;
    setOptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetForm = () => {
    setSelectedFile(null);
    setImportData(null);
    setImportResult(null);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Data
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Select Export File
            </h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              {!selectedFile ? (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop a JSON export file here, or
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    browse to select file
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Maximum file size: 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h4 className="font-medium text-red-900 dark:text-red-100">Validation Errors</h4>
              </div>
              <ul className="text-sm text-red-800 dark:text-red-200">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Import Data Preview */}
          {importData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Import Preview</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {Object.entries(importData.data).map(([type, items]) => (
                  <div key={type}>
                    <div className="text-blue-700 dark:text-blue-300 font-medium">
                      {Array.isArray(items) ? items.length : 0}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 capitalize">
                      {type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Options */}
          {importData && (
            <>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Data Types to Import
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'importProjects', label: 'Projects', icon: BookOpen },
                    { key: 'importTodos', label: 'Todos', icon: CheckSquare },
                    { key: 'importResearch', label: 'Research', icon: FileText },
                    { key: 'importWorkouts', label: 'Workouts', icon: Target },
                    { key: 'importTimeSessions', label: 'Time Sessions', icon: Clock },
                    { key: 'importPreferences', label: 'Preferences', icon: Settings },
                    { key: 'importNotifications', label: 'Notifications', icon: Bell }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => toggleOption(key as keyof ImportOptions)}
                      className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                        options[key as keyof ImportOptions]
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Conflict Resolution
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'skip', label: 'Skip', description: 'Skip existing items' },
                    { value: 'overwrite', label: 'Overwrite', description: 'Replace existing items' },
                    { value: 'merge', label: 'Merge', description: 'Combine data (not implemented)' }
                  ].map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => setOptions(prev => ({ ...prev, conflictResolution: value as any }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        options.conflictResolution === value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium">{label}</div>
                      <div className="text-sm opacity-75">{description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Import Result */}
          {importResult && (
            <div className={`border rounded-lg p-4 ${
              importResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <h4 className={`font-medium ${
                  importResult.success 
                    ? 'text-green-900 dark:text-green-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  Import {importResult.success ? 'Completed' : 'Failed'}
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <div className="font-medium">Imported</div>
                  <div>{importResult.summary.totalImported}</div>
                </div>
                <div>
                  <div className="font-medium">Skipped</div>
                  <div>{importResult.summary.skipped}</div>
                </div>
                <div>
                  <div className="font-medium">Errors</div>
                  <div>{importResult.summary.errors}</div>
                </div>
              </div>
              {Object.entries(importResult.summary.breakdown).length > 0 && (
                <div>
                  <div className="font-medium mb-2">Breakdown:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(importResult.summary.breakdown).map(([type, stats]) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-xs"
                      >
                        {type}: {stats.imported} imported, {stats.skipped} skipped
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {importResult ? 'Close' : 'Cancel'}
            </button>
            {importData && !importResult && (
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import Data
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 