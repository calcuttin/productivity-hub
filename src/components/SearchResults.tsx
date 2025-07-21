'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  CheckSquare, 
  Target, 
  FileText, 
  Calendar, 
  Tag, 
  Clock,
  TrendingUp,
  Filter,
  X,
  ExternalLink,
  Star,
  AlertCircle,
  Search
} from 'lucide-react';
import { SearchResult, SearchFilters } from '@/lib/search';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  filters: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
  isLoading?: boolean;
  totalCount?: number;
  executionTime?: number;
}

export default function SearchResults({ 
  results, 
  query, 
  filters, 
  onFiltersChange,
  isLoading = false,
  totalCount = 0,
  executionTime = 0
}: SearchResultsProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  // Calculate facets from results
  const facets = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    results.forEach(result => {
      // Count types
      typeCounts[result.type] = (typeCounts[result.type] || 0) + 1;
      
      // Count statuses
      if (result.status) {
        statusCounts[result.status] = (statusCounts[result.status] || 0) + 1;
      }
      
      // Count priorities
      if (result.priority) {
        priorityCounts[result.priority] = (priorityCounts[result.priority] || 0) + 1;
      }
    });

    return { typeCounts, statusCounts, priorityCounts };
  }, [results]);

  // Filter results based on selected facets
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(result.type)) {
        return false;
      }
      if (selectedStatuses.length > 0 && result.status && !selectedStatuses.includes(result.status)) {
        return false;
      }
      if (selectedPriorities.length > 0 && result.priority && !selectedPriorities.includes(result.priority)) {
        return false;
      }
      return true;
    });
  }, [results, selectedTypes, selectedStatuses, selectedPriorities]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <BookOpen className="w-4 h-4" />;
      case 'todo': return <CheckSquare className="w-4 h-4" />;
      case 'workout': return <Target className="w-4 h-4" />;
      case 'research': return <FileText className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'todo': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'workout': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'research': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'Completed': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'On Hold': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Not Started': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const toggleFacet = (facetType: 'type' | 'status' | 'priority', value: string) => {
    switch (facetType) {
      case 'type':
        setSelectedTypes(prev => 
          prev.includes(value) 
            ? prev.filter(t => t !== value)
            : [...prev, value]
        );
        break;
      case 'status':
        setSelectedStatuses(prev => 
          prev.includes(value) 
            ? prev.filter(s => s !== value)
            : [...prev, value]
        );
        break;
      case 'priority':
        setSelectedPriorities(prev => 
          prev.includes(value) 
            ? prev.filter(p => p !== value)
            : [...prev, value]
        );
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedStatuses.length > 0 || selectedPriorities.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start searching
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a query to search across your projects, todos, workouts, and research papers.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No items match your search for "{query}"
        </p>
        <button
          onClick={clearAllFilters}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Search Results
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredResults.length} of {totalCount} results for "{query}"
            {executionTime > 0 && ` • ${executionTime}ms`}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Facets Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-6">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>

            {/* Content Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Content Types</h4>
              <div className="space-y-2">
                {Object.entries(facets.typeCounts).map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => toggleFacet('type', type)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Statuses */}
            {Object.keys(facets.statusCounts).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status</h4>
                <div className="space-y-2">
                  {Object.entries(facets.statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => toggleFacet('status', status)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedStatuses.includes(status)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{status}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Priorities */}
            {Object.keys(facets.priorityCounts).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Priority</h4>
                <div className="space-y-2">
                  {Object.entries(facets.priorityCounts).map(([priority, count]) => (
                    <button
                      key={priority}
                      onClick={() => toggleFacet('priority', priority)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedPriorities.includes(priority)
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{priority}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <Link
                key={result.id}
                href={result.url}
                className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                        <span className="capitalize">{result.type}</span>
                      </span>
                      {result.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(result.priority)}`}>
                          {result.priority}
                        </span>
                      )}
                      {result.status && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {result.title}
                    </h3>
                    
                    {result.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(result.createdAt).toLocaleDateString()}
                      </span>
                      {result.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due {new Date(result.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {result.matchReason && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          {result.matchReason}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 