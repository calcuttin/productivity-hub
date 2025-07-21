'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, BarChart3, Settings } from 'lucide-react';

interface TimeSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isActive: boolean;
  activityType: string;
  category?: string;
  tags: string[];
  projectId?: string;
  todoId?: string;
  researchId?: string;
  workoutId?: string;
  location?: string;
  notes?: string;
  project?: { id: string; name: string };
  todo?: { id: string; title: string };
  research?: { id: string; title: string };
  workout?: { id: string; name: string };
}

interface Project {
  id: string;
  name: string;
}

interface Todo {
  id: string;
  title: string;
}

interface Research {
  id: string;
  title: string;
}

interface Workout {
  id: string;
  name: string;
}

export default function TimeTracker() {
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  // Timer state
  const [title, setTitle] = useState('');
  const [activityType, setActivityType] = useState('project');
  const [linkedItemId, setLinkedItemId] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch active session on component mount
  useEffect(() => {
    fetchActiveSession();
    fetchLinkedItems();
  }, []);

  // Update elapsed time for active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeSession.startTime).getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/time-sessions?isActive=true&limit=1');
      if (response.ok) {
        const sessions = await response.json();
        if (sessions.length > 0) {
          setActiveSession(sessions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch active session:', error);
    }
  };

  const fetchLinkedItems = async () => {
    try {
      const [projectsRes, todosRes, researchRes, workoutsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/todos'),
        fetch('/api/research'),
        fetch('/api/workouts')
      ]);

      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (todosRes.ok) setTodos(await todosRes.json());
      if (researchRes.ok) setResearch(await researchRes.json());
      if (workoutsRes.ok) setWorkouts(await workoutsRes.json());
    } catch (error) {
      console.error('Failed to fetch linked items:', error);
    }
  };

  const startSession = async () => {
    try {
      const sessionData: any = {
        title: title || `${activityType} session`,
        activityType,
        category,
        location,
        notes,
        stopActiveSession: !!activeSession
      };

      // Add linked item ID based on activity type
      if (linkedItemId) {
        switch (activityType) {
          case 'project':
            sessionData.projectId = linkedItemId;
            break;
          case 'todo':
            sessionData.todoId = linkedItemId;
            break;
          case 'research':
            sessionData.researchId = linkedItemId;
            break;
          case 'workout':
            sessionData.workoutId = linkedItemId;
            break;
        }
      }

      const response = await fetch('/api/time-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
        setElapsedTime(0);
        setIsStartModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const stopSession = async () => {
    if (!activeSession) return;

    try {
      const response = await fetch(`/api/time-sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stopSession: true })
      });

      if (response.ok) {
        setActiveSession(null);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setActivityType('project');
    setLinkedItemId('');
    setCategory('');
    setLocation('');
    setNotes('');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getLinkedItems = () => {
    switch (activityType) {
      case 'project': return projects;
      case 'todo': return todos;
      case 'research': return research;
      case 'workout': return workouts;
      default: return [];
    }
  };

  const activityTypes = [
    { value: 'project', label: 'Project' },
    { value: 'todo', label: 'Todo' },
    { value: 'research', label: 'Research' },
    { value: 'workout', label: 'Workout' },
    { value: 'break', label: 'Break' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg" data-tour="time-tracker">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          Time Tracker
        </h2>
        <div className="flex gap-1 sm:gap-2">
          <button className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Active Session Display */}
      {activeSession ? (
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-2xl sm:text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">
            {activeSession.title}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize">
            {activeSession.activityType}
            {activeSession.project && ` • ${activeSession.project.name}`}
            {activeSession.todo && ` • ${activeSession.todo.title}`}
            {activeSession.research && ` • ${activeSession.research.title}`}
            {activeSession.workout && ` • ${activeSession.workout.name}`}
          </div>
        </div>
      ) : (
        <div className="text-center mb-4 sm:mb-6 text-gray-500 dark:text-gray-400">
          No active session
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {activeSession ? (
          <button
            onClick={stopSession}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <Square className="w-4 h-4 sm:w-5 sm:h-5" />
            Stop
          </button>
        ) : (
          <button
            onClick={() => setIsStartModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Start Timer
          </button>
        )}
      </div>

      {/* Start Session Modal */}
      {isStartModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
              Start New Session
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter session title..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={(e) => {
                    setActivityType(e.target.value);
                    setLinkedItemId('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {['project', 'todo', 'research', 'workout'].includes(activityType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Link to {activityType}
                  </label>
                  <select
                    value={linkedItemId}
                    onChange={(e) => setLinkedItemId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select {activityType}...</option>
                    {getLinkedItems().map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.name || item.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Optional category..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Optional location..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  setIsStartModalOpen(false);
                  resetForm();
                }}
                className="px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={startSession}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
              >
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 