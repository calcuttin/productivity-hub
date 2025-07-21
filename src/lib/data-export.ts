import { prisma } from './prisma';

export interface ExportOptions {
  format: 'json' | 'csv';
  includeProjects?: boolean;
  includeTodos?: boolean;
  includeResearch?: boolean;
  includeWorkouts?: boolean;
  includeTimeSessions?: boolean;
  includePreferences?: boolean;
  includeNotifications?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface ExportData {
  metadata: {
    exportedAt: string;
    userId: string;
    format: string;
    version: string;
  };
  data: {
    projects?: any[];
    todos?: any[];
    research?: any[];
    workouts?: any[];
    timeSessions?: any[];
    preferences?: any[];
    notifications?: any[];
  };
}

/**
 * Export user data based on specified options
 */
export async function exportUserData(userId: string, options: ExportOptions): Promise<ExportData> {
  const {
    format,
    includeProjects = true,
    includeTodos = true,
    includeResearch = true,
    includeWorkouts = true,
    includeTimeSessions = true,
    includePreferences = true,
    includeNotifications = false,
    dateRange
  } = options;

  const exportData: ExportData = {
    metadata: {
      exportedAt: new Date().toISOString(),
      userId,
      format,
      version: '1.0.0'
    },
    data: {}
  };

  // Build date filter if specified
  const dateFilter = dateRange ? {
    createdAt: {
      ...(dateRange.from && { gte: dateRange.from }),
      ...(dateRange.to && { lte: dateRange.to })
    }
  } : {};

  // Export projects
  if (includeProjects) {
    const projects = await prisma.project.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' }
    });
    exportData.data.projects = projects;
  }

  // Export todos
  if (includeTodos) {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' }
    });
    exportData.data.todos = todos;
  }

  // Export research papers
  if (includeResearch) {
    const research = await prisma.researchPaper.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' }
    });
    exportData.data.research = research;
  }

  // Export workouts
  if (includeWorkouts) {
    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' }
    });
    exportData.data.workouts = workouts;
  }

  // Export time sessions
  if (includeTimeSessions) {
    const timeSessions = await prisma.timeSession.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' }
    });
    exportData.data.timeSessions = timeSessions;
  }

  // Export preferences
  if (includePreferences) {
    const preferences = await prisma.userPreferences.findMany({
      where: {
        userId,
        ...dateFilter
      }
    });
    exportData.data.preferences = preferences;
  }

  // Export notifications (optional, as they can be large)
  if (includeNotifications) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: { createdAt: 'desc' },
      take: 1000 // Limit to prevent huge exports
    });
    exportData.data.notifications = notifications;
  }

  return exportData;
}

/**
 * Convert export data to CSV format
 */
export function convertToCSV(exportData: ExportData): string {
  const csvLines: string[] = [];
  
  // Add metadata as comments
  csvLines.push(`# Export Metadata`);
  csvLines.push(`# Exported At: ${exportData.metadata.exportedAt}`);
  csvLines.push(`# User ID: ${exportData.metadata.userId}`);
  csvLines.push(`# Version: ${exportData.metadata.version}`);
  csvLines.push(``);

  // Export projects
  if (exportData.data.projects && exportData.data.projects.length > 0) {
    csvLines.push(`# Projects`);
    csvLines.push(`id,name,description,status,priority,dueDate,tags,createdAt,updatedAt`);
    exportData.data.projects.forEach(project => {
      csvLines.push([
        project.id,
        `"${project.name?.replace(/"/g, '""') || ''}"`,
        `"${project.description?.replace(/"/g, '""') || ''}"`,
        project.status || '',
        project.priority || '',
        project.dueDate || '',
        `"${project.tags?.join(',') || ''}"`,
        project.createdAt,
        project.updatedAt
      ].join(','));
    });
    csvLines.push(``);
  }

  // Export todos
  if (exportData.data.todos && exportData.data.todos.length > 0) {
    csvLines.push(`# Todos`);
    csvLines.push(`id,title,description,priority,dueDate,completed,createdAt,updatedAt`);
    exportData.data.todos.forEach(todo => {
      csvLines.push([
        todo.id,
        `"${todo.title?.replace(/"/g, '""') || ''}"`,
        `"${todo.description?.replace(/"/g, '""') || ''}"`,
        todo.priority || '',
        todo.dueDate || '',
        todo.completed ? 'true' : 'false',
        todo.createdAt,
        todo.updatedAt
      ].join(','));
    });
    csvLines.push(``);
  }

  // Export research papers
  if (exportData.data.research && exportData.data.research.length > 0) {
    csvLines.push(`# Research Papers`);
    csvLines.push(`id,title,abstract,publication,year,keywords,notes,createdAt,updatedAt`);
    exportData.data.research.forEach(paper => {
      csvLines.push([
        paper.id,
        `"${paper.title?.replace(/"/g, '""') || ''}"`,
        `"${paper.abstract?.replace(/"/g, '""') || ''}"`,
        `"${paper.publication?.replace(/"/g, '""') || ''}"`,
        paper.year || '',
        `"${paper.keywords?.join(',') || ''}"`,
        `"${paper.notes?.replace(/"/g, '""') || ''}"`,
        paper.createdAt,
        paper.updatedAt
      ].join(','));
    });
    csvLines.push(``);
  }

  // Export workouts
  if (exportData.data.workouts && exportData.data.workouts.length > 0) {
    csvLines.push(`# Workouts`);
    csvLines.push(`id,name,notes,date,completed,createdAt,updatedAt`);
    exportData.data.workouts.forEach(workout => {
      csvLines.push([
        workout.id,
        `"${workout.name?.replace(/"/g, '""') || ''}"`,
        `"${workout.notes?.replace(/"/g, '""') || ''}"`,
        workout.date || '',
        workout.completed ? 'true' : 'false',
        workout.createdAt,
        workout.updatedAt
      ].join(','));
    });
    csvLines.push(``);
  }

  // Export time sessions
  if (exportData.data.timeSessions && exportData.data.timeSessions.length > 0) {
    csvLines.push(`# Time Sessions`);
    csvLines.push(`id,description,startTime,endTime,duration,isActive,createdAt,updatedAt`);
    exportData.data.timeSessions.forEach(session => {
      csvLines.push([
        session.id,
        `"${session.description?.replace(/"/g, '""') || ''}"`,
        session.startTime || '',
        session.endTime || '',
        session.duration || '',
        session.isActive ? 'true' : 'false',
        session.createdAt,
        session.updatedAt
      ].join(','));
    });
    csvLines.push(``);
  }

  return csvLines.join('\n');
}

/**
 * Generate export filename
 */
export function generateExportFilename(userId: string, format: string, dateRange?: { from?: Date; to?: Date }): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  let filename = `notion-app-export-${dateStr}-${timeStr}`;
  
  if (dateRange) {
    if (dateRange.from) {
      filename += `-from-${dateRange.from.toISOString().split('T')[0]}`;
    }
    if (dateRange.to) {
      filename += `-to-${dateRange.to.toISOString().split('T')[0]}`;
    }
  }
  
  return `${filename}.${format}`;
}

/**
 * Get export statistics
 */
export async function getExportStats(userId: string, options: ExportOptions): Promise<{
  totalItems: number;
  breakdown: Record<string, number>;
  estimatedSize: string;
}> {
  const breakdown: Record<string, number> = {};
  let totalItems = 0;

  if (options.includeProjects) {
    const projectCount = await prisma.project.count({ where: { userId } });
    breakdown.projects = projectCount;
    totalItems += projectCount;
  }

  if (options.includeTodos) {
    const todoCount = await prisma.todo.count({ where: { userId } });
    breakdown.todos = todoCount;
    totalItems += todoCount;
  }

  if (options.includeResearch) {
    const researchCount = await prisma.researchPaper.count({ where: { userId } });
    breakdown.research = researchCount;
    totalItems += researchCount;
  }

  if (options.includeWorkouts) {
    const workoutCount = await prisma.workout.count({ where: { userId } });
    breakdown.workouts = workoutCount;
    totalItems += workoutCount;
  }

  if (options.includeTimeSessions) {
    const sessionCount = await prisma.timeSession.count({ where: { userId } });
    breakdown.timeSessions = sessionCount;
    totalItems += sessionCount;
  }

  if (options.includePreferences) {
    const prefCount = await prisma.userPreferences.count({ where: { userId } });
    breakdown.preferences = prefCount;
    totalItems += prefCount;
  }

  if (options.includeNotifications) {
    const notifCount = await prisma.notification.count({ where: { userId } });
    breakdown.notifications = Math.min(notifCount, 1000); // Limit for export
    totalItems += Math.min(notifCount, 1000);
  }

  // Estimate file size (rough calculation)
  const avgItemSize = 500; // bytes per item
  const estimatedBytes = totalItems * avgItemSize;
  const estimatedSize = estimatedBytes > 1024 * 1024 
    ? `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${(estimatedBytes / 1024).toFixed(1)} KB`;

  return {
    totalItems,
    breakdown,
    estimatedSize
  };
} 