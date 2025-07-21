'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'ft';
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    browser: boolean;
    reminders: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (session?.user) {
      // Fetch user preferences from API
      fetch('/api/preferences')
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching preferences:', data.error);
            // Fallback to session data
            setProfile({
              id: session.user?.id || '',
              name: session.user?.name || '',
              email: session.user?.email || '',
              image: session.user?.image || undefined,
              weightUnit: 'lb',
              heightUnit: 'ft',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              theme: 'system',
              notifications: {
                email: true,
                browser: true,
                reminders: true,
              },
            });
          } else {
            // Use preferences from database
            setProfile({
              id: session.user?.id || '',
              name: session.user?.name || '',
              email: session.user?.email || '',
              image: session.user?.image || undefined,
              weightUnit: data.weightUnit || 'lb',
              heightUnit: data.heightUnit || 'ft',
              timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              theme: data.theme || 'system',
              notifications: {
                email: data.emailNotifications ?? true,
                browser: data.browserNotifications ?? true,
                reminders: data.reminderNotifications ?? true,
              },
            });
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching preferences:', error);
          // Fallback to session data
          setProfile({
            id: session.user?.id || '',
            name: session.user?.name || '',
            email: session.user?.email || '',
            image: session.user?.image || undefined,
            weightUnit: 'lb',
            heightUnit: 'ft',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            theme: 'system',
            notifications: {
              email: true,
              browser: true,
              reminders: true,
            },
          });
          setIsLoading(false);
        });
    }
  }, [session]);

  // Apply theme when profile is loaded
  useEffect(() => {
    if (profile?.theme) {
      setTheme(profile.theme);
    }
  }, [profile?.theme, setTheme]);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      // Save preferences to database
      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications: profile.notifications.email,
          browserNotifications: profile.notifications.browser,
          reminderNotifications: profile.notifications.reminders,
          weightUnit: profile.weightUnit,
          heightUnit: profile.heightUnit,
          timezone: profile.timezone,
          theme: profile.theme,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Update session with new name/email if changed
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profile.name,
          email: profile.email,
        },
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (session?.user) {
      setProfile({
        id: session.user?.id || '',
        name: session.user?.name || '',
        email: session.user?.email || '',
        image: session.user?.image || undefined,
        weightUnit: 'lb',
        heightUnit: 'ft',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        theme: 'system',
        notifications: {
          email: true,
          browser: true,
          reminders: true,
        },
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      <Toaster position="top-right" />
      
      <div className="content-container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Profile Settings</h1>
          <p className="mt-2 text-secondary">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="card">
          {/* Profile Header */}
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-card-secondary flex items-center justify-center">
                  {profile?.image ? (
                    <img 
                      src={profile.image} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-secondary">
                      {profile?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-primary">
                    {profile?.name || 'User'}
                  </h2>
                  <p className="text-secondary">
                    {profile?.email}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn-primary disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="card-body space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    disabled={!isEditing}
                    className="input-standard disabled:bg-card-secondary disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                    disabled={!isEditing}
                    className="input-standard disabled:bg-card-secondary disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Fitness Preferences */}
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">
                Fitness Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Weight Unit
                  </label>
                  <select
                    value={profile?.weightUnit || 'lb'}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, weightUnit: e.target.value as 'kg' | 'lb' } : null)}
                    disabled={!isEditing}
                    className="input-standard disabled:bg-card-secondary disabled:cursor-not-allowed"
                  >
                    <option value="lb">Pounds (lb)</option>
                    <option value="kg">Kilograms (kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Height Unit
                  </label>
                  <select
                    value={profile?.heightUnit || 'ft'}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, heightUnit: e.target.value as 'cm' | 'ft' } : null)}
                    disabled={!isEditing}
                    className="input-standard disabled:bg-card-secondary disabled:cursor-not-allowed"
                  >
                    <option value="ft">Feet/Inches (ft/in)</option>
                    <option value="cm">Centimeters (cm)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* App Preferences */}
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">
                App Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Theme
                  </label>
                  <select
                    value={profile?.theme || 'system'}
                    onChange={(e) => {
                      const newTheme = e.target.value as 'light' | 'dark' | 'system';
                      setProfile(prev => prev ? { ...prev, theme: newTheme } : null);
                      setTheme(newTheme);
                    }}
                    disabled={!isEditing}
                    className="input-standard disabled:bg-card-secondary disabled:cursor-not-allowed"
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Timezone
                  </label>
                  <select
                    value={profile?.timezone || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                    disabled={!isEditing}
                    className="input-standard disabled:bg-card-secondary disabled:cursor-not-allowed"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="text-lg font-medium text-primary mb-4">
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-primary">
                      Email Notifications
                    </label>
                    <p className="text-sm text-secondary">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile?.notifications.email || false}
                    onChange={(e) => setProfile(prev => prev ? { 
                      ...prev, 
                      notifications: { ...prev.notifications, email: e.target.checked } 
                    } : null)}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-primary">
                      Browser Notifications
                    </label>
                    <p className="text-sm text-secondary">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile?.notifications.browser || false}
                    onChange={(e) => setProfile(prev => prev ? { 
                      ...prev, 
                      notifications: { ...prev.notifications, browser: e.target.checked } 
                    } : null)}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-primary">
                      Reminder Notifications
                    </label>
                    <p className="text-sm text-secondary">
                      Get reminders for upcoming deadlines
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile?.notifications.reminders || false}
                    onChange={(e) => setProfile(prev => prev ? { 
                      ...prev, 
                      notifications: { ...prev.notifications, reminders: e.target.checked } 
                    } : null)}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 