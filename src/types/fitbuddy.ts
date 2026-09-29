export type FitnessGoal =
  | 'Weight Loss'
  | 'Muscle Gain'
  | 'General Wellness'
  | 'Strength'
  | 'Flexibility'
  | 'Endurance';

export type WorkoutIntensity = 'Low' | 'Medium' | 'High';

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type WorkoutDuration =
  | '20 minutes'
  | '30 minutes'
  | '45 minutes'
  | '60 minutes'
  | '90 minutes';

export interface UserProfileInput {
  user_id: string;
  name: string;
  age: number;
  weight: number;
  goal: FitnessGoal;
  intensity: WorkoutIntensity;
  experience: ExperienceLevel;
  available_days: number;
  duration: WorkoutDuration;
  preferences?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: string;
  reps_or_duration: string;
  rest: string;
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  title?: string;
  focus: string;
  is_rest_day?: boolean;
  warmup: string[];
  exercises: WorkoutExercise[];
  rest_between_sets: string;
  cooldown: string;
  recovery: string;
}

export interface NutritionDetails {
  title: string;
  summary: string;
  key_points: string[];
  hydration_target: string;
  recovery_advice: string;
}

export interface WorkoutPlanData {
  days: WorkoutDay[];
  motivational_message: string;
  safety_note: string;
  generated_at: string;
  version_label: string;
}

export interface FeedbackHistoryItem {
  id: string;
  feedback: string;
  updated_at: string;
  updated_plan: WorkoutPlanData;
}

export interface ProgressLogEntry {
  id: string;
  date: string;
  weight_kg: number;
  workouts_completed: number;
  active_minutes: number;
  recovery_score: number; // 1 - 10
  notes?: string;
}

export interface UserRecord {
  user_id: string;
  name: string;
  age: number;
  weight: number;
  goal: FitnessGoal;
  intensity: WorkoutIntensity;
  experience: ExperienceLevel;
  available_days: number;
  duration: WorkoutDuration;
  preferences: string;
  original_plan: WorkoutPlanData;
  updated_plan: WorkoutPlanData | null;
  feedback: string | null;
  feedback_history: FeedbackHistoryItem[];
  nutrition_tip: string;
  nutrition_details: NutritionDetails;
  motivational_message: string;
  completed_days: number[]; // e.g. [1, 2, 4]
  progress_logs: ProgressLogEntry[];
  plans_generated_count: number;
  plan_updates_count: number;
  created_date: string;
  updated_date: string;
}

export interface GenerateWorkoutResponse {
  user: UserRecord;
  user_profile: UserProfileInput;
  days: WorkoutDay[];
  nutrition_tip: string;
  nutrition_details: NutritionDetails;
  motivational_message: string;
}
