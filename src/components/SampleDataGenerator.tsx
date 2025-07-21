'use client';

import { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckSquare, 
  Target, 
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SampleDataGeneratorProps {
  onDataCreated?: () => void;
  className?: string;
}

export default function SampleDataGenerator({ onDataCreated, className = '' }: SampleDataGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState({
    projects: true,
    todos: true,
    workouts: true,
    research: true
  });

  const handleCreateSampleData = async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch('/api/sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedTypes),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sample data');
      }

      setIsSuccess(true);
      onDataCreated?.();
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleType = (type: keyof typeof selectedTypes) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const selectedCount = Object.values(selectedTypes).filter(Boolean).length;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-12 h-12 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Get Started with Sample Data
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Create sample projects, todos, workouts, and research papers to explore the app's features.
        </p>
      </div>

      {/* Data Type Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select what you'd like to create:
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toggleType('projects')}
            className={`flex items-center p-3 rounded-lg border transition-colors ${
              selectedTypes.projects
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Projects</span>
          </button>

          <button
            onClick={() => toggleType('todos')}
            className={`flex items-center p-3 rounded-lg border transition-colors ${
              selectedTypes.todos
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Todos</span>
          </button>

          <button
            onClick={() => toggleType('workouts')}
            className={`flex items-center p-3 rounded-lg border transition-colors ${
              selectedTypes.workouts
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Target className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Workouts</span>
          </button>

          <button
            onClick={() => toggleType('research')}
            className={`flex items-center p-3 rounded-lg border transition-colors ${
              selectedTypes.research
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <FileText className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Research</span>
          </button>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          What you'll get:
        </h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {selectedTypes.projects && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>3 sample projects with subtasks and deadlines</span>
            </div>
          )}
          {selectedTypes.todos && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>5 sample todos with different priorities</span>
            </div>
          )}
          {selectedTypes.workouts && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>4 sample workouts with different types</span>
            </div>
          )}
          {selectedTypes.research && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span>3 sample research papers with metadata</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-green-700 dark:text-green-300 text-sm">
              Sample data created successfully! You can now explore the app's features.
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleCreateSampleData}
        disabled={isLoading || selectedCount === 0}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
          isLoading || selectedCount === 0
            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Sample Data...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Create Sample Data ({selectedCount} types)
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
        You can always delete this data later from your dashboard.
      </p>
    </div>
  );
} 