import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  Calendar,
  Scale,
  Activity,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { UserRecord } from '../types/fitbuddy';

interface ProgressDashboardProps {
  user: UserRecord | null;
  onAddProgressLog: (
    userId: string,
    entry: {
      date: string;
      weight_kg: number;
      workouts_completed: number;
      active_minutes: number;
      recovery_score: number;
      notes: string;
    }
  ) => Promise<void>;
  onNavigateResult: () => void;
  onNavigateHome: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  user,
  onAddProgressLog,
  onNavigateResult,
  onNavigateHome,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [weightKg, setWeightKg] = useState<number>(user?.weight || 75);
  const [workoutsCompleted, setWorkoutsCompleted] = useState<number>(
    user?.completed_days?.length || 4
  );
  const [activeMinutes, setActiveMinutes] = useState<number>(180);
  const [recoveryScore, setRecoveryScore] = useState<number>(8);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!user) {
    return (
      <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-10 text-center max-w-xl mx-auto my-12">
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          No Athlete Profile Loaded
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Generate a fitness plan or select a registered profile to track progress trends over
          time.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Go to Home Page
        </button>
      </div>
    );
  }

  const logs = user.progress_logs || [];
  const firstWeight = logs.length > 0 ? logs[0].weight_kg : user.weight;
  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : user.weight;
  const weightDelta = Math.round((latestWeight - firstWeight) * 10) / 10;
  const avgWorkouts =
    logs.length > 0
      ? (logs.reduce((acc, l) => acc + l.workouts_completed, 0) / logs.length).toFixed(1)
      : String(user.completed_days?.length || 0);

  // Compute SVG polyline coordinates for weight trend
  const chartWidth = 560;
  const chartHeight = 180;
  const padX = 40;
  const padY = 24;

  const weights = logs.length > 0 ? logs.map((l) => l.weight_kg) : [user.weight];
  const minW = Math.min(...weights) - 1.5;
  const maxW = Math.max(...weights) + 1.5;

  const weightPoints = logs.map((log, i) => {
    const x =
      logs.length === 1
        ? chartWidth / 2
        : padX + (i / (logs.length - 1)) * (chartWidth - padX * 2);
    const y =
      chartHeight -
      padY -
      ((log.weight_kg - minW) / Math.max(1, maxW - minW)) * (chartHeight - padY * 2);
    return { x, y, log };
  });

  const polylineStr = weightPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSavedNotice(false);
    try {
      await onAddProgressLog(user.user_id, {
        date,
        weight_kg: Number(weightKg),
        workouts_completed: Number(workoutsCompleted),
        active_minutes: Number(activeMinutes),
        recovery_score: Number(recoveryScore),
        notes: notes.trim() || 'Weekly progress check-in',
      });
      setNotes('');
      setSavedNotice(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-emerald-400 font-medium mb-1">
            Athlete Progress &amp; Biometric Telemetry · {user.name} ({user.user_id})
          </div>
          <h1 className="font-display text-3xl font-bold text-white">
            User Profile &amp; Progress Trends
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track longitudinal body weight, weekly workout consistency, active training minutes,
            and plan iterations over time.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateResult}
          className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#131B2A] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to 7-Day Plan
        </button>
      </div>

      {/* Progress Summary Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Current Fitness Goal</span>
          <div className="font-display text-xl font-bold text-white">{user.goal}</div>
          <div className="text-xs text-slate-400 mt-1">
            {user.intensity} Intensity · {user.experience}
          </div>
        </div>

        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Workout Consistency</span>
          <div className="font-mono tabular-nums text-xl font-bold text-emerald-400">
            {avgWorkouts} days / wk
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Target: {user.available_days} days/wk ({user.duration})
          </div>
        </div>

        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Body Weight Trend</span>
          <div className="font-mono tabular-nums text-xl font-bold text-white">
            {latestWeight} kg{' '}
            <span
              className={`text-xs font-normal ${
                weightDelta === 0
                  ? 'text-slate-400'
                  : weightDelta > 0
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              ({weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg)
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Baseline: {firstWeight} kg · {logs.length} check-ins
          </div>
        </div>

        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Plans &amp; AI Updates</span>
          <div className="font-mono tabular-nums text-xl font-bold text-white">
            {user.plans_generated_count || 1} Plans · {user.plan_updates_count || 0} Updates
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Last updated {new Date(user.updated_date).toLocaleDateString()}
          </div>
        </div>
      </section>

      {/* Visual Trend Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Body Weight Progression */}
        <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Body Weight Trend (kg)
              </h2>
              <p className="text-xs text-slate-400">
                Longitudinal weight trajectory across logged check-ins
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs text-emerald-400">
              Latest: {latestWeight} kg
            </span>
          </div>

          <div className="bg-[#0B0F17] border border-white/[0.06] rounded-xl p-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
              role="img"
              aria-label="Body weight trend line chart"
            >
              {/* Horizontal Guide Lines */}
              {[0.2, 0.5, 0.8].map((ratio, idx) => {
                const y = padY + ratio * (chartHeight - padY * 2);
                const val = (maxW - ratio * (maxW - minW)).toFixed(1);
                return (
                  <g key={idx}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartWidth - padX}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={6}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Line Path */}
              {weightPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  points={polylineStr}
                />
              )}

              {/* Data Nodes */}
              {weightPoints.map((pt, idx) => (
                <g key={pt.log.id || idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={5}
                    fill="#0B0F17"
                    stroke="#34d399"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {pt.log.weight_kg}kg
                  </text>
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {pt.log.date.slice(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Chart 2: Weekly Training Minutes & Workouts Completed */}
        <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Weekly Active Minutes &amp; Sessions
              </h2>
              <p className="text-xs text-slate-400">
                Completed workout sessions and total active training volume per week
              </p>
            </div>
            <span className="font-mono tabular-nums text-xs text-emerald-400">
              Goal: {user.available_days} sessions/wk
            </span>
          </div>

          <div className="bg-[#0B0F17] border border-white/[0.06] rounded-xl p-4 h-52 flex items-end justify-around gap-3">
            {logs.map((log, idx) => {
              const maxMins = Math.max(240, ...logs.map((l) => l.active_minutes || 120));
              const heightPct = Math.max(12, Math.round(((log.active_minutes || 60) / maxMins) * 100));
              return (
                <div
                  key={log.id || idx}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                >
                  <span className="font-mono tabular-nums text-[10px] text-emerald-300 mb-1">
                    {log.active_minutes}m
                  </span>
                  <div className="w-full max-w-[44px] bg-slate-800/70 rounded-t-lg overflow-hidden flex items-end h-28">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-emerald-400/85 hover:bg-emerald-300 transition-all rounded-t-lg"
                      title={`${log.date}: ${log.workouts_completed} workouts (${log.active_minutes} mins)`}
                    />
                  </div>
                  <span className="font-mono tabular-nums text-[10px] text-white mt-1.5">
                    {log.workouts_completed}d
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">
                    {log.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Log New Progress Check-In + Historical Table */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Check-in Form */}
        <div className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Log Progress Check-In
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Record a new weekly measurement to update your trend charts.
          </p>

          {savedNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Progress check-in recorded and trend charts updated!</span>
            </div>
          )}

          <form onSubmit={handleLogSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="log-date"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="log-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-lg text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="log-weight"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Weight (kg)
                </label>
                <input
                  id="log-weight"
                  type="number"
                  step="0.1"
                  min={25}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-lg text-xs font-mono tabular-nums text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="log-workouts"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Workouts (0-7)
                </label>
                <input
                  id="log-workouts"
                  type="number"
                  min={0}
                  max={7}
                  value={workoutsCompleted}
                  onChange={(e) => setWorkoutsCompleted(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-lg text-xs font-mono tabular-nums text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="log-minutes"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Active Mins
                </label>
                <input
                  id="log-minutes"
                  type="number"
                  min={0}
                  max={1000}
                  value={activeMinutes}
                  onChange={(e) => setActiveMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-lg text-xs font-mono tabular-nums text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="log-recovery"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Recovery (1-10)
                </label>
                <input
                  id="log-recovery"
                  type="number"
                  min={1}
                  max={10}
                  value={recoveryScore}
                  onChange={(e) => setRecoveryScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-lg text-xs font-mono tabular-nums text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="log-notes"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Training &amp; Recovery Notes
              </label>
              <input
                id="log-notes"
                type="text"
                placeholder="e.g., Increased squat reps, felt great energy..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-lg text-xs text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Save Progress Entry
            </button>
          </form>
        </div>

        {/* Chronological Progress Table */}
        <div className="lg:col-span-2 bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6 overflow-x-auto">
          <h2 className="font-display text-lg font-bold text-white mb-1">
            Longitudinal Check-In Log
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Complete history of weight, completed sessions, active minutes, and recovery scores.
          </p>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium text-right">Weight</th>
                <th className="py-2.5 px-3 font-medium text-right">Workouts</th>
                <th className="py-2.5 px-3 font-medium text-right">Active Mins</th>
                <th className="py-2.5 px-3 font-medium text-right">Recovery</th>
                <th className="py-2.5 pl-4 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {[...logs].reverse().map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-mono tabular-nums text-slate-200 whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-white font-semibold whitespace-nowrap">
                    {entry.weight_kg} kg
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-emerald-400 whitespace-nowrap">
                    {entry.workouts_completed} / 7
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-200 whitespace-nowrap">
                    {entry.active_minutes} min
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-right text-slate-200 whitespace-nowrap">
                    {entry.recovery_score}/10
                  </td>
                  <td className="py-3 pl-4 text-slate-300">{entry.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
