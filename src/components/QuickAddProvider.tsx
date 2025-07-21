'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import QuickAddModal from './QuickAddModal';

interface QuickAddContextType {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
}

const QuickAddContext = createContext<QuickAddContextType | undefined>(undefined);

export const useQuickAdd = () => {
  const context = useContext(QuickAddContext);
  if (context === undefined) {
    throw new Error('useQuickAdd must be used within a QuickAddProvider');
  }
  return context;
};

interface QuickAddProviderProps {
  children: ReactNode;
}

export default function QuickAddProvider({ children }: QuickAddProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Global keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        // Prevent default browser behavior (like opening search)
        event.preventDefault();
        event.stopPropagation();
        
        // Don't open if already open
        if (!isOpen) {
          openModal();
        }
      }
    };

    // Add the event listener to the document
    document.addEventListener('keydown', handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  // Listen for successful quick add to refresh data
  useEffect(() => {
    const handleQuickAddSuccess = (event: CustomEvent) => {
      // You can add additional logic here if needed
      // For example, showing a success toast notification
      console.log('Quick add successful:', event.detail);
    };

    window.addEventListener('quickAddSuccess', handleQuickAddSuccess as EventListener);

    return () => {
      window.removeEventListener('quickAddSuccess', handleQuickAddSuccess as EventListener);
    };
  }, []);

  const contextValue: QuickAddContextType = {
    openModal,
    closeModal,
    isOpen,
  };

  return (
    <QuickAddContext.Provider value={contextValue}>
      {children}
      <QuickAddModal isOpen={isOpen} onClose={closeModal} />
    </QuickAddContext.Provider>
  );
} 