'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Target, 
  Calendar, 
  CheckSquare, 
  TrendingUp,
  Clock,
  Bell,
  Search,
  Settings
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function FeatureTour({ isOpen, onClose, onComplete }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'dashboard',
      title: 'Your Command Center',
      description: 'This is your main dashboard where you can see all your projects, todos, and progress at a glance.',
      icon: <TrendingUp className="w-6 h-6" />,
      target: '.page-container',
      position: 'top'
    },
    {
      id: 'quick-add',
      title: 'Quick Add',
      description: 'Use the Quick Add button (Ctrl+K) to quickly create projects, todos, or workouts without navigating away.',
      icon: <BookOpen className="w-6 h-6" />,
      target: '[title*="Quick Add"]',
      position: 'bottom'
    },
    {
      id: 'time-tracker',
      title: 'Time Tracking',
      description: 'Track your time spent on different activities to understand your productivity patterns.',
      icon: <Clock className="w-6 h-6" />,
      target: '[data-tour="time-tracker"]',
      position: 'left'
    },
    {
      id: 'streaks',
      title: 'Streak Tracking',
      description: 'Build consistent habits by tracking your daily streaks for todos and workouts.',
      icon: <Target className="w-6 h-6" />,
      target: '[data-tour="streaks"]',
      position: 'right'
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      description: 'Get reminded about upcoming deadlines, workout schedules, and important tasks.',
      icon: <Bell className="w-6 h-6" />,
      target: '[data-tour="notifications"]',
      position: 'bottom'
    },
    {
      id: 'search',
      title: 'Global Search',
      description: 'Quickly find any project, todo, or research paper using the powerful search feature.',
      icon: <Search className="w-6 h-6" />,
      target: '[data-tour="search"]',
      position: 'top'
    },
    {
      id: 'analytics',
      title: 'Analytics & Insights',
      description: 'View detailed analytics about your productivity, completion rates, and progress over time.',
      icon: <TrendingUp className="w-6 h-6" />,
      target: '[data-tour="analytics"]',
      position: 'left'
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    const currentStepData = tourSteps[currentStep];
    if (currentStepData.target) {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return () => {
      setHighlightedElement(null);
    };
  }, [currentStep, isOpen]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={skipTour}
      />

      {/* Highlight overlay */}
      {highlightedElement && (
        <div
          className="fixed z-45 pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            border: '2px solid #3B82F6',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />
      )}

      {/* Tour Tooltip */}
      <div
        className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-sm transition-all duration-300 ${
          highlightedElement ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          top: highlightedElement 
            ? highlightedElement.offsetTop + highlightedElement.offsetHeight + 20
            : '50%',
          left: highlightedElement 
            ? Math.min(highlightedElement.offsetLeft, window.innerWidth - 400)
            : '50%',
          transform: highlightedElement ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {currentStepData.icon}
            <span className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={skipTour}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
              Skip Tour
            </button>
            
            <button
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Finish Tour
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 