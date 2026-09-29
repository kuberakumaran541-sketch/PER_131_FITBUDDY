import fs from 'fs';
import path from 'path';
import { UserRecord, WorkoutPlanData, NutritionDetails } from '../types/fitbuddy.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fitbuddy_db.json');

interface DatabaseSchema {
  users: Record<string, UserRecord>;
}

const SEED_ORIGINAL_PLAN_1: WorkoutPlanData = {
  version_label: 'Original Plan v1.0',
  generated_at: '2026-09-22T09:15:00.000Z',
  motivational_message:
    'Strength is built one controlled rep at a time. Focus on progressive overload and clean movement patterns this week.',
  safety_note:
    'FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice. Always warm up joints thoroughly before loading.',
  days: [
    {
      day: 1,
      focus: 'Upper Body Push & Core Stability',
      is_rest_day: false,
      warmup: [
        '5 minutes rowing machine or brisk incline walk',
        'Arm circles, scapular push-ups, and thoracic rotations (3 minutes)',
      ],
      exercises: [
        {
          name: 'Dumbbell Bench Press',
          sets: '4 sets',
          reps_or_duration: '10 reps',
          rest: '75 seconds',
          notes: 'Lower dumbbells with a 2-second tempo to chest level',
        },
        {
          name: 'Seated Overhead Shoulder Press',
          sets: '3 sets',
          reps_or_duration: '10 reps',
          rest: '60 seconds',
          notes: 'Brace core to avoid arching lower back',
        },
        {
          name: 'Incline Push-ups',
          sets: '3 sets',
          reps_or_duration: '12 reps',
          rest: '60 seconds',
          notes: 'Full range of motion, elbows at 45 degrees',
        },
        {
          name: 'Forearm Plank Hold',
          sets: '3 sets',
          reps_or_duration: '45 seconds',
          rest: '45 seconds',
          notes: 'Maintain neutral spine and steady breathing',
        },
      ],
      rest_between_sets: '60–75 seconds between sets',
      cooldown: '5 minutes doorway chest stretch, overhead triceps stretch, and deep nasal breathing',
      recovery: 'Consume 25–35g protein within 90 minutes post-session and aim for 8 hours of sleep.',
    },
    {
      day: 2,
      focus: 'Lower Body Strength & Glute Activation',
      is_rest_day: false,
      warmup: [
        '5 minutes stationary bike at light cadence',
        'Bodyweight glute bridges, leg swings, and deep squat holds (4 minutes)',
      ],
      exercises: [
        {
          name: 'Goblet Squats',
          sets: '4 sets',
          reps_or_duration: '12 reps',
          rest: '75 seconds',
          notes: 'Drive through mid-foot and keep chest tall',
        },
        {
          name: 'Romanian Deadlifts (Dumbbell)',
          sets: '3 sets',
          reps_or_duration: '10 reps',
          rest: '75 seconds',
          notes: 'Hinge at hips until hamstring stretch is felt',
        },
        {
          name: 'Reverse Walking Lunges',
          sets: '3 sets',
          reps_or_duration: '10 reps per leg',
          rest: '60 seconds',
          notes: 'Keep front knee stable over ankle',
        },
        {
          name: 'Standing Calf Raises',
          sets: '3 sets',
          reps_or_duration: '15 reps',
          rest: '45 seconds',
          notes: '1-second pause at peak contraction',
        },
      ],
      rest_between_sets: '60–75 seconds between sets',
      cooldown: '5 minutes supine hamstring stretch, figure-four hip stretch, and quad stretch',
      recovery: 'Elevate legs for 10 minutes in the evening and replenish electrolytes.',
    },
    {
      day: 3,
      focus: 'Active Recovery & Mobility Flow',
      is_rest_day: true,
      warmup: ['5 minutes easy outdoor walk', 'Gentle neck and shoulder rolls'],
      exercises: [
        {
          name: 'Cat-Cow Spinal Flow',
          sets: '2 sets',
          reps_or_duration: '60 seconds',
          rest: '30 seconds',
          notes: 'Sync movement with slow inhalation and exhalation',
        },
        {
          name: 'World’s Greatest Stretch',
          sets: '2 sets',
          reps_or_duration: '6 reps per side',
          rest: '30 seconds',
          notes: 'Open thoracic spine smoothly at the top',
        },
        {
          name: '90/90 Hip Switches',
          sets: '2 sets',
          reps_or_duration: '10 reps',
          rest: '30 seconds',
          notes: 'Keep torso upright throughout rotation',
        },
      ],
      rest_between_sets: '30 seconds between mobility sets',
      cooldown: '5 minutes box breathing and foam rolling thoracic spine',
      recovery: 'Prioritize hydration (2.8L water) and light non-exercise movement.',
    },
    {
      day: 4,
      focus: 'Upper Body Pull & Posterior Chain',
      is_rest_day: false,
      warmup: [
        '5 minutes brisk walking or light ergometer',
        'Band pull-aparts and scapular retractions (4 minutes)',
      ],
      exercises: [
        {
          name: 'Single-Arm Dumbbell Rows',
          sets: '4 sets',
          reps_or_duration: '10 reps per arm',
          rest: '60 seconds',
          notes: 'Pull elbow toward hip pocket, pause briefly at top',
        },
        {
          name: 'Lat Pulldowns or Assisted Pull-ups',
          sets: '3 sets',
          reps_or_duration: '10 reps',
          rest: '75 seconds',
          notes: 'Depress shoulders before initiating pull',
        },
        {
          name: 'Face Pulls or Rear Delt Flyes',
          sets: '3 sets',
          reps_or_duration: '15 reps',
          rest: '45 seconds',
          notes: 'Focus on upper back posture and external rotation',
        },
        {
          name: 'Dumbbell Hammer Curls',
          sets: '3 sets',
          reps_or_duration: '12 reps',
          rest: '45 seconds',
          notes: 'Avoid swinging torso',
        },
      ],
      rest_between_sets: '60 seconds between sets',
      cooldown: '5 minutes lat stretch on rack and upper trapezius release',
      recovery: 'Magnesium-rich dinner (leafy greens, salmon, or pumpkin seeds) for muscle relaxation.',
    },
    {
      day: 5,
      focus: 'Full Body Hypertrophy & Conditioning',
      is_rest_day: false,
      warmup: [
        '5 minutes light jog or cycling',
        'Inchworms, hip openers, and bodyweight squats (4 minutes)',
      ],
      exercises: [
        {
          name: 'Dumbbell Thrusters',
          sets: '3 sets',
          reps_or_duration: '10 reps',
          rest: '75 seconds',
          notes: 'Use leg drive to press dumbbells smoothly overhead',
        },
        {
          name: 'Renegade Rows (or Plank Shoulder Taps)',
          sets: '3 sets',
          reps_or_duration: '10 reps total',
          rest: '60 seconds',
          notes: 'Widen stance to prevent hip rocking',
        },
        {
          name: 'Bulgarian Split Squats',
          sets: '3 sets',
          reps_or_duration: '10 reps per leg',
          rest: '60 seconds',
          notes: 'Slight forward torso lean for glute recruitment',
        },
        {
          name: 'Dead Bug Core Series',
          sets: '3 sets',
          reps_or_duration: '12 reps total',
          rest: '45 seconds',
          notes: 'Keep lower back pressed gently into floor',
        },
      ],
      rest_between_sets: '60–75 seconds between sets',
      cooldown: '5 minutes full-body static stretching and child’s pose',
      recovery: 'Contrast shower or 15-minute gentle walk after dinner.',
    },
    {
      day: 6,
      focus: 'Cardio Conditioning & Core Endurance',
      is_rest_day: false,
      warmup: ['5 minutes easy pace cycling or brisk walk', 'Dynamic high knees and butt kicks'],
      exercises: [
        {
          name: 'Low-Impact Interval Cycling or Rowing',
          sets: '6 intervals',
          reps_or_duration: '60 seconds moderate-high / 60 seconds easy',
          rest: '60 seconds',
          notes: 'Maintain conversational-to-challenging pace (RPE 7/10)',
        },
        {
          name: 'Side Plank Holds',
          sets: '3 sets',
          reps_or_duration: '30 seconds per side',
          rest: '45 seconds',
          notes: 'Stack hips and shoulders vertically',
        },
        {
          name: 'Farmer’s Carry',
          sets: '3 sets',
          reps_or_duration: '40 meters',
          rest: '60 seconds',
          notes: 'Tall posture, braced core, controlled steps',
        },
      ],
      rest_between_sets: '60 seconds between exercises',
      cooldown: '5 minutes slow walking to bring heart rate below 100 BPM + calf stretches',
      recovery: 'Replenish glycogen with complex carbohydrates (oats, sweet potato, or quinoa).',
    },
    {
      day: 7,
      focus: 'Complete Rest & Nervous System Restoration',
      is_rest_day: true,
      warmup: ['5 minutes morning sun walk'],
      exercises: [
        {
          name: 'Gentle Full-Body Stretching or Leisure Walk',
          sets: '1 session',
          reps_or_duration: '20 minutes',
          rest: 'As needed',
          notes: 'Zero muscular strain; focus on joint decompression',
        },
      ],
      rest_between_sets: 'Continuous relaxed pace',
      cooldown: '5 minutes legs-up-the-wall relaxation',
      recovery: 'Prepare meals for the upcoming week and aim for 8+ hours of restorative sleep.',
    },
  ],
};

const SEED_UPDATED_PLAN_1: WorkoutPlanData = {
  ...SEED_ORIGINAL_PLAN_1,
  version_label: 'Updated Plan v2.0 (Added Yoga & Joint-Friendly Cardio)',
  generated_at: '2026-09-25T14:30:00.000Z',
  motivational_message:
    'Your updated plan blends hypertrophy strength work with dedicated vinyasa mobility and low-impact zone-2 cardio for balanced recovery.',
  days: SEED_ORIGINAL_PLAN_1.days.map((d) => {
    if (d.day === 3) {
      return {
        ...d,
        focus: 'Restorative Vinyasa Yoga & Hip Mobility',
        is_rest_day: false,
        exercises: [
          {
            name: 'Sun Salutation A (Surya Namaskar)',
            sets: '4 flows',
            reps_or_duration: '90 seconds per flow',
            rest: '30 seconds',
            notes: 'Link breath to each transition smoothly',
          },
          {
            name: 'Warrior II to Extended Side Angle Flow',
            sets: '3 sets',
            reps_or_duration: '45 seconds per side',
            rest: '30 seconds',
            notes: 'Open hips and lengthen side ribs',
          },
          {
            name: 'Pigeon Pose & Thoracic Opener',
            sets: '2 sets',
            reps_or_duration: '60 seconds per side',
            rest: '30 seconds',
            notes: 'Relax shoulders away from ears',
          },
        ],
      };
    }
    if (d.day === 6) {
      return {
        ...d,
        focus: 'Zone-2 Low-Impact Cardio & Core Stability',
        exercises: [
          {
            name: 'Incline Treadmill Walk or Elliptical (Zone 2)',
            sets: '1 continuous block',
            reps_or_duration: '25 minutes',
            rest: 'N/A',
            notes: 'Keep heart rate at 65–75% max; nasal breathing pace',
          },
          ...d.exercises.slice(1),
        ],
      };
    }
    return d;
  }),
};

const SEED_NUTRITION_1: NutritionDetails = {
  title: 'Lean Muscle Synthesis & Glycogen Recovery Protocol',
  summary:
    'To support intermediate muscle gain at 45-minute sessions, target 1.6–2.0g of protein per kg of bodyweight alongside timed complex carbohydrates around training windows.',
  key_points: [
    'Distribute protein intake across 4 balanced feedings (30–35g per meal) using lean poultry, fish, eggs, Greek yogurt, tofu, or lentils.',
    'Consume a pre-workout snack 60 minutes prior (e.g., banana + 15g whey or almond butter) to sustain training intensity.',
    'Include omega-3 rich foods (salmon, walnuts, chia seeds) 3x weekly to support joint comfort and manage exercise-induced inflammation.',
    'Prioritize 7.5–8.5 hours of consistent sleep—over 70% of growth hormone release occurs during deep slow-wave sleep.',
  ],
  hydration_target: '2.8 – 3.2 Liters daily (+500ml per 45-min training session)',
  recovery_advice:
    'Take 5–10 minutes post-workout for parasympathetic downregulation (slow nasal breathing) to shift from cortisol to muscle repair.',
};

const SEED_USERS: Record<string, UserRecord> = {
  'USR-101': {
    user_id: 'USR-101',
    name: 'Marcus Vance',
    age: 29,
    weight: 78.5,
    goal: 'Muscle Gain',
    intensity: 'Medium',
    experience: 'Intermediate',
    available_days: 5,
    duration: '45 minutes',
    preferences: 'Dumbbell & barbell gym access, prefers joint-friendly lower body exercises',
    original_plan: SEED_ORIGINAL_PLAN_1,
    updated_plan: SEED_UPDATED_PLAN_1,
    feedback: 'Add a dedicated yoga and hip mobility flow on Day 3 and keep Day 6 cardio low-impact.',
    feedback_history: [
      {
        id: 'FB-001',
        feedback: 'Add a dedicated yoga and hip mobility flow on Day 3 and keep Day 6 cardio low-impact.',
        updated_at: '2026-09-25T14:30:00.000Z',
        updated_plan: SEED_UPDATED_PLAN_1,
      },
    ],
    nutrition_tip:
      'Target 1.6–2.0g protein/kg bodyweight across 4 meals, hydrate with 3.0L water daily, pair complex carbs post-workout, and prioritize 8 hours of sleep for optimal hypertrophy.',
    nutrition_details: SEED_NUTRITION_1,
    motivational_message: SEED_UPDATED_PLAN_1.motivational_message,
    completed_days: [1, 2, 3, 4, 5],
    progress_logs: [
      {
        id: 'LOG-1',
        date: '2026-09-01',
        weight_kg: 76.8,
        workouts_completed: 4,
        active_minutes: 180,
        recovery_score: 7,
        notes: 'Baseline week, felt strong on upper body presses.',
      },
      {
        id: 'LOG-2',
        date: '2026-09-08',
        weight_kg: 77.2,
        workouts_completed: 5,
        active_minutes: 225,
        recovery_score: 8,
        notes: 'Increased dumbbell bench weight by 2.5kg.',
      },
      {
        id: 'LOG-3',
        date: '2026-09-15',
        weight_kg: 77.9,
        workouts_completed: 5,
        active_minutes: 225,
        recovery_score: 8,
        notes: 'Consistent protein intake; sleep quality improved.',
      },
      {
        id: 'LOG-4',
        date: '2026-09-22',
        weight_kg: 78.2,
        workouts_completed: 4,
        active_minutes: 190,
        recovery_score: 7,
        notes: 'Added yoga session on Day 3—hips feel much looser.',
      },
      {
        id: 'LOG-5',
        date: '2026-09-28',
        weight_kg: 78.5,
        workouts_completed: 5,
        active_minutes: 235,
        recovery_score: 9,
        notes: 'Hit all 5 scheduled workouts with great energy.',
      },
    ],
    plans_generated_count: 2,
    plan_updates_count: 1,
    created_date: '2026-09-22T09:15:00.000Z',
    updated_date: '2026-09-25T14:30:00.000Z',
  },
  'USR-102': {
    user_id: 'USR-102',
    name: 'Elena Rostova',
    age: 34,
    weight: 64.0,
    goal: 'Weight Loss',
    intensity: 'Low',
    experience: 'Beginner',
    available_days: 4,
    duration: '30 minutes',
    preferences: 'Home workouts only, no jumping (apartment friendly), enjoys brisk walking and pilates core',
    original_plan: {
      ...SEED_ORIGINAL_PLAN_1,
      version_label: 'Original Plan v1.0',
      generated_at: '2026-09-24T11:20:00.000Z',
      motivational_message:
        'Consistency beats intensity every time. Gentle, low-impact movement 4 days a week builds lasting metabolic momentum.',
    },
    updated_plan: null,
    feedback: null,
    feedback_history: [],
    nutrition_tip:
      'Focus on high-volume whole foods (leafy greens, berries, lean proteins), drink 500ml water before meals, maintain a gentle 300–400 kcal daily deficit, and walk 10 minutes after dinner.',
    nutrition_details: {
      title: 'Sustainable Metabolic Balance & Hydration',
      summary:
        'Prioritize satiety through fiber-rich vegetables and lean protein while avoiding aggressive calorie restriction.',
      key_points: [
        'Fill half your plate with non-starchy vegetables and leafy greens at lunch and dinner.',
        'Aim for 25–30g protein per meal to preserve lean muscle tissue during weight loss.',
        'Drink 2.5L of water daily; mild dehydration often mimics afternoon hunger cues.',
        'Maintain 7–8 hours of sleep to keep hunger hormones (ghrelin and leptin) balanced.',
      ],
      hydration_target: '2.4 – 2.8 Liters daily',
      recovery_advice: 'Gentle 10-minute evening walks aid digestion and blood glucose regulation.',
    },
    motivational_message:
      'Consistency beats intensity every time. Gentle, low-impact movement 4 days a week builds lasting metabolic momentum.',
    completed_days: [1, 2, 4],
    progress_logs: [
      {
        id: 'LOG-201',
        date: '2026-09-07',
        weight_kg: 65.4,
        workouts_completed: 3,
        active_minutes: 90,
        recovery_score: 8,
        notes: 'Completed all beginner low-impact circuits without knee discomfort.',
      },
      {
        id: 'LOG-202',
        date: '2026-09-14',
        weight_kg: 64.9,
        workouts_completed: 4,
        active_minutes: 120,
        recovery_score: 8,
        notes: 'Added daily hydration habit.',
      },
      {
        id: 'LOG-203',
        date: '2026-09-21',
        weight_kg: 64.4,
        workouts_completed: 4,
        active_minutes: 125,
        recovery_score: 9,
        notes: 'Plank hold up to 40 seconds!',
      },
      {
        id: 'LOG-204',
        date: '2026-09-28',
        weight_kg: 64.0,
        workouts_completed: 4,
        active_minutes: 130,
        recovery_score: 9,
        notes: 'Steady progress and high daytime energy.',
      },
    ],
    plans_generated_count: 1,
    plan_updates_count: 0,
    created_date: '2026-09-24T11:20:00.000Z',
    updated_date: '2026-09-24T11:20:00.000Z',
  },
  'USR-103': {
    user_id: 'USR-103',
    name: 'Devon Brooks',
    age: 41,
    weight: 83.0,
    goal: 'Endurance',
    intensity: 'High',
    experience: 'Advanced',
    available_days: 6,
    duration: '60 minutes',
    preferences: 'Hybrid running + kettlebell conditioning, preparing for a 10K race',
    original_plan: {
      ...SEED_ORIGINAL_PLAN_1,
      version_label: 'Original Plan v1.0',
      generated_at: '2026-09-26T08:00:00.000Z',
      motivational_message:
        'Aerobic capacity and muscular stamina work hand-in-hand. Respect your easy days so you can attack your threshold intervals.',
    },
    updated_plan: {
      ...SEED_UPDATED_PLAN_1,
      version_label: 'Updated Plan v2.0 (Added Kettlebell Carries & Tempo Run)',
      generated_at: '2026-09-27T17:45:00.000Z',
    },
    feedback: 'Add more tempo cardio intervals on Day 2 and include heavy kettlebell carries for core stability.',
    feedback_history: [
      {
        id: 'FB-003',
        feedback: 'Add more tempo cardio intervals on Day 2 and include heavy kettlebell carries for core stability.',
        updated_at: '2026-09-27T17:45:00.000Z',
        updated_plan: {
          ...SEED_UPDATED_PLAN_1,
          version_label: 'Updated Plan v2.0 (Added Kettlebell Carries & Tempo Run)',
          generated_at: '2026-09-27T17:45:00.000Z',
        },
      },
    ],
    nutrition_tip:
      'Fuel high-output endurance sessions with 4–6g carbohydrates/kg bodyweight, replenish sodium and potassium during 60-minute sessions, and consume 30g protein post-run.',
    nutrition_details: {
      title: 'Aerobic Fueling & Electrolyte Replenishment',
      summary:
        'High-intensity 60-minute endurance training demands strategic carbohydrate timing and electrolyte balance.',
      key_points: [
        'Consume 40–60g of easily digestible carbohydrates 60–90 minutes before interval workouts.',
        'Include 500–700mg sodium per liter of water on high-sweat training days.',
        'Pair 3:1 carbohydrates-to-protein within 45 minutes after long conditioning sessions.',
        'Use tart cherry juice or berries in the evening to support muscular recovery.',
      ],
      hydration_target: '3.2 – 3.8 Liters daily + electrolytes',
      recovery_advice: 'Foam roll calves, IT band, and thoracic spine for 8 minutes post-run.',
    },
    motivational_message:
      'Aerobic capacity and muscular stamina work hand-in-hand. Respect your easy days so you can attack your threshold intervals.',
    completed_days: [1, 2, 3, 4, 5, 6],
    progress_logs: [
      {
        id: 'LOG-301',
        date: '2026-09-10',
        weight_kg: 83.8,
        workouts_completed: 5,
        active_minutes: 290,
        recovery_score: 7,
        notes: 'Strong tempo intervals.',
      },
      {
        id: 'LOG-302',
        date: '2026-09-17',
        weight_kg: 83.4,
        workouts_completed: 6,
        active_minutes: 340,
        recovery_score: 8,
        notes: 'Resting heart rate dropped by 2 bpm.',
      },
      {
        id: 'LOG-303',
        date: '2026-09-28',
        weight_kg: 83.0,
        workouts_completed: 6,
        active_minutes: 360,
        recovery_score: 9,
        notes: 'Feeling race-ready and well recovered.',
      },
    ],
    plans_generated_count: 1,
    plan_updates_count: 1,
    created_date: '2026-09-26T08:00:00.000Z',
    updated_date: '2026-09-27T17:45:00.000Z',
  },
};

function ensureDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = { users: SEED_USERS };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!parsed || typeof parsed.users !== 'object') {
      const initial: DatabaseSchema = { users: SEED_USERS };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Database read error, using in-memory seed fallback:', err);
    return { users: { ...SEED_USERS } };
  }
}

function saveDb(db: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Database write error:', err);
  }
}

export const dbService = {
  getAllUsers(): UserRecord[] {
    const db = ensureDb();
    return Object.values(db.users).sort(
      (a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime()
    );
  },

  getUserById(userId: string): UserRecord | null {
    const db = ensureDb();
    const normalized = userId.trim();
    return db.users[normalized] || null;
  },

  upsertUser(record: UserRecord): UserRecord {
    const db = ensureDb();
    db.users[record.user_id.trim()] = record;
    saveDb(db);
    return record;
  },

  deleteUser(userId: string): boolean {
    const db = ensureDb();
    const normalized = userId.trim();
    if (!db.users[normalized]) {
      return false;
    }
    delete db.users[normalized];
    saveDb(db);
    return true;
  },
};
