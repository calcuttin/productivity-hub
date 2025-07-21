'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // General shortcuts
  {
    keys: ['Ctrl', 'K'],
    description: 'Open Quick Add modal',
    category: 'General',
  },
  {
    keys: ['?'],
    description: 'Show this help menu',
    category: 'General',
  },
  {
    keys: ['Escape'],
    description: 'Close modal or cancel action',
    category: 'General',
  },
  {
    keys: ['Enter'],
    description: 'Submit form or confirm action',
    category: 'General',
  },
  {
    keys: ['Ctrl', '/'],
    description: 'Focus global search',
    category: 'General',
  },
  {
    keys: ['Ctrl', 'T'],
    description: 'Toggle theme (light/dark)',
    category: 'General',
  },
  {
    keys: ['Ctrl', 'R'],
    description: 'Toggle recent items sidebar',
    category: 'General',
  },

  // Navigation shortcuts
  {
    keys: ['G', 'H'],
    description: 'Go to Home/Dashboard',
    category: 'Navigation',
  },
  {
    keys: ['G', 'P'],
    description: 'Go to Projects',
    category: 'Navigation',
  },
  {
    keys: ['G', 'T'],
    description: 'Go to Todos',
    category: 'Navigation',
  },
  {
    keys: ['G', 'R'],
    description: 'Go to Research',
    category: 'Navigation',
  },
  {
    keys: ['G', 'W'],
    description: 'Go to Workouts',
    category: 'Navigation',
  },
  {
    keys: ['G', 'C'],
    description: 'Go to Calendar',
    category: 'Navigation',
  },
  {
    keys: ['G', 'S'],
    description: 'Go to Search',
    category: 'Navigation',
  },
  {
    keys: ['G', 'O'],
    description: 'Go to Profile',
    category: 'Navigation',
  },

  // Form shortcuts
  {
    keys: ['Tab'],
    description: 'Navigate between form fields',
    category: 'Forms',
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Navigate backwards between form fields',
    category: 'Forms',
  },
  {
    keys: ['Ctrl', 'Enter'],
    description: 'Submit form from any field',
    category: 'Forms',
  },

  // List and content shortcuts
  {
    keys: ['J'],
    description: 'Navigate to next item in list',
    category: 'Lists',
  },
  {
    keys: ['K'],
    description: 'Navigate to previous item in list',
    category: 'Lists',
  },
  {
    keys: ['Space'],
    description: 'Select/toggle current item',
    category: 'Lists',
  },
  {
    keys: ['Enter'],
    description: 'Open/edit current item',
    category: 'Lists',
  },
  {
    keys: ['Delete'],
    description: 'Delete current item (with confirmation)',
    category: 'Lists',
  },

  // Quick actions
  {
    keys: ['N', 'P'],
    description: 'New Project',
    category: 'Quick Actions',
  },
  {
    keys: ['N', 'T'],
    description: 'New Todo',
    category: 'Quick Actions',
  },
  {
    keys: ['N', 'R'],
    description: 'New Research',
    category: 'Quick Actions',
  },
  {
    keys: ['N', 'W'],
    description: 'New Workout',
    category: 'Quick Actions',
  },

  // View shortcuts
  {
    keys: ['V', 'L'],
    description: 'Switch to List view',
    category: 'Views',
  },
  {
    keys: ['V', 'G'],
    description: 'Switch to Grid view',
    category: 'Views',
  },
  {
    keys: ['V', 'C'],
    description: 'Switch to Calendar view',
    category: 'Views',
  },
];

const categories = [...new Set(shortcuts.map(s => s.category))];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gray-600 flex items-center justify-center">
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <p className="text-sm text-gray-500">Speed up your workflow with these shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category} className="mb-6 last:mb-0">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{category}</h3>
                <div className="space-y-3">
                  {shortcuts
                    .filter(shortcut => shortcut.category === category)
                    .map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700 text-sm">{shortcut.description}</span>
                        <div className="flex items-center space-x-1">
                          {shortcut.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center space-x-1">
                              <kbd className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm font-mono">
                                {key}
                              </kbd>
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-gray-400 text-sm">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Tips & Notes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+K</kbd> (or <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Cmd+K</kbd> on Mac) from anywhere to quickly add new items</li>
              <li>• Navigation shortcuts like <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">G+P</kbd> work by pressing the keys in sequence, not simultaneously</li>
              <li>• List navigation (<kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">J</kbd>/<kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">K</kbd>) works when focus is on a list or table</li>
              <li>• Most forms support tab navigation and <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+Enter</kbd> for quick submission</li>
              <li>• Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Escape</kbd> to quickly close modals and return to your work</li>
              <li>• Some shortcuts may not work if you're in an input field - press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Escape</kbd> to exit input focus first</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Escape</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook for global help shortcut
export function useKeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const openHelp = () => setIsHelpOpen(true);
  const closeHelp = () => setIsHelpOpen(false);

  // Global keyboard shortcut for help
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Make sure we're not in an input field
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          openHelp();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isHelpOpen,
    openHelp,
    closeHelp,
    HelpComponent: () => (
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={closeHelp} />
    ),
  };
} 