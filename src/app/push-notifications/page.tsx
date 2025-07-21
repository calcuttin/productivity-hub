'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Smartphone,
  Clock,
  Calendar,
  Target,
  BookOpen,
  CheckSquare,
  FileText,
  Shield,
  Info
} from 'lucide-react';
import PushNotificationManager from '@/components/PushNotificationManager';

interface NotificationSettings {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableDueDateReminders: boolean;
  enableWorkoutReminders: boolean;
  enableResearchAlerts: boolean;
  enableAchievementNotifications: boolean;
  enableStreakNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

export default function PushNotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enablePushNotifications: true,
    enableEmailNotifications: true,
    enableDueDateReminders: true,
    enableWorkoutReminders: true,
    enableResearchAlerts: true,
    enableAchievementNotifications: true,
    enableStreakNotifications: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notification-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Push Notification Settings
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Configure how and when you receive notifications
        </p>
      </div>

      {/* Push Notification Manager */}
      <div className="mb-8">
        <PushNotificationManager />
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Preferences
          </h2>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-sm ${
                message.type === 'success' 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* General Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              General Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Push Notifications
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Receive notifications in your browser
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enablePushNotifications}
                    onChange={(e) => updateSetting('enablePushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Receive notifications via email
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableEmailNotifications}
                    onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notification Types
            </h3>
            <div className="space-y-4">
              {[
                { key: 'enableDueDateReminders', label: 'Due Date Reminders', icon: Calendar, description: 'Get reminded about upcoming deadlines' },
                { key: 'enableWorkoutReminders', label: 'Workout Reminders', icon: Target, description: 'Stay on track with your fitness goals' },
                { key: 'enableResearchAlerts', label: 'Research Alerts', icon: BookOpen, description: 'Get notified about new research papers' },
                { key: 'enableAchievementNotifications', label: 'Achievement Notifications', icon: CheckCircle, description: 'Celebrate your accomplishments' },
                { key: 'enableStreakNotifications', label: 'Streak Notifications', icon: CheckSquare, description: 'Track your consistency streaks' }
              ].map(({ key, label, icon: Icon, description }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {description}
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof NotificationSettings] as boolean}
                      onChange={(e) => updateSetting(key as keyof NotificationSettings, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quiet Hours
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Enable Quiet Hours
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Pause notifications during specific hours
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quietHoursEnabled}
                    onChange={(e) => updateSetting('quietHoursEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 ml-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Timezone
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <option key={tz} value={tz}>
                    {tz} ({new Date().toLocaleString('en-US', { timeZone: tz, timeZoneName: 'short' })})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
            About Push Notifications
          </h3>
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>• Push notifications work even when the app is closed</p>
          <p>• You can customize which types of notifications you receive</p>
          <p>• Quiet hours help you avoid notifications during sleep or focus time</p>
          <p>• Notifications are sent securely and respect your privacy</p>
          <p>• You can disable notifications at any time</p>
        </div>
      </div>
    </div>
  );
} 