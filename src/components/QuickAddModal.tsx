'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { X, Plus, FileText, CheckSquare, BookOpen, Dumbbell, Calendar, Tag, Clock, AlertCircle } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ItemType = 'project' | 'todo' | 'research' | 'workout';

interface FormData {
  type: ItemType;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  category: string;
  tags: string[];
  // Type-specific fields
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  workoutType?: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS';
  authors?: string;
  journal?: string;
  publicationYear?: number;
}

const itemTypes = [
  { key: 'project' as ItemType, label: 'Project', icon: FileText, color: 'bg-blue-500' },
  { key: 'todo' as ItemType, label: 'Todo', icon: CheckSquare, color: 'bg-green-500' },
  { key: 'research' as ItemType, label: 'Research', icon: BookOpen, color: 'bg-purple-500' },
  { key: 'workout' as ItemType, label: 'Workout', icon: Dumbbell, color: 'bg-orange-500' },
];

const priorities = [
  { key: 'LOW' as const, label: 'Low', color: 'text-gray-600' },
  { key: 'MEDIUM' as const, label: 'Medium', color: 'text-yellow-600' },
  { key: 'HIGH' as const, label: 'High', color: 'text-red-600' },
];

const workoutTypes = [
  { key: 'CARDIO' as const, label: 'Cardio' },
  { key: 'STRENGTH' as const, label: 'Strength' },
  { key: 'FLEXIBILITY' as const, label: 'Flexibility' },
  { key: 'SPORTS' as const, label: 'Sports' },
];

export default function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    type: 'project',
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    category: '',
    tags: [],
    status: 'NOT_STARTED',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: 'project',
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        category: '',
        tags: [],
        status: 'NOT_STARTED',
      });
      setError('');
      setTagInput('');
      // Focus the title input after a brief delay
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleTypeChange = (type: ItemType) => {
    setFormData(prev => ({
      ...prev,
      type,
      // Reset type-specific fields
      status: type === 'project' || type === 'todo' ? 'NOT_STARTED' : undefined,
      workoutType: type === 'workout' ? 'CARDIO' : undefined,
      authors: type === 'research' ? '' : undefined,
      journal: type === 'research' ? '' : undefined,
      publicationYear: type === 'research' ? new Date().getFullYear() : undefined,
    }));
  };

  const handleTagAdd = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleTagAdd(tagInput);
    } else if (event.key === 'Backspace' && tagInput === '' && formData.tags.length > 0) {
      handleTagRemove(formData.tags[formData.tags.length - 1]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user?.email) return;

    setIsLoading(true);
    setError('');

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        tags: formData.tags,
      };

      // Add due date if provided
      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString();
      }

      // Add type-specific fields
      if (formData.type === 'project' || formData.type === 'todo') {
        payload.status = formData.status;
      }

      if (formData.type === 'workout') {
        payload.workoutType = formData.workoutType;
      }

      if (formData.type === 'research') {
        payload.authors = formData.authors;
        payload.journal = formData.journal;
        payload.publicationYear = formData.publicationYear;
      }

      const response = await fetch(`/api/${formData.type === 'research' ? 'research' : formData.type + 's'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      // Success - close modal and potentially show success message
      onClose();
      
      // You could emit a custom event here to trigger a refresh of relevant components
      window.dispatchEvent(new CustomEvent('quickAddSuccess', { 
        detail: { type: formData.type, item: await response.json() }
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = itemTypes.find(t => t.key === formData.type)!;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg ${selectedType.color} flex items-center justify-center`}>
              <selectedType.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Add</h2>
              <p className="text-sm text-gray-500">Create a new {selectedType.label.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {itemTypes.map((type) => (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => handleTypeChange(type.key)}
                  data-item-type={type.key}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    formData.type === type.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <type.icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${selectedType.label.toLowerCase()} title...`}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Describe your ${selectedType.label.toLowerCase()}...`}
            />
          </div>

          {/* Priority and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.key} value={priority.key}>{priority.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {(formData.type === 'project' || formData.type === 'todo') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}

          {formData.type === 'workout' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workout Type</label>
              <select
                value={formData.workoutType}
                onChange={(e) => setFormData(prev => ({ ...prev, workoutType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {workoutTypes.map((type) => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
            </div>
          )}

          {formData.type === 'research' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-2">
                  Authors
                </label>
                <input
                  type="text"
                  id="authors"
                  value={formData.authors}
                  onChange={(e) => setFormData(prev => ({ ...prev, authors: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Author names..."
                />
              </div>
              <div>
                <label htmlFor="journal" className="block text-sm font-medium text-gray-700 mb-2">
                  Journal
                </label>
                <input
                  type="text"
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Journal name..."
                />
              </div>
            </div>
          )}

          {/* Category and Tags Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <div className="border border-gray-300 rounded-lg p-2 min-h-[42px] flex flex-wrap items-center gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={() => tagInput.trim() && handleTagAdd(tagInput)}
                  className="flex-1 min-w-[120px] outline-none text-sm"
                  placeholder={formData.tags.length === 0 ? "Add tags..." : ""}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Press Enter or comma to add tags</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> to cancel
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create {selectedType.label}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 