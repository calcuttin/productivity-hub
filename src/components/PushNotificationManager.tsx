'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react';

interface PushSubscriptionInfo {
  id: string;
  endpoint: string;
  userAgent?: string;
  lastUsed: string;
  createdAt: string;
}

interface PushNotificationManagerProps {
  className?: string;
}

export default function PushNotificationManager({ className = '' }: PushNotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<PushSubscriptionInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check browser support and permission status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      
      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Register service worker
  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      }
      return null;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  // Request notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    }
    return 'denied';
  };

  // Get push subscription
  const getPushSubscription = async (registration: ServiceWorkerRegistration) => {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI3Q3H7Uv8z1W3kzH7+L+H+0Q1HQ5P7sU4M0z7r7g8e8q2t+L3Hq0VKz4Y='
      });
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  };

  // Load user's subscriptions
  const loadSubscriptions = async () => {
    try {
      const response = await fetch('/api/push-subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setIsSubscribed(data.count > 0);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          throw new Error('Notification permission denied');
        }
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error('Failed to register service worker');
      }

      // Get push subscription
      const subscription = await getPushSubscription(registration);
      
      // Send subscription to server
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          },
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register push subscription');
      }

      setSuccess('Push notifications enabled successfully!');
      setIsSubscribed(true);
      await loadSubscriptions();

    } catch (error: any) {
      console.error('Failed to subscribe to push notifications:', error);
      setError(error.message || 'Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async (subscriptionId?: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove from server
      const url = subscriptionId 
        ? `/api/push-subscriptions?id=${subscriptionId}`
        : '/api/push-subscriptions';
      
      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove push subscription');
      }

      // Unsubscribe from browser (if removing all)
      if (!subscriptionId && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      setSuccess('Push notifications disabled successfully!');
      setIsSubscribed(false);
      await loadSubscriptions();

    } catch (error: any) {
      console.error('Failed to unsubscribe from push notifications:', error);
      setError(error.message || 'Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/push-notifications/test', {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test notification');
      }

      setSuccess('Test notification sent! Check your browser.');

    } catch (error: any) {
      console.error('Failed to send test notification:', error);
      setError(error.message || 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800">Push Notifications Not Supported</h3>
            <p className="text-yellow-700 mt-1">
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSubscribed ? (
              <Bell className="h-6 w-6 text-green-600" />
            ) : (
              <BellOff className="h-6 w-6 text-gray-400" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600">
                {permission === 'granted' 
                  ? isSubscribed 
                    ? 'Enabled and active'
                    : 'Permission granted, click to enable'
                  : permission === 'denied'
                    ? 'Permission denied by browser'
                    : 'Permission not requested'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {permission === 'granted' && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Permitted</span>
              </div>
            )}
            {permission === 'denied' && (
              <div className="flex items-center text-red-600">
                <XCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Blocked</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          {!isSubscribed && permission !== 'denied' && (
            <button
              onClick={subscribeToPush}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
            </button>
          )}
          
          {isSubscribed && (
            <>
              <button
                onClick={() => unsubscribeFromPush()}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BellOff className="h-4 w-4 mr-2" />
                {isLoading ? 'Disabling...' : 'Disable Push Notifications'}
              </button>
              
              <button
                onClick={sendTestNotification}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {isLoading ? 'Sending...' : 'Send Test Notification'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Active Devices ({subscriptions.length})
          </h4>
          
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {sub.userAgent ? 
                        sub.userAgent.split(' ').slice(-2).join(' ') : 
                        'Unknown Device'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Added {new Date(sub.createdAt).toLocaleDateString()}
                      {sub.lastUsed && ` • Last used ${new Date(sub.lastUsed).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => unsubscribeFromPush(sub.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permission Denied Help */}
      {permission === 'denied' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-yellow-600" />
            <div>
              <h4 className="text-lg font-semibold text-yellow-800">Permission Blocked</h4>
              <p className="text-yellow-700 mt-2">
                Push notifications are blocked in your browser. To enable them:
              </p>
              <ol className="text-yellow-700 mt-2 ml-4 list-decimal">
                <li>Click the lock/info icon in your browser's address bar</li>
                <li>Change notifications from "Block" to "Allow"</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">About Push Notifications</h4>
        <div className="text-blue-700 space-y-2">
          <p>
            <strong>What are push notifications?</strong> Browser notifications that appear even when you're not using the app.
          </p>
          <p>
            <strong>What will you receive?</strong> Reminders for due dates, workout schedules, research deadlines, and important updates.
          </p>
          <p>
            <strong>Privacy:</strong> Notifications are sent directly to your browser. We don't track or store notification content.
          </p>
          <p>
            <strong>Control:</strong> You can disable notifications anytime from this page or your browser settings.
          </p>
        </div>
      </div>
    </div>
  );
} 