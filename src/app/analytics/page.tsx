'use client';

import Navigation from '@/components/Navigation';
import AdvancedCharts, { 
  ProductivityTrendsChart, 
  ActivityBreakdownChart, 
  TimeDistributionChart, 
  GoalsProgressChart 
} from '@/components/AdvancedCharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Calendar,
  Clock,
  Target,
  Zap,
  Download,
  Filter
} from 'lucide-react';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedCharts, setSelectedCharts] = useState<string[]>([
    'productivity', 'activity', 'time', 'goals'
  ]);

  const toggleChart = (chartId: string) => {
    setSelectedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
  };

  return (
    <div className="page-container">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Advanced Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Deep insights into your productivity patterns and performance metrics
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Track productivity trends over time</span>
            </div>
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Visualize activity breakdowns</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Monitor goal progress</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe:</span>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Chart Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Chart Selection</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'productivity', label: 'Productivity Trends', icon: TrendingUp },
              { id: 'activity', label: 'Activity Breakdown', icon: Activity },
              { id: 'time', label: 'Time Distribution', icon: Clock },
              { id: 'goals', label: 'Goals Progress', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => toggleChart(id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCharts.includes(id)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          {selectedCharts.includes('productivity') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Productivity Trends
                </h3>
                <div className="text-sm text-gray-500">
                  {selectedTimeframe === '7d' ? 'Last 7 days' : 
                   selectedTimeframe === '30d' ? 'Last 30 days' : 'Last 90 days'}
                </div>
              </div>
              <div className="h-80 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Productivity trends chart will be displayed here</p>
                </div>
              </div>
            </div>
          )}

          {selectedCharts.includes('activity') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Breakdown
                </h3>
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Activity breakdown chart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Distribution
                </h3>
                <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Time distribution chart</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCharts.includes('goals') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals Progress
              </h3>
              <div className="h-80 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Goals progress chart</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Productivity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+5% from last week</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">24</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">80% completion rate</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Hours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">32h</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">6.4h average per day</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12d</p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Personal best: 15 days</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">AI Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Productivity Peak</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Your most productive hours are between 9 AM and 11 AM. Consider scheduling your most important tasks during this time.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-3 w-3" />
                <span>Based on 30 days of data</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Improvement Opportunity</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                You're spending 25% of your time in meetings. Consider reducing meeting duration or frequency to increase deep work time.
              </p>
              <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                <Activity className="h-3 w-3" />
                <span>Time optimization suggestion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 