import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { WorkoutDay } from '../types/fitbuddy';

interface WorkoutDayGridProps {
  days: WorkoutDay[];
  durationLabel: string;
  completedDays?: number[];
  onToggleDay?: (dayNumber: number) => void;
}

export const WorkoutDayGrid: React.FC<WorkoutDayGridProps> = ({
  days,
  durationLabel,
  completedDays = [],
  onToggleDay,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {days.map((day) => {
        const isCompleted = completedDays.includes(day.day);
        return (
          <article
            key={day.day}
            className={`print-card bg-[#131B2A] border rounded-2xl p-6 flex flex-col justify-between transition-colors ${
              isCompleted
                ? 'border-emerald-500/40'
                : 'border-white/[0.08] hover:border-white/[0.14]'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-white/[0.08]">
                <div>
                  <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                    <span className="font-mono font-semibold text-emerald-400">
                      Day {day.day}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>⏱️ {day.is_rest_day ? '20–25 minutes' : durationLabel}</span>
                    {day.is_rest_day && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300">Active Recovery</span>
                      </>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">
                    🏋️ Day {day.day} – {day.focus}
                  </h3>
                </div>

                {onToggleDay && (
                  <button
                    type="button"
                    onClick={() => onToggleDay(day.day)}
                    className={`no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#0B0F17] text-slate-300 hover:text-white border border-white/[0.08]'
                    }`}
                    title="Mark day as completed"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Done
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-500" />
                        Mark Done
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Warm-up Section */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">
                  🔥 Warm-up (5–10 minutes)
                </h4>
                <ul className="space-y-1.5 text-sm text-slate-300">
                  {day.warmup.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono text-xs mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main Workout Exercises */}
              <div className="mb-5">
                <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
                  💪 Main Workout Exercises
                </h4>
                <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
                  {day.exercises.map((exercise, idx) => (
                    <div key={idx} className="py-3 first:pt-2.5 last:pb-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-white">
                          <span className="font-mono text-emerald-400 mr-1.5">
                            {idx + 1}.
                          </span>
                          {exercise.name}
                        </span>
                        <span className="text-xs font-mono tabular-nums text-emerald-300 whitespace-nowrap">
                          {exercise.sets} × {exercise.reps_or_duration}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>Rest: {exercise.rest}</span>
                        {exercise.notes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{exercise.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rest, Cool-down & Recovery Footer */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">😴 Rest:</span>
                <span>{day.rest_between_sets}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">🧘 Cool-down:</span>
                <span>{day.cooldown}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">💧 Recovery:</span>
                <span>{day.recovery}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};
