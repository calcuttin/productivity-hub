'use client';

import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import StreakTracker from '@/components/StreakTracker';

export default function StreaksPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="page-container">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Streak Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please log in to view and track your streaks.
            </p>
            <a
              href="/api/auth/signin"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign In
            </a>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Streak Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily habits and build consistent productivity patterns
          </p>
        </div>

        <StreakTracker />
      </div>
    </div>
  );
} 