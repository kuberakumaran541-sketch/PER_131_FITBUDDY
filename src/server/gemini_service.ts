import { GoogleGenAI, Type } from '@google/genai';
import {
  NutritionDetails,
  UserProfileInput,
  WorkoutDay,
  WorkoutPlanData,
} from '../types/fitbuddy.js';

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SAFETY_SYSTEM_INSTRUCTION = `You are FitBuddy AI, an expert, certified personal fitness coach and exercise physiologist.
CRITICAL SAFETY & DESIGN RULES:
1. You provide general fitness and wellness coaching, NOT medical diagnosis or treatment.
2. Never claim a workout is medically guaranteed safe for every individual.
3. Never recommend extreme calorie deficits, crash diets, or unsafe weight-loss practices.
4. Recommend consulting a qualified healthcare or fitness professional if a user mentions pain, injury, or medical conditions.
5. Tailor every exercise, set count, rep scheme, and rest interval directly to the user's Age, Weight, Fitness Goal, Workout Intensity (Low/Medium/High), Experience Level (Beginner/Intermediate/Advanced), Available Workout Days (1-7), Preferred Workout Duration, and Preferences.
6. For Beginners, select accessible, joint-friendly, foundational exercises with clear form cues.
7. Respect Available Workout Days: if available_days is e.g. 4, schedule 4 structured training days and 3 active recovery / mobility / rest days across the 7-day plan so all 7 days (Day 1 to Day 7) have clear guidance.`;

const WORKOUT_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    motivational_message: {
      type: Type.STRING,
      description: 'A personalized, inspiring 1-2 sentence motivational message tailored to the user goal.',
    },
    safety_note: {
      type: Type.STRING,
      description:
        'A brief safety reminder including: FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice.',
    },
    days: {
      type: Type.ARRAY,
      description: 'Exactly 7 days of structured programming from Day 1 to Day 7.',
      items: {
        type: Type.OBJECT,
        properties: {
          day: {
            type: Type.INTEGER,
            description: 'Day number from 1 to 7',
          },
          focus: {
            type: Type.STRING,
            description: 'Workout focus for this day, e.g., Full Body Foundation, Upper Body Push, Active Recovery & Mobility',
          },
          is_rest_day: {
            type: Type.BOOLEAN,
            description: 'True if this day is an active recovery or rest day based on user available workout days.',
          },
          warmup: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 4 specific warm-up movements (5-10 minutes total)',
          },
          exercises: {
            type: Type.ARRAY,
            description: 'Main workout exercises (3 to 6 exercises for training days, 2 to 3 gentle mobility activities for rest days)',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Exercise name' },
                sets: { type: Type.STRING, description: 'Number of sets, e.g. 3 sets' },
                reps_or_duration: {
                  type: Type.STRING,
                  description: 'Repetitions or duration, e.g. 12 reps or 45 seconds',
                },
                rest: {
                  type: Type.STRING,
                  description: 'Rest after set, e.g. 60 seconds',
                },
                notes: {
                  type: Type.STRING,
                  description: 'Concise form cue or tempo note',
                },
              },
              required: ['name', 'sets', 'reps_or_duration', 'rest', 'notes'],
            },
          },
          rest_between_sets: {
            type: Type.STRING,
            description: 'Overall rest guidance between sets, e.g. 60 seconds between sets',
          },
          cooldown: {
            type: Type.STRING,
            description: '5-minute cool-down stretching routine specific to the muscles worked',
          },
          recovery: {
            type: Type.STRING,
            description: 'Practical post-workout recovery suggestion for this day',
          },
        },
        required: [
          'day',
          'focus',
          'is_rest_day',
          'warmup',
          'exercises',
          'rest_between_sets',
          'cooldown',
          'recovery',
        ],
      },
    },
  },
  required: ['motivational_message', 'safety_note', 'days'],
};

const NUTRITION_TIP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Headline for the nutrition and recovery protocol based on the user goal.',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise 2-sentence overview of the nutrition and recovery strategy.',
    },
    key_points: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '4 actionable, evidence-based nutrition and recovery bullet points tailored to the user weight, goal, and intensity.',
    },
    hydration_target: {
      type: Type.STRING,
      description: 'Daily water intake recommendation in liters based on body weight and workout intensity.',
    },
    recovery_advice: {
      type: Type.STRING,
      description: 'Specific sleep and post-exercise recovery habit.',
    },
  },
  required: ['title', 'summary', 'key_points', 'hydration_target', 'recovery_advice'],
};

function buildFallbackWorkoutPlan(
  profile: UserProfileInput,
  versionLabel = 'Original Plan v1.0',
  feedback?: string
): WorkoutPlanData {
  const isBeginner = profile.experience === 'Beginner';
  const isLow = profile.intensity === 'Low';
  const restTime = isLow ? '75–90 seconds' : profile.intensity === 'High' ? '45 seconds' : '60 seconds';
  const setsCount = isBeginner ? '3 sets' : '4 sets';
  const hasYoga = feedback?.toLowerCase().includes('yoga') || profile.preferences?.toLowerCase().includes('yoga');
  const hasCardio =
    feedback?.toLowerCase().includes('cardio') ||
    profile.goal === 'Weight Loss' ||
    profile.goal === 'Endurance';

  const activeDaysTarget = Math.min(7, Math.max(1, Number(profile.available_days) || 4));
  const days: WorkoutDay[] = [];

  const focusTemplates: Record<string, string[]> = {
    'Weight Loss': [
      'Full Body Metabolic Circuit',
      'Low-Impact Cardio & Core Stability',
      hasYoga ? 'Restorative Vinyasa Yoga & Mobility' : 'Active Recovery & Brisk Walk',
      'Lower Body Strength & Calorie Burn',
      'Upper Body Toning & Interval Conditioning',
      hasCardio ? 'Zone-2 Endurance Cardio Session' : 'Full Body Functional Movement',
      'Complete Rest & Gentle Stretching',
    ],
    'Muscle Gain': [
      'Upper Body Push & Chest/Shoulder Hypertrophy',
      'Lower Body Quad & Glute Compound Strength',
      hasYoga ? 'Mobility Yoga & Thoracic Flow' : 'Active Recovery & Core Control',
      'Upper Body Pull & Back Thickness',
      'Lower Body Posterior Chain & Hamstrings',
      'Full Body Functional Hypertrophy & Arms',
      'Complete Rest & Muscle Repair',
    ],
    'General Wellness': [
      'Full Body Foundational Strength',
      'Cardiovascular Health & Core Balance',
      'Yoga Flow & Joint Mobility',
      'Upper Body Posture & Core Endurance',
      'Lower Body Balance & Functional Movement',
      'Outdoor Conditioning & Breathwork',
      'Complete Rest & Restoration',
    ],
    Strength: [
      'Lower Body Squat Focus & Core Bracing',
      'Upper Body Horizontal & Overhead Press',
      'Active Mobility & Scapular Stability',
      'Posterior Chain Hinge & Back Strength',
      'Unilateral Strength & Loaded Carries',
      'Conditioning & Explosive Power',
      'Complete Nervous System Recovery',
    ],
    Flexibility: [
      'Dynamic Lower Body Mobility & Hip Openers',
      'Thoracic Spine, Shoulder & Posture Flow',
      'Active Recovery Walk & Breathwork',
      'Full Body Vinyasa Yoga & Core Control',
      'Hamstring, Ankle & Posterior Chain Lengthening',
      'Balance, Isometric Stability & PNF Stretching',
      'Deep Restorative Stretch & Relaxation',
    ],
    Endurance: [
      'Aerobic Base Zone-2 Conditioning',
      'Muscular Stamina Full-Body Circuit',
      'Active Recovery Mobility & Foam Rolling',
      'Threshold Tempo Intervals & Core',
      'Lower Body Stamina & Single-Leg Stability',
      'Long Sustained Cardio Session',
      'Complete Rest & Glycogen Restoration',
    ],
  };

  const selectedFocuses = focusTemplates[profile.goal] || focusTemplates['General Wellness'];
  let scheduledWorkouts = 0;

  for (let d = 1; d <= 7; d++) {
    const shouldBeRest =
      d === 7 || (d === 3 && activeDaysTarget <= 5) || scheduledWorkouts >= activeDaysTarget;
    if (!shouldBeRest) {
      scheduledWorkouts++;
    }

    const focusTitle = selectedFocuses[d - 1] || `Day ${d} Functional Training`;
    days.push({
      day: d,
      focus: shouldBeRest && !hasYoga ? `Active Recovery: ${focusTitle}` : focusTitle,
      is_rest_day: shouldBeRest,
      warmup: [
        `5 minutes ${isLow ? 'easy walking' : 'brisk walk or light cardio'} to elevate heart rate`,
        'Dynamic joint rotations: arm circles, hip openers, and bodyweight torso twists (4 minutes)',
      ],
      exercises: shouldBeRest
        ? [
            {
              name: hasYoga ? 'Sun Salutation & Cat-Cow Spinal Flow' : 'Brisk Outdoor or Treadmill Walk',
              sets: '1 session',
              reps_or_duration: '15–20 minutes',
              rest: 'Continuous easy pace',
              notes: 'Keep breathing relaxed and nasal throughout',
            },
            {
              name: '90/90 Hip Mobility & Thoracic Opener',
              sets: '2 sets',
              reps_or_duration: '45 seconds per side',
              rest: '30 seconds',
              notes: 'Move gently without forcing end-range stretch',
            },
          ]
        : [
            {
              name: isBeginner ? 'Bodyweight Box Squats' : 'Goblet Squats',
              sets: setsCount,
              reps_or_duration: '12 reps',
              rest: restTime,
              notes: 'Keep chest tall and knees aligned with toes',
            },
            {
              name: isBeginner ? 'Incline Push-ups' : 'Push-ups / Dumbbell Press',
              sets: setsCount,
              reps_or_duration: '10–12 reps',
              rest: restTime,
              notes: 'Maintain a straight line from head to heels',
            },
            {
              name: hasCardio ? 'Low-Impact High-Knee March / Mountain Climbers' : 'Reverse Lunges',
              sets: setsCount,
              reps_or_duration: hasCardio ? '40 seconds' : '10 reps per leg',
              rest: restTime,
              notes: 'Controlled tempo, engage core throughout movement',
            },
            {
              name: 'Forearm Plank Hold',
              sets: '3 sets',
              reps_or_duration: isBeginner ? '30 seconds' : '45 seconds',
              rest: '45 seconds',
              notes: 'Breathe steadily while bracing abdominals',
            },
          ],
      rest_between_sets: `${restTime} between sets`,
      cooldown: '5 minutes full-body static stretching focusing on hips, chest, and hamstrings',
      recovery: `Hydrate with 500ml water post-session and prioritize 7.5–8 hours of quality sleep.`,
    });
  }

  return {
    version_label: versionLabel,
    generated_at: new Date().toISOString(),
    motivational_message: `Stay consistent, ${profile.name}! Every ${profile.duration} session moves you closer to your ${profile.goal} goal.`,
    safety_note:
      'FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice. Consult a healthcare professional before starting a new regimen.',
    days,
  };
}

function buildFallbackNutrition(profile: UserProfileInput): {
  nutrition_tip: string;
  nutrition_details: NutritionDetails;
} {
  const hydrationLiters = Math.max(2.2, Math.round((profile.weight * 0.035 + 0.4) * 10) / 10);
  const details: NutritionDetails = {
    title: `${profile.goal} Nutrition & Recovery Blueprint`,
    summary: `Tailored for a ${profile.age}-year-old (${profile.weight} kg) training at ${profile.intensity.toLowerCase()} intensity (${profile.duration}). Focus on whole-food nourishment, consistent hydration, and restorative sleep.`,
    key_points: [
      profile.goal === 'Muscle Gain' || profile.goal === 'Strength'
        ? `Prioritize 1.6–2.0g of protein per kg of bodyweight (~${Math.round(profile.weight * 1.8)}g daily) distributed evenly across 3–4 meals.`
        : `Build balanced plates with 1/2 colorful vegetables, 1/4 lean protein, and 1/4 high-fiber complex carbohydrates.`,
      `Hydrate consistently throughout the day: aim for ${hydrationLiters}L of water plus electrolytes on training days.`,
      `Fuel 60 minutes before your ${profile.duration} workout with easily digestible carbs and protein (e.g., Greek yogurt with berries or banana with oats).`,
      `Protect your recovery window with 7.5–8.5 hours of uninterrupted sleep and 5 minutes of post-workout stretching.`,
    ],
    hydration_target: `${hydrationLiters} Liters / day (+400ml during workouts)`,
    recovery_advice:
      'Pair post-workout protein with complex carbohydrates within 60–90 minutes of training, and take a 10-minute gentle walk on rest days.',
  };

  return {
    nutrition_tip: `${details.summary} Key habits: ${details.key_points.join(' ')}`,
    nutrition_details: details,
  };
}

export async function generateWorkoutPlan(profile: UserProfileInput): Promise<WorkoutPlanData> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return buildFallbackWorkoutPlan(profile, 'Original Plan v1.0');
  }

  try {
    const ai = getAiClient();
    const prompt = `Generate a personalized, structured 7-day workout plan (Day 1 through Day 7) for the following user profile:
- Full Name: ${profile.name}
- User ID: ${profile.user_id}
- Age: ${profile.age} years old
- Weight: ${profile.weight} kg
- Fitness Goal: ${profile.goal}
- Workout Intensity: ${profile.intensity}
- Experience Level: ${profile.experience}
- Available Workout Days per Week: ${profile.available_days} days
- Preferred Workout Duration: ${profile.duration}
- Specific Preferences / Equipment / Notes: ${profile.preferences || 'Standard home or gym equipment, balanced approach'}

Requirements:
1. Return exactly 7 days (Day 1 to Day 7).
2. Schedule ${profile.available_days} primary workout days and ${7 - profile.available_days} active recovery/mobility/rest days across the 7-day week.
3. Each day must fit within ${profile.duration} including a 5-10 minute warm-up, 3-5 purposeful exercises with sets, reps/duration, and rest times, plus a 5-minute cool-down and recovery suggestion.
4. Ensure exercises match ${profile.experience} experience and ${profile.intensity} intensity for ${profile.goal}.
5. Include the safety disclaimer in safety_note: "FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: WORKOUT_PLAN_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error('Invalid days array in Gemini response');
    }

    return {
      version_label: 'Original Plan v1.0',
      generated_at: new Date().toISOString(),
      motivational_message:
        parsed.motivational_message ||
        `Stay consistent, ${profile.name}! Your personalized ${profile.goal} plan is ready.`,
      safety_note:
        parsed.safety_note ||
        'FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice.',
      days: parsed.days,
    };
  } catch (error) {
    console.error('Gemini generateWorkoutPlan error, using tailored fallback:', error);
    return buildFallbackWorkoutPlan(profile, 'Original Plan v1.0');
  }
}

export async function generateNutritionTip(profile: UserProfileInput): Promise<{
  nutrition_tip: string;
  nutrition_details: NutritionDetails;
}> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return buildFallbackNutrition(profile);
  }

  try {
    const ai = getAiClient();
    const prompt = `Generate a concise, practical, safety-first Nutrition & Recovery Tip tailored to:
- Name: ${profile.name}
- Age: ${profile.age}
- Weight: ${profile.weight} kg
- Fitness Goal: ${profile.goal}
- Workout Intensity: ${profile.intensity}
- Experience Level: ${profile.experience}
- Workout Duration: ${profile.duration} (${profile.available_days} days/week)
- Preferences: ${profile.preferences || 'None specified'}

Focus on sustainable hydration, balanced macronutrients, whole foods, and sleep/recovery habits without extreme calorie restriction or medical claims.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: NUTRITION_TIP_SCHEMA,
        temperature: 0.6,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty nutrition response from Gemini');
    }

    const parsed = JSON.parse(text) as NutritionDetails;
    const combinedTip = `${parsed.summary} • ${parsed.key_points.join(' • ')}`;

    return {
      nutrition_tip: combinedTip,
      nutrition_details: parsed,
    };
  } catch (error) {
    console.error('Gemini generateNutritionTip error, using tailored fallback:', error);
    return buildFallbackNutrition(profile);
  }
}

export async function updateWorkoutPlan(
  profile: UserProfileInput,
  existingPlan: WorkoutPlanData,
  feedback: string,
  updateNumber = 1
): Promise<WorkoutPlanData> {
  const versionLabel = `Updated Plan v${updateNumber + 1}.0`;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return buildFallbackWorkoutPlan(profile, versionLabel, feedback);
  }

  try {
    const ai = getAiClient();
    const prompt = `You are updating an existing 7-day workout plan based on the user's feedback.

USER PROFILE:
- Name: ${profile.name} (ID: ${profile.user_id})
- Age: ${profile.age}, Weight: ${profile.weight} kg
- Fitness Goal: ${profile.goal}
- Workout Intensity: ${profile.intensity}
- Experience Level: ${profile.experience}
- Available Days: ${profile.available_days} days/week
- Preferred Duration: ${profile.duration}
- Initial Preferences: ${profile.preferences || 'None'}

CURRENT 7-DAY WORKOUT PLAN:
${JSON.stringify(existingPlan.days, null, 2)}

USER FEEDBACK TO INCORPORATE:
"${feedback}"

Instructions:
1. Directly modify the 7-day plan (Day 1 to Day 7) to honor the user's feedback ("${feedback}") while keeping it safe and aligned with their profile.
2. Make clear, noticeable adjustments to the days, exercises, intensity, or recovery sessions requested by the user.
3. Update the motivational_message to acknowledge their customization.
4. Keep the safety disclaimer in safety_note: "FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: SAFETY_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: WORKOUT_PLAN_SCHEMA,
        temperature: 0.7,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from Gemini on updateWorkoutPlan');
    }

    const parsed = JSON.parse(text);
    return {
      version_label: versionLabel,
      generated_at: new Date().toISOString(),
      motivational_message:
        parsed.motivational_message ||
        `Your plan has been updated based on your feedback: "${feedback}". Keep pushing forward!`,
      safety_note:
        parsed.safety_note ||
        'FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice.',
      days: parsed.days,
    };
  } catch (error) {
    console.error('Gemini updateWorkoutPlan error, using tailored fallback:', error);
    return buildFallbackWorkoutPlan(profile, versionLabel, feedback);
  }
}
