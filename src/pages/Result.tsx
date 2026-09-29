import React, { useState } from 'react';
import {
  Printer,
  Download,
  MessageSquarePlus,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  History,
} from 'lucide-react';
import { UserRecord } from '../types/fitbuddy';
import { WorkoutDayGrid } from '../components/WorkoutDayGrid';
import { downloadPlanAsText } from '../utils/exportPlan';

interface ResultProps {
  user: UserRecord | null;
  onNavigateFeedback: () => void;
  onNavigateHome: () => void;
  onNavigateProgress: () => void;
  onRegeneratePlan: (user: UserRecord) => Promise<void>;
  onToggleCompletedDay: (dayNumber: number) => Promise<void>;
  isLoading: boolean;
}

export const Result: React.FC<ResultProps> = ({
  user,
  onNavigateFeedback,
  onNavigateHome,
  onNavigateProgress,
  onRegeneratePlan,
  onToggleCompletedDay,
  isLoading,
}) => {
  const [selectedPlanView, setSelectedPlanView] = useState<'active' | 'original' | 'compare'>(
    'active'
  );

  if (!user) {
    return (
      <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-10 text-center max-w-xl mx-auto my-12">
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          No Active Fitness Plan Selected
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Enter your fitness details on the Home page to generate a personalized 7-day workout plan
          with Google Gemini.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Create Fitness Plan
        </button>
      </div>
    );
  }

  const hasUpdatedPlan = Boolean(user.updated_plan);
  const displayedPlan =
    selectedPlanView === 'original' || !user.updated_plan
      ? user.original_plan
      : user.updated_plan;

  const consistencyPct = Math.round(((user.completed_days?.length || 0) / 7) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Toolbar & User Profile Card */}
      <section className="print-card bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 mb-6 border-b border-white/[0.08]">
          <div>
            <div className="text-xs text-emerald-400 font-medium mb-1">
              User Profile · {displayedPlan.version_label}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {user.name}’s 7-Day Fitness Plan
            </h1>
            <p className="text-sm text-slate-300 mt-1 italic">
              “{displayedPlan.motivational_message || user.motivational_message}”
            </p>
          </div>

          {/* Primary Actions: Generate New Plan, Regenerate, Give Feedback, Print, Download */}
          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0B0F17] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              Generate New Plan
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => onRegeneratePlan(user)}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0B0F17] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
              title="Ask Gemini AI for a fresh 7-day variation for this profile"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              Regenerate
            </button>

            <button
              type="button"
              onClick={onNavigateFeedback}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              Give Feedback
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0B0F17] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Plan
            </button>

            <button
              type="button"
              onClick={() => downloadPlanAsText(user, displayedPlan)}
              className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0B0F17] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Plan
            </button>
          </div>
        </div>

        {/* User Profile Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
          <div>
            <span className="block text-xs text-slate-400">Name:</span>
            <span className="font-semibold text-white">{user.name}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400">User ID:</span>
            <span className="font-mono font-semibold text-emerald-400">{user.user_id}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Age:</span>
            <span className="font-mono tabular-nums text-white">{user.age} yrs</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Weight:</span>
            <span className="font-mono tabular-nums text-white">{user.weight} kg</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Goal:</span>
            <span className="font-semibold text-white">{user.goal}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Intensity:</span>
            <span className="font-semibold text-white">{user.intensity}</span>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Experience:</span>
            <span className="font-semibold text-white">{user.experience}</span>
          </div>
        </div>

        {/* Progress Summary Bar */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="block text-xs text-slate-400">Current Goal</span>
            <span className="text-base font-display font-bold text-white">{user.goal}</span>
            <span className="block text-xs text-slate-400 mt-0.5">
              {user.available_days} days/wk · {user.duration}
            </span>
          </div>

          <div>
            <span className="block text-xs text-slate-400">Workout Consistency</span>
            <span className="text-base font-mono tabular-nums font-bold text-emerald-400">
              {user.completed_days?.length || 0} / 7 Days ({consistencyPct}%)
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              Click “Mark Done” on any day card
            </span>
          </div>

          <div>
            <span className="block text-xs text-slate-400">Plans Generated</span>
            <span className="text-base font-mono tabular-nums font-bold text-white">
              {user.plans_generated_count || 1}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              Created {new Date(user.created_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs text-slate-400">Plan Updates</span>
              <span className="text-base font-mono tabular-nums font-bold text-white">
                {user.plan_updates_count || 0}
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">
                {hasUpdatedPlan ? 'Updated via AI Feedback' : 'Original Baseline'}
              </span>
            </div>

            <button
              type="button"
              onClick={onNavigateProgress}
              className="no-print px-3 py-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trends
            </button>
          </div>
        </div>
      </section>

      {/* 💡 AI Nutrition & Recovery Tip Card */}
      <section className="print-card bg-[#131B2A] border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-white/[0.08]">
          <h2 className="font-display text-xl font-bold text-white">
            💡 AI Nutrition &amp; Recovery Tip
          </h2>
          <span className="text-xs text-emerald-400 font-medium">
            Tailored for {user.goal} · {user.weight} kg · {user.intensity} Intensity
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-emerald-300 mb-1">
              {user.nutrition_details?.title || `${user.goal} Fueling & Recovery Strategy`}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {user.nutrition_details?.summary || user.nutrition_tip}
            </p>
          </div>

          {user.nutrition_details?.key_points && user.nutrition_details.key_points.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {user.nutrition_details.key_points.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-300 bg-[#0B0F17]/60 p-3.5 rounded-xl border border-white/[0.05]"
                >
                  <span className="font-mono text-xs text-emerald-400 font-bold mt-0.5">
                    0{idx + 1}.
                  </span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 border-t border-white/[0.06]">
            <span>
              <strong className="text-white">💧 Daily Hydration Target:</strong>{' '}
              {user.nutrition_details?.hydration_target || '2.5 – 3.0 Liters / day'}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="text-white">😴 Recovery Focus:</strong>{' '}
              {user.nutrition_details?.recovery_advice ||
                '7.5–8.5 hours sleep and post-session stretching'}
            </span>
          </div>
        </div>
      </section>

      {/* Plan History Switcher (Original Plan vs Updated Plan) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Your 7-Day Fitness Plan</h2>
            <p className="text-xs text-slate-400 mt-1">
              Structured Day 1 through Day 7 programming with warm-ups, sets, reps, rest, and
              recovery.
            </p>
          </div>

          {/* Interactive Version Toggle (Original vs Updated vs Side-by-Side) */}
          {hasUpdatedPlan && (
            <div className="no-print flex items-center gap-1 p-1 bg-[#131B2A] border border-white/[0.08] rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedPlanView('active')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlanView === 'active'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Updated Plan
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlanView('original')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlanView === 'original'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Original Plan
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlanView('compare')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedPlanView === 'compare'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Compare History
              </button>
            </div>
          )}
        </div>

        {/* Display Active or Original 7-Day Plan */}
        {selectedPlanView !== 'compare' ? (
          <WorkoutDayGrid
            days={displayedPlan.days}
            durationLabel={user.duration}
            completedDays={user.completed_days}
            onToggleDay={onToggleCompletedDay}
          />
        ) : (
          /* Side-by-Side Original vs Updated Comparison */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-4">
                <span className="text-xs font-mono text-slate-400">BASELINE RECORD</span>
                <h3 className="font-display text-lg font-bold text-white">
                  Original Plan ({new Date(user.original_plan.generated_at).toLocaleDateString()})
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Preserved initial 7-day plan generated prior to user feedback.
                </p>
              </div>
              <WorkoutDayGrid days={user.original_plan.days} durationLabel={user.duration} />
            </div>

            {user.updated_plan && (
              <div className="space-y-4">
                <div className="bg-[#131B2A] border border-emerald-500/40 rounded-xl p-4">
                  <span className="text-xs font-mono text-emerald-400">ADAPTIVE AI REVISION</span>
                  <h3 className="font-display text-lg font-bold text-white">
                    Updated Plan ({new Date(user.updated_plan.generated_at).toLocaleDateString()})
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Feedback applied: “{user.feedback}”
                  </p>
                </div>
                <WorkoutDayGrid days={user.updated_plan.days} durationLabel={user.duration} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Plan History Section (Original Plan & Updated Plan Summary) */}
      <section className="print-card bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display text-xl font-bold text-white">
              Plan History (Original vs. Updated Plan)
            </h2>
          </div>
          <button
            type="button"
            onClick={onNavigateFeedback}
            className="no-print text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            + Submit New Feedback to Update Plan →
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Plan Summary Box */}
          <div className="bg-[#0B0F17] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-white">Original Plan</h3>
              <span className="text-xs font-mono text-slate-400">
                {new Date(user.original_plan.generated_at).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Initial 7-day plan generated for {user.goal} ({user.intensity} intensity,{' '}
              {user.experience} level). Always preserved in history.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {user.original_plan.days.map((d) => (
                <li key={d.day} className="flex items-center justify-between py-1 border-b border-white/[0.04]">
                  <span>
                    <strong className="font-mono text-emerald-400 mr-1.5">Day {d.day}:</strong>
                    {d.focus}
                  </span>
                  <span className="font-mono text-slate-400">{d.exercises.length} exercises</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 no-print">
              <button
                type="button"
                onClick={() => setSelectedPlanView('original')}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Inspect Full Original 7-Day Plan ↑
              </button>
            </div>
          </div>

          {/* Updated Plan Summary Box */}
          <div className="bg-[#0B0F17] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-white">Updated Plan</h3>
              {user.updated_plan ? (
                <span className="text-xs font-mono text-emerald-400">
                  {new Date(user.updated_plan.generated_at).toLocaleString()}
                </span>
              ) : (
                <span className="text-xs text-slate-500">No feedback submitted yet</span>
              )}
            </div>

            {user.updated_plan ? (
              <>
                <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-slate-200">
                  <div className="font-semibold text-emerald-300 mb-0.5">
                    Feedback Provided ({new Date(user.updated_date).toLocaleString()}):
                  </div>
                  <div>“{user.feedback}”</div>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {user.updated_plan.days.map((d) => (
                    <li
                      key={d.day}
                      className="flex items-center justify-between py-1 border-b border-white/[0.04]"
                    >
                      <span>
                        <strong className="font-mono text-emerald-400 mr-1.5">Day {d.day}:</strong>
                        {d.focus}
                      </span>
                      <span className="font-mono text-slate-400">
                        {d.exercises.length} exercises
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-4 no-print">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanView('active')}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    Inspect Full Updated 7-Day Plan ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanView('compare')}
                    className="text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                  >
                    Side-by-Side Comparison ↑
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-400 mb-4">
                  Want to adjust exercises, add yoga, reduce intensity, or include more cardio?
                </p>
                <button
                  type="button"
                  onClick={onNavigateFeedback}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Give Feedback to Update Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Safety Disclaimer Footer Banner */}
      <div className="bg-[#131B2A]/70 border border-white/[0.06] rounded-xl p-4 text-center text-xs text-slate-400">
        {displayedPlan.safety_note ||
          'FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice.'}
      </div>
    </div>
  );
};
