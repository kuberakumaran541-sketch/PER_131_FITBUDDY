import React, { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Clock,
  Calendar,
  User,
  Scale,
  Target,
  Award,
  Sliders,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import {
  ExperienceLevel,
  FitnessGoal,
  UserProfileInput,
  UserRecord,
  WorkoutDuration,
  WorkoutIntensity,
} from '../types/fitbuddy';
import heroImage from '../assets/images/hero_athletic_studio_1790682456188.jpg';

interface HomeProps {
  onGeneratePlan: (input: UserProfileInput) => Promise<void>;
  isLoading: boolean;
  existingUsers: UserRecord[];
  activeUser: UserRecord | null;
  onSelectExistingUser: (user: UserRecord) => void;
}

const GOALS: FitnessGoal[] = [
  'Weight Loss',
  'Muscle Gain',
  'General Wellness',
  'Strength',
  'Flexibility',
  'Endurance',
];

const INTENSITIES: WorkoutIntensity[] = ['Low', 'Medium', 'High'];
const EXPERIENCES: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS: WorkoutDuration[] = [
  '20 minutes',
  '30 minutes',
  '45 minutes',
  '60 minutes',
  '90 minutes',
];

const PRESET_PROFILES: { label: string; data: Omit<UserProfileInput, 'user_id'> }[] = [
  {
    label: 'Beginner Weight Loss (30m)',
    data: {
      name: 'Jordan Taylor',
      age: 31,
      weight: 74,
      goal: 'Weight Loss',
      intensity: 'Low',
      experience: 'Beginner',
      available_days: 4,
      duration: '30 minutes',
      preferences: 'Home workouts, low-impact exercises, no jumping',
    },
  },
  {
    label: 'Intermediate Muscle Gain (45m)',
    data: {
      name: 'Alex Rivera',
      age: 27,
      weight: 79,
      goal: 'Muscle Gain',
      intensity: 'Medium',
      experience: 'Intermediate',
      available_days: 5,
      duration: '45 minutes',
      preferences: 'Dumbbells and bench available, focus on upper body & core',
    },
  },
  {
    label: 'General Wellness & Mobility (30m)',
    data: {
      name: 'Samira Patel',
      age: 38,
      weight: 62,
      goal: 'General Wellness',
      intensity: 'Medium',
      experience: 'Beginner',
      available_days: 4,
      duration: '30 minutes',
      preferences: 'Desk worker, wants posture improvement, core strength, and yoga mobility',
    },
  },
];

export const Home: React.FC<HomeProps> = ({
  onGeneratePlan,
  isLoading,
  existingUsers,
  activeUser,
  onSelectExistingUser,
}) => {
  const [imgError, setImgError] = useState(false);
  const [formData, setFormData] = useState<UserProfileInput>({
    name: activeUser?.name || '',
    user_id: activeUser?.user_id || `USR-${Math.floor(104 + Math.random() * 890)}`,
    age: activeUser?.age || 28,
    weight: activeUser?.weight || 72,
    goal: activeUser?.goal || 'Muscle Gain',
    intensity: activeUser?.intensity || 'Medium',
    experience: activeUser?.experience || 'Intermediate',
    available_days: activeUser?.available_days || 4,
    duration: activeUser?.duration || '45 minutes',
    preferences: activeUser?.preferences || '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleApplyPreset = (preset: Omit<UserProfileInput, 'user_id'>) => {
    setValidationError(null);
    setFormData({
      ...preset,
      user_id: `USR-${Math.floor(104 + Math.random() * 890)}`,
    });
  };

  const handleRandomizeId = () => {
    setFormData((prev) => ({
      ...prev,
      user_id: `USR-${Math.floor(104 + Math.random() * 890)}`,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.name.trim()) {
      setValidationError('Please enter your Full Name.');
      return;
    }
    if (!formData.user_id.trim()) {
      setValidationError('Please enter a valid User ID.');
      return;
    }
    if (!Number.isFinite(Number(formData.age)) || formData.age < 12 || formData.age > 105) {
      setValidationError('Please enter a valid Age between 12 and 105 years.');
      return;
    }
    if (!Number.isFinite(Number(formData.weight)) || formData.weight < 25 || formData.weight > 300) {
      setValidationError('Please enter a valid Weight between 25 kg and 300 kg.');
      return;
    }
    if (formData.available_days < 1 || formData.available_days > 7) {
      setValidationError('Available Workout Days must be between 1 and 7 days.');
      return;
    }

    await onGeneratePlan({
      ...formData,
      name: formData.name.trim(),
      user_id: formData.user_id.trim(),
      age: Number(formData.age),
      weight: Number(formData.weight),
      available_days: Number(formData.available_days),
      preferences: formData.preferences?.trim() || '',
    });
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#131B2A]">
        <div className="absolute inset-0">
          {!imgError ? (
            <img
              src={heroImage}
              alt="Modern architectural strength and conditioning studio"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center opacity-45"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-[#131B2A] to-emerald-950/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/75 to-[#0B0F17]/35" />
        </div>

        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-16 lg:py-20 max-w-4xl">
          <div className="text-xs font-medium text-emerald-400 mb-3">
            FitBuddy · AI Fitness Plan Generator · Your AI-powered personal fitness companion
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.12] mb-4">
            Build Better Habits With AI
          </h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed mb-6">
            Get a personalized 7-day workout plan powered by Google Gemini. Tailored to your exact
            goals, experience level, schedule, and recovery needs—with adaptive feedback refinement.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
            <span>7-Day Structured Programming</span>
            <span aria-hidden="true">·</span>
            <span>Goal-Specific Nutrition &amp; Recovery</span>
            <span aria-hidden="true">·</span>
            <span>Adaptive AI Feedback Updates</span>
          </div>
        </div>
      </section>

      {/* Quick Load Existing Athlete Bar */}
      {existingUsers.length > 0 && (
        <section className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Registered Athlete Profiles ({existingUsers.length})
            </h2>
            <p className="text-xs text-slate-400">
              Select a saved user profile to view their 7-day plan, feedback history, or progress trends.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {existingUsers.slice(0, 4).map((u) => {
              const isCurrent = activeUser?.user_id === u.user_id;
              return (
                <button
                  key={u.user_id}
                  type="button"
                  onClick={() => onSelectExistingUser(u)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-[#182235] text-slate-200 hover:bg-slate-700/70 border border-white/[0.06]'
                  }`}
                >
                  <span>{u.name}</span>
                  <span className="font-mono opacity-75">({u.user_id})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Fitness Profile Form Card */}
      <section className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Create Your Personalized Fitness Profile
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Complete the parameters below so FitBuddy AI can engineer a safe, effective 7-day plan.
            </p>
          </div>

          {/* Preset Fillers */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Quick Fill:</span>
            {PRESET_PROFILES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset.data)}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#182235] hover:bg-slate-700/70 hover:text-white rounded-lg border border-white/[0.06] transition-colors whitespace-nowrap cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {validationError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-200 flex items-center gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Row 1: Identity & Biometrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label
                htmlFor="full-name"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="full-name"
                  type="text"
                  required
                  placeholder="e.g., Alex Mercer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="user-id" className="block text-xs font-medium text-slate-300">
                  User ID *
                </label>
                <button
                  type="button"
                  onClick={handleRandomizeId}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  New ID
                </button>
              </div>
              <input
                id="user-id"
                type="text"
                required
                placeholder="e.g., USR-104"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-xs font-medium text-slate-300 mb-2">
                Age (Years) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="age"
                  type="number"
                  min={12}
                  max={105}
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="weight" className="block text-xs font-medium text-slate-300 mb-2">
                Weight (kg) *
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="weight"
                  type="number"
                  step="0.5"
                  min={25}
                  max={300}
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Training Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="fitness-goal"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Fitness Goal *
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="fitness-goal"
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value as FitnessGoal })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="workout-intensity"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Workout Intensity *
              </label>
              <div className="relative">
                <Flame className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="workout-intensity"
                  value={formData.intensity}
                  onChange={(e) =>
                    setFormData({ ...formData, intensity: e.target.value as WorkoutIntensity })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  {INTENSITIES.map((intensity) => (
                    <option key={intensity} value={intensity}>
                      {intensity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="experience-level"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Experience Level *
              </label>
              <div className="relative">
                <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="experience-level"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value as ExperienceLevel })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  {EXPERIENCES.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 3: Schedule & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="available-days"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Available Workout Days (Per Week) *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((dayCount) => {
                  const selected = formData.available_days === dayCount;
                  return (
                    <button
                      key={dayCount}
                      type="button"
                      onClick={() => setFormData({ ...formData, available_days: dayCount })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-mono tabular-nums font-semibold transition-colors cursor-pointer ${
                        selected
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-[#0B0F17] text-slate-300 border border-white/[0.1] hover:border-slate-600'
                      }`}
                    >
                      {dayCount}d
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {formData.available_days} active training days + {7 - formData.available_days} structured recovery/mobility days.
              </p>
            </div>

            <div>
              <label
                htmlFor="workout-duration"
                className="block text-xs font-medium text-slate-300 mb-2"
              >
                Preferred Workout Duration *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="workout-duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value as WorkoutDuration })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 transition-colors"
                >
                  {DURATIONS.map((dur) => (
                    <option key={dur} value={dur}>
                      {dur}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Optional Fitness Preferences */}
          <div>
            <label
              htmlFor="fitness-preferences"
              className="block text-xs font-medium text-slate-300 mb-2"
            >
              Optional Fitness Preferences (Equipment, Joint Considerations, Favorite Exercises)
            </label>
            <div className="relative">
              <Sliders className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <textarea
                id="fitness-preferences"
                rows={3}
                placeholder="Example: Home workouts with dumbbells and resistance bands, avoid high-impact jumping, include core stability..."
                value={formData.preferences || ''}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Safety-First Disclaimer & Submit CTA */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/[0.08]">
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              FitBuddy provides general fitness and wellness information and is not a substitute for
              professional medical advice. Consult a qualified healthcare or fitness professional
              when needed.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-display font-bold text-base rounded-xl transition-colors flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer"
            >
              <Dumbbell className="w-5 h-5" />
              Generate My Fitness Plan
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
