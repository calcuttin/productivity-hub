'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  template?: {
    name: string;
    type: string;
    description?: string;
  };
}

interface NotificationSettings {
  id: string;
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  enablePushNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  projectNotifications: boolean;
  todoNotifications: boolean;
  workoutNotifications: boolean;
  researchNotifications: boolean;
  defaultReminderTiming: string;
  enableDailyDigest: boolean;
  enableWeeklyDigest: boolean;
  digestTime: string;
}

const NOTIFICATION_TYPES = {
  due_date: { icon: '⏰', label: 'Due Dates', color: 'text-orange-600' },
  workout: { icon: '💪', label: 'Workouts', color: 'text-blue-600' },
  research: { icon: '📖', label: 'Research', color: 'text-purple-600' },
  achievement: { icon: '🏆', label: 'Achievements', color: 'text-yellow-600' },
  reminder: { icon: '🔔', label: 'Reminders', color: 'text-gray-600' },
  system: { icon: '⚙️', label: 'System', color: 'text-gray-600' },
};

const PRIORITY_STYLES = {
  urgent: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  low: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      fetchSettings();
    }
  }, [session, filter, typeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/notifications?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notification-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const createTestNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
      });
      
      if (response.ok) {
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Failed to create test notifications:', err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? { ...n, status: 'read', readAt: new Date().toISOString() }
              : n
          )
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setSelectedNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const bulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const bulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const response = await fetch('/api/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const selectAllNotifications = () => {
    setSelectedNotifications(new Set(notifications.map(n => n.id)));
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  if (!session?.user) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Please sign in to view notifications
            </h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Notifications
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your notifications and alert preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'notifications' ? (
          <div>
            {/* Controls */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {/* Filters */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                {/* Test Button */}
                <button
                  onClick={createTestNotifications}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Create Test Notifications
                </button>

                {/* Bulk Actions */}
                {selectedNotifications.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedNotifications.size} selected
                    </span>
                    <button
                      onClick={bulkMarkAsRead}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={bulkDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {notifications.length > 0 && (
                  <button
                    onClick={selectedNotifications.size === notifications.length ? clearSelection : selectAllNotifications}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {selectedNotifications.size === notifications.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600 dark:text-red-400">
                <p>{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {filter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your filters to see more notifications.' 
                    : 'You\'re all caught up! Create some test notifications to see how the system works.'}
                </p>
                <button
                  onClick={createTestNotifications}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Test Notifications
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES] || NOTIFICATION_TYPES.system;
                  const priorityStyle = PRIORITY_STYLES[notification.priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.medium;
                  const isUnread = notification.status === 'unread';
                  const isSelected = selectedNotifications.has(notification.id);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-2 ${
                        isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                        isUnread ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' : 
                        priorityStyle.border + ' ' + priorityStyle.bg + ' dark:bg-gray-800'
                      } hover:shadow-md transition-all duration-200`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />

                        {/* Type Icon */}
                        <div className="flex-shrink-0">
                          <span className="text-2xl">{typeConfig.icon}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {notification.title}
                                {isUnread && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                              </h3>
                              <p className={`mt-1 ${isUnread ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                {notification.message}
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${priorityStyle.color} ${priorityStyle.bg} border ${priorityStyle.border}`}>
                                  {notification.priority.toUpperCase()}
                                </span>
                                <span className={typeConfig.color}>
                                  {typeConfig.label}
                                </span>
                                <span>{formatTimeAgo(notification.createdAt)}</span>
                                {notification.readAt && (
                                  <span className="text-green-600 dark:text-green-400">
                                    ✓ Read {formatTimeAgo(notification.readAt)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              {notification.actionUrl && (
                                <button
                                  onClick={() => handleNotificationClick(notification)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                  View
                                </button>
                              )}
                              {isUnread && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Settings Tab */
          <div className="max-w-2xl">
            {settings ? (
              <div className="space-y-6">
                {/* Global Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Global Notification Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enableNotifications}
                        onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        Enable all notifications
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enableEmailNotifications}
                        onChange={(e) => updateSettings({ enableEmailNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        Email notifications
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enableBrowserNotifications}
                        onChange={(e) => updateSettings({ enableBrowserNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        Browser notifications
                      </span>
                    </label>
                  </div>
                </div>

                {/* Category Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Notification Categories
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.projectNotifications}
                        onChange={(e) => updateSettings({ projectNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        📋 Project notifications
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.todoNotifications}
                        onChange={(e) => updateSettings({ todoNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        ✅ Todo notifications
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.workoutNotifications}
                        onChange={(e) => updateSettings({ workoutNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        💪 Workout notifications
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.researchNotifications}
                        onChange={(e) => updateSettings({ researchNotifications: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        📖 Research notifications
                      </span>
                    </label>
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Timing & Schedule
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Default reminder timing
                      </label>
                      <select
                        value={settings.defaultReminderTiming}
                        onChange={(e) => updateSettings({ defaultReminderTiming: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                      >
                        <option value="1">1 hour before</option>
                        <option value="6">6 hours before</option>
                        <option value="24">1 day before</option>
                        <option value="48">2 days before</option>
                        <option value="168">1 week before</option>
                      </select>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.quietHoursEnabled}
                        onChange={(e) => updateSettings({ quietHoursEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        Enable quiet hours
                      </span>
                    </label>

                    {settings.quietHoursEnabled && (
                      <div className="ml-7 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start time
                          </label>
                          <input
                            type="time"
                            value={settings.quietHoursStart || '22:00'}
                            onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End time
                          </label>
                          <input
                            type="time"
                            value={settings.quietHoursEnd || '08:00'}
                            onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Digest Settings */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Digest Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enableDailyDigest}
                        onChange={(e) => updateSettings({ enableDailyDigest: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        Daily digest emails
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.enableWeeklyDigest}
                        onChange={(e) => updateSettings({ enableWeeklyDigest: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        Weekly digest emails
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Digest delivery time
                      </label>
                      <input
                        type="time"
                        value={settings.digestTime}
                        onChange={(e) => updateSettings({ digestTime: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 