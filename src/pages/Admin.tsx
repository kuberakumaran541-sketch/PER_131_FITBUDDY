import React, { useMemo, useState } from 'react';
import {
  Search,
  Trash2,
  Eye,
  FileText,
  RefreshCw,
  MessageSquare,
  X,
  ArrowUpRight,
} from 'lucide-react';
import {
  ExperienceLevel,
  FitnessGoal,
  UserRecord,
  WorkoutIntensity,
} from '../types/fitbuddy';
import { WorkoutDayGrid } from '../components/WorkoutDayGrid';

interface AdminProps {
  users: UserRecord[];
  onDeleteUser: (userId: string) => Promise<void>;
  onSelectActiveUser: (user: UserRecord) => void;
  onRefreshUsers: () => Promise<void>;
}

type InspectMode = 'profile' | 'original' | 'updated' | 'feedback';

export const Admin: React.FC<AdminProps> = ({
  users,
  onDeleteUser,
  onSelectActiveUser,
  onRefreshUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('All');
  const [intensityFilter, setIntensityFilter] = useState<string>('All');
  const [experienceFilter, setExperienceFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Oldest' | 'Goal'>('Newest');

  const [inspectedUser, setInspectedUser] = useState<UserRecord | null>(null);
  const [inspectMode, setInspectMode] = useState<InspectMode>('profile');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Dashboard Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalPlansGenerated = users.reduce(
      (sum, u) => sum + (u.plans_generated_count || 1),
      0
    );
    const updatedPlans = users.filter((u) => Boolean(u.updated_plan)).length;
    const activeUsers = users.filter((u) => (u.completed_days?.length || 0) > 0).length;
    return {
      totalUsers,
      totalPlansGenerated,
      updatedPlans,
      activeUsers,
    };
  }, [users]);

  // Search, Filter & Sort Logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const q = searchQuery.trim().toLowerCase();
        if (q) {
          const matchesName = u.name.toLowerCase().includes(q);
          const matchesId = u.user_id.toLowerCase().includes(q);
          if (!matchesName && !matchesId) return false;
        }
        if (goalFilter !== 'All' && u.goal !== goalFilter) return false;
        if (intensityFilter !== 'All' && u.intensity !== intensityFilter) return false;
        if (experienceFilter !== 'All' && u.experience !== experienceFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Newest') {
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        }
        if (sortBy === 'Oldest') {
          return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
        }
        return a.goal.localeCompare(b.goal);
      });
  }, [users, searchQuery, goalFilter, intensityFilter, experienceFilter, sortBy]);

  const openInspector = (user: UserRecord, mode: InspectMode) => {
    setInspectedUser(user);
    setInspectMode(mode);
  };

  const handleConfirmDelete = async (userId: string) => {
    await onDeleteUser(userId);
    setConfirmDeleteId(null);
    if (inspectedUser?.user_id === userId) {
      setInspectedUser(null);
    }
  };

  const goals: FitnessGoal[] = [
    'Weight Loss',
    'Muscle Gain',
    'General Wellness',
    'Strength',
    'Flexibility',
    'Endurance',
  ];
  const intensities: WorkoutIntensity[] = ['Low', 'Medium', 'High'];
  const experiences: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-emerald-400 font-medium mb-1">
            Coach &amp; System Oversight
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor registered users, inspect original and AI-updated 7-day plans, review athlete
            feedback, and manage records.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshUsers}
          className="px-4 py-2 text-xs font-medium text-slate-200 bg-[#131B2A] hover:bg-slate-800 border border-white/[0.1] rounded-lg transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          Refresh Records
        </button>
      </div>

      {/* Dashboard Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Total Users</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-white">
            {stats.totalUsers}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Registered profiles</span>
        </div>

        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Total Plans Generated</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-400">
            {stats.totalPlansGenerated}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">7-day AI workout plans</span>
        </div>

        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Updated Plans</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-white">
            {stats.updatedPlans}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Refined with user feedback</span>
        </div>

        <div className="bg-[#131B2A] border border-white/[0.08] rounded-xl p-5">
          <span className="text-xs text-slate-400 block mb-1">Active Users</span>
          <div className="font-mono tabular-nums text-2xl font-bold text-emerald-400">
            {stats.activeUsers}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Logging completed workouts</span>
        </div>
      </section>

      {/* Search, Filter & Sort Controls */}
      <section className="bg-[#131B2A] border border-white/[0.08] rounded-2xl p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search by Name or User ID */}
          <div className="lg:col-span-2">
            <label htmlFor="admin-search" className="block text-xs text-slate-400 mb-1.5">
              Search by Name or User ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name (e.g. Marcus) or ID (e.g. USR-101)..."
                className="w-full pl-10 pr-4 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Filter by Fitness Goal */}
          <div>
            <label htmlFor="filter-goal" className="block text-xs text-slate-400 mb-1.5">
              Filter by Goal
            </label>
            <select
              id="filter-goal"
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="All">All Goals</option>
              {goals.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Workout Intensity */}
          <div>
            <label htmlFor="filter-intensity" className="block text-xs text-slate-400 mb-1.5">
              Filter by Intensity
            </label>
            <select
              id="filter-intensity"
              value={intensityFilter}
              onChange={(e) => setIntensityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="All">All Intensities</option>
              {intensities.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Experience & Sort By */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="filter-experience" className="block text-xs text-slate-400 mb-1.5">
                Experience
              </label>
              <select
                id="filter-experience"
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="All">All</option>
                {experiences.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sort-by" className="block text-xs text-slate-400 mb-1.5">
                Sort By
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'Newest' | 'Oldest' | 'Goal')}
                className="w-full px-2.5 py-2 bg-[#0B0F17] border border-white/[0.1] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Goal">Goal</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Registered Users Table */}
      <section className="bg-[#131B2A] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            Registered Users ({filteredUsers.length})
          </h2>
          {(searchQuery ||
            goalFilter !== 'All' ||
            intensityFilter !== 'All' ||
            experienceFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setGoalFilter('All');
                setIntensityFilter('All');
                setExperienceFilter('All');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs text-slate-400 bg-[#0B0F17]/40">
                <th className="py-3.5 px-4 font-medium">User ID</th>
                <th className="py-3.5 px-4 font-medium">Name</th>
                <th className="py-3.5 px-3 font-medium text-right">Age</th>
                <th className="py-3.5 px-3 font-medium text-right">Weight</th>
                <th className="py-3.5 px-4 font-medium">Goal</th>
                <th className="py-3.5 px-4 font-medium">Intensity</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-400">
                    No matching user records found. Try adjusting your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const hasUpdated = Boolean(u.updated_plan);
                  return (
                    <tr key={u.user_id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                        {u.user_id}
                      </td>
                      <td className="py-3.5 px-4 text-white font-medium whitespace-nowrap">
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {u.experience} · {u.duration}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-right text-slate-200 whitespace-nowrap">
                        {u.age}
                      </td>
                      <td className="py-3.5 px-3 font-mono tabular-nums text-right text-slate-200 whitespace-nowrap">
                        {u.weight} kg
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 whitespace-nowrap">{u.goal}</td>
                      <td className="py-3.5 px-4 text-slate-200 whitespace-nowrap">
                        {u.intensity}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            hasUpdated ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {hasUpdated ? 'Updated Plan Active' : 'Original Plan Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => openInspector(u, 'profile')}
                            className="px-2.5 py-1.5 bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-white/[0.08] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View User Profile"
                          >
                            <Eye className="w-3 h-3 text-emerald-400" />
                            View Profile
                          </button>

                          <button
                            type="button"
                            onClick={() => openInspector(u, 'original')}
                            className="px-2.5 py-1.5 bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-white/[0.08] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Original Plan"
                          >
                            <FileText className="w-3 h-3 text-slate-300" />
                            Original Plan
                          </button>

                          <button
                            type="button"
                            onClick={() => openInspector(u, 'updated')}
                            className="px-2.5 py-1.5 bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-white/[0.08] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Updated Plan"
                          >
                            <FileText className="w-3 h-3 text-emerald-400" />
                            Updated Plan
                          </button>

                          <button
                            type="button"
                            onClick={() => openInspector(u, 'feedback')}
                            className="px-2.5 py-1.5 bg-[#0B0F17] hover:bg-slate-800 text-slate-200 border border-white/[0.08] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="View Feedback"
                          >
                            <MessageSquare className="w-3 h-3 text-amber-300" />
                            Feedback
                          </button>

                          {confirmDeleteId === u.user_id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleConfirmDelete(u.user_id)}
                                className="px-2.5 py-1.5 bg-red-500 text-white font-semibold rounded-lg text-xs cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(u.user_id)}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inspector Modal / Panel for View Profile, View Original Plan, View Updated Plan, View Feedback */}
      {inspectedUser && (
        <section className="bg-[#131B2A] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div>
              <div className="text-xs font-mono text-emerald-400">
                INSPECTING ATHLETE RECORD · {inspectedUser.user_id}
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                {inspectedUser.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-[#0B0F17] border border-white/[0.08] rounded-xl">
                {(
                  [
                    { id: 'profile', label: 'Profile' },
                    { id: 'original', label: 'Original Plan' },
                    { id: 'updated', label: 'Updated Plan' },
                    { id: 'feedback', label: 'Feedback' },
                  ] as { id: InspectMode; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInspectMode(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      inspectMode === tab.id
                        ? 'bg-emerald-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onSelectActiveUser(inspectedUser)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors inline-flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                Open in Workspace
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="p-2 text-slate-400 hover:text-white bg-[#0B0F17] rounded-lg border border-white/[0.08] cursor-pointer"
                aria-label="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode 1: View Profile */}
          {inspectMode === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0B0F17] border border-white/[0.06] rounded-xl p-5 text-sm">
                <div>
                  <span className="block text-xs text-slate-400">Full Name</span>
                  <span className="font-semibold text-white">{inspectedUser.name}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">User ID</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {inspectedUser.user_id}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Age / Weight</span>
                  <span className="font-mono tabular-nums text-white">
                    {inspectedUser.age} yrs · {inspectedUser.weight} kg
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Goal &amp; Intensity</span>
                  <span className="font-semibold text-white">
                    {inspectedUser.goal} ({inspectedUser.intensity})
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Experience Level</span>
                  <span className="text-white">{inspectedUser.experience}</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Schedule</span>
                  <span className="text-white">
                    {inspectedUser.available_days} days/wk · {inspectedUser.duration}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Created Date</span>
                  <span className="font-mono text-xs text-slate-300">
                    {new Date(inspectedUser.created_date).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400">Updated Date</span>
                  <span className="font-mono text-xs text-slate-300">
                    {new Date(inspectedUser.updated_date).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#0B0F17] border border-white/[0.06] rounded-xl p-5">
                <h4 className="text-xs font-semibold text-emerald-400 mb-1">
                  💡 AI Nutrition &amp; Recovery Tip
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {inspectedUser.nutrition_tip}
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: View Original Plan */}
          {inspectMode === 'original' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Original Plan generated on{' '}
                <span className="font-mono text-white">
                  {new Date(inspectedUser.original_plan.generated_at).toLocaleString()}
                </span>
              </div>
              <WorkoutDayGrid
                days={inspectedUser.original_plan.days}
                durationLabel={inspectedUser.duration}
              />
            </div>
          )}

          {/* Mode 3: View Updated Plan */}
          {inspectMode === 'updated' && (
            <div className="space-y-4">
              {inspectedUser.updated_plan ? (
                <>
                  <div className="bg-[#0B0F17] border border-emerald-500/30 rounded-xl p-4 text-xs text-slate-200">
                    <span className="text-emerald-400 font-semibold">Latest Feedback:</span> “
                    {inspectedUser.feedback}” · Updated{' '}
                    {new Date(inspectedUser.updated_plan.generated_at).toLocaleString()}
                  </div>
                  <WorkoutDayGrid
                    days={inspectedUser.updated_plan.days}
                    durationLabel={inspectedUser.duration}
                  />
                </>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400 bg-[#0B0F17] rounded-xl border border-white/[0.06]">
                  This user has not submitted feedback for an updated plan yet.
                </div>
              )}
            </div>
          )}

          {/* Mode 4: View Feedback */}
          {inspectMode === 'feedback' && (
            <div className="space-y-4">
              {inspectedUser.feedback_history && inspectedUser.feedback_history.length > 0 ? (
                inspectedUser.feedback_history.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0B0F17] border border-white/[0.08] rounded-xl p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-emerald-400">
                        {item.updated_plan.version_label}
                      </span>
                      <span className="font-mono">
                        {new Date(item.updated_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium">
                      Feedback: “{item.feedback}”
                    </p>
                  </div>
                ))
              ) : inspectedUser.feedback ? (
                <div className="bg-[#0B0F17] border border-white/[0.08] rounded-xl p-5">
                  <p className="text-sm text-white">“{inspectedUser.feedback}”</p>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-400 bg-[#0B0F17] rounded-xl border border-white/[0.06]">
                  No feedback entries submitted for {inspectedUser.name}.
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
