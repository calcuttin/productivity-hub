"use client";
import Navigation from '@/components/Navigation';
import DraggableCalendar from '@/components/DraggableCalendar';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, Settings } from 'lucide-react';

// Define types for data coming from API (subset of Prisma models)
interface ApiProject {
  id: string;
  name: string;
  description?: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate?: string | null; // ISO string
  progress?: number | null;
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
}

interface ApiTodo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string | null;
  tags: string[];
}

interface ApiTimeBlock {
  id: string;
  title: string;
  description?: string | null;
  startTime: string; // ISO string
  endTime?: string | null; // ISO string
  activityType: 'project' | 'workout' | 'todo' | 'meeting' | 'break';
  category?: string | null;
  tags: string[];
  notes?: string | null;
}

// Unified type for calendar display
interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format for easy mapping
  time?: string; // HH:MM format for time blocking
  duration?: number; // Duration in minutes
  type: 'project' | 'workout' | 'todo' | 'meeting' | 'break';
  status: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  description?: string;
  originalData: ApiProject | ApiWorkout | ApiTodo | ApiTimeBlock;
}

const VIEW_MODES = ['month', 'week', 'day'] as const;
type ViewMode = typeof VIEW_MODES[number];

export default function CalendarPage() {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
      setIsLoading(true);
      setError(null);
      try {
      const [projectsRes, workoutsRes, todosRes, timeBlocksRes] = await Promise.all([
          fetch('/api/projects'),
        fetch('/api/workouts'),
        fetch('/api/todos'),
        fetch('/api/time-blocks')
        ]);

        if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${projectsRes.statusText}`);
        if (!workoutsRes.ok) throw new Error(`Failed to fetch workouts: ${workoutsRes.statusText}`);
      if (!todosRes.ok) throw new Error(`Failed to fetch todos: ${todosRes.statusText}`);
      if (!timeBlocksRes.ok) throw new Error(`Failed to fetch time blocks: ${timeBlocksRes.statusText}`);

        const projectsData: ApiProject[] = await projectsRes.json();
        const workoutsData: ApiWorkout[] = await workoutsRes.json();
      const todosData: ApiTodo[] = await todosRes.json();
      const timeBlocksData: ApiTimeBlock[] = await timeBlocksRes.json();

        const calendarEvents: CalendarEvent[] = [];

      // Convert projects to calendar events
        projectsData.forEach(p => {
          if (p.dueDate) {
            calendarEvents.push({
              id: p.id,
              title: p.name,
            date: new Date(p.dueDate).toISOString().split('T')[0],
              type: 'project',
              status: p.status,
            description: p.description || undefined,
              originalData: p
            });
          }
        });

      // Convert workouts to calendar events
        workoutsData.forEach(w => {
          calendarEvents.push({
            id: w.id,
            title: w.name,
          date: new Date(w.date).toISOString().split('T')[0],
            type: 'workout',
            status: w.completed ? 'Completed' : 'Planned',
          description: w.notes || undefined,
            originalData: w
          });
        });

      // Convert todos to calendar events
      todosData.forEach(t => {
        if (t.dueDate) {
          calendarEvents.push({
            id: t.id,
            title: t.title,
            date: new Date(t.dueDate).toISOString().split('T')[0],
            type: 'todo',
            status: t.completed ? 'Completed' : 'Pending',
            priority: t.priority,
            description: t.description || undefined,
            originalData: t
          });
        }
      });

      // Convert time blocks to calendar events
      timeBlocksData.forEach(tb => {
        const startDate = new Date(tb.startTime);
        const timeString = startDate.toTimeString().slice(0, 5); // HH:MM format
        const duration = tb.endTime 
          ? Math.round((new Date(tb.endTime).getTime() - startDate.getTime()) / (1000 * 60))
          : undefined;

        calendarEvents.push({
          id: tb.id,
          title: tb.title,
          date: startDate.toISOString().split('T')[0],
          time: timeString,
          duration,
          type: tb.activityType,
          status: 'Scheduled',
          description: tb.description || undefined,
          originalData: tb
        });
      });

        setAllEvents(calendarEvents);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
  };

  const handleEventMove = async (eventId: string, newDate: string, newTime?: string) => {
    try {
      const event = allEvents.find(e => e.id === eventId);
      if (!event) return;

      // Update the event in the local state
      setAllEvents(prev => prev.map(e => 
        e.id === eventId 
          ? { ...e, date: newDate, time: newTime }
          : e
      ));

      // Update the event in the database based on its type
      const updateData: any = {};
      
      if (event.type === 'project') {
        updateData.dueDate = newDate;
        const response = await fetch(`/api/projects/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dueDate: newDate })
        });
        if (!response.ok) throw new Error('Failed to update project');
      } else if (event.type === 'workout') {
        updateData.date = newDate;
        const response = await fetch(`/api/workouts/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: newDate })
        });
        if (!response.ok) throw new Error('Failed to update workout');
      } else if (event.type === 'todo') {
        updateData.dueDate = newDate;
        const response = await fetch(`/api/todos/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dueDate: newDate })
        });
        if (!response.ok) throw new Error('Failed to update todo');
      } else if (['meeting', 'break'].includes(event.type)) {
        // For time blocks, we need to update the startTime
        const newDateTime = new Date(newDate);
        if (newTime) {
          const [hours, minutes] = newTime.split(':').map(Number);
          newDateTime.setHours(hours, minutes, 0, 0);
        }
        
        const response = await fetch(`/api/time-blocks/${eventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime: newDateTime.toISOString() })
        });
        if (!response.ok) throw new Error('Failed to update time block');
      }
    } catch (err) {
      console.error('Error moving event:', err);
      // Revert the local state change on error
      await fetchCalendarData();
    }
  };

  const handleEventCreate = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      // This would typically create a new event based on the type
      // For now, we'll just refresh the data
      await fetchCalendarData();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const event = allEvents.find(e => e.id === eventId);
      if (!event) return;

      // Delete the event from the database based on its type
      const response = await fetch(`/api/${event.type}s/${eventId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`Failed to delete ${event.type}`);
      
      // Remove from local state
      setAllEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleTimeBlockCreate = async (timeBlock: any) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const startDateTime = new Date(`${dateStr}T${timeBlock.startTime}`);
      const endDateTime = new Date(`${dateStr}T${timeBlock.endTime}`);

      const response = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: timeBlock.title,
          description: timeBlock.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          activityType: timeBlock.type,
          category: timeBlock.type,
          notes: timeBlock.description
        })
      });

      if (!response.ok) throw new Error('Failed to create time block');
      
      // Refresh the calendar data
      await fetchCalendarData();
    } catch (err) {
      console.error('Error creating time block:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="page-content">
          <div className="alert-error">
            <p>Error loading calendar: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h1 className="page-title">Calendar</h1>
            <p className="page-subtitle">Drag & drop scheduling for your projects, workouts, and time blocks</p>
          </div>
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                className={`btn-secondary ${viewMode === mode ? 'btn-primary' : ''}`}
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Google Calendar Sync */}
        <div className="mb-6">
          <GoogleCalendarSync />
        </div>

        <DraggableCalendar
          events={allEvents}
          onEventMove={handleEventMove}
          onEventCreate={handleEventCreate}
          onEventDelete={handleEventDelete}
          onTimeBlockCreate={handleTimeBlockCreate}
          viewMode={viewMode}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
    </div>
  </div>
  );
} 