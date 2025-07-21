'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  summary: {
    totalProjects: number;
    completedProjects: number;
    totalTodos: number;
    completedTodos: number;
    totalWorkouts: number;
    completedWorkouts: number;
    totalResearchPapers: number;
    productivity: number;
  };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
    averageProgress: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    recent: Array<{
      id: string;
      name: string;
      status: string;
      priority: string;
      progress: number;
      createdAt: string;
    }>;
  };
  todos: {
    total: number;
    completed: number;
    overdue: number;
    completionRate: number;
    byPriority: Record<string, number>;
    today: {
      total: number;
      completed: number;
      completionRate: number;
    };
    recent: Array<{
      id: string;
      title: string;
      completed: boolean;
      priority: string;
      createdAt: string;
    }>;
  };
  workouts: {
    total: number;
    completed: number;
    completionRate: number;
    weekly: {
      total: number;
      completed: number;
      completionRate: number;
    };
    recent: Array<{
      id: string;
      name: string;
      date: string;
      completed: boolean;
    }>;
  };
  research: {
    total: number;
    recent: Array<{
      id: string;
      title: string;
      publication?: string;
      year?: number;
      createdAt: string;
    }>;
    byYear: Record<string, number>;
  };
  streaks: {
    todos: number;
    workouts: number;
  };
  recentActivity: Array<{
    type: string;
    item: any;
    updatedAt: string;
  }>;
  timeframe: number;
}

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analytics = await response.json();
      setData(analytics);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-body">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ))}
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
            onClick={fetchAnalytics}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📋';
      case 'todo':
        return '✓';
      case 'workout':
        return '💪';
      case 'research':
        return '📚';
      default:
        return '📝';
    }
  };

  return (
    <div className={`${className}`}>
      {/* Header with timeframe selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-primary">Analytics Dashboard</h2>
          <a
            href="/productivity-summary"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View Detailed Summary →
          </a>
        </div>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="input-standard w-full sm:w-auto"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-secondary mb-2">Overall Productivity</h3>
            <div className={`text-3xl font-bold ${getProductivityColor(data.summary.productivity)}`}>
              {data.summary.productivity}%
            </div>
            <p className="text-xs text-muted mt-1">Weighted score</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-secondary mb-2">Projects</h3>
            <div className="text-2xl font-bold text-primary">
              {data.summary.completedProjects}/{data.summary.totalProjects}
            </div>
            <p className="text-xs text-muted mt-1">
              {data.projects.completionRate}% completion rate
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-secondary mb-2">Today's Todos</h3>
            <div className="text-2xl font-bold text-primary">
              {data.todos.today.completed}/{data.todos.today.total}
            </div>
            <p className="text-xs text-muted mt-1">
              {data.todos.today.completionRate}% completed today
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-sm font-medium text-secondary mb-2">Current Streaks</h3>
            <div className="text-sm text-primary space-y-1">
              <div>📋 Todos: {data.streaks.todos} days</div>
              <div>💪 Workouts: {data.streaks.workouts} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
        {/* Projects Analytics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Projects Overview</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-secondary">In Progress</div>
                <div className="text-xl font-bold text-primary">{data.projects.inProgress}</div>
              </div>
              <div>
                <div className="text-sm text-secondary">Overdue</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{data.projects.overdue}</div>
              </div>
            </div>
            
            <div>
              <div className="text-sm text-secondary mb-2">Average Progress</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.projects.averageProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted mt-1">{data.projects.averageProgress}%</div>
            </div>

            <div>
              <div className="text-sm text-secondary mb-2">By Priority</div>
              <div className="space-y-1">
                {Object.entries(data.projects.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between text-sm">
                    <span className="text-muted">{priority}</span>
                    <span className="text-primary font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Todos Analytics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Todos Overview</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-secondary">Completed</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {data.todos.completed}
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary">Overdue</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {data.todos.overdue}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-secondary mb-2">Completion Rate</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.todos.completionRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted mt-1">{data.todos.completionRate}%</div>
            </div>

            <div>
              <div className="text-sm text-secondary mb-2">By Priority</div>
              <div className="space-y-1">
                {Object.entries(data.todos.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between text-sm">
                    <span className="text-muted">{priority}</span>
                    <span className="text-primary font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Workouts Analytics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Fitness Overview</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-secondary">Total Workouts</div>
                <div className="text-xl font-bold text-primary">{data.workouts.total}</div>
              </div>
              <div>
                <div className="text-sm text-secondary">Completed</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {data.workouts.completed}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-secondary mb-2">Overall Completion</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.workouts.completionRate}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted mt-1">{data.workouts.completionRate}%</div>
            </div>

            <div>
              <div className="text-sm text-secondary mb-2">This Week</div>
              <div className="text-sm text-primary">
                {data.workouts.weekly.completed}/{data.workouts.weekly.total} completed
                <span className="text-muted ml-2">
                  ({data.workouts.weekly.completionRate}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {data.recentActivity.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-lg">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary truncate">
                      {activity.type === 'project' ? activity.item.name :
                       activity.type === 'todo' ? activity.item.title :
                       activity.type === 'workout' ? activity.item.name :
                       activity.item.title}
                    </div>
                    <div className="text-xs text-muted">
                      {activity.type} • {formatDate(activity.updatedAt)}
                    </div>
                  </div>
                  {activity.type === 'project' && (
                    <span className={`status-badge ${
                      activity.item.status === 'Completed' ? 'status-green' :
                      activity.item.status === 'In Progress' ? 'status-blue' :
                      'status-gray'
                    }`}>
                      {activity.item.status}
                    </span>
                  )}
                  {(activity.type === 'todo' || activity.type === 'workout') && (
                    <span className={`status-badge ${
                      activity.item.completed ? 'status-green' : 'status-gray'
                    }`}>
                      {activity.item.completed ? 'Done' : 'Pending'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Research Papers</h3>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <div className="text-2xl font-bold text-primary">{data.research.total}</div>
              <div className="text-sm text-secondary">Total papers</div>
            </div>
            
            {data.research.recent.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-secondary mb-2">Recent Papers</div>
                {data.research.recent.slice(0, 5).map((paper) => (
                  <div key={paper.id} className="border-l-2 border-blue-200 dark:border-blue-700 pl-3">
                    <div className="text-sm font-medium text-primary truncate">
                      {paper.title}
                    </div>
                    <div className="text-xs text-muted">
                      {paper.publication && `${paper.publication} • `}
                      {paper.year && `${paper.year} • `}
                      {formatDate(paper.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted">No recent research papers</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 