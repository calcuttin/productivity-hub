export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // Optional due date for the task
  priority?: 'Low' | 'Medium' | 'High'; // Optional priority
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate: string;
  progress: number; // 0-100
  tasks?: Task[]; // Optional for backward compatibility
} 