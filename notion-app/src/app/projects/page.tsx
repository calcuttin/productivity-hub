"use client";
import Navigation from '@/components/Navigation'
import { useEffect, useState } from 'react'
import { Project, Task } from '@/types/project'
import { v4 as uuidv4 } from 'uuid'

const initialProjectForm: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  status: 'Not Started',
  dueDate: '',
  progress: 0,
};

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
  const [taskSortOrder, setTaskSortOrder] = useState<{ [projectId: string]: 'asc' | 'desc' }>({});

  useEffect(() => {
    fetchProjects();
  }, []);

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
      // Ensure dueDate is formatted as YYYY-MM-DD for the input field if it's not already
      const formattedData = data.map(project => ({
        ...project,
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : "",
      }));
      setProjects(formattedData);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentProject((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value, 10) : value,
    }));
  };

  const handleSaveProject = async () => {
    if (!currentProject.name || !currentProject.status) {
      alert("Project Name and Status are required.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const payload = {
      ...currentProject,
      // Ensure progress is a number, and dueDate is in a format the backend can parse (ISO string or let backend handle it)
      progress: Number(currentProject.progress) || 0,
      dueDate: currentProject.dueDate || null, // Send null if empty
    };

    try {
      let response;
      let responseData;

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

  // Add Task
  const handleAddTask = (projectId: string) => {
    const title = (newTaskTitle[projectId] || '').trim();
    const dueDate = newTaskDueDate[projectId] || '';
    const priority = newTaskPriority[projectId] || 'Medium';
    if (!title) return;
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      const newTask: Task = { id: uuidv4(), title, completed: false, dueDate, priority };
      const updatedTasks = project.tasks ? [...project.tasks, newTask] : [newTask];
      // Recalculate progress
      const progress = Math.round((updatedTasks.filter(t => t.completed).length / updatedTasks.length) * 100);
      return { ...project, tasks: updatedTasks, progress };
    }));
    setNewTaskTitle(prev => ({ ...prev, [projectId]: '' }));
    setNewTaskDueDate(prev => ({ ...prev, [projectId]: '' }));
    setNewTaskPriority(prev => ({ ...prev, [projectId]: 'Medium' }));
  };

  // Toggle Task Completion
  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      const updatedTasks = (project.tasks || []).map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      const progress = Math.round((updatedTasks.filter(t => t.completed).length / updatedTasks.length) * 100);
      return { ...project, tasks: updatedTasks, progress };
    }));
  };

  // Delete Task
  const handleDeleteTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      const updatedTasks = (project.tasks || []).filter(task => task.id !== taskId);
      const progress = updatedTasks.length > 0 ? Math.round((updatedTasks.filter(t => t.completed).length / updatedTasks.length) * 100) : 0;
      return { ...project, tasks: updatedTasks, progress };
    }));
  };

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          <p className="text-center text-gray-700 dark:text-gray-300">Loading projects...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Project Tracker
          </h1>
          <button
            onClick={() => {
              setShowForm(true);
              setCurrentProject(initialProjectForm);
              setEditingProjectId(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            {showForm && !editingProjectId ? "Cancel" : "Add New Project"}
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-red-100 dark:bg-red-800/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                {editingProjectId ? "Edit Project" : "Add New Project"}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveProject();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Project Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={currentProject.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={currentProject.description || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Status*
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={currentProject.status}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={currentProject.dueDate || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="progress"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    name="progress"
                    id="progress"
                    value={currentProject.progress || 0}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition duration-150"
                    disabled={isLoading}
                  >
                    {isLoading ? (editingProjectId ? 'Updating...':'Saving...') : (editingProjectId ? "Update Project" : "Save Project")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!showForm && projects.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No projects added yet. Click &quot;Add New Project&quot; to get started.
          </p>
        )}

        {!showForm && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 h-10 overflow-y-auto">
                    {project.description || "No description"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: <span className={`font-medium ${ 
                        project.status === "Completed" ? "text-green-500 dark:text-green-400" : 
                        project.status === "In Progress" ? "text-blue-500 dark:text-blue-400" : 
                        project.status === "On Hold" ? "text-yellow-500 dark:text-yellow-400" : 
                        "text-gray-500 dark:text-gray-400"
                    }`}>{project.status}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due: {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "N/A"}
                  </p>
                  <div className="mt-3 mb-1">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className={`${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'} h-2.5 rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Tasks UI */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-200">Tasks</h4>
                      <div>
                        <label className="mr-2 text-xs text-gray-500 dark:text-gray-400">Sort by Due Date:</label>
                        <select
                          value={taskSortOrder[project.id] || 'asc'}
                          onChange={e => setTaskSortOrder(prev => ({ ...prev, [project.id]: e.target.value as 'asc' | 'desc' }))}
                          className="text-xs px-2 py-1 rounded border dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="asc">Soonest First</option>
                          <option value="desc">Latest First</option>
                        </select>
                      </div>
                    </div>
                    <ul>
                      {(project.tasks ? [...project.tasks].sort((a, b) => {
                        if (!a.dueDate && !b.dueDate) return 0;
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        const cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        return (taskSortOrder[project.id] || 'asc') === 'asc' ? cmp : -cmp;
                      }) : []).map(task => (
                        <li key={task.id} className="flex items-center mb-1">
                          <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(project.id, task.id)} />
                          <span className={`ml-2 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</span>
                          {task.dueDate && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Due: {new Date(task.dueDate).toLocaleDateString()})</span>
                          )}
                          {task.priority && (
                            <span className={`ml-2 text-xs font-semibold rounded px-2 py-0.5
                              ${task.priority === 'High' ? 'bg-red-500 text-white' : ''}
                              ${task.priority === 'Medium' ? 'bg-yellow-400 text-gray-900' : ''}
                              ${task.priority === 'Low' ? 'bg-green-500 text-white' : ''}
                            `}>
                              {task.priority}
                            </span>
                          )}
                          <button onClick={() => handleDeleteTask(project.id, task.id)} className="ml-2 text-xs text-red-500 hover:underline">Delete</button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex mt-2 gap-2">
                      <input
                        type="text"
                        value={newTaskTitle[project.id] || ''}
                        onChange={e => setNewTaskTitle(prev => ({ ...prev, [project.id]: e.target.value }))}
                        className="flex-1 px-2 py-1 rounded border dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Add a new task"
                      />
                      <input
                        type="date"
                        value={newTaskDueDate[project.id] || ''}
                        onChange={e => setNewTaskDueDate(prev => ({ ...prev, [project.id]: e.target.value }))}
                        className="px-2 py-1 rounded border dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Due date"
                      />
                      <select
                        value={newTaskPriority[project.id] || 'Medium'}
                        onChange={e => setNewTaskPriority(prev => ({ ...prev, [project.id]: e.target.value as 'Low' | 'Medium' | 'High' }))}
                        className="px-2 py-1 rounded border dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <button onClick={() => handleAddTask(project.id)} className="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEditProject(project)}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 