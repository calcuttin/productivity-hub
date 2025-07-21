'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Calendar, Clock, AlertTriangle, Play, CheckCircle } from 'lucide-react';

interface DueDateItem {
  id: string;
  title: string;
  dueDate: Date;
  type: 'project' | 'todo';
  priority?: string;
  userId: string;
}

interface ReminderStats {
  remindersCreated: number;
  overdueProcessed: number;
}

export default function DueDateReminders() {
  const { data: session, status } = useSession();
  const [upcomingItems, setUpcomingItems] = useState<DueDateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchUpcomingItems();
    }
  }, [session]);

  const fetchUpcomingItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/due-date-reminders', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming items');
      }
      const data = await response.json();
      setUpcomingItems(data.upcomingItems || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching upcoming items:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const processReminders = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/due-date-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'process_user' }),
      });

      if (!response.ok) {
        throw new Error('Failed to process reminders');
      }

      const data = await response.json();
      setStats(data.results);
      setError(null);
      
      // Refresh the upcoming items list
      await fetchUpcomingItems();
    } catch (err) {
      console.error('Error processing reminders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setProcessing(false);
    }
  };

  const formatTimeUntilDue = (dueDate: Date): { text: string; color: string; urgency: 'low' | 'medium' | 'high' } => {
    const now = new Date();
    const timeDiff = new Date(dueDate).getTime() - now.getTime();
    const hoursUntilDue = timeDiff / (1000 * 60 * 60);

    if (hoursUntilDue < 0) {
      const daysPastDue = Math.ceil(Math.abs(hoursUntilDue) / 24);
      return {
        text: `${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue`,
        color: 'text-red-600',
        urgency: 'high'
      };
    } else if (hoursUntilDue <= 1) {
      return {
        text: 'Due within 1 hour',
        color: 'text-red-500',
        urgency: 'high'
      };
    } else if (hoursUntilDue <= 24) {
      const hours = Math.ceil(hoursUntilDue);
      return {
        text: `Due in ${hours} hour${hours > 1 ? 's' : ''}`,
        color: 'text-orange-500',
        urgency: 'medium'
      };
    } else {
      const days = Math.ceil(hoursUntilDue / 24);
      return {
        text: `Due in ${days} day${days > 1 ? 's' : ''}`,
        color: 'text-blue-600',
        urgency: 'low'
      };
    }
  };

  const getPriorityColor = (priority?: string): string => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Please sign in to view due date reminders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Due Date Reminders
          </h2>
        </div>
        <button
          onClick={processReminders}
          disabled={processing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          <span>{processing ? 'Processing...' : 'Process Reminders'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {stats && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 dark:text-green-400">
              Processed successfully: {stats.remindersCreated} reminders created
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Upcoming Due Dates ({upcomingItems.length})
        </h3>

        {upcomingItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming due dates found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingItems.map((item) => {
              const timeInfo = formatTimeUntilDue(new Date(item.dueDate));
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {item.type === 'project' ? (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        ) : (
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {item.type}
                          </span>
                          {item.priority && (
                            <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm font-medium ${timeInfo.color}`}>
                          {timeInfo.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.dueDate).toLocaleDateString()} at{' '}
                        {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {timeInfo.urgency === 'high' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Due date reminders are automatically processed based on your notification settings.
          Use the "Process Reminders" button to manually check for new reminders.
        </p>
      </div>
    </div>
  );
} 