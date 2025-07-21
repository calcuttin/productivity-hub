'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  date: string;
}

interface Milestone {
  type: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

interface Insight {
  type: 'positive' | 'suggestion' | 'celebration';
  title: string;
  description: string;
  icon: string;
}

interface DailyActivity {
  date: string;
  todos: number;
  workouts: number;
  projectUpdates: number;
  isActive: boolean;
}

interface PeriodData {
  projects: {
    created: number;
    completed: number;
    avgProgress: number;
  };
  todos: {
    created: number;
    completed: number;
    highPriorityCompleted: number;
    mediumPriorityCompleted: number;
    lowPriorityCompleted: number;
  };
  workouts: {
    planned: number;
    completed: number;
    completionRate: number;
  };
  research: {
    added: number;
    read: number;
  };
  dailyActivity: DailyActivity[];
  focusTime: number;
  consistency: number;
}

interface ProductivitySummaryData {
  period: {
    type: string;
    offset: number;
    startDate: string;
    endDate: string;
    label: string;
  };
  metrics: PeriodData;
  improvements: {
    projectsCompleted: number;
    todosCompleted: number;
    workoutCompletionRate: number;
    consistency: number;
    focusTime: number;
  };
  productivityScore: number;
  achievements: Achievement[];
  milestones: Milestone[];
  habits: {
    consistencyRate: number;
    activeDays: number;
    totalDays: number;
    bestDayOfWeek: string;
    averageDailyTasks: number;
    averageWeeklyWorkouts: number;
  };
  insights: Insight[];
  comparison: {
    previous: PeriodData;
    improvements: any;
  };
}

interface ProductivitySummaryProps {
  className?: string;
}

export default function ProductivitySummary({ className = '' }: ProductivitySummaryProps) {
  const { data: session, status } = useSession();
  const [summaryData, setSummaryData] = useState<ProductivitySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedOffset, setSelectedOffset] = useState(0);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchSummary();
    }
  }, [status, session, selectedPeriod, selectedOffset]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/productivity-summary?period=${selectedPeriod}&offset=${selectedOffset}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view your productivity summary');
          return;
        }
        throw new Error('Failed to fetch summary data');
      }
      
      const data = await response.json();
      setSummaryData(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatImprovement = (value: number) => {
    if (value === 0) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getImprovementColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProductivityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return '✅';
      case 'suggestion':
        return '💡';
      case 'celebration':
        return '🎉';
      default:
        return '📊';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            onClick={fetchSummary}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Productivity Summary
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {summaryData.period.label}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
            
            {/* Navigation */}
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedOffset(selectedOffset + 1)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Previous period"
              >
                ←
              </button>
              <button
                onClick={() => setSelectedOffset(Math.max(0, selectedOffset - 1))}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Next period"
                disabled={selectedOffset === 0}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Productivity Score
          </h3>
          <div className={`text-6xl font-bold ${getProductivityScoreColor(summaryData.productivityScore)} mb-2`}>
            {summaryData.productivityScore}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(summaryData.productivityScore, 100)}%` }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
            Based on projects, tasks, workouts, and consistency
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Projects Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData.metrics.projects.completed}
              </p>
              <p className={`text-sm ${getImprovementColor(summaryData.improvements.projectsCompleted)}`}>
                {formatImprovement(summaryData.improvements.projectsCompleted)} vs last period
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData.metrics.todos.completed}
              </p>
              <p className={`text-sm ${getImprovementColor(summaryData.improvements.todosCompleted)}`}>
                {formatImprovement(summaryData.improvements.todosCompleted)} vs last period
              </p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Workout Completion</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData.metrics.workouts.completionRate.toFixed(1)}%
              </p>
              <p className={`text-sm ${getImprovementColor(summaryData.improvements.workoutCompletionRate)}`}>
                {formatImprovement(summaryData.improvements.workoutCompletionRate)} vs last period
              </p>
            </div>
            <div className="text-3xl">💪</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consistency</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summaryData.habits.consistencyRate.toFixed(1)}%
              </p>
              <p className={`text-sm ${getImprovementColor(summaryData.improvements.consistency)}`}>
                {formatImprovement(summaryData.improvements.consistency)} vs last period
              </p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Achievements & Milestones */}
      {(summaryData.achievements.length > 0 || summaryData.milestones.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          {summaryData.achievements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🏆</span>
                Achievements
              </h3>
              <div className="space-y-3">
                {summaryData.achievements.map((achievement, index) => (
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

          {/* Milestones */}
          {summaryData.milestones.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Milestones
              </h3>
              <div className="space-y-3">
                {summaryData.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-2xl mr-3">{milestone.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {milestone.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {summaryData.insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaryData.insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20' :
                insight.type === 'suggestion' ? 'bg-blue-50 dark:bg-blue-900/20' :
                'bg-purple-50 dark:bg-purple-900/20'
              }`}>
                <div className="flex items-start">
                  <span className="text-xl mr-3">{insight.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Focus & Habits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Focus & Habits
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Focus Time</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatFocusTime(summaryData.metrics.focusTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Days</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {summaryData.habits.activeDays} / {summaryData.habits.totalDays}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Best Day</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {summaryData.habits.bestDayOfWeek || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Avg Daily Tasks</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {summaryData.habits.averageDailyTasks.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">High Priority Tasks</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summaryData.metrics.todos.highPriorityCompleted}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Medium Priority Tasks</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summaryData.metrics.todos.mediumPriorityCompleted}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Low Priority Tasks</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summaryData.metrics.todos.lowPriorityCompleted}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Research Papers Added</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summaryData.metrics.research.added}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 