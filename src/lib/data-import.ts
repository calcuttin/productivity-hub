import { prisma } from './prisma';
import { ExportData } from './data-export';

export interface ImportOptions {
  importProjects?: boolean;
  importTodos?: boolean;
  importResearch?: boolean;
  importWorkouts?: boolean;
  importTimeSessions?: boolean;
  importPreferences?: boolean;
  importNotifications?: boolean;
  conflictResolution: 'skip' | 'overwrite' | 'merge';
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface ImportResult {
  success: boolean;
  summary: {
    totalImported: number;
    skipped: number;
    errors: number;
    breakdown: Record<string, { imported: number; skipped: number; errors: number }>;
  };
  errors: Array<{
    type: string;
    id: string;
    message: string;
  }>;
}

/**
 * Import user data from export format
 */
export async function importUserData(
  userId: string, 
  exportData: ExportData, 
  options: ImportOptions
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    summary: {
      totalImported: 0,
      skipped: 0,
      errors: 0,
      breakdown: {}
    },
    errors: []
  };

  try {
    // Validate export data structure
    if (!exportData.metadata || !exportData.data) {
      throw new Error('Invalid export data format');
    }

    // Import projects
    if (options.importProjects && exportData.data.projects) {
      const projectResult = await importProjects(userId, exportData.data.projects, options);
      result.summary.breakdown.projects = projectResult;
      result.summary.totalImported += projectResult.imported;
      result.summary.skipped += projectResult.skipped;
      result.summary.errors += projectResult.errors;
    }

    // Import todos
    if (options.importTodos && exportData.data.todos) {
      const todoResult = await importTodos(userId, exportData.data.todos, options);
      result.summary.breakdown.todos = todoResult;
      result.summary.totalImported += todoResult.imported;
      result.summary.skipped += todoResult.skipped;
      result.summary.errors += todoResult.errors;
    }

    // Import research papers
    if (options.importResearch && exportData.data.research) {
      const researchResult = await importResearch(userId, exportData.data.research, options);
      result.summary.breakdown.research = researchResult;
      result.summary.totalImported += researchResult.imported;
      result.summary.skipped += researchResult.skipped;
      result.summary.errors += researchResult.errors;
    }

    // Import workouts
    if (options.importWorkouts && exportData.data.workouts) {
      const workoutResult = await importWorkouts(userId, exportData.data.workouts, options);
      result.summary.breakdown.workouts = workoutResult;
      result.summary.totalImported += workoutResult.imported;
      result.summary.skipped += workoutResult.skipped;
      result.summary.errors += workoutResult.errors;
    }

    // Import time sessions
    if (options.importTimeSessions && exportData.data.timeSessions) {
      const sessionResult = await importTimeSessions(userId, exportData.data.timeSessions, options);
      result.summary.breakdown.timeSessions = sessionResult;
      result.summary.totalImported += sessionResult.imported;
      result.summary.skipped += sessionResult.skipped;
      result.summary.errors += sessionResult.errors;
    }

    // Import preferences
    if (options.importPreferences && exportData.data.preferences) {
      const prefResult = await importPreferences(userId, exportData.data.preferences, options);
      result.summary.breakdown.preferences = prefResult;
      result.summary.totalImported += prefResult.imported;
      result.summary.skipped += prefResult.skipped;
      result.summary.errors += prefResult.errors;
    }

    // Import notifications
    if (options.importNotifications && exportData.data.notifications) {
      const notifResult = await importNotifications(userId, exportData.data.notifications, options);
      result.summary.breakdown.notifications = notifResult;
      result.summary.totalImported += notifResult.imported;
      result.summary.skipped += notifResult.skipped;
      result.summary.errors += notifResult.errors;
    }

  } catch (error) {
    result.success = false;
    result.errors.push({
      type: 'general',
      id: 'import',
      message: error instanceof Error ? error.message : 'Unknown import error'
    });
  }

  return result;
}

/**
 * Import projects
 */
async function importProjects(
  userId: string, 
  projects: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const project of projects) {
    try {
      // Check if project already exists
      const existing = await prisma.project.findFirst({
        where: { 
          userId,
          name: project.name 
        }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        } else if (options.conflictResolution === 'overwrite') {
          await prisma.project.update({
            where: { id: existing.id },
            data: {
              description: project.description,
              status: project.status,
              priority: project.priority,
              dueDate: project.dueDate ? new Date(project.dueDate) : null,
              tags: project.tags || [],
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Create new project
        await prisma.project.create({
          data: {
            userId,
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            dueDate: project.dueDate ? new Date(project.dueDate) : null,
            tags: project.tags || []
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing project:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Import todos
 */
async function importTodos(
  userId: string, 
  todos: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const todo of todos) {
    try {
      // Check if todo already exists
      const existing = await prisma.todo.findFirst({
        where: { 
          userId,
          title: todo.title 
        }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        } else if (options.conflictResolution === 'overwrite') {
          await prisma.todo.update({
            where: { id: existing.id },
            data: {
              description: todo.description,
              priority: todo.priority,
              dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
              completed: todo.completed || false,
              completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Create new todo
        await prisma.todo.create({
          data: {
            userId,
            title: todo.title,
            description: todo.description,
            priority: todo.priority,
            dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
            completed: todo.completed || false,
            completedAt: todo.completedAt ? new Date(todo.completedAt) : null
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing todo:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Import research papers
 */
async function importResearch(
  userId: string, 
  research: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const paper of research) {
    try {
      // Check if paper already exists
      const existing = await prisma.researchPaper.findFirst({
        where: { 
          userId,
          title: paper.title 
        }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        } else if (options.conflictResolution === 'overwrite') {
          await prisma.researchPaper.update({
            where: { id: existing.id },
            data: {
              abstract: paper.abstract,
              publication: paper.publication,
              year: paper.year,
              keywords: paper.keywords || [],
              notes: paper.notes,
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Create new research paper
        await prisma.researchPaper.create({
          data: {
            userId,
            title: paper.title,
            abstract: paper.abstract,
            publication: paper.publication,
            year: paper.year,
            keywords: paper.keywords || [],
            notes: paper.notes
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing research paper:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Import workouts
 */
async function importWorkouts(
  userId: string, 
  workouts: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const workout of workouts) {
    try {
      // Check if workout already exists
      const existing = await prisma.workout.findFirst({
        where: { 
          userId,
          name: workout.name,
          date: workout.date ? new Date(workout.date) : undefined
        }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        } else if (options.conflictResolution === 'overwrite') {
          await prisma.workout.update({
            where: { id: existing.id },
            data: {
              notes: workout.notes,
              completed: workout.completed || false,
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Create new workout
        await prisma.workout.create({
          data: {
            userId,
            name: workout.name,
            notes: workout.notes,
            date: workout.date ? new Date(workout.date) : new Date(),
            completed: workout.completed || false
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing workout:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Import time sessions
 */
async function importTimeSessions(
  userId: string, 
  sessions: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const session of sessions) {
    try {
      // Check if session already exists
      const existing = await prisma.timeSession.findFirst({
        where: { 
          userId,
          description: session.description,
          startTime: session.startTime ? new Date(session.startTime) : undefined
        }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        } else if (options.conflictResolution === 'overwrite') {
          await prisma.timeSession.update({
            where: { id: existing.id },
            data: {
              endTime: session.endTime ? new Date(session.endTime) : null,
              duration: session.duration,
              isActive: session.isActive || false,
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Create new time session
        await prisma.timeSession.create({
          data: {
            userId,
            title: session.description || 'Imported Session',
            description: session.description,
            startTime: session.startTime ? new Date(session.startTime) : new Date(),
            endTime: session.endTime ? new Date(session.endTime) : null,
            duration: session.duration,
            isActive: session.isActive || false,
            activityType: 'work'
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing time session:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Import preferences
 */
async function importPreferences(
  userId: string, 
  preferences: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const pref of preferences) {
    try {
      // Check if preference already exists
      const existing = await prisma.userPreferences.findFirst({
        where: { userId }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        } else if (options.conflictResolution === 'overwrite') {
          await prisma.userPreferences.update({
            where: { id: existing.id },
            data: {
              theme: pref.theme,
              timezone: pref.timezone,
              updatedAt: new Date()
            }
          });
        }
      } else {
        // Create new preferences
        await prisma.userPreferences.create({
          data: {
            userId,
            theme: pref.theme,
            timezone: pref.timezone
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing preferences:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Import notifications
 */
async function importNotifications(
  userId: string, 
  notifications: any[], 
  options: ImportOptions
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const notif of notifications) {
    try {
      // Check if notification already exists
      const existing = await prisma.notification.findFirst({
        where: { 
          userId,
          title: notif.title,
          createdAt: notif.createdAt ? new Date(notif.createdAt) : undefined
        }
      });

      if (existing) {
        if (options.conflictResolution === 'skip') {
          skipped++;
          continue;
        }
      } else {
        // Create new notification
        await prisma.notification.create({
          data: {
            userId,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            status: notif.status,
            readAt: notif.readAt ? new Date(notif.readAt) : null
          }
        });
      }
      imported++;
    } catch (error) {
      errors++;
      console.error('Error importing notification:', error);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Validate import data structure
 */
export function validateImportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors };
  }

  if (!data.metadata) {
    errors.push('Missing metadata');
  }

  if (!data.data) {
    errors.push('Missing data section');
  }

  if (data.metadata && !data.metadata.version) {
    errors.push('Missing version information');
  }

  return {
    valid: errors.length === 0,
    errors
  };
} 