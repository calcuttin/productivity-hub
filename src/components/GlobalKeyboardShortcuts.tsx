'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import { useQuickAdd } from './QuickAddProvider';
import { useRecentItems } from '@/context/RecentItemsContext';

interface KeyboardShortcutsProps {
  onToggleHelp?: () => void;
}

export default function GlobalKeyboardShortcuts({ onToggleHelp }: KeyboardShortcutsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { openModal } = useQuickAdd();
  const { toggleSidebar } = useRecentItems();
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get the active element to check if we're in an input
      const activeElement = document.activeElement as HTMLElement;
      const isInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true'
      );

      // Skip if user is not authenticated for protected shortcuts
      if (!session && needsAuth(event)) {
        return;
      }

      // Handle shortcuts that work even in inputs
      if (handleInputCompatibleShortcuts(event)) {
        return;
      }

      // Skip other shortcuts if we're in an input field
      if (isInInput) {
        return;
      }

      // Handle global shortcuts
      if (handleGlobalShortcuts(event)) {
        return;
      }

      // Handle navigation sequences (G + key)
      if (handleNavigationSequences(event)) {
        return;
      }

      // Handle quick action sequences (N + key)
      if (handleQuickActionSequences(event)) {
        return;
      }

      // Handle view sequences (V + key)
      if (handleViewSequences(event)) {
        return;
      }

      // Handle list navigation
      if (handleListNavigation(event)) {
        return;
      }
    };

    // Input-compatible shortcuts (work even when in input fields)
    const handleInputCompatibleShortcuts = (event: KeyboardEvent): boolean => {
      // Ctrl+K / Cmd+K for Quick Add
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        event.stopPropagation();
        openModal();
        return true;
      }

      // Escape to close modals/inputs
      if (event.key === 'Escape') {
        // Find and close any open modals
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        if (modals.length > 0) {
          // Click the close button or trigger escape on the modal
          const lastModal = modals[modals.length - 1];
          const closeButton = lastModal.querySelector('[aria-label="Close"], .close-button, [data-close="modal"]');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
          return true;
        }
        
        // Blur active input
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          activeElement.blur();
          return true;
        }
      }

      // Ctrl+/ to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"], input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return true;
      }

      return false;
    };

    // Global shortcuts
    const handleGlobalShortcuts = (event: KeyboardEvent): boolean => {
      // ? for help
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        onToggleHelp?.();
        return true;
      }

      // Ctrl+T for theme toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        return true;
      }

      // Ctrl+R for recent items sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        toggleSidebar();
        return true;
      }

      // Ctrl+Enter for form submission
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const form = document.querySelector('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"], input[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            event.preventDefault();
            submitButton.click();
            return true;
          }
        }
      }

      return false;
    };

    // Navigation sequences (G + key)
    const handleNavigationSequences = (event: KeyboardEvent): boolean => {
      const now = Date.now();
      const isSequenceStart = event.key.toLowerCase() === 'g' && !event.ctrlKey && !event.metaKey;
      const isSequenceContinue = lastKeyRef.current === 'g' && (now - lastKeyTimeRef.current) < 1000;

      if (isSequenceStart) {
        event.preventDefault();
        lastKeyRef.current = 'g';
        lastKeyTimeRef.current = now;
        
        // Clear any existing timeout
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }
        
        // Set timeout to clear sequence
        sequenceTimeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        
        return true;
      }

      if (isSequenceContinue) {
        event.preventDefault();
        lastKeyRef.current = null;
        
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }

        switch (event.key.toLowerCase()) {
          case 'h':
            router.push('/');
            return true;
          case 'p':
            router.push('/projects');
            return true;
          case 't':
            router.push('/todos');
            return true;
          case 'r':
            router.push('/research');
            return true;
          case 'w':
            router.push('/workout');
            return true;
          case 'c':
            router.push('/calendar');
            return true;
          case 's':
            router.push('/search');
            return true;
          case 'o':
            router.push('/profile');
            return true;
        }
      }

      return false;
    };

    // Quick action sequences (N + key)
    const handleQuickActionSequences = (event: KeyboardEvent): boolean => {
      const now = Date.now();
      const isSequenceStart = event.key.toLowerCase() === 'n' && !event.ctrlKey && !event.metaKey;
      const isSequenceContinue = lastKeyRef.current === 'n' && (now - lastKeyTimeRef.current) < 1000;

      if (isSequenceStart) {
        event.preventDefault();
        lastKeyRef.current = 'n';
        lastKeyTimeRef.current = now;
        
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }
        
        sequenceTimeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        
        return true;
      }

      if (isSequenceContinue) {
        event.preventDefault();
        lastKeyRef.current = null;
        
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }

        // Open quick add modal with specific type pre-selected
        openModal();
        
        // Use a small delay to ensure modal is open before setting type
        setTimeout(() => {
          const typeButtons = document.querySelectorAll('[data-item-type]');
          let targetType = '';
          
          switch (event.key.toLowerCase()) {
            case 'p':
              targetType = 'project';
              break;
            case 't':
              targetType = 'todo';
              break;
            case 'r':
              targetType = 'research';
              break;
            case 'w':
              targetType = 'workout';
              break;
          }
          
          if (targetType) {
            const targetButton = document.querySelector(`[data-item-type="${targetType}"]`) as HTMLButtonElement;
            if (targetButton) {
              targetButton.click();
            }
          }
        }, 100);
        
        return true;
      }

      return false;
    };

    // View sequences (V + key) - for pages that support different views
    const handleViewSequences = (event: KeyboardEvent): boolean => {
      const now = Date.now();
      const isSequenceStart = event.key.toLowerCase() === 'v' && !event.ctrlKey && !event.metaKey;
      const isSequenceContinue = lastKeyRef.current === 'v' && (now - lastKeyTimeRef.current) < 1000;

      if (isSequenceStart) {
        event.preventDefault();
        lastKeyRef.current = 'v';
        lastKeyTimeRef.current = now;
        
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }
        
        sequenceTimeoutRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        
        return true;
      }

      if (isSequenceContinue) {
        event.preventDefault();
        lastKeyRef.current = null;
        
        if (sequenceTimeoutRef.current) {
          clearTimeout(sequenceTimeoutRef.current);
        }

        // Look for view toggle buttons
        let targetButton: HTMLButtonElement | null = null;
        
        switch (event.key.toLowerCase()) {
          case 'l':
            targetButton = document.querySelector('[data-view="list"], [aria-label*="List view"]') as HTMLButtonElement;
            break;
          case 'g':
            targetButton = document.querySelector('[data-view="grid"], [aria-label*="Grid view"]') as HTMLButtonElement;
            break;
          case 'c':
            targetButton = document.querySelector('[data-view="calendar"], [aria-label*="Calendar view"]') as HTMLButtonElement;
            break;
        }
        
        if (targetButton) {
          targetButton.click();
        }
        
        return true;
      }

      return false;
    };

    // List navigation (J/K for next/previous, Space for select, Enter for open, Delete for delete)
    const handleListNavigation = (event: KeyboardEvent): boolean => {
      // Find if we're in a list context
      const listContainer = document.querySelector('[data-list="true"], table tbody, .list-container');
      if (!listContainer) return false;

      const items = listContainer.querySelectorAll('[data-list-item="true"], tr:not(.header), .list-item');
      if (items.length === 0) return false;

      // Find current focused item or first item
      let currentIndex = -1;
      const focusedItem = document.querySelector('[data-list-focused="true"], .focused, .selected');
      
      if (focusedItem) {
        currentIndex = Array.from(items).indexOf(focusedItem as Element);
      }

      switch (event.key.toLowerCase()) {
        case 'j':
          event.preventDefault();
          // Move to next item
          const nextIndex = Math.min(currentIndex + 1, items.length - 1);
          if (nextIndex !== currentIndex) {
            updateListFocus(items, currentIndex, nextIndex);
          }
          return true;

        case 'k':
          event.preventDefault();
          // Move to previous item
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (prevIndex !== currentIndex || currentIndex === -1) {
            updateListFocus(items, currentIndex, prevIndex);
          }
          return true;

        case ' ':
          event.preventDefault();
          // Toggle selection
          if (currentIndex >= 0) {
            const item = items[currentIndex] as HTMLElement;
            const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
            if (checkbox) {
              checkbox.click();
            }
          }
          return true;

        case 'enter':
          event.preventDefault();
          // Open/edit item
          if (currentIndex >= 0) {
            const item = items[currentIndex] as HTMLElement;
            const link = item.querySelector('a') || item;
            if (link instanceof HTMLElement) {
              link.click();
            }
          }
          return true;

        case 'delete':
          event.preventDefault();
          // Delete item (with confirmation)
          if (currentIndex >= 0) {
            const item = items[currentIndex] as HTMLElement;
            const deleteButton = item.querySelector('[data-action="delete"], .delete-button, [aria-label*="Delete"]') as HTMLButtonElement;
            if (deleteButton) {
              deleteButton.click();
            }
          }
          return true;
      }

      return false;
    };

    // Update list focus
    const updateListFocus = (items: NodeListOf<Element>, oldIndex: number, newIndex: number) => {
      // Remove focus from old item
      if (oldIndex >= 0) {
        const oldItem = items[oldIndex] as HTMLElement;
        oldItem.setAttribute('data-list-focused', 'false');
        oldItem.classList.remove('focused', 'selected');
      }

      // Add focus to new item
      if (newIndex >= 0 && newIndex < items.length) {
        const newItem = items[newIndex] as HTMLElement;
        newItem.setAttribute('data-list-focused', 'true');
        newItem.classList.add('focused');
        newItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    // Check if shortcut needs authentication
    const needsAuth = (event: KeyboardEvent): boolean => {
      // Navigation shortcuts need auth
      if (event.key.toLowerCase() === 'g' || lastKeyRef.current === 'g') return true;
      if (event.key.toLowerCase() === 'n' || lastKeyRef.current === 'n') return true;
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') return true;
      return false;
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current);
      }
    };
  }, [router, session, theme, setTheme, openModal, onToggleHelp]);

  // This component doesn't render anything
  return null;
} 