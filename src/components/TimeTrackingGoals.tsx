"use client";
import { useState, useEffect } from 'react';
import { Target, TrendingUp, Award, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TimeGoal {
  id: string;
  name: string;
  targetHours: number;
  currentHours: number;
  timeframe: 'daily' | 'weekly' | 'monthly';
  activityType?: string;
  completed: boolean;
  streak: number;
}

interface ProductivityInsight {
  type: 'positive' | 'warning' | 'achievement';
  title: string;
  description: string;
  metric?: string;
  icon: React.ReactNode;
}

interface TimeTrackingGoalsProps {
  className?: string;
}

export default function TimeTrackingGoals({ className = "" }: TimeTrackingGoalsProps) {
  const [goals, setGoals] = useState<TimeGoal[]>([]);
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetHours: 8,
    timeframe: 'daily' as const,
    activityType: ''
  });

  useEffect(() => {
    fetchGoals();
    generateInsights();
  }, []);

  const fetchGoals = async () => {
    try {
      // For now, we'll use mock data. In a real app, this would fetch from an API
      const mockGoals: TimeGoal[] = [
        {
          id: '1',
          name: 'Daily Focus Time',
          targetHours: 6,
          currentHours: 4.5,
          timeframe: 'daily',
          completed: false,
          streak: 3
        },
        {
          id: '2',
          name: 'Weekly Project Work',
          targetHours: 20,
          currentHours: 18,
          timeframe: 'weekly',
          activityType: 'project',
          completed: false,
          streak: 2
        },
        {
          id: '3',
          name: 'Daily Exercise',
          targetHours: 1,
          currentHours: 1.2,
          timeframe: 'daily',
          activityType: 'workout',
          completed: true,
          streak: 5
        }
      ];
      setGoals(mockGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = () => {
    const mockInsights: ProductivityInsight[] = [
      {
        type: 'achievement',
        title: 'Consistent Morning Routine',
        description: 'You\'ve maintained a 5-day streak of early morning productivity',
        metric: '5 days',
        icon: <Award className="h-5 w-5 text-yellow-500" />
      },
      {
        type: 'positive',
        title: 'Improved Focus Time',
        description: 'Your average focus session increased by 25% this week',
        metric: '+25%',
        icon: <TrendingUp className="h-5 w-5 text-green-500" />
      },
      {
        type: 'warning',
        title: 'Weekend Productivity Dip',
        description: 'Consider scheduling important tasks during your peak hours (9-11 AM)',
        icon: <AlertCircle className="h-5 w-5 text-orange-500" />
      }
    ];
    setInsights(mockInsights);
  };

  const addGoal = () => {
    if (!newGoal.name.trim()) return;

    const goal: TimeGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetHours: newGoal.targetHours,
      currentHours: 0,
      timeframe: newGoal.timeframe,
      activityType: newGoal.activityType || undefined,
      completed: false,
      streak: 0
    };

    setGoals([...goals, goal]);
    setNewGoal({ name: '', targetHours: 8, timeframe: 'daily', activityType: '' });
    setShowAddGoal(false);
  };

  const getProgressPercentage = (goal: TimeGoal) => {
    return Math.min((goal.currentHours / goal.targetHours) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'positive': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Goals Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Time Management Goals
          </h3>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Add Goal
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="e.g., Daily Focus Time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Hours
                </label>
                <input
                  type="number"
                  value={newGoal.targetHours}
                  onChange={(e) => setNewGoal({ ...newGoal, targetHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  min="0"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timeframe
                </label>
                <select
                  value={newGoal.timeframe}
                  onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Type (Optional)
                </label>
                <select
                  value={newGoal.activityType}
                  onChange={(e) => setNewGoal({ ...newGoal, activityType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">All Activities</option>
                  <option value="project">Project</option>
                  <option value="workout">Workout</option>
                  <option value="todo">Todo</option>
                  <option value="research">Research</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Save Goal
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            const progressColor = getProgressColor(progress);
            
            return (
              <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {goal.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Target className="h-5 w-5 text-blue-500" />
                      )}
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</h4>
                    </div>
                    {goal.activityType && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full capitalize">
                        {goal.activityType}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {goal.currentHours.toFixed(1)} / {goal.targetHours}h
                    </div>
                    <div className="text-xs text-gray-500">
                      {goal.timeframe} • {goal.streak} day streak
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {progress.toFixed(0)}% complete
                  </span>
                  {goal.completed && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Goal achieved! 🎉
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {goals.length === 0 && (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Goals Set
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Set time management goals to track your productivity progress
              </p>
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Productivity Insights
        </h3>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {insight.icon}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>
                  {insight.metric && (
                    <span className="inline-block px-2 py-1 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 rounded">
                      {insight.metric}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No Insights Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start tracking your time to receive personalized productivity insights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 