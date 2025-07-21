"use client";
import Navigation from '@/components/Navigation';
import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Align with Prisma schema
export interface Exercise {
  id: string; // Exercises from DB will have an ID
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  name: string;
  date: string; // Store as ISO string or YYYY-MM-DD
  notes?: string | null;
  completed: boolean;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

// For the form, exercises might not have DB IDs yet, or we might be creating new ones
interface FormExercise extends Omit<Exercise, 'id'> {
  id?: string; // id is optional here, as it might be a new exercise
  _key?: string; // A temporary client-side key for React list rendering
}

interface WorkoutFormData {
  name: string;
  date: string;
  notes: string;
  completed: boolean;
  exercises: FormExercise[];
}

const initialExerciseForm: FormExercise = {
  name: '',
  sets: 3,
  reps: 10,
  weight: 0,
  _key: uuidv4(), // Add client-side key for new exercises
};

const initialWorkoutForm: WorkoutFormData = {
  name: '',
  date: new Date().toISOString().split('T')[0], // Default to today
  notes: '',
  completed: false,
  exercises: [{ ...initialExerciseForm }],
};

export default function WorkoutPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<WorkoutFormData>(initialWorkoutForm);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For general page load & submissions
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null); // For specific toggle button loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  async function fetchWorkouts() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/workouts');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch workouts: ${response.statusText}`);
      }
      let data: Workout[] = await response.json();
      data = data.map(w => ({
        ...w,
        date: w.date ? new Date(w.date).toISOString().split('T')[0] : '',
        exercises: w.exercises.map(ex => ({...ex}))
      }));
      setWorkouts(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  }

  function handleExerciseChange(exerciseKey: string, e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const updatedExercises = form.exercises.map(ex => {
      if (ex._key === exerciseKey) {
        const numericFields = ['sets', 'reps', 'weight'];
        return {
          ...ex,
          [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value,
        };
      }
      return ex;
    });
    setForm(prev => ({ ...prev, exercises: updatedExercises }));
  }

  function addExercise() {
    setForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...initialExerciseForm, name: '', _key: uuidv4() }]
    }));
  }

  function removeExercise(exerciseKey: string) {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex._key !== exerciseKey)
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.date || form.exercises.some(ex => !ex.name.trim())) {
      setError("Workout Name, Date, and all Exercise Names are required.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const payload = {
      ...form,
      date: new Date(form.date).toISOString(),
      exercises: form.exercises.map(({ _key, ...exData }) => ({...exData, id: exData.id || undefined }) ),
    };

    try {
      let response;
      let responseData: Workout;

      if (editingWorkoutId) {
        response = await fetch(`/api/workouts/${editingWorkoutId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save workout: ${response.statusText} - ${JSON.stringify(errorData.errors)}`);
      }
      responseData = await response.json();
      responseData.date = responseData.date ? new Date(responseData.date).toISOString().split('T')[0] : '';

      if (editingWorkoutId) {
        setWorkouts(workouts.map(w => (w.id === editingWorkoutId ? responseData : w)));
      } else {
        setWorkouts(prevWorkouts => [responseData, ...prevWorkouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(workout: Workout) {
    setShowForm(true);
    setForm({
      name: workout.name,
      date: workout.date ? new Date(workout.date).toISOString().split('T')[0] : '',
      notes: workout.notes || '',
      completed: workout.completed,
      exercises: workout.exercises.map(ex => ({ ...ex, _key: ex.id || uuidv4() }))
    });
    setEditingWorkoutId(workout.id);
  }

  async function handleDelete(workoutId: string) {
    if (confirm('Are you sure you want to delete this workout?')) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to delete workout: ${response.statusText}`);
        }
        setWorkouts(workouts.filter(w => w.id !== workoutId));
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  }

  async function toggleComplete(workoutId: string) {
    const workoutToToggle = workouts.find(w => w.id === workoutId);
    if (!workoutToToggle) return;

    setIsTogglingId(workoutId);
    setError(null);
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !workoutToToggle.completed,
          name: workoutToToggle.name,
          date: new Date(workoutToToggle.date).toISOString(), // Ensure date is ISO for backend
          notes: workoutToToggle.notes,
          exercises: workoutToToggle.exercises.map(({id, ...rest}) => ({...rest, id: id || undefined}))
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update workout status: ${response.statusText}`);
      }
      const updatedWorkout: Workout = await response.json();
      updatedWorkout.date = updatedWorkout.date ? new Date(updatedWorkout.date).toISOString().split('T')[0] : '';
      setWorkouts(workouts.map(w => (w.id === workoutId ? updatedWorkout : w)));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsTogglingId(null);
    }
  }

  const resetForm = () => {
    setShowForm(false);
    setForm(initialWorkoutForm);
    setEditingWorkoutId(null);
    setError(null);
  };

  const groupedWorkouts = [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce<Record<string, Workout[]>>((acc, w) => {
      const dateKey = w.date ? new Date(w.date).toISOString().split('T')[0] : 'Invalid Date';
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(w);
      return acc;
    }, {});
  const sortedDates = Object.keys(groupedWorkouts);

  if (isLoading && workouts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />

      {/* Header */}
      <div className="bg-card border-b border-card">
        <div className="content-container">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Workout Planner</h1>
                <p className="mt-2 text-secondary">Track your fitness goals and workout routines</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Workout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Workouts</p>
                <p className="text-2xl font-bold text-primary">{workouts.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Completed</p>
                <p className="text-2xl font-bold text-primary">{workouts.filter(w => w.completed).length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Pending</p>
                <p className="text-2xl font-bold text-primary">{workouts.filter(w => !w.completed).length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total Exercises</p>
                <p className="text-2xl font-bold text-primary">{workouts.reduce((acc, w) => acc + w.exercises.length, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workouts List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">Workout Routines</h3>
          </div>

          <div className="divide-y divide-card">
            {workouts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary">
                  No workouts found
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Get started by creating your first workout routine.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary mt-4"
                >
                  Create Your First Workout
                </button>
              </div>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="px-6 py-4 hover:bg-card-secondary">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-primary truncate">
                          {workout.name}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                          workout.completed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {workout.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-secondary">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(workout.date).toLocaleDateString()}
                        </span>
                        
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {workout.exercises.length} exercises
                        </span>
                      </div>
                      
                      {workout.notes && (
                        <p className="mt-2 text-sm text-secondary">
                          {workout.notes}
                        </p>
                      )}
                      
                      {workout.exercises.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {workout.exercises.slice(0, 3).map((exercise, index) => (
                            <span key={index} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-primary rounded">
                              {exercise.name} ({exercise.sets}x{exercise.reps})
                            </span>
                          ))}
                          {workout.exercises.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-muted">
                              +{workout.exercises.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => toggleComplete(workout.id)}
                        disabled={isTogglingId === workout.id}
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          workout.completed
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                        title={workout.completed ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {isTogglingId === workout.id ? '...' : (workout.completed ? 'Undo' : 'Complete')}
                      </button>
                      
                      <button 
                        onClick={() => handleEdit(workout)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                        title="Edit workout"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(workout.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                        title="Delete workout"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 