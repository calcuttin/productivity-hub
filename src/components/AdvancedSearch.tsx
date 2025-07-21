'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  X, 
  Calendar, 
  Tag, 
  Clock, 
  TrendingUp,
  BookOpen,
  CheckSquare,
  Target,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { SearchFilters, SearchResult } from '@/lib/search';

interface AdvancedSearchProps {
  onSearch?: (results: SearchResult[]) => void;
  onFiltersChange?: (filters: SearchFilters) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function AdvancedSearch({ 
  onSearch, 
  onFiltersChange, 
  className = '',
  placeholder = 'Search projects, todos, workouts, research...',
  autoFocus = false
}: AdvancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    types: searchParams.get('types')?.split(',') as any || ['project', 'todo', 'research', 'workout'],
    status: searchParams.get('status')?.split(',') || [],
    priority: searchParams.get('priority')?.split(',') || [],
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?action=suggestions&q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  // Handle query changes
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for suggestions
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(newQuery);
    }, 300);
  };

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(searchFilters.types?.length && { types: searchFilters.types.join(',') }),
        ...(searchFilters.status?.length && { status: searchFilters.status.join(',') }),
        ...(searchFilters.priority?.length && { priority: searchFilters.priority.join(',') }),
        ...(searchFilters.sortBy && { sortBy: searchFilters.sortBy }),
        ...(searchFilters.sortOrder && { sortOrder: searchFilters.sortOrder })
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        onSearch?.(data.results);
        
        // Update URL
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router, onSearch]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    performSearch(query, filters);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion, filters);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    
    if (query.trim()) {
      performSearch(query, newFilters);
    }
  };

  // Toggle filter type
  const toggleFilterType = (type: string) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type as any)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type as any];
    
    handleFilterChange('types', newTypes);
  };

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      types: ['project', 'todo', 'research', 'workout'],
      sortBy: 'relevance',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
    
    if (query.trim()) {
      performSearch(query, defaultFilters);
    }
  };

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = filters.status?.length || filters.priority?.length || 
                          filters.types?.length !== 4 || filters.sortBy !== 'relevance';

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded transition-colors ${
                hasActiveFilters 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            {/* Content Types */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Content Types
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'project', label: 'Projects', icon: BookOpen },
                  { key: 'todo', label: 'Todos', icon: CheckSquare },
                  { key: 'workout', label: 'Workouts', icon: Target },
                  { key: 'research', label: 'Research', icon: FileText }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => toggleFilterType(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.types?.includes(key as any)
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Status
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Not Started', 'In Progress', 'Completed', 'On Hold'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      const currentStatuses = filters.status || [];
                      const newStatuses = currentStatuses.includes(status)
                        ? currentStatuses.filter(s => s !== status)
                        : [...currentStatuses, status];
                      handleFilterChange('status', newStatuses);
                    }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      filters.status?.includes(status)
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Priority
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'High', color: 'red' },
                  { key: 'Medium', color: 'yellow' },
                  { key: 'Low', color: 'green' }
                ].map(({ key, color }) => (
                  <button
                    key={key}
                    onClick={() => {
                      const currentPriorities = filters.priority || [];
                      const newPriorities = currentPriorities.includes(key)
                        ? currentPriorities.filter(p => p !== key)
                        : [...currentPriorities, key];
                      handleFilterChange('priority', newPriorities);
                    }}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      filters.priority?.includes(key)
                        ? `bg-${color}-100 dark:bg-${color}-900/20 text-${color}-700 dark:text-${color}-300`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Sort By
              </h4>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                </select>
                <button
                  onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {filters.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 