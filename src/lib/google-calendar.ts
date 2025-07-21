import { google } from 'googleapis';
import { prisma } from './prisma';

// Google Calendar API configuration
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  colorId?: string;
}

interface CalendarSyncOptions {
  syncProjects?: boolean;
  syncTodos?: boolean;
  syncWorkouts?: boolean;
  syncTimeBlocks?: boolean;
  twoWaySync?: boolean;
  defaultReminders?: number[]; // minutes before event
}

export class GoogleCalendarService {
  private auth: any;
  private calendar: any;

  constructor(accessToken: string) {
    this.auth = new google.auth.OAuth2();
    this.auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  // Get user's calendars
  async getCalendars() {
    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendars:', error);
      throw new Error('Failed to fetch calendars');
    }
  }

  // Create event in Google Calendar
  async createEvent(event: GoogleCalendarEvent, calendarId: string = 'primary') {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        resource: event,
        sendUpdates: 'all'
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  // Update event in Google Calendar
  async updateEvent(eventId: string, event: GoogleCalendarEvent, calendarId: string = 'primary') {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        resource: event,
        sendUpdates: 'all'
      });
      return response.data;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw new Error('Failed to update Google Calendar event');
    }
  }

  // Delete event from Google Calendar
  async deleteEvent(eventId: string, calendarId: string = 'primary') {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all'
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }

  // Get events from Google Calendar
  async getEvents(calendarId: string = 'primary', timeMin?: string, timeMax?: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }
}

// Sync app events to Google Calendar
export async function syncToGoogleCalendar(
  userId: string, 
  accessToken: string, 
  options: CalendarSyncOptions = {}
) {
  const service = new GoogleCalendarService(accessToken);
  const results = {
    created: 0,
    updated: 0,
    errors: 0,
    details: [] as any[]
  };

  try {
    // Sync projects
    if (options.syncProjects !== false) {
      const projects = await prisma.project.findMany({
        where: { userId, dueDate: { not: null } }
      });

      for (const project of projects) {
        try {
          const event: GoogleCalendarEvent = {
            summary: `📋 ${project.name}`,
            description: project.description || undefined,
            start: {
              date: project.dueDate!.toISOString().split('T')[0],
              timeZone: 'UTC'
            },
            end: {
              date: project.dueDate!.toISOString().split('T')[0],
              timeZone: 'UTC'
            },
            colorId: getPriorityColorId(project.priority),
            reminders: {
              useDefault: false,
              overrides: options.defaultReminders?.map(minutes => ({
                method: 'popup',
                minutes
              })) || [{ method: 'popup', minutes: 60 }]
            }
          };

          await service.createEvent(event);
          results.created++;
          results.details.push({ type: 'project', id: project.id, action: 'created' });
        } catch (error) {
          results.errors++;
          results.details.push({ type: 'project', id: project.id, action: 'error', error });
        }
      }
    }

    // Sync todos
    if (options.syncTodos !== false) {
      const todos = await prisma.todo.findMany({
        where: { userId, dueDate: { not: null } }
      });

      for (const todo of todos) {
        try {
          const event: GoogleCalendarEvent = {
            summary: `✅ ${todo.title}`,
            description: todo.description || undefined,
            start: {
              date: todo.dueDate!.toISOString().split('T')[0],
              timeZone: 'UTC'
            },
            end: {
              date: todo.dueDate!.toISOString().split('T')[0],
              timeZone: 'UTC'
            },
            colorId: getPriorityColorId(todo.priority),
            reminders: {
              useDefault: false,
              overrides: options.defaultReminders?.map(minutes => ({
                method: 'popup',
                minutes
              })) || [{ method: 'popup', minutes: 30 }]
            }
          };

          await service.createEvent(event);
          results.created++;
          results.details.push({ type: 'todo', id: todo.id, action: 'created' });
        } catch (error) {
          results.errors++;
          results.details.push({ type: 'todo', id: todo.id, action: 'error', error });
        }
      }
    }

    // Sync workouts
    if (options.syncWorkouts !== false) {
      const workouts = await prisma.workout.findMany({
        where: { userId }
      });

      for (const workout of workouts) {
        try {
          const event: GoogleCalendarEvent = {
            summary: `💪 ${workout.name}`,
            description: workout.notes || undefined,
            start: {
              date: workout.date.toISOString().split('T')[0],
              timeZone: 'UTC'
            },
            end: {
              date: workout.date.toISOString().split('T')[0],
              timeZone: 'UTC'
            },
            colorId: '10', // Green for workouts
            reminders: {
              useDefault: false,
              overrides: options.defaultReminders?.map(minutes => ({
                method: 'popup',
                minutes
              })) || [{ method: 'popup', minutes: 60 }]
            }
          };

          await service.createEvent(event);
          results.created++;
          results.details.push({ type: 'workout', id: workout.id, action: 'created' });
        } catch (error) {
          results.errors++;
          results.details.push({ type: 'workout', id: workout.id, action: 'error', error });
        }
      }
    }

    // Sync time blocks
    if (options.syncTimeBlocks !== false) {
      const timeBlocks = await prisma.timeSession.findMany({
        where: { 
          userId,
          activityType: { in: ['meeting', 'project', 'todo', 'workout', 'break'] }
        }
      });

      for (const block of timeBlocks) {
        try {
          const event: GoogleCalendarEvent = {
            summary: `⏰ ${block.title}`,
            description: block.description || undefined,
            start: {
              dateTime: block.startTime.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: block.endTime?.toISOString() || new Date(block.startTime.getTime() + 60 * 60 * 1000).toISOString(),
              timeZone: 'UTC'
            },
            colorId: getActivityColorId(block.activityType),
            reminders: {
              useDefault: false,
              overrides: options.defaultReminders?.map(minutes => ({
                method: 'popup',
                minutes
              })) || [{ method: 'popup', minutes: 15 }]
            }
          };

          await service.createEvent(event);
          results.created++;
          results.details.push({ type: 'timeBlock', id: block.id, action: 'created' });
        } catch (error) {
          results.errors++;
          results.details.push({ type: 'timeBlock', id: block.id, action: 'error', error });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    throw new Error('Failed to sync to Google Calendar');
  }
}

// Helper functions
function getPriorityColorId(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgent': return '11'; // Red
    case 'high': return '6';    // Orange
    case 'medium': return '5';  // Yellow
    case 'low': return '2';     // Blue
    default: return '1';        // Default
  }
}

function getActivityColorId(activityType: string): string {
  switch (activityType) {
    case 'project': return '1';   // Blue
    case 'workout': return '10';  // Green
    case 'todo': return '5';      // Yellow
    case 'meeting': return '11';  // Red
    case 'break': return '2';     // Light blue
    default: return '1';          // Default
  }
}

// Import events from Google Calendar
export async function importFromGoogleCalendar(
  userId: string,
  accessToken: string,
  calendarId: string = 'primary'
) {
  const service = new GoogleCalendarService(accessToken);
  const results = {
    imported: 0,
    errors: 0,
    details: [] as any[]
  };

  try {
    const events = await service.getEvents(calendarId);
    
    for (const event of events) {
      try {
        // Skip events that are all-day (we'll handle them differently)
        if (event.start?.date) {
          // Create a todo for all-day events
          await prisma.todo.create({
            data: {
              title: event.summary || 'Imported Event',
              description: event.description || undefined,
              dueDate: new Date(event.start.date),
              userId,
              priority: 'Medium',
              tags: ['imported', 'google-calendar']
            }
          });
        } else if (event.start?.dateTime) {
          // Create a time block for timed events
          await prisma.timeSession.create({
            data: {
              title: event.summary || 'Imported Event',
              description: event.description || undefined,
              startTime: new Date(event.start.dateTime),
              endTime: event.end?.dateTime ? new Date(event.end.dateTime) : undefined,
              activityType: 'meeting',
              category: 'imported',
              userId,
              tags: ['imported', 'google-calendar']
            }
          });
        }

        results.imported++;
        results.details.push({ 
          type: event.start?.date ? 'todo' : 'timeBlock', 
          id: event.id, 
          action: 'imported',
          title: event.summary 
        });
      } catch (error) {
        results.errors++;
        results.details.push({ 
          type: 'unknown', 
          id: event.id, 
          action: 'error', 
          error,
          title: event.summary 
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error importing from Google Calendar:', error);
    throw new Error('Failed to import from Google Calendar');
  }
} 