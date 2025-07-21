"use client";
import { useState, useEffect, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import { Project } from '@/types/project';
import { useRecentItemsListTracker } from '@/hooks/useRecentItemsTracker';
import AssignmentForm from '@/components/AssignmentForm';
import { 
  BookOpen, 
  Clock, 
  GraduationCap, 
  Plus, 
  Search, 
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';

type AssignmentFilter = 'all' | 'upcoming' | 'in-progress' | 'completed' | 'overdue';
type AssignmentSort = 'dueDate' | 'priority' | 'course' | 'grade' | 'progress';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Project[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AssignmentFilter>('all');
  const [sortBy, setSortBy] = useState<AssignmentSort>('dueDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trackItem } = useRecentItemsListTracker();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      
      // Filter only academic assignments (projects with course or assignmentType)
      const academicAssignments = data.filter((project: Project) => 
        project.course || project.assignmentType
      );
      
      setAssignments(academicAssignments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique courses and assignment types for filtering
  const uniqueCourses = useMemo(() => {
    const courses = assignments
      .map(a => a.course)
      .filter(Boolean)
      .filter((course, index, array) => array.indexOf(course) === index);
    return courses;
  }, [assignments]);

  const uniqueTypes = useMemo(() => {
    const types = assignments
      .map(a => a.assignmentType)
      .filter(Boolean)
      .filter((type, index, array) => array.indexOf(type) === index);
    return types;
  }, [assignments]);

  // Filter and sort assignments
  useEffect(() => {
    let filtered = [...assignments];

    // Apply status filter
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(a => {
          if (!a.dueDate) return false;
          const dueDate = new Date(a.dueDate);
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue >= 0 && a.status !== 'Completed';
        });
        break;
      case 'in-progress':
        filtered = filtered.filter(a => a.status === 'In Progress');
        break;
      case 'completed':
        filtered = filtered.filter(a => a.status === 'Completed');
        break;
      case 'overdue':
        filtered = filtered.filter(a => {
          if (!a.dueDate || a.status === 'Completed') return false;
          const dueDate = new Date(a.dueDate);
          return dueDate < now;
        });
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assignmentType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply course filter
    if (selectedCourse) {
      filtered = filtered.filter(a => a.course === selectedCourse);
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter(a => a.assignmentType === selectedType);
    }

    // Sort assignments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'course':
          return (a.course || '').localeCompare(b.course || '');
        case 'grade':
          if (a.grade === null && b.grade === null) return 0;
          if (a.grade === null) return 1;
          if (b.grade === null) return -1;
          return (b.grade || 0) - (a.grade || 0);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  }, [assignments, filter, searchTerm, selectedCourse, selectedType, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: assignments.length,
      completed: assignments.filter(a => a.status === 'Completed').length,
      inProgress: assignments.filter(a => a.status === 'In Progress').length,
      overdue: assignments.filter(a => {
        if (!a.dueDate || a.status === 'Completed') return false;
        return new Date(a.dueDate) < now;
      }).length,
      averageGrade: (() => {
        const gradedAssignments = assignments.filter(a => a.grade !== null);
        if (gradedAssignments.length === 0) return null;
        const sum = gradedAssignments.reduce((acc, a) => acc + (a.grade || 0), 0);
        return (sum / gradedAssignments.length).toFixed(1);
      })(),
      coursesCount: uniqueCourses.length
    };
  }, [assignments, uniqueCourses]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (assignment: Project) => {
    if (assignment.status === 'Completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (!assignment.dueDate) {
      return <Clock className="h-5 w-5 text-gray-600" />;
    }

    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    if (daysUntilDue === null) return <Clock className="h-5 w-5 text-gray-600" />;

    if (daysUntilDue < 0) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    } else if (daysUntilDue <= 3) {
      return <AlertCircle className="h-5 w-5 text-orange-600" />;
    } else {
      return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete assignment');
      await fetchAssignments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSaveAssignment = async (assignmentData: Partial<Project>) => {
    setIsSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/projects/${editingId}` : '/api/projects';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) throw new Error('Failed to save assignment');
      
      await fetchAssignments();
      setShowForm(false);
      setEditingId(null);
      setEditingAssignment(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAssignment = (assignment: Project) => {
    trackItem({
      id: assignment.id,
      type: 'project',
      title: assignment.name,
      subtitle: assignment.course || assignment.assignmentType || '',
      status: assignment.status,
      priority: assignment.priority,
    });
    
    setEditingId(assignment.id);
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleNewAssignment = () => {
    setEditingId(null);
    setEditingAssignment(null);
    setShowForm(true);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="content-container">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-muted">Loading assignments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      <div className="content-container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
              <GraduationCap className="h-8 w-8" />
              Academic Assignments
            </h1>
            <p className="text-lg text-muted">
              Track your coursework, deadlines, and academic progress
            </p>
          </div>
          <button
            onClick={handleNewAssignment}
            className="btn-primary flex items-center gap-2 mt-4 lg:mt-0"
          >
            <Plus className="h-5 w-5" />
            New Assignment
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Total</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Avg Grade</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.averageGrade ? `${stats.averageGrade}%` : 'N/A'}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Courses</p>
                <p className="text-2xl font-bold text-primary">{stats.coursesCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-primary mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search assignments, courses, instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-standard pl-10 w-full"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as AssignmentFilter)}
                className="input-standard w-full"
              >
                <option value="all">All Assignments</option>
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Course</label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-standard w-full"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course || ''}>{course}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as AssignmentSort)}
                className="input-standard w-full"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="course">Course</option>
                <option value="grade">Grade</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>

          {/* Type Filter (Secondary Row) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-primary mb-2">Assignment Type</label>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input-standard w-full md:w-64"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type || ''}>{type}</option>
              ))}
            </select>
          </div>

          {/* Active Filters Display */}
          {(filter !== 'all' || searchTerm || selectedCourse || selectedType) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-muted">Active filters:</span>
              {filter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  Status: {filter}
                  <button onClick={() => setFilter('all')} className="ml-1 hover:text-blue-900">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-green-900">×</button>
                </span>
              )}
              {selectedCourse && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                  Course: {selectedCourse}
                  <button onClick={() => setSelectedCourse('')} className="ml-1 hover:text-purple-900">×</button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                  Type: {selectedType}
                  <button onClick={() => setSelectedType('')} className="ml-1 hover:text-orange-900">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <GraduationCap className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">
              {assignments.length === 0 ? 'No assignments yet' : 'No assignments found'}
            </h3>
            <p className="text-muted mb-4">
              {assignments.length === 0 
                ? 'Create your first assignment to get started with academic tracking.'
                : 'Try adjusting your filters or search terms.'
              }
            </p>
            {assignments.length === 0 && (
              <button
                onClick={handleNewAssignment}
                className="btn-primary"
              >
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const daysUntilDue = getDaysUntilDue(assignment.dueDate);
              
              return (
                <div
                  key={assignment.id}
                  className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(assignment)}
                        <h3 className="text-xl font-semibold text-primary">
                          {assignment.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted">Course</p>
                          <p className="font-medium text-primary">{assignment.course || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted">Type</p>
                          <p className="font-medium text-primary">{assignment.assignmentType || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted">Due Date</p>
                          <p className="font-medium text-primary">{formatDate(assignment.dueDate)}</p>
                          {daysUntilDue !== null && (
                            <p className={`text-xs ${
                              daysUntilDue < 0 ? 'text-red-600' : 
                              daysUntilDue <= 3 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                               daysUntilDue === 0 ? 'Due today' :
                               `${daysUntilDue} days remaining`}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-muted">Progress</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${assignment.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-primary">
                              {assignment.progress || 0}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {assignment.description && (
                        <p className="text-sm text-muted mb-4">{assignment.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        {assignment.instructor && (
                          <span className="text-muted">
                            <strong>Instructor:</strong> {assignment.instructor}
                          </span>
                        )}
                        {assignment.grade !== null && assignment.maxGrade !== null && (
                          <span className="text-muted">
                            <strong>Grade:</strong> {assignment.grade}/{assignment.maxGrade} 
                            ({((assignment.grade / assignment.maxGrade) * 100).toFixed(1)}%)
                          </span>
                        )}
                        <span className="text-muted">
                          <strong>Status:</strong> {assignment.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 lg:mt-0">
                                            <button
                        onClick={() => handleEditAssignment(assignment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Edit assignment"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assignment Form Modal */}
        <AssignmentForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
            setEditingAssignment(null);
          }}
          onSave={handleSaveAssignment}
          assignment={editingAssignment}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
} 