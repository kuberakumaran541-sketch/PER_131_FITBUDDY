import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  visible: boolean;
  mode: 'generate' | 'feedback';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, mode }) => {
  if (!visible) return null;

  const title =
    mode === 'generate'
      ? 'FitBuddy AI is creating your personalized plan…'
      : 'FitBuddy AI is updating your workout plan…';

  const subtitle =
    mode === 'generate'
      ? 'Structuring 7 days of warm-ups, target exercises, rest intervals, and goal-specific nutrition guidance with Google Gemini.'
      : 'Analyzing your feedback alongside your original 7-day plan and fitness profile to build an updated training schedule.';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B0F17]/85 backdrop-blur-sm flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-md w-full bg-[#131B2A] border border-white/[0.1] rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">{subtitle}</p>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-400 h-full w-2/3 rounded-full animate-pulse" />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Powered by Google Gemini · Please wait a few seconds
        </p>
      </div>
    </div>
  );
};
