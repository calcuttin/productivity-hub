'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText, CheckSquare, Activity, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchSuggestion {
  text: string;
  type: 'recent' | 'suggestion';
}

interface GlobalSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export default function GlobalSearchBar({ 
  placeholder = "Search projects, todos, research, workouts...", 
  onSearch,
  className = '' 
}: GlobalSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?action=suggestions&q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Save search to recent searches
  const saveToRecentSearches = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    saveToRecentSearches(trimmed);
    setIsOpen(false);
    setQuery('');
    
    if (onSearch) {
      onSearch(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalSuggestions = recentSearches.length + suggestions.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalSuggestions - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const allSuggestions = [...recentSearches, ...suggestions];
          handleSearch(allSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  const getTypeIcon = (text: string) => {
    // Simple heuristics to guess content type
    if (text.toLowerCase().includes('project')) return <FileText className="h-4 w-4" />;
    if (text.toLowerCase().includes('todo') || text.toLowerCase().includes('task')) return <CheckSquare className="h-4 w-4" />;
    if (text.toLowerCase().includes('workout') || text.toLowerCase().includes('exercise')) return <Activity className="h-4 w-4" />;
    if (text.toLowerCase().includes('research') || text.toLowerCase().includes('paper')) return <BookOpen className="h-4 w-4" />;
    return <Search className="h-4 w-4" />;
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setSelectedIndex(-1);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                <div className="flex items-center text-xs font-medium text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, index) => (
                <div
                  key={`recent-${index}`}
                                     ref={el => { suggestionRefs.current[index] = el; }}
                  onClick={() => handleSearch(recent)}
                  className={`px-4 py-2 cursor-pointer flex items-center space-x-3 ${
                    selectedIndex === index 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 text-sm">{recent}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              {recentSearches.length > 0 && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-600">Suggestions</span>
                </div>
              )}
              {suggestions.map((suggestion, index) => {
                const adjustedIndex = recentSearches.length + index;
                return (
                  <div
                    key={`suggestion-${index}`}
                                         ref={el => { suggestionRefs.current[adjustedIndex] = el; }}
                    onClick={() => handleSearch(suggestion)}
                    className={`px-4 py-2 cursor-pointer flex items-center space-x-3 ${
                      selectedIndex === adjustedIndex 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {getTypeIcon(suggestion)}
                    <span className="flex-1 text-sm">{suggestion}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Loading State */}
          {isLoading && suggestions.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
              Searching...
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.length >= 2 && suggestions.length === 0 && recentSearches.length === 0 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              No suggestions found
            </div>
          )}

          {/* Show Recent Searches When No Query */}
          {!query && recentSearches.length === 0 && (
            <div className="px-4 py-3 text-center text-sm text-gray-500">
              Start typing to search across all your content
            </div>
          )}

          {/* Quick Actions */}
          {query.trim() && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
              <button
                onClick={() => handleSearch()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Search for "{query.trim()}" →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 