'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertCircle, Award, TrendingUp, Play, Calendar, CheckCircle } from 'lucide-react';

interface RestDayAnalysis {
  shouldRest: boolean;
  consecutiveDays: number;
  lastRestDay: Date | null;
  reason: string;
}

interface StreakInfo {
  currentStreak: number;
  isStreakMilestone: boolean;
  streakMessage: string;
}

interface WorkoutNotificationData {
  upcomingWorkouts: number;
  nextWorkout: any;
  restDay: RestDayAnalysis;
  streak: StreakInfo;
  recentWorkouts: number;
  lastWorkout: any;
  reminderTimings: string[];
}

export default function WorkoutNotifications() {
  const [data, setData] = useState<WorkoutNotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotificationData();
  }, []);

  async function fetchNotificationData() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/workout-notifications', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch workout notification data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function processNotifications() {
    try {
      setProcessing(true);
      setError(null);
      const response = await fetch('/api/workout-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'process_user' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process notifications');
      }
      
      // Refresh data after processing
      await fetchNotificationData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={fetchNotificationData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Workout Notifications
          </h2>
          <button
            onClick={processNotifications}
            disabled={processing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{processing ? 'Processing...' : 'Process Now'}</span>
          </button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Get intelligent workout reminders, rest day suggestions, and streak tracking to maintain your fitness routine.
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Upcoming Workouts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.upcomingWorkouts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Upcoming Workouts
              </div>
            </div>
          </div>
          {data.nextWorkout && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Next: {data.nextWorkout.name} on {new Date(data.nextWorkout.date).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Award className={`w-8 h-8 ${data.streak.currentStreak > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.streak.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Day Streak
              </div>
            </div>
          </div>
          {data.streak.isStreakMilestone && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              🎉 Milestone!
            </div>
          )}
        </div>

        {/* Rest Day Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Clock className={`w-8 h-8 ${data.restDay.shouldRest ? 'text-orange-600' : 'text-green-600'}`} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.restDay.consecutiveDays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Consecutive Days
              </div>
            </div>
          </div>
          <div className={`mt-2 text-xs font-medium ${data.restDay.shouldRest ? 'text-orange-600' : 'text-green-600'}`}>
            {data.restDay.shouldRest ? '😌 Rest Day Suggested' : '💪 Keep Going!'}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.recentWorkouts}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Recent Workouts
              </div>
            </div>
          </div>
          {data.lastWorkout && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Last: {data.lastWorkout.name} on {new Date(data.lastWorkout.date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rest Day Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Rest Day Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className={`mt-1 w-3 h-3 rounded-full ${data.restDay.shouldRest ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {data.restDay.shouldRest ? 'Rest Day Recommended' : 'You\'re On Track'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {data.restDay.reason}
                </div>
              </div>
            </div>
            
            {data.restDay.consecutiveDays > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  You've been consistently working out for {data.restDay.consecutiveDays} day{data.restDay.consecutiveDays !== 1 ? 's' : ''}.
                  {data.restDay.shouldRest && ' Your muscles would benefit from some recovery time.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Streak Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Workout Streak
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Award className={`w-6 h-6 ${data.streak.currentStreak > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {data.streak.streakMessage}
                </div>
                {data.streak.isStreakMilestone && (
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    🎉 You've reached a milestone!
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {data.streak.currentStreak === 0 
                  ? 'Start a new workout today to begin building your streak!'
                  : `Keep it up! Consistency is key to reaching your fitness goals.`
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          How Workout Notifications Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Reminder notifications before scheduled workouts</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Rest day suggestions after consecutive workouts</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Streak milestone celebrations</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Motivation reminders for inactive periods</span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-blue-700 dark:text-blue-300">
          Available reminder timings: {data.reminderTimings.join(', ')}
        </div>
      </div>
    </div>
  );
} 