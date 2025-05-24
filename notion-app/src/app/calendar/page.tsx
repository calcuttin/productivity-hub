"use client";
import Navigation from '@/components/Navigation';
import { useEffect, useState, Fragment, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
// import { Project } from '@/types/project'; // Will be replaced by local/API types

// Define types for data coming from API (subset of Prisma models)
interface ApiProject {
  id: string;
  name: string;
  description?: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate?: string | null; // ISO string
  progress?: number | null;
  // createdAt and updatedAt are also available but not directly used in calendar view
}

interface ApiWorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface ApiWorkout {
  id: string;
  name: string;
  date: string; // ISO string
  notes?: string | null;
  completed: boolean;
  exercises: ApiWorkoutExercise[];
  // createdAt and updatedAt are also available
}

// Unified type for calendar display
interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format for easy mapping
  type: 'project' | 'workout';
  status?: ApiProject['status'] | 'Completed' | 'Planned'; // Project status or Workout status
  originalData: ApiProject | ApiWorkout; // To store the full object for modal/details
}

function getMonthDays(year: number, month: number) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function getMonthMatrix(year: number, month: number) {
  const days = getMonthDays(year, month);
  const matrix: (Date | null)[][] = [];
  let week: (Date | null)[] = Array(new Date(year, month, 1).getDay()).fill(null);
  days.forEach((date) => {
    week.push(date);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getEventStatusColor(event: CalendarEvent): string {
  if (event.type === 'project') {
    const projectStatus = event.status as ApiProject['status'];
    switch (projectStatus) {
      case 'Not Started': return 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
      case 'In Progress': return 'bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100';
      case 'Completed': return 'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100';
      case 'On Hold': return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100';
      default: return 'bg-gray-200 text-gray-900 dark:bg-gray-500 dark:text-gray-300';
    }
  } else if (event.type === 'workout') {
    return event.status === 'Completed' 
      ? 'bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100' 
      : 'bg-pink-200 text-pink-900 dark:bg-pink-700 dark:text-pink-100';
  }
  return 'bg-gray-200 text-gray-900';
}

const STATUS_COLORS_LEGEND = [
  { type: 'Project', label: 'Not Started', color: 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-100' },
  { type: 'Project', label: 'In Progress', color: 'bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100' },
  { type: 'Project', label: 'Completed', color: 'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100' },
  { type: 'Project', label: 'On Hold', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100' },
  { type: 'Workout', label: 'Planned', color: 'bg-pink-200 text-pink-900 dark:bg-pink-700 dark:text-pink-100' },
  { type: 'Workout', label: 'Completed', color: 'bg-purple-200 text-purple-900 dark:bg-purple-700 dark:text-purple-100' },
];

const VIEW_MODES = ['Month', 'Week', 'Day'] as const;
type ViewMode = typeof VIEW_MODES[number];

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function formatYMD(date: Date): string { return date.toISOString().slice(0, 10); }

export default function CalendarPage() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [currentViewDateInfo, setCurrentViewDateInfo] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() }; // For month view
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date()); // For week/day view focus
  
  const [modalEvent, setModalEvent] = useState<CalendarEvent | null>(null);
  // Edit form state - simplified for now, or consider linking to actual edit pages
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [projectsRes, workoutsRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/workouts')
        ]);

        if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${projectsRes.statusText}`);
        if (!workoutsRes.ok) throw new Error(`Failed to fetch workouts: ${workoutsRes.statusText}`);

        const projectsData: ApiProject[] = await projectsRes.json();
        const workoutsData: ApiWorkout[] = await workoutsRes.json();

        const calendarEvents: CalendarEvent[] = [];

        projectsData.forEach(p => {
          if (p.dueDate) {
            calendarEvents.push({
              id: p.id,
              title: p.name,
              date: new Date(p.dueDate).toISOString().split('T')[0], // Ensure YYYY-MM-DD
              type: 'project',
              status: p.status,
              originalData: p
            });
          }
        });

        workoutsData.forEach(w => {
          calendarEvents.push({
            id: w.id,
            title: w.name,
            date: new Date(w.date).toISOString().split('T')[0], // Ensure YYYY-MM-DD
            type: 'workout',
            status: w.completed ? 'Completed' : 'Planned',
            originalData: w
          });
        });
        setAllEvents(calendarEvents);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Map of YYYY-MM-DD to events for quick lookup
  const eventMap: Record<string, CalendarEvent[]> = {};
  allEvents.forEach((event) => {
    if (!eventMap[event.date]) eventMap[event.date] = [];
    eventMap[event.date].push(event);
  });

  const matrix = getMonthMatrix(currentViewDateInfo.year, currentViewDateInfo.month);
  const monthName = new Date(currentViewDateInfo.year, currentViewDateInfo.month).toLocaleString('default', { month: 'long' });

  const weekStart = getWeekStart(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayEvents = eventMap[formatYMD(selectedDate)] || [];

  function prevMonth() {
    setCurrentViewDateInfo((c) => {
      const newDate = new Date(c.year, c.month -1, 1);
      return { year: newDate.getFullYear(), month: newDate.getMonth() };
    });
  }
  function nextMonth() {
    setCurrentViewDateInfo((c) => {
      const newDate = new Date(c.year, c.month + 1, 1);
      return { year: newDate.getFullYear(), month: newDate.getMonth() };
    });
  }

  // Simplified modal logic: just display info, no direct edit/delete from calendar modal
  // Edit/Delete should be done on the respective module pages (Projects/Workouts)
  function handleEventClick(event: CalendarEvent) {
    setModalEvent(event);
    setDeleteError(null); // Clear previous delete error
  }

  function closeModal() {
    setModalEvent(null);
    setDeleteError(null); // Clear delete error on close
  }

  async function handleDeleteItem() {
    if (!modalEvent) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${modalEvent.title}"?`
    );
    if (!confirmDelete) return;

    setIsDeletingId(modalEvent.id);
    setDeleteError(null);

    try {
      const response = await fetch(
        `/api/${modalEvent.type}s/${modalEvent.id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete item.' }));
        throw new Error(errorData.message || `Failed to delete ${modalEvent.type}`);
      }
      setAllEvents((prevEvents) => prevEvents.filter(event => event.id !== modalEvent.id));
      closeModal();
    } catch (err) {
      console.error(`Error deleting ${modalEvent.type}:`, err);
      setDeleteError((err as Error).message);
    } finally {
      setIsDeletingId(null);
    }
  }

  function goToPrevWeek() { setSelectedDate(addDays(selectedDate, -7)); }
  function goToNextWeek() { setSelectedDate(addDays(selectedDate, 7)); }
  function goToPrevDay() { setSelectedDate(addDays(selectedDate, -1)); }
  function goToNextDay() { setSelectedDate(addDays(selectedDate, 1)); }

  if (isLoading) {
    return (
      <div className="min-h-screen"><Navigation /><div className="p-8 text-center"><p>Loading calendar...</p></div></div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen"><Navigation /><div className="p-8 text-center text-red-500"><p>Error loading calendar: {error}</p></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Calendar</h1>
           {/* View Mode Toggle */}
          <div className="flex gap-2">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                className={`px-4 py-2 rounded-lg font-medium text-sm border transition-colors
                  ${viewMode === mode 
                    ? 'bg-indigo-600 text-white border-indigo-700 dark:bg-indigo-500 dark:border-indigo-600' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        
        {/* Color Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          {STATUS_COLORS_LEGEND.map((s) => (
            <span key={`${s.type}-${s.label}`} className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
              <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 dark:border-white/20" style={{ backgroundColor: s.color.split(' ')[0].replace('bg-', '').replace('bg-', '') === 'gray-300' ? '#D1D5DB' : s.color.split(' ')[0].replace('bg-', '') }}></span>
              {s.type}: {s.label}
            </span>
          ))}
        </div>

        {/* Calendar Views */}
        {viewMode === 'Month' && (
          <Fragment>
            <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <button onClick={prevMonth} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">&lt; Prev</button>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{monthName} {currentViewDateInfo.year}</h2>
              <button onClick={nextMonth} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">Next &gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-px text-center mb-2 bg-gray-300 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-t-lg overflow-hidden">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2 font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-5 gap-px bg-gray-300 dark:bg-gray-700 border border-t-0 border-gray-300 dark:border-gray-700 rounded-b-lg overflow-hidden">
              {matrix.flat().map((date, idx) => {
                if (!date) return <div key={idx} className="min-h-[6rem] bg-gray-50 dark:bg-gray-800/50" />;
                const ymd = formatYMD(date);
                const isCurrentMonth = date.getMonth() === currentViewDateInfo.month;
                const dayEventsList = eventMap[ymd] || [];
                return (
                  <div
                    key={idx}
                    className={`min-h-[6rem] p-1.5 flex flex-col relative transition-colors ${isCurrentMonth ? 'bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60' : 'bg-gray-200 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400'}`}
                    onClick={() => { if(isCurrentMonth) { setSelectedDate(date); setViewMode('Day'); }}}
                  >
                    <div className={`text-xs font-semibold mb-1 ${isCurrentMonth ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{date.getDate()}</div>
                    {isCurrentMonth && dayEventsList.length > 0 && (
                      <ul className="space-y-1 overflow-y-auto flex-grow max-h-[calc(6rem-20px)] custom-scrollbar">
                        {dayEventsList.map((event) => (
                          <li
                            key={event.id}
                            className={`text-xs rounded px-1.5 py-0.5 truncate font-medium cursor-pointer ${getEventStatusColor(event)}`}
                            title={event.title}
                            onClick={e => { e.stopPropagation(); handleEventClick(event); }}
                          >
                            {event.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </Fragment>
        )}

        {viewMode === 'Week' && (
          <Fragment>
            <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <button onClick={goToPrevWeek} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">&lt; Prev Week</button>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {formatYMD(weekStart)} - {formatYMD(addDays(weekStart, 6))}
              </h2>
              <button onClick={goToNextWeek} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">Next Week &gt;</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-gray-300 dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              {weekDays.map((day, dayIdx) => {
                const ymd = formatYMD(day);
                const dayEventsList = eventMap[ymd] || [];
                return (
                  <div key={dayIdx} className="min-h-[10rem] p-2 bg-white dark:bg-gray-800 flex flex-col">
                    <div className="text-center font-semibold text-sm mb-2 text-gray-700 dark:text-gray-200 border-b pb-1 dark:border-gray-700">
                      {WEEKDAYS[day.getDay()]} <span className="text-gray-500 dark:text-gray-400">{day.getDate()}</span>
                    </div>
                    <ul className="space-y-1.5 overflow-y-auto flex-grow custom-scrollbar">
                      {dayEventsList.length > 0 ? dayEventsList.map(event => (
                        <li key={event.id} 
                            className={`text-xs rounded px-2 py-1 truncate font-medium cursor-pointer ${getEventStatusColor(event)}`}
                            title={event.title}
                            onClick={() => handleEventClick(event)} >
                           {event.title}
                        </li>
                      )) : <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-4">No events</p>}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Fragment>
        )}

        {viewMode === 'Day' && (
          <Fragment>
            <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <button onClick={goToPrevDay} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">&lt; Prev Day</button>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h2>
              <button onClick={goToNextDay} className="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors">Next Day &gt;</button>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow min-h-[20rem]">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Events for the day:</h3>
              {dayEvents.length > 0 ? (
                <ul className="space-y-2">
                  {dayEvents.map(event => (
                    <li key={event.id} 
                        className={`rounded p-2.5 font-medium cursor-pointer flex justify-between items-center ${getEventStatusColor(event)}`}
                        onClick={() => handleEventClick(event)} >
                      <span>{event.title} <span className="text-xs opacity-80">({event.type})</span></span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">{event.status}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 dark:text-gray-400">No events scheduled for this day.</p>}
            </div>
          </Fragment>
        )}

        {/* Event Detail Modal */}
        {modalEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50" onClick={closeModal}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">{modalEvent.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Type: <span className="font-medium capitalize text-gray-700 dark:text-gray-200">{modalEvent.type}</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date: <span className="font-medium text-gray-700 dark:text-gray-200">{new Date(modalEvent.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Status: <span className="font-medium text-gray-700 dark:text-gray-200">{modalEvent.status}</span></p>
              
              {modalEvent.type === 'project' && (modalEvent.originalData as ApiProject).description && (
                <div className="mb-3"><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Description:</h4><p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{(modalEvent.originalData as ApiProject).description}</p></div>
              )}
              {modalEvent.type === 'project' && (modalEvent.originalData as ApiProject).progress !== null && (modalEvent.originalData as ApiProject).progress !== undefined && (
                <div className="mb-3"><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Progress:</h4><p className="text-sm text-gray-600 dark:text-gray-400">{(modalEvent.originalData as ApiProject).progress}%</p></div>
              )}

              {modalEvent.type === 'workout' && (modalEvent.originalData as ApiWorkout).notes && (
                <div className="mb-3"><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Notes:</h4><p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{(modalEvent.originalData as ApiWorkout).notes}</p></div>
              )}
              {modalEvent.type === 'workout' && (modalEvent.originalData as ApiWorkout).exercises.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Exercises:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-1">
                    {(modalEvent.originalData as ApiWorkout).exercises.map(ex => (
                      <li key={ex.id}>{ex.name} ({ex.sets} sets, {ex.reps} reps, {ex.weight} kg)</li>
                    ))}
                  </ul>
                </div>
              )}

              {deleteError && (
                <p className="text-sm text-red-500 dark:text-red-400 mb-3">Error: {deleteError}</p>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={closeModal} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition duration-150">
                  Close
                </button>
                <Link
                  href={modalEvent.type === 'project' ? '/projects' : '/workouts'}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition duration-150"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDeleteItem}
                  disabled={isDeletingId === modalEvent.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition duration-150 disabled:opacity-50"
                >
                  {isDeletingId === modalEvent.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 