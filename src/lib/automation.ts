import { prisma } from './prisma';

export interface AutomationResult {
  projectId: string;
  status: string;
  progress: number;
  isOverdue: boolean;
  daysUntilDue: number | null;
  automationStatus: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  urgent: number;
  highPriority: number;
}

export class AssignmentAutomation {
  /**
   * Run automation checks on all projects for a specific user (similar to Notion's database automations)
   */
  static async runAutomationChecks(userId: string): Promise<AutomationResult[]> {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
      include: {
        subtasks: true,
      },
    });

    const results: AutomationResult[] = [];

    for (const project of projects) {
      const result = await this.automateProject(project);
      results.push(result);
    }

    return results;
  }

  /**
   * Automate a single project with status updates and progress calculations
   */
  static async automateProject(project: any): Promise<AutomationResult> {
    const now = new Date();
    let newStatus = project.status;
    let newProgress = project.progress;
    let isOverdue = false;
    let daysUntilDue: number | null = null;

    // Calculate days until due
    if (project.dueDate) {
      const dueDate = new Date(project.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      daysUntilDue = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    // Check if overdue (automation trigger)
    if (project.dueDate && daysUntilDue && daysUntilDue < 0) {
      isOverdue = true;
      if (project.status !== 'Completed') {
        newStatus = 'Overdue';
      }
    }

    // Calculate progress based on subtasks (automation action)
    if (project.subtasks && project.subtasks.length > 0) {
      const completedSubtasks = project.subtasks.filter(
        (subtask: any) => subtask.status === 'Completed'
      );
      newProgress = Math.round(
        (completedSubtasks.length / project.subtasks.length) * 100
      );
    }

    // Auto-update status based on progress (automation action)
    if (newProgress === 100 && newStatus !== 'Completed') {
      newStatus = 'Completed';
    } else if (newProgress > 0 && newProgress < 100 && newStatus === 'Not Started') {
      newStatus = 'In Progress';
    }

    // Update project if changes detected
    if (
      newStatus !== project.status ||
      newProgress !== project.progress ||
      project.automationStatus !== 'Completed'
    ) {
      await prisma.project.update({
        where: { id: project.id },
        data: {
          status: newStatus,
          progress: newProgress,
          lastAutomationCheck: now,
          automationStatus: 'Completed',
          completedAt: newStatus === 'Completed' ? now : project.completedAt,
        },
      });
    }

    return {
      projectId: project.id,
      status: newStatus,
      progress: newProgress,
      isOverdue,
      daysUntilDue,
      automationStatus: 'Completed',
    };
  }

  /**
   * Get projects that need attention for a specific user (overdue, due soon, etc.)
   */
  static async getProjectsNeedingAttention(userId: string) {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    return await prisma.project.findMany({
      where: {
        userId: userId,
        OR: [
          { status: 'Overdue' },
          {
            dueDate: {
              lte: threeDaysFromNow,
              gte: now,
            },
            status: {
              not: 'Completed',
            },
          },
        ],
      },
      include: {
        subtasks: true,
      },
      orderBy: [
        { status: 'asc' }, // Overdue first
        { dueDate: 'asc' },
      ],
    });
  }

  /**
   * Get dashboard statistics for a specific user
   */
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
    });
    const now = new Date();

    const stats: DashboardStats = {
      total: projects.length,
      completed: projects.filter(p => p.status === 'Completed').length,
      inProgress: projects.filter(p => p.status === 'In Progress').length,
      overdue: projects.filter(p => p.status === 'Overdue').length,
      dueToday: projects.filter(p => {
        if (!p.dueDate || p.status === 'Completed') return false;
        const dueDate = new Date(p.dueDate);
        return dueDate.toDateString() === now.toDateString();
      }).length,
      dueThisWeek: projects.filter(p => {
        if (!p.dueDate || p.status === 'Completed') return false;
        const dueDate = new Date(p.dueDate);
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= weekFromNow && dueDate >= now;
      }).length,
      urgent: projects.filter(p => p.priority === 'Urgent' && p.status !== 'Completed').length,
      highPriority: projects.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
    };

    return stats;
  }

  /**
   * Get priority-based project recommendations for a specific user
   */
  static async getPriorityRecommendations(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
        status: {
          not: 'Completed',
        },
      },
      include: {
        subtasks: true,
      },
      orderBy: [
        { priority: 'desc' }, // Urgent first
        { dueDate: 'asc' },
      ],
    });

    return projects.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get projects by course for a specific user (for academic tracking)
   */
  static async getProjectsByCourse(userId: string) {
    return await prisma.project.findMany({
      where: {
        userId: userId,
        course: {
          not: null,
        },
      },
      orderBy: [
        { course: 'asc' },
        { dueDate: 'asc' },
      ],
    });
  }

  /**
   * Get upcoming deadlines for a specific user
   */
  static async getUpcomingDeadlines(userId: string) {
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    return await prisma.project.findMany({
      where: {
        userId: userId,
        dueDate: {
          gte: now,
          lte: twoWeeksFromNow,
        },
        status: {
          not: 'Completed',
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
} 