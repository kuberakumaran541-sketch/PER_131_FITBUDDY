import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Navbar, NavTab } from './components/Navbar';
import { LoadingOverlay } from './components/LoadingOverlay';
import { Home } from './pages/Home';
import { Result } from './pages/Result';
import { Feedback } from './pages/Feedback';
import { Admin } from './pages/Admin';
import { ProgressDashboard } from './components/ProgressDashboard';
import {
  GenerateWorkoutResponse,
  UserProfileInput,
  UserRecord,
} from './types/fitbuddy';

const ACTIVE_USER_STORAGE_KEY = 'fitbuddy_active_user_id';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [activeUser, setActiveUser] = useState<UserRecord | null>(null);
  const [loadingMode, setLoadingMode] = useState<'generate' | 'feedback' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to load user records');
      const data = await res.json();
      const fetchedUsers: UserRecord[] = data.users || [];
      setUsers(fetchedUsers);

      const savedId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (savedId) {
        const matched = fetchedUsers.find((u) => u.user_id === savedId);
        if (matched) {
          setActiveUser(matched);
          return;
        }
      }
      if (fetchedUsers.length > 0 && !activeUser) {
        setActiveUser(fetchedUsers[0]);
      }
    } catch (err) {
      console.error('Error loading initial users:', err);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectActiveUser = (user: UserRecord, targetTab: NavTab = 'result') => {
    setActiveUser(user);
    localStorage.setItem(ACTIVE_USER_STORAGE_KEY, user.user_id);
    setActiveTab(targetTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneratePlan = async (profileInput: UserProfileInput, resetUpdates = true) => {
    if (loadingMode) return; // Prevent duplicate submissions
    setErrorMessage(null);
    setLoadingMode('generate');

    try {
      const res = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileInput, reset_updates: resetUpdates }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || 'Something went wrong while generating your plan. Please try again.'
        );
      }

      const payload = data as GenerateWorkoutResponse;
      setActiveUser(payload.user);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, payload.user.user_id);
      await fetchUsers();
      setActiveTab('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong while generating your plan. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleRegenerateVariation = async (user: UserRecord) => {
    await handleGeneratePlan(
      {
        user_id: user.user_id,
        name: user.name,
        age: user.age,
        weight: user.weight,
        goal: user.goal,
        intensity: user.intensity,
        experience: user.experience,
        available_days: user.available_days,
        duration: user.duration,
        preferences: user.preferences,
      },
      false
    );
  };

  const handleSubmitFeedback = async (userId: string, feedbackText: string) => {
    if (loadingMode) return;
    setErrorMessage(null);
    setLoadingMode('feedback');

    try {
      const res = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, feedback: feedbackText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || 'Something went wrong while updating your workout plan. Please try again.'
        );
      }

      const payload = data as GenerateWorkoutResponse;
      setActiveUser(payload.user);
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, payload.user.user_id);
      await fetchUsers();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong while updating your workout plan. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoadingMode(null);
    }
  };

  const handleToggleCompletedDay = async (dayNumber: number) => {
    if (!activeUser) return;
    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(activeUser.user_id)}/toggle-day`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ day: dayNumber }),
        }
      );
      if (!res.ok) return;
      const data = await res.json();
      setActiveUser(data.user);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === data.user.user_id ? data.user : u))
      );
    } catch (err) {
      console.error('Failed to toggle workout day:', err);
    }
  };

  const handleAddProgressLog = async (
    userId: string,
    entry: {
      date: string;
      weight_kg: number;
      workouts_completed: number;
      active_minutes: number;
      recovery_score: number;
      notes: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unable to save progress check-in.');
      }
      const data = await res.json();
      setActiveUser(data.user);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === data.user.user_id ? data.user : u))
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to save progress check-in.';
      setErrorMessage(msg);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Unable to delete user record.');
      }
      const remaining = users.filter((u) => u.user_id !== userId);
      setUsers(remaining);
      if (activeUser?.user_id === userId) {
        const nextUser = remaining[0] || null;
        setActiveUser(nextUser);
        if (nextUser) {
          localStorage.setItem(ACTIVE_USER_STORAGE_KEY, nextUser.user_id);
        } else {
          localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to delete user.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeUserName={activeUser?.name}
        onStartNewPlan={() => {
          setActiveTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <LoadingOverlay visible={loadingMode !== null} mode={loadingMode || 'generate'} />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {errorMessage && (
          <div
            role="alert"
            className="no-print mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-red-300 hover:text-white rounded-lg cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <Home
            onGeneratePlan={(input) => handleGeneratePlan(input, true)}
            isLoading={loadingMode !== null}
            existingUsers={users}
            activeUser={activeUser}
            onSelectExistingUser={(u) => handleSelectActiveUser(u, 'result')}
          />
        )}

        {activeTab === 'result' && (
          <Result
            user={activeUser}
            onNavigateFeedback={() => {
              setActiveTab('feedback');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateProgress={() => {
              setActiveTab('progress');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRegeneratePlan={handleRegenerateVariation}
            onToggleCompletedDay={handleToggleCompletedDay}
            isLoading={loadingMode !== null}
          />
        )}

        {activeTab === 'feedback' && (
          <Feedback
            user={activeUser}
            onSubmitFeedback={handleSubmitFeedback}
            onNavigateResult={() => {
              setActiveTab('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isLoading={loadingMode !== null}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            user={activeUser}
            onAddProgressLog={handleAddProgressLog}
            onNavigateResult={() => {
              setActiveTab('result');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateHome={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'admin' && (
          <Admin
            users={users}
            onDeleteUser={handleDeleteUser}
            onSelectActiveUser={(u) => handleSelectActiveUser(u, 'result')}
            onRefreshUsers={fetchUsers}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="no-print border-t border-white/[0.08] py-8 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-display font-bold text-white mr-2">FitBuddy</span>
            <span>AI Fitness Plan Generator · Your AI-powered personal fitness companion</span>
          </div>
          <div>
            FitBuddy provides general fitness and wellness information and is not a substitute for
            professional medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
