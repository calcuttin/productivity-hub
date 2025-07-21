"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Target, BarChart3, PieChart, Activity, Zap } from 'lucide-react';

interface TimeSession {
  id: string;
  activityType: string;
  startTime: string;
  endTime: string;
  duration: number;
  description?: string;
  isActive: boolean;
}

interface TimeAnalytics {
  totalTime: number;
  sessionsCount: number;
  averageSessionLength: number;
  mostProductiveDay: string;
  mostProductiveHour: number;
  activityBreakdown: { [key: string]: number };
  weeklyTrend: { date: string; totalTime: number }[];
  dailyAverages: { [key: string]: number };
}

interface TimeTrackingDashboardProps {
  className?: string;
}

export default function TimeTrackingDashboard({ className = "" }: TimeTrackingDashboardProps) {
  const [analytics, setAnalytics] = useState<TimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [activeSessions, setActiveSessions] = useState<TimeSession[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchActiveSessions();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/time-analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch time analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/time-sessions?active=true');
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch active sessions:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getActivityColor = (activityType: string) => {
    const colors: { [key: string]: string } = {
      project: 'bg-blue-500',
      workout: 'bg-green-500',
      todo: 'bg-yellow-500',
      meeting: 'bg-purple-500',
      break: 'bg-gray-500',
      research: 'bg-indigo-500',
      default: 'bg-gray-400'
    };
    return colors[activityType] || colors.default;
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-80 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Time Tracking Data
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start tracking your time to see analytics and insights.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with timeframe selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Time Tracking Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your productivity and time management insights
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatDuration(analytics.totalTime)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.sessionsCount}
              </p>
            </div>
            <Activity className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Session</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatDuration(analytics.averageSessionLength)}
              </p>
            </div>
            <Target className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeSessions.length}
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Activity Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.activityBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([activity, time]) => (
                <div key={activity} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getActivityColor(activity)}`}></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {activity}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDuration(time)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(time, analytics.totalTime)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Trend
          </h3>
          <div className="space-y-3">
            {analytics.weeklyTrend.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getDayName(day.date)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${formatPercentage(day.totalTime, Math.max(...analytics.weeklyTrend.map(d => d.totalTime)))}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                    {formatDuration(day.totalTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Productivity Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Most Productive Day</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {analytics.mostProductiveDay ? getDayName(analytics.mostProductiveDay) : 'No data'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Peak Hour</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {analytics.mostProductiveHour !== -1 ? `${analytics.mostProductiveHour}:00` : 'No data'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Active Sessions
          </h3>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getActivityColor(session.activityType)}`}></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {session.activityType}
                    </p>
                    {session.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{session.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Started {new Date(session.startTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 