import React, { useState } from 'react';
import {
  MessageSquarePlus,
  History,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserRecord } from '../types/fitbuddy';
import { WorkoutDayGrid } from '../components/WorkoutDayGrid';

interface FeedbackProps {
  user: UserRecord | null;
  onSubmitFeedback: (userId: string, feedbackText: string) => Promise<void>;
  onNavigateResult: () => void;
  onNavigateHome: () => void;
  isLoading: boolean;
}

const FEEDBACK_SUGGESTIONS = [
  'Add more cardio intervals on Days 2 and 6',
  'Reduce workout intensity and make exercises low-impact on knees',
  'Include more rest days and add a 30-minute Vinyasa yoga session',
  'Switch all exercises to home bodyweight & dumbbell movements only',
  'Add extra core stability and posture exercises to every session',
];

export const Feedback: React.FC<FeedbackProps> = ({
  user,
  onSubmitFeedback,
  onNavigateResult,
  onNavigateHome,
  isLoading,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);
  const [historyTab, setHistoryTab] = useState<'updated' | 'original' | 'side-by-side'>('updated');

  if (!user) {
    return (
      <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-10 text-center max-w-xl mx-auto my-12">
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Generate a Plan First to Submit Feedback
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Once your initial 7-day workout plan is created, you can customize it anytime with
          Google Gemini AI.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Go to Profile Form
        </button>
      </div>
    );
  }

  const handleApplySuggestion = (suggestion: string) => {
    setErrorMsg(null);
    setFeedbackText((prev) => (prev.trim() ? `${prev.trim()}. ${suggestion}` : suggestion));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessBanner(false);

    if (!feedbackText.trim() || feedbackText.trim().length < 3) {
      setErrorMsg(
        'Please describe how you would like FitBuddy AI to modify your workout plan.'
      );
      return;
    }

    await onSubmitFeedback(user.user_id, feedbackText.trim());
    setFeedbackText('');
    setSuccessBanner(true);
    setHistoryTab('updated');
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-emerald-400 font-medium mb-1">
            Adaptive AI Coaching · {user.name} ({user.user_id})
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Improve My Plan</h1>
          <p className="text-sm text-slate-400 mt-1">
            Tell FitBuddy AI what to adjust. Your Original Plan is always preserved in Plan
            History.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateResult}
          className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#131B2A] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Full Plan View
        </button>
      </div>

      {/* Feedback Input Card */}
      <section className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <div className="pb-5 mb-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Submit Workout Feedback to Gemini AI
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Profile: {user.goal} · {user.intensity} Intensity · {user.experience} ·{' '}
              {user.duration}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Updates Recorded: {user.plan_updates_count || 0}
          </span>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successBanner && (
          <div
            role="status"
            className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Your 7-day workout plan has been updated by Gemini AI! Review the Original vs.
                Updated Plan below.
              </span>
            </div>
            <button
              type="button"
              onClick={onNavigateResult}
              className="px-3 py-1.5 bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg whitespace-nowrap cursor-pointer"
            >
              View Result Page
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="feedback-textarea"
              className="block text-xs font-medium text-slate-300 mb-2"
            >
              How should FitBuddy AI modify your 7-day plan?
            </label>
            <textarea
              id="feedback-textarea"
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Example: Add more cardio, reduce workout intensity, include more rest days, add yoga…"
              className="w-full p-4 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Quick Suggestion Buttons */}
          <div>
            <span className="block text-xs text-slate-400 mb-2">
              Quick Prompts (Click to add):
            </span>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleApplySuggestion(suggestion)}
                  className="px-3 py-1.5 text-xs text-slate-300 bg-[#0B0F17] hover:bg-slate-800 hover:text-white border border-white/[0.08] rounded-lg transition-colors text-left cursor-pointer"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.08]">
            <span className="text-xs text-slate-400">
              Original plan is preserved automatically in Plan History.
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-display font-bold text-sm rounded-xl transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Update My Plan
            </button>
          </div>
        </form>
      </section>

      {/* Plan History: Original Plan vs Updated Plan */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Plan History</h2>
              <p className="text-xs text-slate-400">
                Compare your preserved Original Plan and your latest AI-Updated Plan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#131B2A] border border-white/[0.08] rounded-xl">
            <button
              type="button"
              onClick={() => setHistoryTab('updated')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                historyTab === 'updated'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Updated Plan
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab('original')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                historyTab === 'original'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Original Plan
            </button>
            <button
              type="button"
              onClick={() => setHistoryTab('side-by-side')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                historyTab === 'side-by-side'
                  ? 'bg-emerald-400 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
          </div>
        </div>

        {/* Feedback Metadata Banner if Updated Plan exists */}
        {user.updated_plan && user.feedback && (
          <div className="bg-[#131B2A] border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-emerald-400 mb-1">
                LATEST FEEDBACK APPLIED · {new Date(user.updated_date).toLocaleString()}
              </div>
              <p className="text-sm text-white font-medium">“{user.feedback}”</p>
            </div>
            <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
              {user.updated_plan.version_label}
            </div>
          </div>
        )}

        {historyTab === 'original' && (
          <div className="space-y-4">
            <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Original Plan</h3>
                <p className="text-xs text-slate-400">
                  Generated on {new Date(user.original_plan.generated_at).toLocaleString()}
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">Preserved Baseline</span>
            </div>
            <WorkoutDayGrid days={user.original_plan.days} durationLabel={user.duration} />
          </div>
        )}

        {historyTab === 'updated' && (
          <div className="space-y-4">
            {user.updated_plan ? (
              <>
                <div className="bg-[#131B2A] border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Updated Plan ({user.updated_plan.version_label})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Updated on {new Date(user.updated_plan.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Active Revision</span>
                </div>
                <WorkoutDayGrid days={user.updated_plan.days} durationLabel={user.duration} />
              </>
            ) : (
              <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-8 text-center">
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  No Updated Plan Yet
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
                  Submit feedback in the form above (e.g., “Add yoga on Day 3” or “Include more
                  cardio”) to generate an updated 7-day plan while keeping your Original Plan safe.
                </p>
                <button
                  type="button"
                  onClick={() => setHistoryTab('original')}
                  className="px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg cursor-pointer"
                >
                  View Original Plan
                </button>
              </div>
            )}
          </div>
        )}

        {historyTab === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-4">
                <h3 className="font-display text-base font-bold text-white">Original Plan</h3>
                <p className="text-xs text-slate-400">
                  Created: {new Date(user.original_plan.generated_at).toLocaleString()}
                </p>
              </div>
              <WorkoutDayGrid days={user.original_plan.days} durationLabel={user.duration} />
            </div>

            <div className="space-y-4">
              <div className="bg-[#131B2A] border border-emerald-500/30 rounded-xl p-4">
                <h3 className="font-display text-base font-bold text-white">Updated Plan</h3>
                <p className="text-xs text-slate-400">
                  {user.updated_plan
                    ? `Updated: ${new Date(user.updated_plan.generated_at).toLocaleString()} · Feedback: "${user.feedback}"`
                    : 'Submit feedback above to generate an updated plan'}
                </p>
              </div>
              {user.updated_plan ? (
                <WorkoutDayGrid days={user.updated_plan.days} durationLabel={user.duration} />
              ) : (
                <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-8 text-center text-sm text-slate-400">
                  No updated plan generated yet. Use the form above to submit feedback.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
