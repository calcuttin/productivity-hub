'use client';

import { useRecentItems, RecentItem } from '@/context/RecentItemsContext';
import Link from 'next/link';
import { X, Clock, FileText, CheckSquare, BookOpen, Dumbbell, Trash2, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

const typeIcons = {
  project: FileText,
  todo: CheckSquare,
  research: BookOpen,
  workout: Dumbbell,
};

const typeColors = {
  project: 'text-blue-600 bg-blue-100',
  todo: 'text-green-600 bg-green-100',
  research: 'text-purple-600 bg-purple-100',
  workout: 'text-orange-600 bg-orange-100',
};

const typeColorsDark = {
  project: 'dark:text-blue-400 dark:bg-blue-900/30',
  todo: 'dark:text-green-400 dark:bg-green-900/30',
  research: 'dark:text-purple-400 dark:bg-purple-900/30',
  workout: 'dark:text-orange-400 dark:bg-orange-900/30',
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function getPriorityColor(priority?: string): string {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'in progress':
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'not started':
    case 'not_started':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'on hold':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

interface RecentItemCardProps {
  item: RecentItem;
  onRemove: (id: string, type: string) => void;
}

function RecentItemCard({ item, onRemove }: RecentItemCardProps) {
  const Icon = typeIcons[item.type];
  const typeColorClasses = `${typeColors[item.type]} ${typeColorsDark[item.type]}`;

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600">
      <Link href={item.url} className="block">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${typeColorClasses}`}>
            <Icon className="w-4 h-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.title}
              </h4>
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {item.subtitle && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                {item.subtitle}
              </p>
            )}

            {/* Status and Priority Tags */}
            <div className="flex items-center gap-2 mt-2">
              {item.status && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              )}
              {item.priority && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </span>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{getRelativeTime(item.lastAccessed)}</span>
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
                {item.type}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item.id, item.type);
        }}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Remove from recent items"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function RecentItemsSidebar() {
  const { items, isOpen, closeSidebar, removeRecentItem, clearAllItems } = useRecentItems();

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeSidebar]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Items
            </h2>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearAllItems}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Clear all recent items"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={closeSidebar}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Recent Items
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                  Start viewing projects, todos, research papers, or workouts to see them here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <RecentItemCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onRemove={removeRecentItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Showing {items.length} recent item{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 