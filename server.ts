import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/server/database.js';
import {
  generateNutritionTip,
  generateWorkoutPlan,
  updateWorkoutPlan,
} from './src/server/gemini_service.js';
import {
  ExperienceLevel,
  FitnessGoal,
  ProgressLogEntry,
  UserProfileInput,
  UserRecord,
  WorkoutDuration,
  WorkoutIntensity,
} from './src/types/fitbuddy.js';

const PORT = 3000;

const VALID_GOALS: FitnessGoal[] = [
  'Weight Loss',
  'Muscle Gain',
  'General Wellness',
  'Strength',
  'Flexibility',
  'Endurance',
];
const VALID_INTENSITIES: WorkoutIntensity[] = ['Low', 'Medium', 'High'];
const VALID_EXPERIENCES: ExperienceLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
const VALID_DURATIONS: WorkoutDuration[] = [
  '20 minutes',
  '30 minutes',
  '45 minutes',
  '60 minutes',
  '90 minutes',
];

function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

async function handleGenerateWorkout(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const name = sanitizeString(body.name, 100);
    const user_id = sanitizeString(body.user_id, 50);
    const age = Number(body.age);
    const weight = Number(body.weight);
    const goal = body.goal as FitnessGoal;
    const intensity = body.intensity as WorkoutIntensity;
    const experience = body.experience as ExperienceLevel;
    const available_days = Number(body.available_days ?? 4);
    const duration = body.duration as WorkoutDuration;
    const preferences = sanitizeString(body.preferences, 400);

    if (!name) {
      res.status(400).json({ error: 'Please enter your Full Name.' });
      return;
    }
    if (!user_id) {
      res.status(400).json({ error: 'Please provide a valid User ID.' });
      return;
    }
    if (!Number.isFinite(age) || age < 12 || age > 105) {
      res.status(400).json({ error: 'Please enter a valid age between 12 and 105.' });
      return;
    }
    if (!Number.isFinite(weight) || weight < 25 || weight > 300) {
      res.status(400).json({ error: 'Please enter a valid weight between 25 kg and 300 kg.' });
      return;
    }
    if (!VALID_GOALS.includes(goal)) {
      res.status(400).json({ error: 'Please select a valid Fitness Goal.' });
      return;
    }
    if (!VALID_INTENSITIES.includes(intensity)) {
      res.status(400).json({ error: 'Please select a valid Workout Intensity.' });
      return;
    }
    if (!VALID_EXPERIENCES.includes(experience)) {
      res.status(400).json({ error: 'Please select a valid Experience Level.' });
      return;
    }
    if (!Number.isFinite(available_days) || available_days < 1 || available_days > 7) {
      res.status(400).json({ error: 'Available Workout Days must be between 1 and 7.' });
      return;
    }
    if (!VALID_DURATIONS.includes(duration)) {
      res.status(400).json({ error: 'Please select a valid Workout Duration.' });
      return;
    }

    const profile: UserProfileInput = {
      user_id,
      name,
      age: Math.round(age),
      weight: Math.round(weight * 10) / 10,
      goal,
      intensity,
      experience,
      available_days: Math.round(available_days),
      duration,
      preferences,
    };

    const [workoutPlan, nutritionResult] = await Promise.all([
      generateWorkoutPlan(profile),
      generateNutritionTip(profile),
    ]);

    const existingUser = dbService.getUserById(user_id);
    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    const initialLog: ProgressLogEntry = {
      id: `LOG-${Date.now()}`,
      date: todayDate,
      weight_kg: profile.weight,
      workouts_completed: existingUser ? existingUser.completed_days.length : 0,
      active_minutes: 0,
      recovery_score: 8,
      notes: `Generated ${profile.goal} plan (${profile.intensity} intensity, ${profile.duration})`,
    };

    const record: UserRecord = {
      user_id: profile.user_id,
      name: profile.name,
      age: profile.age,
      weight: profile.weight,
      goal: profile.goal,
      intensity: profile.intensity,
      experience: profile.experience,
      available_days: profile.available_days,
      duration: profile.duration,
      preferences: profile.preferences || '',
      original_plan: workoutPlan,
      updated_plan: existingUser?.updated_plan || null,
      feedback: existingUser?.feedback || null,
      feedback_history: existingUser?.feedback_history || [],
      nutrition_tip: nutritionResult.nutrition_tip,
      nutrition_details: nutritionResult.nutrition_details,
      motivational_message: workoutPlan.motivational_message,
      completed_days: existingUser?.completed_days || [],
      progress_logs: existingUser?.progress_logs?.length
        ? [...existingUser.progress_logs, initialLog]
        : [initialLog],
      plans_generated_count: (existingUser?.plans_generated_count || 0) + 1,
      plan_updates_count: existingUser?.plan_updates_count || 0,
      created_date: existingUser?.created_date || nowIso,
      updated_date: nowIso,
    };

    // If user explicitly regenerates a fresh plan, reset updated_plan so the new original plan is primary,
    // while keeping previous feedback history intact
    if (body.reset_updates === true) {
      record.updated_plan = null;
      record.feedback = null;
      record.completed_days = [];
    }

    dbService.upsertUser(record);

    res.json({
      user: record,
      user_profile: profile,
      days: workoutPlan.days,
      nutrition_tip: nutritionResult.nutrition_tip,
      nutrition_details: nutritionResult.nutrition_details,
      motivational_message: workoutPlan.motivational_message,
    });
  } catch (error) {
    console.error('Error in /generate-workout:', error);
    res.status(500).json({
      error: 'Something went wrong while generating your plan. Please try again.',
    });
  }
}

async function handleSubmitFeedback(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const user_id = sanitizeString(body.user_id, 50);
    const feedback = sanitizeString(body.feedback, 800);

    if (!user_id) {
      res.status(400).json({ error: 'Missing User ID. Please select or generate a plan first.' });
      return;
    }
    if (!feedback || feedback.length < 3) {
      res.status(400).json({
        error: 'Please enter specific feedback (e.g., "Add yoga on Day 3" or "Include more cardio").',
      });
      return;
    }

    const existingUser = dbService.getUserById(user_id);
    if (!existingUser) {
      res.status(404).json({
        error: 'User profile and original workout plan not found. Please generate a plan first.',
      });
      return;
    }

    const profile: UserProfileInput = {
      user_id: existingUser.user_id,
      name: existingUser.name,
      age: existingUser.age,
      weight: existingUser.weight,
      goal: existingUser.goal,
      intensity: existingUser.intensity,
      experience: existingUser.experience,
      available_days: existingUser.available_days,
      duration: existingUser.duration,
      preferences: existingUser.preferences,
    };

    const nextUpdateCount = (existingUser.plan_updates_count || 0) + 1;
    // Always preserve existingUser.original_plan and pass the current active plan or original plan to Gemini
    const basePlanToModify = existingUser.updated_plan || existingUser.original_plan;

    const updatedPlan = await updateWorkoutPlan(
      profile,
      basePlanToModify,
      feedback,
      nextUpdateCount
    );

    const nowIso = new Date().toISOString();
    const feedbackItem = {
      id: `FB-${Date.now()}`,
      feedback,
      updated_at: nowIso,
      updated_plan: updatedPlan,
    };

    const updatedRecord: UserRecord = {
      ...existingUser,
      // DO NOT overwrite original_plan
      original_plan: existingUser.original_plan,
      updated_plan: updatedPlan,
      feedback,
      feedback_history: [feedbackItem, ...(existingUser.feedback_history || [])],
      motivational_message: updatedPlan.motivational_message || existingUser.motivational_message,
      plan_updates_count: nextUpdateCount,
      updated_date: nowIso,
    };

    dbService.upsertUser(updatedRecord);

    res.json({
      user: updatedRecord,
      user_profile: profile,
      days: updatedPlan.days,
      nutrition_tip: updatedRecord.nutrition_tip,
      nutrition_details: updatedRecord.nutrition_details,
      motivational_message: updatedRecord.motivational_message,
    });
  } catch (error) {
    console.error('Error in /submit-feedback:', error);
    res.status(500).json({
      error: 'Something went wrong while updating your workout plan. Please try again.',
    });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Core API routes (accessible both with and without /api prefix to honor FastAPI & Vite conventions)
  app.post(['/api/generate-workout', '/generate-workout'], handleGenerateWorkout);
  app.post(['/api/submit-feedback', '/submit-feedback'], handleSubmitFeedback);

  app.get(['/api/users', '/users', '/view-all-users', '/api/view-all-users'], (_req, res) => {
    try {
      const users = dbService.getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Unable to load users from database.' });
    }
  });

  app.get(['/api/users/:user_id', '/users/:user_id'], (req, res) => {
    try {
      const user = dbService.getUserById(req.params.user_id);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      res.json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Unable to retrieve user details.' });
    }
  });

  app.delete(['/api/users/:user_id', '/users/:user_id'], (req, res) => {
    try {
      const deleted = dbService.deleteUser(req.params.user_id);
      if (!deleted) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      res.json({ success: true, deleted_user_id: req.params.user_id });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Unable to delete user record.' });
    }
  });

  // Toggle completed day for consistency tracking
  app.post('/api/users/:user_id/toggle-day', (req, res) => {
    try {
      const user = dbService.getUserById(req.params.user_id);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      const dayNumber = Number(req.body?.day);
      if (!Number.isFinite(dayNumber) || dayNumber < 1 || dayNumber > 7) {
        res.status(400).json({ error: 'Invalid day number.' });
        return;
      }
      const exists = user.completed_days.includes(dayNumber);
      const completed_days = exists
        ? user.completed_days.filter((d) => d !== dayNumber)
        : [...user.completed_days, dayNumber].sort((a, b) => a - b);

      const updated: UserRecord = {
        ...user,
        completed_days,
        updated_date: new Date().toISOString(),
      };
      dbService.upsertUser(updated);
      res.json({ user: updated });
    } catch (error) {
      console.error('Error toggling completed day:', error);
      res.status(500).json({ error: 'Unable to update workout completion status.' });
    }
  });

  // Log a progress check-in for User Profile Progress Trends
  app.post('/api/users/:user_id/progress', (req, res) => {
    try {
      const user = dbService.getUserById(req.params.user_id);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      const weight_kg = Number(req.body?.weight_kg);
      const workouts_completed = Number(req.body?.workouts_completed ?? user.completed_days.length);
      const active_minutes = Number(req.body?.active_minutes ?? 150);
      const recovery_score = Number(req.body?.recovery_score ?? 8);
      const date = sanitizeString(req.body?.date, 20) || new Date().toISOString().split('T')[0];
      const notes = sanitizeString(req.body?.notes, 300);

      if (!Number.isFinite(weight_kg) || weight_kg < 25 || weight_kg > 300) {
        res.status(400).json({ error: 'Please enter a valid weight between 25 and 300 kg.' });
        return;
      }

      const newLog: ProgressLogEntry = {
        id: `LOG-${Date.now()}`,
        date,
        weight_kg: Math.round(weight_kg * 10) / 10,
        workouts_completed: Math.min(7, Math.max(0, Math.round(workouts_completed))),
        active_minutes: Math.max(0, Math.round(active_minutes)),
        recovery_score: Math.min(10, Math.max(1, Math.round(recovery_score))),
        notes,
      };

      const updated: UserRecord = {
        ...user,
        weight: newLog.weight_kg,
        progress_logs: [...(user.progress_logs || []), newLog].sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
        updated_date: new Date().toISOString(),
      };
      dbService.upsertUser(updated);
      res.json({ user: updated });
    } catch (error) {
      console.error('Error adding progress check-in:', error);
      res.status(500).json({ error: 'Unable to save progress check-in.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
