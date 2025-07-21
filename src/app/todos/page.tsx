"use client";
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Todo } from '@/types/todo';
import { useRecentItemsListTracker } from '@/hooks/useRecentItemsTracker';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'all' | 'today' | 'pending' | 'completed'>('all');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [currentTodo, setCurrentTodo] = useState<Omit<Todo, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    tags: [],
    notes: ''
  });

  const { trackItem } = useRecentItemsListTracker();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentTodo(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTodo.title.trim()) return;

    try {
      const method = editingTodoId ? 'PUT' : 'POST';
      const url = editingTodoId ? `/api/todos/${editingTodoId}` : '/api/todos';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTodo),
      });

      if (!response.ok) throw new Error('Failed to save todo');
      
      const savedTodo = await response.json();
      
      // Track the todo as recently edited
      trackItem({
        id: savedTodo.id,
        type: 'todo',
        title: savedTodo.title,
        subtitle: savedTodo.description ? savedTodo.description : undefined,
        status: savedTodo.completed ? 'Completed' : 'Pending',
        priority: savedTodo.priority,
      });

      await fetchTodos();
      resetForm();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEditTodo = (todo: Todo) => {
    // Track when user starts editing a todo
    trackItem({
      id: todo.id,
      type: 'todo',
      title: todo.title,
      subtitle: todo.description,
      status: todo.completed ? 'Completed' : 'Pending',
      priority: todo.priority,
    });

    setCurrentTodo({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      tags: todo.tags || [],
      notes: todo.notes || ''
    });
    setEditingTodoId(todo.id);
    setShowForm(true);
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;

      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...todo, 
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date().toISOString() : null
        }),
      });

      if (!response.ok) throw new Error('Failed to update todo');
      
      const updatedTodo = await response.json();
      
      // Track the todo interaction
      trackItem({
        id: updatedTodo.id,
        type: 'todo',
        title: updatedTodo.title,
        subtitle: updatedTodo.description,
        status: updatedTodo.completed ? 'Completed' : 'Pending',
        priority: updatedTodo.priority,
      });

      setTodos(todos.map(t => t.id === todoId ? { ...t, completed: !t.completed } : t));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete todo');
      
      setTodos(todos.filter(t => t.id !== todoId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const resetForm = () => {
    setCurrentTodo({
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
      tags: [],
      notes: ''
    });
    setEditingTodoId(null);
    setShowForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = todos.filter(todo => !todo.completed).length;
  const urgentCount = todos.filter(todo => todo.priority === 'Urgent').length;

  // Filter todos based on current view
  const filteredTodos = todos.filter(todo => {
    if (view === 'pending') return !todo.completed;
    if (view === 'completed') return todo.completed;
    if (view === 'today') {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }
    return true; // 'all' view
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="content-container">
          <div className="text-center py-10 text-secondary">
            <p>Loading todos...</p>
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
                <h1 className="text-3xl font-bold text-primary">Todo Board</h1>
                <p className="mt-2 text-secondary">Manage your daily tasks and personal reminders</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Todo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Total</p>
                <p className="text-2xl font-bold text-primary">{todos.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Completed</p>
                <p className="text-2xl font-bold text-primary">{completedCount}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Pending</p>
                <p className="text-2xl font-bold text-primary">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary">Urgent</p>
                <p className="text-2xl font-bold text-primary">{urgentCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="border-b border-card">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Todos', count: todos.length },
                { key: 'today', label: 'Today', count: todos.filter(t => {
                  if (!t.dueDate) return false;
                  const dueDate = new Date(t.dueDate);
                  const today = new Date();
                  return dueDate.toDateString() === today.toDateString();
                }).length },
                { key: 'pending', label: 'Pending', count: pendingCount },
                { key: 'completed', label: 'Completed', count: completedCount }
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

        {/* Todos List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-primary">
              {view === 'all' && 'All Todos'}
              {view === 'today' && 'Today\'s Todos'}
              {view === 'pending' && 'Pending Todos'}
              {view === 'completed' && 'Completed Todos'}
            </h3>
          </div>

          <div className="divide-y divide-card" data-list="true">
            {filteredTodos.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary">
                  No todos found
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {view === 'all' && 'Get started by creating your first todo.'}
                  {view === 'today' && 'No todos scheduled for today.'}
                  {view === 'pending' && 'Great! All todos are completed.'}
                  {view === 'completed' && 'No completed todos yet.'}
                </p>
                {view === 'all' && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary mt-4"
                  >
                    Create Your First Todo
                  </button>
                )}
              </div>
            ) : (
              <>
                {filteredTodos.map((todo) => (
                  <div 
                    key={todo.id} 
                    className="px-6 py-4 hover:bg-card-secondary list-item" 
                    data-list-item="true" 
                    data-list-focused="false"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            todo.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {todo.completed && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Todo Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h4 className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-muted' : 'text-primary'}`}>
                              {todo.title}
                            </h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getPriorityColor(todo.priority)}`}>
                              {todo.priority}
                            </span>
                          </div>
                          
                          {todo.description && (
                            <p className={`mt-1 text-sm ${todo.completed ? 'text-muted' : 'text-secondary'}`}>
                              {todo.description}
                            </p>
                          )}
                          
                          {todo.dueDate && (
                            <p className="mt-1 text-xs text-muted">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          
                          {todo.tags && todo.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {todo.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditTodo(todo)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title="Edit todo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          title="Delete todo"
                          data-action="delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Keyboard Navigation Hint */}
                {filteredTodos.length > 0 && (
                  <div className="px-6 py-3 bg-gray-50 border-t list-navigation-hint">
                    <div className="text-xs text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <kbd>J</kbd>/<kbd>K</kbd> Navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd>Space</kbd> Toggle
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

      {/* Todo Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card border-card">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-primary mb-4">
                {editingTodoId ? 'Edit Todo' : 'Add New Todo'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={currentTodo.title}
                      onChange={handleInputChange}
                      className="input-standard"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary">Description</label>
                    <textarea
                      name="description"
                      value={currentTodo.description || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-standard"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary">Priority</label>
                      <select
                        name="priority"
                        value={currentTodo.priority}
                        onChange={handleInputChange}
                        className="input-standard"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary">Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={currentTodo.dueDate || ''}
                        onChange={handleInputChange}
                        className="input-standard"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      {editingTodoId ? 'Update' : 'Create'}
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