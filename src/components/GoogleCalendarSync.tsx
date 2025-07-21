'use client';

import { useState } from 'react';
import { Calendar, RefreshCw, Download, Upload, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncOptions {
  syncProjects: boolean;
  syncTodos: boolean;
  syncWorkouts: boolean;
  syncTimeBlocks: boolean;
  twoWaySync: boolean;
  defaultReminders: number[];
}

interface SyncResult {
  created: number;
  updated: number;
  errors: number;
  details: any[];
}

export default function GoogleCalendarSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    syncProjects: true,
    syncTodos: true,
    syncWorkouts: true,
    syncTimeBlocks: true,
    twoWaySync: false,
    defaultReminders: [15, 60]
  });

  const handleConnect = () => {
    // In a real implementation, this would redirect to Google OAuth
    // For now, we'll simulate the connection
    const mockToken = 'mock_google_calendar_token_' + Date.now();
    setAccessToken(mockToken);
    setIsConnected(true);
    setError(null);
  };

  const handleDisconnect = () => {
    setAccessToken('');
    setIsConnected(false);
    setSyncResults(null);
    setError(null);
  };

  const handleSyncToGoogle = async () => {
    if (!accessToken) {
      setError('Please connect to Google Calendar first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync_to_google',
          accessToken,
          options: syncOptions
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSyncResults(data.results);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync with Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromGoogle = async () => {
    if (!accessToken) {
      setError('Please connect to Google Calendar first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_from_google',
          accessToken,
          calendarId: 'primary'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSyncResults(data.results);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError('Failed to import from Google Calendar');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSyncOption = (key: keyof SyncOptions, value: boolean | number[]) => {
    setSyncOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateReminder = (index: number, value: number) => {
    const newReminders = [...syncOptions.defaultReminders];
    newReminders[index] = value;
    updateSyncOption('defaultReminders', newReminders);
  };

  const addReminder = () => {
    updateSyncOption('defaultReminders', [...syncOptions.defaultReminders, 60]);
  };

  const removeReminder = (index: number) => {
    const newReminders = syncOptions.defaultReminders.filter((_, i) => i !== index);
    updateSyncOption('defaultReminders', newReminders);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Google Calendar Sync
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sync your productivity data with Google Calendar
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          {!isConnected ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Not connected to Google Calendar
                </span>
              </div>
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Connect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Connected to Google Calendar
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Sync Options */}
        {showOptions && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Sync Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncOptions.syncProjects}
                  onChange={(e) => updateSyncOption('syncProjects', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sync Projects</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncOptions.syncTodos}
                  onChange={(e) => updateSyncOption('syncTodos', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sync Todos</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncOptions.syncWorkouts}
                  onChange={(e) => updateSyncOption('syncWorkouts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sync Workouts</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={syncOptions.syncTimeBlocks}
                  onChange={(e) => updateSyncOption('syncTimeBlocks', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sync Time Blocks</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={syncOptions.twoWaySync}
                  onChange={(e) => updateSyncOption('twoWaySync', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Two-way sync (experimental)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Reminders (minutes before event)
              </label>
              <div className="space-y-2">
                {syncOptions.defaultReminders.map((reminder, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={reminder}
                      onChange={(e) => updateReminder(index, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">minutes</span>
                    {syncOptions.defaultReminders.length > 1 && (
                      <button
                        onClick={() => removeReminder(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addReminder}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  + Add reminder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sync Actions */}
        {isConnected && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSyncToGoogle}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Sync to Google Calendar
            </button>
            
            <button
              onClick={handleImportFromGoogle}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Import from Google Calendar
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Sync Results */}
        {syncResults && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Sync Results</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 dark:text-blue-300">Created:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                  {syncResults.created}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Updated:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                  {syncResults.updated}
                </span>
              </div>
              <div>
                <span className="text-blue-700 dark:text-blue-300">Errors:</span>
                <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">
                  {syncResults.errors}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 