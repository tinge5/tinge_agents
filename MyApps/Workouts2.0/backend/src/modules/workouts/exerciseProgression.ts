import { EXERCISE_LIBRARY, GENERIC_PROGRESSIVE_OVERLOAD_RULE, getExerciseProgressionRule, normalizeExerciseCanonicalName } from './exerciseLibrary';

function toNumberOrNull(value: any) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function applyProgression(exercise: any, weekIndex: number, enabled: boolean) {
  if (!enabled || weekIndex <= 0) return exercise;

  const rule = getExerciseProgressionRule(exercise.exerciseName);
  const setsBase = Number(exercise.setsTarget ?? 0);
  const repsBase = Number(exercise.repsTarget ?? 0);
  const weightBase = typeof exercise.weightTarget === 'number' ? exercise.weightTarget : null;
  const rounds = weekIndex;

  let setsTarget = Math.max(1, setsBase);
  let repsTarget = Math.max(1, repsBase);
  let weightTarget = weightBase;

  if (rule.sets?.type === 'increment') setsTarget = Math.max(rule.sets.min ?? 1, setsBase + rule.sets.value * rounds);
  if (rule.reps?.type === 'increment') repsTarget = Math.max(rule.reps.min ?? 1, repsBase + rule.reps.value * rounds);

  if (rule.weight?.type === 'increment') {
    if (weightBase !== null) weightTarget = Number((weightBase + rule.weight.value * rounds).toFixed(rule.weight.decimals ?? 1));
  } else if (rule.weight?.type === 'percent') {
    if (weightBase !== null) weightTarget = Number((weightBase * (1 + rule.weight.value * rounds)).toFixed(rule.weight.decimals ?? 1));
  }

  if (rule.strategy === 'bodyweight' && weightBase === null) weightTarget = null;
  if (weightTarget !== null && Number.isNaN(Number(weightTarget))) weightTarget = null;

  return { ...exercise, setsTarget, repsTarget, weightTarget };
}

export { EXERCISE_LIBRARY, GENERIC_PROGRESSIVE_OVERLOAD_RULE, getExerciseProgressionRule, normalizeExerciseCanonicalName, toNumberOrNull, applyProgression };
