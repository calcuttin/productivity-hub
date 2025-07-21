'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AdvancedSearch from '@/components/AdvancedSearch';
import SearchResults from '@/components/SearchResults';
import { SearchResult, SearchFilters } from '@/lib/search';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [executionTime, setExecutionTime] = useState(0);

  // Initialize query from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  const handleSearch = (searchResults: SearchResult[]) => {
    setResults(searchResults);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Global Search
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Search across all your projects, todos, research papers, and workouts
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <AdvancedSearch 
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            className="w-full"
            autoFocus={true}
          />
        </div>
      </div>

      {/* Search Results */}
      <SearchResults 
        results={results}
        query={query}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        totalCount={totalCount}
        executionTime={executionTime}
      />

      {/* Search Tips */}
      {!query && (
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Search Tips
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">What you can search:</h4>
              <ul className="space-y-1">
                <li>• Project titles and descriptions</li>
                <li>• Todo items and categories</li>
                <li>• Research paper titles, authors, and abstracts</li>
                <li>• Workout names, types, and notes</li>
                <li>• Tags and keywords</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Search features:</h4>
              <ul className="space-y-1">
                <li>• Real-time search suggestions</li>
                <li>• Filter by content type and priority</li>
                <li>• Sort by relevance, date, or priority</li>
                <li>• Advanced filtering options</li>
                <li>• Smart relevance scoring</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Pro tip:</strong> Use specific keywords for better results. The search looks through titles, descriptions, and content to find the most relevant matches.
            </p>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      {!query && (
        <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Searches
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setQuery('project')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <div className="text-blue-500 mb-2">📁</div>
              <div className="font-medium text-gray-900 dark:text-white">Projects</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">All projects</div>
            </button>
            
            <button
              onClick={() => setQuery('todo')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <div className="text-green-500 mb-2">✓</div>
              <div className="font-medium text-gray-900 dark:text-white">Todos</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Task items</div>
            </button>
            
            <button
              onClick={() => setQuery('research')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <div className="text-purple-500 mb-2">📚</div>
              <div className="font-medium text-gray-900 dark:text-white">Research</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Papers & studies</div>
            </button>
            
            <button
              onClick={() => setQuery('workout')}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
            >
              <div className="text-red-500 mb-2">💪</div>
              <div className="font-medium text-gray-900 dark:text-white">Workouts</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Exercise plans</div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 