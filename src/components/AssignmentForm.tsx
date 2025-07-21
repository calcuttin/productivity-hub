"use client";
import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { X, Save, Calendar, GraduationCap, User, Hash } from 'lucide-react';

interface AssignmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignment: Partial<Project>) => Promise<void>;
  assignment?: Project | null;
  isLoading?: boolean;
}

const initialAssignment: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  status: 'Not Started',
  priority: 'Medium',
  dueDate: '',
  startDate: '',
  progress: 0,
  estimatedHours: null,
  actualHours: null,
  tags: [],
  assignmentType: '',
  course: '',
  instructor: '',
  grade: null,
  maxGrade: 100,
  notes: '',
  automationEnabled: false,
  lastAutomationRun: null
};

export default function AssignmentForm({
  isOpen,
  onClose,
  onSave,
  assignment,
  isLoading = false
}: AssignmentFormProps) {
  const [formData, setFormData] = useState(initialAssignment);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assignment) {
      setFormData({
        name: assignment.name,
        description: assignment.description || '',
        status: assignment.status,
        priority: assignment.priority,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
        startDate: assignment.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : '',
        progress: assignment.progress || 0,
        estimatedHours: assignment.estimatedHours,
        actualHours: assignment.actualHours,
        tags: assignment.tags || [],
        assignmentType: assignment.assignmentType || '',
        course: assignment.course || '',
        instructor: assignment.instructor || '',
        grade: assignment.grade,
        maxGrade: assignment.maxGrade || 100,
        notes: assignment.notes || '',
        automationEnabled: assignment.automationEnabled || false,
        lastAutomationRun: assignment.lastAutomationRun
      });
    } else {
      setFormData(initialAssignment);
    }
    setErrors({});
  }, [assignment, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : null) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Assignment name is required';
    }

    if ((!formData.course || !formData.course.trim()) && (!formData.assignmentType || !formData.assignmentType.trim())) {
      newErrors.course = 'Either course or assignment type is required';
      newErrors.assignmentType = 'Either course or assignment type is required';
    }

    if (formData.dueDate && formData.startDate) {
      const dueDate = new Date(formData.dueDate);
      const startDate = new Date(formData.startDate);
      if (dueDate < startDate) {
        newErrors.dueDate = 'Due date cannot be before start date';
      }
    }

    if (formData.grade !== null && formData.maxGrade !== null && formData.grade > formData.maxGrade) {
      newErrors.grade = 'Grade cannot be higher than maximum grade';
    }

    if (formData.progress < 0 || formData.progress > 100) {
      newErrors.progress = 'Progress must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            {assignment ? 'Edit Assignment' : 'Create New Assignment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignment Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-standard w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Machine Learning Research Paper"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                                     value={formData.description || ''}
                   onChange={handleChange}
                   rows={3}
                   className="input-standard w-full"
                   placeholder="Brief description of the assignment..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Status
                 </label>
                 <select
                   name="status"
                   value={formData.status}
                   onChange={handleChange}
                   className="input-standard w-full"
                 >
                   <option value="Not Started">Not Started</option>
                   <option value="In Progress">In Progress</option>
                   <option value="Completed">Completed</option>
                   <option value="On Hold">On Hold</option>
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Priority
                 </label>
                 <select
                   name="priority"
                   value={formData.priority}
                   onChange={handleChange}
                   className="input-standard w-full"
                 >
                   <option value="Low">Low</option>
                   <option value="Medium">Medium</option>
                   <option value="High">High</option>
                   <option value="Urgent">Urgent</option>
                 </select>
               </div>
             </div>
           </div>

           {/* Academic Details */}
           <div className="space-y-4">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
               <GraduationCap className="h-5 w-5" />
               Academic Details
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Course *
                 </label>
                 <input
                   type="text"
                   name="course"
                   value={formData.course || ''}
                   onChange={handleChange}
                   className={`input-standard w-full ${errors.course ? 'border-red-500' : ''}`}
                   placeholder="e.g., Computer Science 101"
                 />
                 {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course}</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Assignment Type *
                 </label>
                 <select
                   name="assignmentType"
                   value={formData.assignmentType || ''}
                   onChange={handleChange}
                   className={`input-standard w-full ${errors.assignmentType ? 'border-red-500' : ''}`}
                 >
                   <option value="">Select type...</option>
                   <option value="Homework">📝 Homework</option>
                   <option value="Project">🛠️ Project</option>
                   <option value="Research">🔬 Research</option>
                   <option value="Essay">📄 Essay</option>
                   <option value="Exam">📊 Exam</option>
                   <option value="Lab">🧪 Lab</option>
                   <option value="Presentation">🎤 Presentation</option>
                   <option value="Quiz">❓ Quiz</option>
                   <option value="Discussion">💬 Discussion</option>
                   <option value="Other">❓ Other</option>
                 </select>
                 {errors.assignmentType && <p className="text-red-500 text-sm mt-1">{errors.assignmentType}</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Instructor
                 </label>
                 <input
                   type="text"
                   name="instructor"
                   value={formData.instructor || ''}
                   onChange={handleChange}
                   className="input-standard w-full"
                   placeholder="e.g., Dr. Smith"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Progress (%)
                 </label>
                 <input
                   type="number"
                   name="progress"
                   value={formData.progress}
                   onChange={handleChange}
                   min="0"
                   max="100"
                   className={`input-standard w-full ${errors.progress ? 'border-red-500' : ''}`}
                 />
                 {errors.progress && <p className="text-red-500 text-sm mt-1">{errors.progress}</p>}
               </div>
             </div>
           </div>

           {/* Dates and Time */}
           <div className="space-y-4">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
               <Calendar className="h-5 w-5" />
               Dates & Time
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Start Date
                 </label>
                 <input
                   type="date"
                   name="startDate"
                   value={formData.startDate || ''}
                   onChange={handleChange}
                   className="input-standard w-full"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Due Date
                 </label>
                 <input
                   type="date"
                   name="dueDate"
                   value={formData.dueDate || ''}
                   onChange={handleChange}
                   className={`input-standard w-full ${errors.dueDate ? 'border-red-500' : ''}`}
                 />
                 {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Estimated Hours
                 </label>
                 <input
                   type="number"
                   name="estimatedHours"
                   value={formData.estimatedHours || ''}
                   onChange={handleChange}
                   min="0"
                   step="0.5"
                   className="input-standard w-full"
                   placeholder="5.0"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Actual Hours
                 </label>
                 <input
                   type="number"
                   name="actualHours"
                   value={formData.actualHours || ''}
                   onChange={handleChange}
                   min="0"
                   step="0.5"
                   className="input-standard w-full"
                   placeholder="4.5"
                 />
               </div>
             </div>
           </div>

           {/* Grading */}
           <div className="space-y-4">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
               <Hash className="h-5 w-5" />
               Grading
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Received Grade
                 </label>
                 <input
                   type="number"
                   name="grade"
                   value={formData.grade || ''}
                   onChange={handleChange}
                   min="0"
                   className={`input-standard w-full ${errors.grade ? 'border-red-500' : ''}`}
                   placeholder="95"
                 />
                 {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                   Maximum Grade
                 </label>
                 <input
                   type="number"
                   name="maxGrade"
                   value={formData.maxGrade || ''}
                   onChange={handleChange}
                   min="0"
                   className="input-standard w-full"
                   placeholder="100"
                 />
               </div>
             </div>
           </div>

           {/* Additional Information */}
           <div className="space-y-4">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h3>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Tags
               </label>
               <input
                 type="text"
                 value={formData.tags.join(', ')}
                 onChange={handleTagsChange}
                 className="input-standard w-full"
                 placeholder="machine-learning, research, python (comma-separated)"
               />
               <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Notes
               </label>
               <textarea
                 name="notes"
                 value={formData.notes || ''}
                 onChange={handleChange}
                 rows={4}
                 className="input-standard w-full"
                 placeholder="Additional notes, requirements, or comments..."
               />
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {assignment ? 'Update Assignment' : 'Create Assignment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 