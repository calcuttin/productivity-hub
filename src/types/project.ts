export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // Optional due date for the task
  priority?: 'Low' | 'Medium' | 'High'; // Optional priority
}

export interface Subtask {
  id: string;
  name: string;
  description: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string | null;
  completedAt: string | null;
  progress: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string | null;
  startDate: string | null;
  progress: number; // 0-100
  estimatedHours: number | null;
  actualHours: number | null;
  tags: string[];
  assignmentType: string | null;
  course: string | null;
  instructor: string | null;
  grade: number | null;
  maxGrade: number | null;
  notes: string | null;
  automationEnabled: boolean;
  lastAutomationRun: string | null;
  tasks?: Task[]; // Optional for backward compatibility
  subtasks?: Subtask[]; // New subtasks field
} 