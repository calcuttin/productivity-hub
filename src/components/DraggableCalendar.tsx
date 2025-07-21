"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, Plus, X, Edit3, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format for time blocking
  duration?: number; // Duration in minutes
  type: 'project' | 'workout' | 'todo' | 'meeting' | 'break';
  status: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  description?: string;
  originalData: any;
}

interface TimeBlock {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  type: 'project' | 'workout' | 'todo' | 'meeting' | 'break';
  status: string;
  priority?: string;
  description?: string;
  originalData: any;
}

interface DraggableCalendarProps {
  events: CalendarEvent[];
  onEventMove: (eventId: string, newDate: string, newTime?: string) => Promise<void>;
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  onEventDelete: (eventId: string) => Promise<void>;
  onTimeBlockCreate: (timeBlock: Omit<TimeBlock, 'id'>) => Promise<void>;
  viewMode: 'month' | 'week' | 'day';
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

const EVENT_TYPE_COLORS = {
  project: 'bg-blue-500',
  workout: 'bg-green-500',
  todo: 'bg-yellow-500',
  meeting: 'bg-purple-500',
  break: 'bg-gray-500'
};

const EVENT_TYPE_ICONS = {
  project: '📋',
  workout: '💪',
  todo: '✅',
  meeting: '🤝',
  break: '☕'
};

export default function DraggableCalendar({
  events,
  onEventMove,
  onEventCreate,
  onEventDelete,
  onTimeBlockCreate,
  viewMode,
  selectedDate,
  onDateSelect
}: DraggableCalendarProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [newTimeBlock, setNewTimeBlock] = useState<Partial<TimeBlock>>({});
  const [dragOverTimeSlot, setDragOverTimeSlot] = useState<string | null>(null);

  // Generate time blocks for the selected date
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayTimeBlocks = timeBlocks.filter(block => 
      block.startTime.startsWith(dateStr)
    );
    setTimeBlocks(dayTimeBlocks);
  }, [selectedDate, timeBlocks]);

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setIsDragging(true);
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedEvent(null);
    setDragOverTimeSlot(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: string, targetTime?: string) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    
    if (eventId && draggedEvent) {
      await onEventMove(eventId, targetDate, targetTime);
    }
    
    setIsDragging(false);
    setDraggedEvent(null);
    setDragOverTimeSlot(null);
  };

  const handleTimeSlotClick = (timeSlot: string) => {
    setNewTimeBlock({
      startTime: timeSlot,
      endTime: addMinutes(timeSlot, 60), // Default 1 hour
      type: 'meeting'
    });
    setShowTimeBlockModal(true);
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const createTimeBlock = async () => {
    if (!newTimeBlock.title || !newTimeBlock.startTime || !newTimeBlock.endTime) return;

    const timeBlock: Omit<TimeBlock, 'id'> = {
      title: newTimeBlock.title!,
      startTime: newTimeBlock.startTime!,
      endTime: newTimeBlock.endTime!,
      type: newTimeBlock.type || 'meeting',
      status: 'scheduled',
      priority: newTimeBlock.priority,
      description: newTimeBlock.description,
      originalData: {}
    };

    await onTimeBlockCreate(timeBlock);
    setShowTimeBlockModal(false);
    setNewTimeBlock({});
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(selectedDate);
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const startOffset = firstDay.getDay();

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm bg-muted">
            {day}
          </div>
        ))}
        
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-32 bg-muted" />
        ))}
        
        {days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateStr);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={dateStr}
              className={`h-32 p-1 border border-border relative ${
                isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-background'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
            >
              <div className="text-xs font-medium mb-1">
                {date.getDate()}
              </div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event)}
                    onDragEnd={handleDragEnd}
                    className={`text-xs p-1 rounded cursor-move ${
                      EVENT_TYPE_COLORS[event.type as keyof typeof EVENT_TYPE_COLORS]
                    } text-white ${isDragging && draggedEvent?.id === event.id ? 'opacity-50' : ''}`}
                  >
                    {EVENT_TYPE_ICONS[event.type as keyof typeof EVENT_TYPE_ICONS]} {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayEvents = events.filter(e => e.date === dateStr);
    const dayTimeBlocks = timeBlocks.filter(b => b.startTime.startsWith(dateStr));

    return (
      <div className="space-y-2">
        {TIME_SLOTS.map(timeSlot => {
          const timeBlock = dayTimeBlocks.find(b => b.startTime.includes(timeSlot));
          const isDragOver = dragOverTimeSlot === timeSlot;
          
          return (
            <div
              key={timeSlot}
              className={`flex items-center p-2 border border-border rounded ${
                isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-background'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr, timeSlot)}
            >
              <div className="w-16 text-sm font-medium text-muted-foreground">
                {timeSlot}
              </div>
              <div className="flex-1 min-h-[2rem] flex items-center">
                {timeBlock ? (
                  <div className={`p-2 rounded text-sm text-white ${
                    EVENT_TYPE_COLORS[timeBlock.type as keyof typeof EVENT_TYPE_COLORS]
                  }`}>
                    {timeBlock.title}
                  </div>
                ) : (
                  <button
                    onClick={() => handleTimeSlotClick(timeSlot)}
                    className="w-full h-8 border-2 border-dashed border-muted-foreground rounded flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = getWeekStart(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="grid grid-cols-8 gap-1">
        <div className="p-2"></div> {/* Empty corner */}
        {weekDays.map(date => (
          <div key={date.toISOString()} className="p-2 text-center font-semibold text-sm bg-muted">
            {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        ))}
        
        {TIME_SLOTS.map(timeSlot => (
          <div key={timeSlot} className="contents">
            <div className="p-2 text-sm text-muted-foreground border-r border-border">
              {timeSlot}
            </div>
            {weekDays.map(date => {
              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = events.filter(e => e.date === dateStr);
              
              return (
                <div
                  key={`${dateStr}-${timeSlot}`}
                  className="p-1 border-b border-border min-h-[3rem] bg-background"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dateStr, timeSlot)}
                >
                  {dayEvents.map((event, index) => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                      onDragEnd={handleDragEnd}
                      className={`text-xs p-1 rounded cursor-move ${
                        EVENT_TYPE_COLORS[event.type as keyof typeof EVENT_TYPE_COLORS]
                      } text-white ${isDragging && draggedEvent?.id === event.id ? 'opacity-50' : ''}`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDateSelect(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
            className="btn-secondary"
          >
            ← Previous
          </button>
          <button
            onClick={() => onDateSelect(new Date())}
            className="btn-primary"
          >
            Today
          </button>
          <button
            onClick={() => onDateSelect(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
            className="btn-secondary"
          >
            Next →
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTimeBlockModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Block
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Time Block Creation Modal */}
      {showTimeBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Time Block</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newTimeBlock.title || ''}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-border rounded"
                  placeholder="Meeting, Work Session, etc."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newTimeBlock.startTime || ''}
                    onChange={(e) => setNewTimeBlock(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full p-2 border border-border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={newTimeBlock.endTime || ''}
                    onChange={(e) => setNewTimeBlock(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full p-2 border border-border rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newTimeBlock.type || 'meeting'}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border border-border rounded"
                >
                  <option value="meeting">Meeting</option>
                  <option value="project">Project Work</option>
                  <option value="todo">Todo</option>
                  <option value="workout">Workout</option>
                  <option value="break">Break</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTimeBlock.description || ''}
                  onChange={(e) => setNewTimeBlock(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-border rounded"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowTimeBlockModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createTimeBlock}
                className="btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getDaysInMonth(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
} 