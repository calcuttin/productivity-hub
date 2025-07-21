'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface MiniStreakData {
  todos: { current: number; };
  workouts: { current: number; };
  productivity: { current: number; };
  summary: {
    longestCurrentStreak: number;
    streakRank: string;
  };
}

interface MiniStreakWidgetProps {
  className?: string;
}

export default function MiniStreakWidget({ className = '' }: MiniStreakWidgetProps) {
  const { data: session, status } = useSession();
  const [streakData, setStreakData] = useState<MiniStreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchStreaks();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  const fetchStreaks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/streaks');
      
      if (!response.ok) {
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
    if (streakLength >= 1) return '💫';
    return '⭕';
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

  if (status === 'loading' || loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Track Your Streaks
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Build consistent habits and track your progress
          </p>
          <Link 
            href="/api/auth/signin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign In to Track
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Error Loading Streaks
          </h3>
          <button 
            onClick={fetchStreaks}
            className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!streakData) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 ${className}`} data-tour="streaks">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <span className="text-lg sm:text-xl mr-2">🔥</span>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Current Streaks
          </h3>
        </div>
        <Link 
          href="/streaks"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Current Streaks Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="text-center">
          <div className={`text-xl sm:text-2xl font-bold ${getStreakColor(streakData.todos.current)}`}>
            {streakData.todos.current}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Todos</div>
          <div className="text-base sm:text-lg">{getStreakIcon(streakData.todos.current)}</div>
        </div>
        
        <div className="text-center">
          <div className={`text-xl sm:text-2xl font-bold ${getStreakColor(streakData.workouts.current)}`}>
            {streakData.workouts.current}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Workouts</div>
          <div className="text-base sm:text-lg">{getStreakIcon(streakData.workouts.current)}</div>
        </div>
        
        <div className="text-center">
          <div className={`text-xl sm:text-2xl font-bold ${getStreakColor(streakData.productivity.current)}`}>
            {streakData.productivity.current}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Overall</div>
          <div className="text-base sm:text-lg">{getStreakIcon(streakData.productivity.current)}</div>
        </div>
      </div>

      {/* Summary Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm gap-1 sm:gap-0">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Best Current: </span>
            <span className={`font-semibold ${getStreakColor(streakData.summary.longestCurrentStreak)}`}>
              {streakData.summary.longestCurrentStreak} days
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Rank: </span>
            <span className={`font-semibold ${getRankColor(streakData.summary.streakRank)}`}>
              {streakData.summary.streakRank}
            </span>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-3 text-center">
        {streakData.summary.longestCurrentStreak === 0 ? (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Start your first streak today! 🚀
          </p>
        ) : streakData.summary.longestCurrentStreak >= 7 ? (
          <p className="text-xs text-green-600 dark:text-green-400">
            Amazing consistency! Keep it up! 🎉
          </p>
        ) : (
          <p className="text-xs text-blue-600 dark:text-blue-400">
            You're building momentum! 💪
          </p>
        )}
      </div>
    </div>
  );
} 