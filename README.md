# FitBuddy – AI Fitness Plan Generator

**“Your AI-powered personal fitness companion”**

## 1. Project Title
**FitBuddy – AI Fitness Plan Generator**

## 2. Project Description
FitBuddy is an AI-powered personal fitness and wellness web application powered by **Google Gemini (`@google/genai`)**. It generates personalized, structured 7-day workout routines along with goal-specific nutrition and recovery guidance based on each user's biometric profile, experience level, workout intensity, available days, and training duration. Users can iteratively refine their 7-day plan through natural-language feedback while preserving their original plan in history, track longitudinal progress trends over time, and manage athlete profiles through an Admin/Coach Dashboard.

## 3. Features
- **Personalized 7-Day Workout Plan Generation**: Generates structured Day 1 → Day 7 programming with workout focus, 5–10 minute warm-ups, main exercises (sets, reps/duration, rest, form cues), cool-down routines, and recovery suggestions.
- **💡 AI Nutrition & Recovery Tip**: Generates complementary hydration targets, macronutrient guidelines, and sleep/recovery protocols tailored to the user's goal (`Weight Loss`, `Muscle Gain`, `General Wellness`, `Strength`, `Flexibility`, `Endurance`).
- **Feedback-Based Workout Regeneration (`Improve My Plan`)**: Allows users to submit feedback (e.g., *"Add yoga on Day 3"*, *"Include more cardio"*, *"Reduce workout intensity"*) to generate an updated 7-day plan while preserving the original plan.
- **Original vs. Updated Plan History**: Side-by-side and tabbed comparison of the preserved Original Plan and the latest Updated Plan with feedback timestamps.
- **User Profile Progress Trends Dashboard**: Tracks body weight trends (kg), weekly workout completion consistency, active training minutes, and recovery scores over time with interactive SVG trend visualizations and check-in logging.
- **Admin / Coach Dashboard**: Displays system statistics (`Total Users`, `Total Plans Generated`, `Updated Plans`, `Active Users`), search by Name/User ID, filtering by Goal/Intensity/Experience, sorting (`Newest`, `Oldest`, `Goal`), and actions to inspect profiles, original plans, updated plans, feedback, or delete records.
- **Print & Download Support**: Clean print stylesheet (`window.print()`) and one-click `.txt` plan export.

## 4. Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express (`server.ts` with Vite middleware in development)
- **AI Engine**: Google Gemini SDK (`@google/genai`, model `gemini-3.8-flash`) with structured JSON `responseSchema`
- **Database / Persistence**: Persistent file-backed JSON database (`data/fitbuddy_db.json`) mirroring the relational User + Original/Updated Plan + Progress Log schema

## 5. Gemini Integration
All Google Gemini API calls are executed strictly on the **server side** (`src/server/gemini_service.ts`) using `@google/genai` and structured JSON output (`responseMimeType: "application/json"` and `responseSchema`):
1. `generateWorkoutPlan(profile)` — Generates the 7-day structured workout routine and motivational message.
2. `generateNutritionTip(profile)` — Generates the goal-specific nutrition, hydration, and recovery recommendations.
3. `updateWorkoutPlan(profile, existingPlan, feedback)` — Modifies the existing 7-day workout plan based on user feedback while honoring safety constraints.

## 6. Setup Instructions
1. Clone or open the project in Google AI Studio Build.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` (or AI Studio Secrets panel).

## 7. Environment Variables
Create a `.env` file (see `.env.example`):
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```
*Note: The Gemini API key is only accessed on the server (`process.env.GEMINI_API_KEY`) and is never exposed to client-side code.*

## 8. How to Run the Project
- **Development Server (Full-Stack Express + Vite on Port 3000)**:
  ```bash
  npm run dev
  ```
- **Typecheck / Lint**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

## 9. API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/generate-workout` (or `/generate-workout`) | Validates user profile, generates 7-day plan & nutrition tip via Gemini, and stores record |
| `POST` | `/api/submit-feedback` (or `/submit-feedback`) | Retrieves existing plan, sends original plan + feedback + profile to Gemini, saves updated plan |
| `GET` | `/api/users` (or `/users`, `/view-all-users`) | Returns all registered users and their original/updated plans |
| `GET` | `/api/users/:user_id` (or `/users/:user_id`) | Returns a single user profile, plan history, and progress logs |
| `DELETE` | `/api/users/:user_id` (or `/users/:user_id`) | Deletes a user record from persistent storage |
| `POST` | `/api/users/:user_id/toggle-day` | Toggles completion status for Day 1–7 to track workout consistency |
| `POST` | `/api/users/:user_id/progress` | Logs a new longitudinal progress check-in (weight, sessions, active minutes, recovery) |

## 10. Project Structure
```text
fitbuddy/
├── data/
│   └── fitbuddy_db.json           # Persistent user, plan history & progress storage
├── src/
│   ├── assets/images/             # Generated high-resolution athletic studio imagery
│   ├── components/
│   │   ├── LoadingOverlay.tsx     # Animated AI generation & feedback progress modal
│   │   ├── Navbar.tsx             # Responsive top navigation bar
│   │   ├── ProgressDashboard.tsx  # User profile longitudinal progress trends & charts
│   │   └── WorkoutDayGrid.tsx     # 7-day workout cards with warm-up, exercises & cooldown
│   ├── pages/
│   │   ├── Home.tsx               # Hero section & validated fitness profile input form
│   │   ├── Result.tsx             # 7-Day plan display, nutrition tip, print/download & history
│   │   ├── Feedback.tsx           # Improve My Plan feedback form & Original vs Updated view
│   │   └── Admin.tsx              # Coach/Admin dashboard with stats, search, filter & actions
│   ├── server/
│   │   ├── database.ts            # Persistent database operations & seed profiles
│   │   └── gemini_service.ts      # Server-side Google Gemini AI functions
│   ├── types/
│   │   └── fitbuddy.ts            # Shared TypeScript interfaces & schemas
│   ├── utils/
│   │   └── exportPlan.ts          # Text file workout plan exporter
│   ├── App.tsx                    # Main application state & view router
│   ├── index.css                  # Tailwind CSS v4 & print stylesheet
│   └── main.tsx                   # React DOM entry point
├── server.ts                      # Express backend server + Vite middleware
├── package.json
└── README.md
```

## 11. Safety Disclaimer
> **FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice.**
> Always consult a qualified healthcare or certified fitness professional before beginning any new exercise or nutrition program, especially if you have pre-existing medical conditions or injuries.

## 12. Future Improvements
- Wearable device synchronization (Apple Health, Google Fit, Garmin, Strava) for automatic heart-rate zone and calorie tracking.
- Exercise form demonstration animations and voice-guided interval timers using Gemini TTS.
- Multi-week mesocycle periodization (4-week and 12-week progressive overload blocks).
