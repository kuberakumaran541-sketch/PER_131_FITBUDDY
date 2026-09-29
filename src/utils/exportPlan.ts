import { UserRecord, WorkoutPlanData } from '../types/fitbuddy';

export function downloadPlanAsText(user: UserRecord, planToExport?: WorkoutPlanData): void {
  const plan = planToExport || user.updated_plan || user.original_plan;

  const lines: string[] = [
    '============================================================',
    'FITBUDDY – AI FITNESS PLAN GENERATOR',
    'Your AI-powered personal fitness companion',
    '============================================================',
    '',
    'USER PROFILE',
    `Name:            ${user.name}`,
    `User ID:         ${user.user_id}`,
    `Age:             ${user.age} years`,
    `Weight:          ${user.weight} kg`,
    `Fitness Goal:    ${user.goal}`,
    `Intensity:       ${user.intensity}`,
    `Experience:      ${user.experience}`,
    `Available Days:  ${user.available_days} days/week`,
    `Duration:        ${user.duration}`,
    `Plan Version:    ${plan.version_label}`,
    `Generated Date:  ${new Date(plan.generated_at).toLocaleString()}`,
    '',
    'MOTIVATIONAL MESSAGE',
    `"${plan.motivational_message}"`,
    '',
    '------------------------------------------------------------',
    'AI NUTRITION & RECOVERY TIP',
    '------------------------------------------------------------',
    `Title:     ${user.nutrition_details?.title || 'Goal-Specific Nutrition & Recovery'}`,
    `Summary:   ${user.nutrition_details?.summary || user.nutrition_tip}`,
    `Hydration: ${user.nutrition_details?.hydration_target || '2.5 - 3.0L Daily'}`,
    `Recovery:  ${user.nutrition_details?.recovery_advice || 'Prioritize 7.5-8 hours of sleep.'}`,
    ...(user.nutrition_details?.key_points || []).map((pt) => `  * ${pt}`),
    '',
    '============================================================',
    'YOUR 7-DAY FITNESS PLAN',
    '============================================================',
  ];

  for (const day of plan.days) {
    lines.push('');
    lines.push(`DAY ${day.day} – ${day.focus.toUpperCase()}${day.is_rest_day ? ' (RECOVERY / MOBILITY)' : ''}`);
    lines.push('------------------------------------------------------------');
    lines.push('Warm-up (5–10 minutes):');
    for (const w of day.warmup) {
      lines.push(`  - ${w}`);
    }
    lines.push('');
    lines.push('Main Workout:');
    day.exercises.forEach((ex, idx) => {
      lines.push(
        `  ${idx + 1}. ${ex.name} — ${ex.sets} × ${ex.reps_or_duration} (Rest: ${ex.rest})`
      );
      if (ex.notes) {
        lines.push(`     Cue: ${ex.notes}`);
      }
    });
    lines.push('');
    lines.push(`Rest Between Sets: ${day.rest_between_sets}`);
    lines.push(`Cool-down:         ${day.cooldown}`);
    lines.push(`Recovery Tip:      ${day.recovery}`);
  }

  if (user.feedback) {
    lines.push('');
    lines.push('============================================================');
    lines.push('LATEST FEEDBACK APPLIED');
    lines.push('============================================================');
    lines.push(`Feedback: "${user.feedback}"`);
    lines.push(`Updated:  ${new Date(user.updated_date).toLocaleString()}`);
  }

  lines.push('');
  lines.push('------------------------------------------------------------');
  lines.push(
    'Disclaimer: FitBuddy provides general fitness and wellness information and is not a substitute for professional medical advice.'
  );

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FitBuddy_${user.user_id}_${plan.version_label.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
