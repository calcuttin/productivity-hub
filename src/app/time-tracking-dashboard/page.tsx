"use client";
import Navigation from '@/components/Navigation';
import TimeTrackingDashboard from '@/components/TimeTrackingDashboard';
import TimeTrackingGoals from '@/components/TimeTrackingGoals';
import { Clock, BarChart3, TrendingUp, Target } from 'lucide-react';

export default function TimeTrackingDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Time Tracking Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor your productivity patterns and time management insights
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Track your time across different activities</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Identify your most productive patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Set and achieve time management goals</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <TimeTrackingDashboard className="mb-8" />

        {/* Goals and Insights */}
        <TimeTrackingGoals />
      </main>
    </div>
  );
} 