export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string | null;
  completedAt?: string | null;
  tags: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
} 