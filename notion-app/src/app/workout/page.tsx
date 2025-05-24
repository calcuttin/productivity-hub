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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <p className="text-center text-gray-700 dark:text-gray-300">Loading workouts...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Workout Planner
          </h1>
          <button
            onClick={() => {
              setShowForm(prev => !prev);
              if (showForm && editingWorkoutId) resetForm(); // Reset if cancelling an edit
              else if (showForm) resetForm(); // Reset if cancelling a new form
              else setForm(initialWorkoutForm); // Prepare new form if opening
              setEditingWorkoutId(null); // Always clear editing ID when toggling form unless opening an edit
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            {showForm && !editingWorkoutId ? "Cancel" : "Add New Workout"}
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-100 dark:bg-red-800/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                {editingWorkoutId ? "Edit Workout" : "Add New Workout"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Workout Name*</label>
                  <input type="text" name="name" id="name" value={form.name} onChange={handleFormChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date*</label>
                  <input type="date" name="date" id="date" value={form.date} onChange={handleFormChange} required
                         className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                  <textarea name="notes" id="notes" value={form.notes || ''} onChange={handleFormChange} rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>

                <div className="space-y-3 pt-2 border-t dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">Exercises</h3>
                  {form.exercises.map((ex, idx) => (
                    <div key={ex._key || idx} className="p-3 border dark:border-gray-600 rounded-md space-y-2 bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercise #{idx + 1}</span>
                        {form.exercises.length > 1 && (
                           <button type="button" onClick={() => ex._key && removeExercise(ex._key)}
                                   className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 text-xs font-semibold">Remove</button>
                        )}
                      </div>
                      <div>
                        <label htmlFor={`ex-name-${ex._key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Name*</label>
                        <input type="text" name="name" id={`ex-name-${ex._key}`} value={ex.name} onChange={e => ex._key && handleExerciseChange(ex._key, e)} required
                               className="mt-1 block w-full px-2 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label htmlFor={`ex-sets-${ex._key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Sets*</label>
                          <input type="number" name="sets" id={`ex-sets-${ex._key}`} value={ex.sets} onChange={e => ex._key && handleExerciseChange(ex._key, e)} required min="1"
                                 className="mt-1 block w-full px-2 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                          <label htmlFor={`ex-reps-${ex._key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Reps*</label>
                          <input type="number" name="reps" id={`ex-reps-${ex._key}`} value={ex.reps} onChange={e => ex._key && handleExerciseChange(ex._key, e)} required min="1"
                                 className="mt-1 block w-full px-2 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                        <div>
                          <label htmlFor={`ex-weight-${ex._key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400">Weight (kg)*</label>
                          <input type="number" name="weight" id={`ex-weight-${ex._key}`} value={ex.weight} onChange={e => ex._key && handleExerciseChange(ex._key, e)} required min="0" step="0.01"
                                 className="mt-1 block w-full px-2 py-1.5 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addExercise}
                          className="w-full mt-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 rounded-lg transition duration-150">
                    + Add Exercise
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={resetForm}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition duration-150">
                    Cancel
                  </button>
                  <button type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition duration-150"
                          disabled={isLoading}>
                    {isLoading ? (editingWorkoutId ? 'Updating...' : 'Saving...') : (editingWorkoutId ? "Update Workout" : "Save Workout")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!showForm && workouts.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No workouts planned yet. Click "Add New Workout" to get started.
          </p>
        )}

        {!showForm && workouts.length > 0 && (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date}>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 sticky top-0 bg-gray-100 dark:bg-gray-900 py-2 z-10">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <div className="space-y-4">
                  {groupedWorkouts[date].map(workout => (
                    <div key={workout.id}
                         className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 ${workout.completed ? 'border-green-500 dark:border-green-400' : 'border-blue-500 dark:border-blue-400'}`}>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{workout.name}</h3>
                          <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${workout.completed ? 'bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200' : 'bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-200'}`}>
                            {workout.completed ? 'Completed' : 'Planned'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2 sm:mt-0 flex-shrink-0">
                          <button onClick={() => toggleComplete(workout.id)}
                                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${workout.completed ? 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                  disabled={isTogglingId === workout.id || isLoading} >
                            {isTogglingId === workout.id ? '...' : (workout.completed ? 'Undo' : 'Mark Done')}
                          </button>
                          <button onClick={() => handleEdit(workout)}
                                  className="px-3 py-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors"
                                  disabled={isLoading}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(workout.id)}
                                  className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors"
                                  disabled={isLoading || isTogglingId === workout.id}>
                            {isLoading && editingWorkoutId === workout.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      {workout.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-line break-words">{workout.notes}</p>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Exercises:</h4>
                        <ul className="space-y-1.5 pl-1">
                          {workout.exercises.map((ex) => (
                            <li key={ex.id} className="text-sm text-gray-800 dark:text-gray-200 flex flex-wrap gap-x-3 gap-y-0.5 items-center">
                              <span className="font-medium">{ex.name}</span>
                              <span className="text-gray-600 dark:text-gray-400">{ex.sets} sets</span>
                              <span className="text-gray-600 dark:text-gray-400">{ex.reps} reps</span>
                              <span className="text-gray-600 dark:text-gray-400">{ex.weight} kg</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 