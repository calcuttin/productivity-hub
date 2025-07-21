'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryOptions<T> {
  enabled?: boolean;
  staleTime?: number; // Time in ms before data is considered stale
  cacheTime?: number; // Time in ms to keep data in cache
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

// Global cache for query results
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  promise?: Promise<any>;
}>();

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function useOptimizedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Check if cached data is stale
  const checkStale = useCallback(() => {
    const cached = queryCache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      setIsStale(age > staleTime);
    }
  }, [key, staleTime]);

  // Fetch data with retry logic
  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);
    retryCountRef.current = 0;

    const attemptFetch = async (attempt: number): Promise<T> => {
      try {
        if (signal?.aborted) {
          throw new Error('Request aborted');
        }

        const result = await fetcher();
        
        // Cache the result
        queryCache.set(key, {
          data: result,
          timestamp: Date.now()
        });

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        
        if (attempt < retry && !signal?.aborted) {
          retryCountRef.current = attempt + 1;
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return attemptFetch(attempt + 1);
        }
        
        throw error;
      }
    };

    try {
      const result = await attemptFetch(0);
      setData(result);
      setIsStale(false);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, retry, retryDelay, onSuccess, onError]);

  // Debounced refetch
  const debouncedRefetch = useCallback(
    debounce(() => fetchData(), 300),
    [fetchData]
  );

  // Refetch function
  const refetch = useCallback(async () => {
    // Clear cache for this key
    queryCache.delete(key);
    await fetchData();
  }, [key, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    // Check if we have cached data
    const cached = queryCache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      
      if (age < cacheTime) {
        setData(cached.data);
        setIsStale(age > staleTime);
        setIsLoading(false);
        
        // If data is stale, refetch in background
        if (age > staleTime) {
          debouncedRefetch();
        }
        return;
      } else {
        // Remove expired cache entry
        queryCache.delete(key);
      }
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [key, enabled, cacheTime, staleTime, fetchData, debouncedRefetch]);

  // Cleanup expired cache entries
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [cacheKey, entry] of queryCache.entries()) {
        if (now - entry.timestamp > cacheTime) {
          queryCache.delete(cacheKey);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cacheTime]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isStale
  };
}

// Hook for infinite queries (pagination)
export function useInfiniteQuery<T>(
  key: string,
  fetcher: (page: number) => Promise<T[]>,
  options: QueryOptions<T[]> & {
    pageSize?: number;
  } = {}
): {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isStale: boolean;
} {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const { pageSize = 20, ...queryOptions } = options;

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetcher(page);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }

      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore, fetcher, pageSize]);

  // Initial load
  useEffect(() => {
    if (queryOptions.enabled !== false) {
      loadMore();
    }
  }, [loadMore, queryOptions.enabled]);

  return {
    data,
    isLoading,
    error,
    loadMore,
    hasMore,
    isStale
  };
}

// Hook for optimistic updates
export function useOptimisticUpdate<T>(
  key: string,
  updater: (oldData: T) => T
): (immediate?: boolean) => void {
  return useCallback((immediate = false) => {
    const cached = queryCache.get(key);
    if (cached) {
      const updatedData = updater(cached.data);
      queryCache.set(key, {
        ...cached,
        data: updatedData
      });
    }
  }, [key, updater]);
} 