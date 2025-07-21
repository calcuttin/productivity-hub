"use client";
import Navigation from '@/components/Navigation'
import { useEffect, useState, useMemo } from 'react'
import { Project } from '@/types/project'

const initialProjectForm: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  status: 'Not Started',
  dueDate: '',
  startDate: '',
  progress: 0,
  priority: 'Medium',
  estimatedHours: null,
  actualHours: null,
  tags: [],
  assignmentType: null,
  course: '',
  instructor: null,
  grade: null,
  maxGrade: null,
  notes: null,
  automationEnabled: false,
  lastAutomationRun: null,
  tasks: [],
  subtasks: []
};

interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  urgent: number;
  highPriority: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [currentProject, setCurrentProject] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>(initialProjectForm);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<{ [projectId: string]: string }>({});
  const [newTaskDueDate, setNewTaskDueDate] = useState<{ [projectId: string]: string }>({});
  const [newTaskPriority, setNewTaskPriority] = useState<{ [projectId: string]: 'Low' | 'Medium' | 'High' }>({});
  // const [taskSortOrder, setTaskSortOrder] = useState<{ [projectId: string]: 'asc' | 'desc' }>({});
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [view, setView] = useState<'all' | 'overdue' | 'thisWeek' | 'urgent' | 'completed'>('all');
  const [expandedProjects, setExpandedProjects] = useState<{ [projectId: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'projects' | 'school'>('projects');

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  // Separate projects into categories
  const schoolProjects = projects.filter(project => project.course || project.assignmentType);
  const generalProjects = projects.filter(project => !project.course && !project.assignmentType);

  // Get current projects based on active tab
  const currentProjects = activeTab === 'school' ? schoolProjects : generalProjects;

  // Calculate stats for current tab
  const currentStats = useMemo(() => {
    if (!stats) return null;
    
    const projectsForStats = currentProjects;
    return {
      total: projectsForStats.length,
      completed: projectsForStats.filter(p => p.status === 'Completed').length,
      inProgress: projectsForStats.filter(p => p.status === 'In Progress').length,
      overdue: projectsForStats.filter(p => p.status === 'Overdue').length,
      dueToday: projectsForStats.filter(p => {
        if (!p.dueDate || p.status === 'Completed') return false;
        const dueDate = new Date(p.dueDate);
        const today = new Date();
        return dueDate.toDateString() === today.toDateString();
      }).length,
      dueThisWeek: projectsForStats.filter(p => {
        if (!p.dueDate || p.status === 'Completed') return false;
        const dueDate = new Date(p.dueDate);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate <= weekFromNow && dueDate >= now;
      }).length,
      urgent: projectsForStats.filter(p => p.priority === 'Urgent' && p.status !== 'Completed').length,
      highPriority: projectsForStats.filter(p => p.priority === 'High' && p.status !== 'Completed').length,
    };
  }, [stats, currentProjects]);

  async function fetchProjects() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch projects: ${response.statusText}`);
      }
      const data: Project[] = await response.json();
      console.log('Fetched projects with subtasks:', data);
      
      // Ensure dueDate is formatted as YYYY-MM-DD for the input field if it's not already
      const formattedData = data.map(project => ({
        ...project,
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : "",
        subtasks: project.subtasks || [] // Ensure subtasks array exists
      }));
      console.log('Formatted projects:', formattedData);
      setProjects(formattedData);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/assignments/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value, 10) : 
               name === "grade" || name === "maxGrade" ? (value === '' ? null : parseInt(value, 10)) :
               value,
    }));
  };

  const handleSaveProject = async () => {
    if (!currentProject.name || !currentProject.status) {
      alert("Project Name and Status are required.");
      return;
    }

    // For school assignments, ensure either course or assignmentType is filled
    if (activeTab === 'school' && !currentProject.course && !currentProject.assignmentType) {
      alert("For school assignments, please fill in either Course or Assignment Type.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      ...currentProject,
      // Ensure progress is a number, and dueDate is in a format the backend can parse (ISO string or let backend handle it)
      progress: Number(currentProject.progress) || 0,
      dueDate: currentProject.dueDate || null, // Send null if empty
      // For school tab, ensure we have at least one school identifier
      ...(activeTab === 'school' && !currentProject.course && !currentProject.assignmentType ? 
         { assignmentType: 'Other' } : {})
    };

    try {
      let response;
      let responseData: Project;

      if (editingProjectId) {
        response = await fetch(`/api/projects/${editingProjectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save project: ${response.statusText}`);
      }
      responseData = await response.json();
      // Format dueDate for consistency in the frontend state if necessary
      responseData.dueDate = responseData.dueDate ? new Date(responseData.dueDate).toISOString().split('T')[0] : "";

      if (editingProjectId) {
        setProjects(
          projects.map((p) => (p.id === editingProjectId ? responseData : p))
        );
      } else {
        setProjects([responseData, ...projects]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setShowForm(true);
    // Ensure dueDate is in YYYY-MM-DD for the form input
    const projectToEdit = {
        ...project,
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : "",
        description: project.description || "", // Ensure description is not null for form
        progress: project.progress || 0, // Ensure progress is not null for form
    };
    setCurrentProject(projectToEdit as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>);
    setEditingProjectId(project.id);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to delete project: ${response.statusText}`);
        }
        setProjects(projects.filter((p) => p.id !== projectId));
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setCurrentProject(initialProjectForm);
    setEditingProjectId(null);
    setError(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
    // If we're on the school tab, set a default to ensure proper categorization
    if (activeTab === 'school') {
      setCurrentProject(prev => ({
        ...prev,
        assignmentType: 'Homework' // Default assignment type for school work
      }));
    }
  };

  // Add Task
  const handleAddTask = async (projectId: string) => {
    const title = (newTaskTitle[projectId] || '').trim();
    const dueDate = newTaskDueDate[projectId] || '';
    const priority = newTaskPriority[projectId] || 'Medium';
    if (!title) return;

    console.log('Adding task:', { projectId, title, dueDate, priority });

    try {
      const response = await fetch(`/api/projects/${projectId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          dueDate: dueDate || null,
          priority,
          status: 'Not Started'
        })
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to add task: ${responseData.message || response.statusText}`);
      }

      // Refresh the projects to get updated data
      await fetchProjects();
      
      // Clear form fields
      setNewTaskTitle(prev => ({ ...prev, [projectId]: '' }));
      setNewTaskDueDate(prev => ({ ...prev, [projectId]: '' }));
      setNewTaskPriority(prev => ({ ...prev, [projectId]: 'Medium' }));
      
      console.log('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      setError(`Failed to add task: ${(error as Error).message}`);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (projectId: string, taskId: string) => {
    try {
      // Find the current task to get its current completion status
      const project = projects.find(p => p.id === projectId);
      const task = project?.subtasks?.find(t => t.id === taskId);
      if (!task) return;

      const newCompleted = task.status !== 'Completed';

      const response = await fetch(`/api/projects/${projectId}/subtasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: newCompleted
        })
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Refresh the projects to get updated data
      await fetchProjects();
    } catch (error) {
      console.error('Error toggling task:', error);
      setError('Failed to update task');
    }
  };

  // Delete Task
  const handleDeleteTask = async (projectId: string, taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/subtasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');

      // Refresh the projects to get updated data
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredProjects = currentProjects.filter(project => {
    if (view === 'overdue') return project.status === 'Overdue';
    if (view === 'thisWeek') {
      if (!project.dueDate) return false;
      const dueDate = new Date(project.dueDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate <= weekFromNow && dueDate >= now && project.status !== 'Completed';
    }
    if (view === 'urgent') return project.priority === 'Urgent' && project.status !== 'Completed';
    if (view === 'completed') return project.status === 'Completed';
    return true;
  });

  if (isLoading && projects.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      
      {/* Header */}
      <div className="bg-card border-b border-card">
        <div className="content-container">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary">Project Tracker</h1>
                <p className="mt-2 text-secondary">Manage your projects and assignments with smart automation</p>
              </div>
              <button
                onClick={openCreateForm}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add {activeTab === 'school' ? 'Assignment' : 'Project'}</span>
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="border-b border-card">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'projects'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-secondary hover:text-primary hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>General Projects</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-primary py-0.5 px-2.5 rounded-full text-xs">
                      {generalProjects.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('school')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'school'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-secondary hover:text-primary hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>School Work</span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-primary py-0.5 px-2.5 rounded-full text-xs">
                      {schoolProjects.length}
                    </span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Stats Cards */}
        {currentStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <button
              className={`card p-6 text-left transition-colors w-full ${view === 'all' ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setView('all')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary">Total</p>
                  <p className="text-2xl font-bold text-primary">{currentStats.total}</p>
                </div>
              </div>
            </button>

            <button
              className={`card p-6 text-left transition-colors w-full ${view === 'completed' ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setView('completed')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary">Completed</p>
                  <p className="text-2xl font-bold text-primary">{currentStats.completed}</p>
                </div>
              </div>
            </button>

            <button
              className={`card p-6 text-left transition-colors w-full ${view === 'overdue' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setView('overdue')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary">Overdue</p>
                  <p className="text-2xl font-bold text-primary">{currentStats.overdue}</p>
                </div>
              </div>
            </button>

            <button
              className={`card p-6 text-left transition-colors w-full ${view === 'urgent' ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => setView('urgent')}
            >
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary">Urgent</p>
                  <p className="text-2xl font-bold text-primary">{currentStats.urgent}</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* View Tabs */}
        <div className="card mb-6">
          <div className="border-b border-card">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: activeTab === 'school' ? 'All Assignments' : 'All Projects', count: currentProjects.length },
                { key: 'overdue', label: 'Overdue', count: currentProjects.filter(p => p.status === 'Overdue').length },
                { key: 'thisWeek', label: 'Due This Week', count: currentProjects.filter(p => {
                  if (!p.dueDate || p.status === 'Completed') return false;
                  const dueDate = new Date(p.dueDate);
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return dueDate <= weekFromNow && dueDate >= now;
                }).length },
                { key: 'urgent', label: 'Urgent', count: currentProjects.filter(p => p.priority === 'Urgent' && p.status !== 'Completed').length },
                { key: 'completed', label: 'Completed', count: currentProjects.filter(p => p.status === 'Completed').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    view === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-secondary hover:text-primary hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-primary py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Projects List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">
              {view === 'all' && (activeTab === 'school' ? 'All Assignments' : 'All Projects')}
              {view === 'overdue' && 'Overdue ' + (activeTab === 'school' ? 'Assignments' : 'Projects')}
              {view === 'thisWeek' && 'Due This Week'}
              {view === 'urgent' && 'Urgent ' + (activeTab === 'school' ? 'Assignments' : 'Projects')}
              {view === 'completed' && 'Completed ' + (activeTab === 'school' ? 'Assignments' : 'Projects')}
            </h3>
          </div>

          <div className="divide-y divide-card" data-list="true">
            {filteredProjects.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary">
                  No {activeTab === 'school' ? 'assignments' : 'projects'}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {view === 'all' && `Get started by creating your first ${activeTab === 'school' ? 'assignment' : 'project'}.`}
                  {view === 'overdue' && `Great! No overdue ${activeTab === 'school' ? 'assignments' : 'projects'}.`}
                  {view === 'thisWeek' && `No ${activeTab === 'school' ? 'assignments' : 'projects'} due this week.`}
                  {view === 'urgent' && `No urgent ${activeTab === 'school' ? 'assignments' : 'projects'} at the moment.`}
                  {view === 'completed' && `No completed ${activeTab === 'school' ? 'assignments' : 'projects'} at the moment.`}
                </p>
                {view === 'all' && (
                  <button
                    onClick={openCreateForm}
                    className="btn-primary mt-4"
                  >
                    Create Your First {activeTab === 'school' ? 'Assignment' : 'Project'}
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="px-6 py-4 hover:bg-card-secondary list-item" 
                    data-list-item="true" 
                    data-list-focused="false"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Priority Indicator */}
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}></div>
                        
                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-primary truncate">
                              {project.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          
                          <div className="mt-1 flex items-center space-x-4 text-sm text-secondary">
                            {project.course && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {project.course}
                              </span>
                            )}
                            
                            {project.dueDate && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(project.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            
                            {project.assignmentType && (
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {project.assignmentType}
                              </span>
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          {project.progress !== null && project.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-secondary mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${getProgressColor(project.progress)}`} 
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleProjectExpansion(project.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title={expandedProjects[project.id] ? "Collapse tasks" : "Expand tasks"}
                        >
                          <svg className={`w-5 h-5 transform transition-transform ${expandedProjects[project.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title="Edit project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          title="Delete project"
                          data-action="delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Tasks Section */}
                    {expandedProjects[project.id] && (
                      <div className="mt-4 ml-7 border-l-2 border-card pl-4">
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-primary mb-3">Tasks</h5>
                          
                          {/* Add New Task Form */}
                          <div className="bg-card-secondary rounded-lg p-3 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <input
                                type="text"
                                placeholder="Task title"
                                value={newTaskTitle[project.id] || ''}
                                onChange={(e) => setNewTaskTitle(prev => ({ ...prev, [project.id]: e.target.value }))}
                                className="input-standard"
                              />
                              <input
                                type="date"
                                value={newTaskDueDate[project.id] || ''}
                                onChange={(e) => setNewTaskDueDate(prev => ({ ...prev, [project.id]: e.target.value }))}
                                className="input-standard"
                              />
                              <select
                                value={newTaskPriority[project.id] || 'Medium'}
                                onChange={(e) => setNewTaskPriority(prev => ({ ...prev, [project.id]: e.target.value as 'Low' | 'Medium' | 'High' }))}
                                className="input-standard"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                              <button
                                onClick={() => handleAddTask(project.id)}
                                className="btn-primary text-sm"
                              >
                                Add Task
                              </button>
                            </div>
                          </div>

                          {/* Tasks List */}
                          <div className="space-y-2">
                            {project.subtasks && project.subtasks.length > 0 ? (
                              project.subtasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between bg-card border border-card rounded-lg p-3">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => handleToggleTask(project.id, task.id)}
                                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                        task.status === 'Completed'
                                          ? 'bg-green-500 border-green-500 text-white' 
                                          : 'border-gray-300 dark:border-gray-600'
                                      }`}
                                    >
                                      {task.status === 'Completed' && (
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </button>
                                    
                                    <div className="flex-1">
                                      <span className={`text-sm ${task.status === 'Completed' ? 'line-through text-muted' : 'text-primary'}`}>
                                        {task.name}
                                      </span>
                                      {task.dueDate && (
                                        <div className="text-xs text-secondary mt-1">
                                          Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                                      task.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                  
                                  <button
                                    onClick={() => handleDeleteTask(project.id, task.id)}
                                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                                    title="Delete task"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted text-sm">No tasks yet. Add your first task above.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Keyboard Navigation Hint */}
                {filteredProjects.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t list-navigation-hint">
                    <div className="text-xs text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd>J</kbd>/<kbd>K</kbd> Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd>Space</kbd> Expand
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd>Enter</kbd> Edit
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd>Del</kbd> Delete
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-xl shadow-2xl border border-card">
            <div className="sticky top-0 bg-card border-b border-card px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-primary">
                  {editingProjectId ? `Edit ${activeTab === 'school' ? 'Assignment' : 'Project'}` : `Add New ${activeTab === 'school' ? 'Assignment' : 'Project'}`}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProject(); }} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">
                      {activeTab === 'school' ? 'Assignment' : 'Project'} Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={currentProject.name}
                      onChange={handleInputChange}
                      className="input-standard w-full"
                      placeholder={`Enter ${activeTab === 'school' ? 'assignment' : 'project'} name...`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Description</label>
                    <textarea
                      name="description"
                      value={currentProject.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-standard w-full resize-none"
                      placeholder="Optional description..."
                    />
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Status *</label>
                    <select
                      name="status"
                      value={currentProject.status}
                      onChange={handleInputChange}
                      className="input-standard w-full"
                      required
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Priority</label>
                    <select
                      name="priority"
                      value={currentProject.priority}
                      onChange={handleInputChange}
                      className="input-standard w-full"
                    >
                      <option value="Low">🟢 Low</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="High">🟠 High</option>
                      <option value="Urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={currentProject.dueDate || ''}
                      onChange={handleInputChange}
                      className="input-standard w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      value={currentProject.progress}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="input-standard w-full"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* School-Specific Fields */}
                {activeTab === 'school' && (
                  <div className="border-t border-card pt-6 space-y-4">
                    <h4 className="text-lg font-semibold text-primary mb-4">📚 Academic Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Course</label>
                        <input
                          type="text"
                          name="course"
                          value={currentProject.course || ''}
                          onChange={handleInputChange}
                          className="input-standard w-full"
                          placeholder="e.g., Computer Science 101"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Assignment Type</label>
                        <select
                          name="assignmentType"
                          value={currentProject.assignmentType || ''}
                          onChange={handleInputChange}
                          className="input-standard w-full"
                        >
                          <option value="">Select type...</option>
                          <option value="Homework">📝 Homework</option>
                          <option value="Project">🛠️ Project</option>
                          <option value="Research">🔬 Research</option>
                          <option value="Essay">📄 Essay</option>
                          <option value="Exam">📊 Exam</option>
                          <option value="Lab">🧪 Lab</option>
                          <option value="Presentation">🎤 Presentation</option>
                          <option value="Other">❓ Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Current Grade</label>
                        <input
                          type="number"
                          name="grade"
                          value={currentProject.grade || ''}
                          onChange={handleInputChange}
                          className="input-standard w-full"
                          placeholder="Your grade (optional)"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">Max Grade</label>
                        <input
                          type="number"
                          name="maxGrade"
                          value={currentProject.maxGrade || ''}
                          onChange={handleInputChange}
                          className="input-standard w-full"
                          placeholder="e.g., 100"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="sticky bottom-0 bg-card border-t border-card px-6 py-4 rounded-b-xl">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isLoading && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      )}
                      <span>{isLoading ? 'Saving...' : (editingProjectId ? 'Update' : 'Create')}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 