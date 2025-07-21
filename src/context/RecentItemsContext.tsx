'use client';

import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';

export interface RecentItem {
  id: string;
  type: 'project' | 'todo' | 'research' | 'workout';
  title: string;
  subtitle?: string;
  lastAccessed: Date;
  url: string;
  status?: string;
  priority?: string;
}

interface RecentItemsState {
  items: RecentItem[];
  isOpen: boolean;
}

type RecentItemsAction =
  | { type: 'ADD_ITEM'; payload: Omit<RecentItem, 'lastAccessed'> }
  | { type: 'REMOVE_ITEM'; payload: { id: string; type: string } }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_SIDEBAR' }
  | { type: 'CLOSE_SIDEBAR' }
  | { type: 'LOAD_FROM_STORAGE'; payload: RecentItem[] };

interface RecentItemsContextType {
  items: RecentItem[];
  isOpen: boolean;
  addRecentItem: (item: Omit<RecentItem, 'lastAccessed'>) => void;
  removeRecentItem: (id: string, type: string) => void;
  clearAllItems: () => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const RecentItemsContext = createContext<RecentItemsContextType | undefined>(undefined);

const STORAGE_KEY = 'recentItems';
const MAX_RECENT_ITEMS = 15;

function recentItemsReducer(state: RecentItemsState, action: RecentItemsAction): RecentItemsState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: RecentItem = {
        ...action.payload,
        lastAccessed: new Date(),
      };

      // Remove existing item if it exists (to update position)
      const filteredItems = state.items.filter(
        item => !(item.id === newItem.id && item.type === newItem.type)
      );

      // Add to front and limit to MAX_RECENT_ITEMS
      const newItems = [newItem, ...filteredItems].slice(0, MAX_RECENT_ITEMS);

      return {
        ...state,
        items: newItems,
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(
          item => !(item.id === action.payload.id && item.type === action.payload.type)
        ),
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        items: [],
      };
    }

    case 'TOGGLE_SIDEBAR': {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    }

    case 'OPEN_SIDEBAR': {
      return {
        ...state,
        isOpen: true,
      };
    }

    case 'CLOSE_SIDEBAR': {
      return {
        ...state,
        isOpen: false,
      };
    }

    case 'LOAD_FROM_STORAGE': {
      return {
        ...state,
        items: action.payload,
      };
    }

    default:
      return state;
  }
}

const initialState: RecentItemsState = {
  items: [],
  isOpen: false,
};

export function RecentItemsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(recentItemsReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert lastAccessed strings back to Date objects
        const itemsWithDates = parsed.map((item: any) => ({
          ...item,
          lastAccessed: new Date(item.lastAccessed),
        }));
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: itemsWithDates });
      }
    } catch (error) {
      console.error('Failed to load recent items from storage:', error);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (error) {
      console.error('Failed to save recent items to storage:', error);
    }
  }, [state.items]);

  const addRecentItem = (item: Omit<RecentItem, 'lastAccessed'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeRecentItem = (id: string, type: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, type } });
  };

  const clearAllItems = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const openSidebar = () => {
    dispatch({ type: 'OPEN_SIDEBAR' });
  };

  const closeSidebar = () => {
    dispatch({ type: 'CLOSE_SIDEBAR' });
  };

  const contextValue: RecentItemsContextType = {
    items: state.items,
    isOpen: state.isOpen,
    addRecentItem,
    removeRecentItem,
    clearAllItems,
    toggleSidebar,
    openSidebar,
    closeSidebar,
  };

  return (
    <RecentItemsContext.Provider value={contextValue}>
      {children}
    </RecentItemsContext.Provider>
  );
}

export function useRecentItems() {
  const context = useContext(RecentItemsContext);
  if (context === undefined) {
    throw new Error('useRecentItems must be used within a RecentItemsProvider');
  }
  return context;
}

// Utility function to create recent item objects
export function createRecentItem(
  id: string,
  type: 'project' | 'todo' | 'research' | 'workout',
  title: string,
  options?: {
    subtitle?: string;
    status?: string;
    priority?: string;
    customUrl?: string;
  }
): Omit<RecentItem, 'lastAccessed'> {
  const baseUrls = {
    project: '/projects',
    todo: '/todos',
    research: `/research/${id}`,
    workout: '/workout',
  };

  return {
    id,
    type,
    title,
    subtitle: options?.subtitle,
    status: options?.status,
    priority: options?.priority,
    url: options?.customUrl || baseUrls[type],
  };
} 