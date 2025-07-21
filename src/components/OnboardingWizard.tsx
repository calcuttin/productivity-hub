'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  Target, 
  Calendar, 
  CheckSquare, 
  TrendingUp,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action?: () => void;
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Productivity Hub!',
      description: 'Let\'s get you set up with your personal productivity command center. This will only take a few minutes.',
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
      completed: completedSteps.has('welcome'),
      action: () => {
        setCompletedSteps(prev => new Set([...prev, 'welcome']));
        setCurrentStep(1);
      }
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us a bit about yourself so we can personalize your experience.',
      icon: <Star className="w-8 h-8 text-purple-500" />,
      completed: completedSteps.has('profile'),
      action: () => {
        router.push('/profile');
        setCompletedSteps(prev => new Set([...prev, 'profile']));
        setCurrentStep(2);
      }
    },
    {
      id: 'first-project',
      title: 'Create Your First Project',
      description: 'Start with a simple project to see how it works. You can always add more later.',
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      completed: completedSteps.has('first-project'),
      action: () => {
        router.push('/projects');
        setCompletedSteps(prev => new Set([...prev, 'first-project']));
        setCurrentStep(3);
      }
    },
    {
      id: 'first-todo',
      title: 'Add Your First Todo',
      description: 'Create a simple task to get started with your daily productivity.',
      icon: <CheckSquare className="w-8 h-8 text-orange-500" />,
      completed: completedSteps.has('first-todo'),
      action: () => {
        router.push('/todos');
        setCompletedSteps(prev => new Set([...prev, 'first-todo']));
        setCurrentStep(4);
      }
    },
    {
      id: 'workout-plan',
      title: 'Plan Your First Workout',
      description: 'Set up your fitness tracking to maintain a healthy work-life balance.',
      icon: <Target className="w-8 h-8 text-red-500" />,
      completed: completedSteps.has('workout-plan'),
      action: () => {
        router.push('/workout');
        setCompletedSteps(prev => new Set([...prev, 'workout-plan']));
        setCurrentStep(5);
      }
    },
    {
      id: 'explore-features',
      title: 'Explore Features',
      description: 'Discover time tracking, analytics, and other powerful features.',
      icon: <TrendingUp className="w-8 h-8 text-indigo-500" />,
      completed: completedSteps.has('explore-features'),
      action: () => {
        setCompletedSteps(prev => new Set([...prev, 'explore-features']));
        setCurrentStep(6);
      }
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Congratulations! You\'ve completed the setup. Start exploring your productivity hub.',
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      completed: completedSteps.has('complete'),
      action: () => {
        setCompletedSteps(prev => new Set([...prev, 'complete']));
        onComplete();
      }
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = (completedSteps.size / steps.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Getting Started</h2>
              <p className="text-blue-100 mt-1">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-blue-200 bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {currentStepData.description}
            </p>
          </div>

          {/* Step List */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                    : index < currentStep
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    index <= currentStep
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${
                    index <= currentStep
                      ? 'text-gray-600 dark:text-gray-300'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Skip for now
              </button>
              
              <button
                onClick={currentStepData.action}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Complete Setup
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {currentStep === 0 ? 'Get Started' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 