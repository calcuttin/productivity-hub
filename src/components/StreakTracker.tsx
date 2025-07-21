'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface StreakData {
  current: number;
  longest: number;
  lastActiveDate: string | null;
  streakType: string;
  goal: number;
  isOnTrack: boolean;
}

interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface Challenge {
  type: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  current: number;
  daysRemaining: number;
}

interface StreakHistory {
  streakLength: number;
  date: string;
  type: 'milestone' | 'ended';
  description: string;
}

interface StreakTrackerData {
  summary: {
    totalActiveStreaks: number;
    longestCurrentStreak: number;
    allTimeLongest: number;
    streakRank: string;
  };
  todos: StreakData & {
    weeklyCompletionRates: any[];
    averageDaily: number;
    bestDay: string;
  };
  workouts: StreakData & {
    weeklyCompletionRates: any[];
    averageWeekly: number;
    consistencyScore: number;
  };
  productivity: StreakData & {
    averageProductivityScore: number;
    mostProductiveDay: string;
  };
  history: StreakHistory[];
  achievements: Achievement[];
  challenges: Challenge[];
}

interface StreakTrackerProps {
  className?: string;
}

export default function StreakTracker({ className = '' }: StreakTrackerProps) {
  const { data: session, status } = useSession();
  const [streakData, setStreakData] = useState<StreakTrackerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchStreaks();
    }
  }, [status, session]);

  const fetchStreaks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/streaks');
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view your streaks');
          return;
        }
        throw new Error('Failed to fetch streak data');
      }
      
      const data = await response.json();
      setStreakData(data);
    } catch (err) {
      console.error('Error fetching streaks:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStreakColor = (streakLength: number) => {
    if (streakLength >= 30) return 'text-purple-600 dark:text-purple-400';
    if (streakLength >= 14) return 'text-blue-600 dark:text-blue-400';
    if (streakLength >= 7) return 'text-green-600 dark:text-green-400';
    if (streakLength >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStreakIcon = (streakLength: number) => {
    if (streakLength >= 30) return '🔥';
    if (streakLength >= 14) return '⚡';
    if (streakLength >= 7) return '🌟';
    if (streakLength >= 3) return '✨';
    return '💫';
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legend': return 'text-purple-600 dark:text-purple-400';
      case 'Expert': return 'text-blue-600 dark:text-blue-400';
      case 'Advanced': return 'text-green-600 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 dark:text-yellow-400';
      case 'Beginner': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-600 dark:text-red-400 font-medium">
              <strong>Error:</strong> {error}
            </span>
          </div>
          <button 
            onClick={fetchStreaks}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!streakData) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">🔥</span>
              Streak Tracker
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Keep your momentum going!
            </p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRankColor(streakData.summary.streakRank)}`}>
              {streakData.summary.streakRank}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Streak Rank</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {streakData.summary.totalActiveStreaks}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Streaks</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-3xl font-bold ${getStreakColor(streakData.summary.longestCurrentStreak)}`}>
              {streakData.summary.longestCurrentStreak}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Longest Current</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className={`text-3xl font-bold ${getStreakColor(streakData.summary.allTimeLongest)}`}>
              {streakData.summary.allTimeLongest}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">All-Time Best</p>
          </div>
        </div>
      </div>

      {/* Individual Streak Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Todo Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Todo Streak
            </h3>
            <span className="text-2xl">{getStreakIcon(streakData.todos.current)}</span>
          </div>
          
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getStreakColor(streakData.todos.current)}`}>
              {streakData.todos.current}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">days</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.todos.longest} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Active:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatLastActive(streakData.todos.lastActiveDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Best Day:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.todos.bestDay}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Daily Avg:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.todos.averageDaily.toFixed(1)} todos
              </span>
            </div>
          </div>

          {/* Progress to next goal */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Next Goal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.todos.goal} days
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((streakData.todos.current / streakData.todos.goal) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Workout Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workout Streak
            </h3>
            <span className="text-2xl">{getStreakIcon(streakData.workouts.current)}</span>
          </div>
          
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getStreakColor(streakData.workouts.current)}`}>
              {streakData.workouts.current}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">days</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.workouts.longest} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Active:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatLastActive(streakData.workouts.lastActiveDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Consistency:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.workouts.consistencyScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Weekly Avg:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.workouts.averageWeekly.toFixed(1)} workouts
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Next Goal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.workouts.goal} days
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((streakData.workouts.current / streakData.workouts.goal) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Productivity Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productivity Streak
            </h3>
            <span className="text-2xl">{getStreakIcon(streakData.productivity.current)}</span>
          </div>
          
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold ${getStreakColor(streakData.productivity.current)}`}>
              {streakData.productivity.current}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">days</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.productivity.longest} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Active:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatLastActive(streakData.productivity.lastActiveDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Best Day:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.productivity.mostProductiveDay}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg Score:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.productivity.averageProductivityScore.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Next Goal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {streakData.productivity.goal} days
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((streakData.productivity.current / streakData.productivity.goal) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Challenges */}
      {streakData.challenges.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Active Challenges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streakData.challenges.map((challenge, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {challenge.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {challenge.description}
                </p>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {challenge.current}/{challenge.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(challenge.progress, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {challenge.daysRemaining} days remaining
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {streakData.achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Recent Achievements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streakData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak History */}
      {streakData.history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Streak History
          </h3>
          <div className="space-y-3">
            {streakData.history.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-3 ${
                    event.type === 'milestone' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${getStreakColor(event.streakLength)}`}>
                  {event.streakLength}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 