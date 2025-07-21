'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import TimeTracker from '@/components/TimeTracker';
import { Clock, BarChart3, Calendar, TrendingUp, Target, MapPin } from 'lucide-react';

interface TimeSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isActive: boolean;
  activityType: string;
  category?: string;
  tags: string[];
  location?: string;
  notes?: string;
  project?: { id: string; name: string };
  todo?: { id: string; title: string };
  research?: { id: string; title: string };
  workout?: { id: string; name: string };
}

interface TimeAnalytics {
  timeframe: number;
  summary: {
    totalHours: number;
    totalSessions: number;
    averageSessionLength: number;
    currentStreak: number;
    longestStreak: number;
    activeDays: number;
  };
  breakdown: {
    byActivity: Record<string, number>;
    byCategory: Record<string, number>;
    byLocation: Record<string, number>;
    byProductivity: Record<string, number>;
    byFocus: Record<string, number>;
  };
  patterns: {
    daily: Record<string, { total: number; byActivity: Record<string, number> }>;
    hourly: Record<number, number>;
    weekly: Record<number, number>;
    bestHour: number;
    bestDay: number;
  };
  recentSessions: Array<{
    id: string;
    title: string;
    activityType: string;
    duration: number;
    startTime: string;
    endTime?: string;
    linkedItem?: string;
  }>;
}

export default function TimeTrackingPage() {
  const { data: session } = useSession();
  const [recentSessions, setRecentSessions] = useState<TimeSession[]>([]);
  const [analytics, setAnalytics] = useState<TimeAnalytics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchRecentSessions();
      fetchAnalytics();
    }
  }, [session, selectedTimeframe]);

  const fetchRecentSessions = async () => {
    try {
      const response = await fetch('/api/time-sessions?limit=20');
      if (response.ok) {
        const sessions = await response.json();
        setRecentSessions(sessions);
      }
    } catch (error) {
      console.error('Failed to fetch recent sessions:', error);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/time-analytics?timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityColor = (activityType: string) => {
    const colors: Record<string, string> = {
      project: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      todo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      workout: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      break: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      meeting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      other: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[activityType] || colors.other;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!session) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">Please sign in to access time tracking.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Time Tracking</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your time across different activities and analyze your productivity patterns.
          </p>
        </div>

        {/* Timer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <TimeTracker />
          </div>
          
          {/* Quick Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Overview
                </h2>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading analytics...</p>
                </div>
              ) : analytics && analytics.summary ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analytics.summary.totalHours || 0}h
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analytics.summary.totalSessions || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {analytics.summary.averageSessionLength || 0}m
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {analytics.summary.activeDays || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Days</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Breakdown and Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Breakdown */}
          {analytics && analytics.breakdown && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Time by Activity
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.breakdown.byActivity || {})
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([activity, hours]) => (
                    <div key={activity} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getActivityColor(activity)}`}>
                          {activity}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {(hours as number).toFixed(1)}h
                      </div>
                    </div>
                  ))
                }
                {Object.keys(analytics.breakdown.byActivity || {}).length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No activity data available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Sessions
            </h3>
            {recentSessions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getActivityColor(session.activityType)}`}>
                          {session.activityType}
                        </span>
                        {session.isActive && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(session.startTime)}
                        {session.location && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {session.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white ml-4">
                      {session.duration ? formatDuration(session.duration) : 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No sessions yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Start your first timer session to see it here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Pattern Visualization */}
        {analytics && analytics.patterns && analytics.patterns.weekly && Object.keys(analytics.patterns.weekly).length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Pattern
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day, index) => {
                const weeklyData = analytics.patterns.weekly || {};
                const maxValue = Math.max(...Object.values(weeklyData), 1); // Avoid division by zero
                const dayValue = weeklyData[index] || 0;
                
                return (
                  <div key={day} className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      {day}
                    </div>
                    <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-end justify-center relative overflow-hidden">
                      <div
                        className="bg-blue-500 w-full transition-all duration-300"
                        style={{
                          height: `${Math.max(10, (dayValue / maxValue) * 100)}%`
                        }}
                      />
                      <div className="absolute bottom-1 text-xs text-white font-medium">
                        {dayValue.toFixed(1)}h
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 