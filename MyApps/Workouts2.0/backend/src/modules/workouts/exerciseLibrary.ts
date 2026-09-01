export type ProgressiveStrategy =
  | 'weight'
  | 'reps'
  | 'sets'
  | 'hybrid'
  | 'bodyweight'
  | 'generic';

export type ExerciseProgressionRule = {
  canonicalName: string;
  strategy: ProgressiveStrategy;
  weight?: {
    type: 'percent' | 'increment';
    value: number;
    decimals?: number;
    min?: number;
  };
  reps?: {
    type: 'increment' | 'range';
    value: number;
    min?: number;
    max?: number;
  };
  sets?: {
    type: 'increment' | 'cap';
    value: number;
    min?: number;
    max?: number;
  };
  notes?: string;
};

export const EXERCISE_LIBRARY: Record<string, ExerciseProgressionRule> = {
  'Barbell Back Squat': {
    canonicalName: 'Barbell Back Squat',
    strategy: 'weight',
    weight: { type: 'percent', value: 0.025, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Primary barbell compound lift; progress load first while keeping sets/reps stable.',
  },
  'Barbell Bench Press': {
    canonicalName: 'Barbell Bench Press',
    strategy: 'weight',
    weight: { type: 'percent', value: 0.025, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Primary barbell press; progress load first while preserving the entered set and rep targets.',
  },
  'Barbell Deadlift': {
    canonicalName: 'Barbell Deadlift',
    strategy: 'weight',
    weight: { type: 'percent', value: 0.02, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Deadlift progress is conservative to keep progression deterministic and sustainable.',
  },
  'Overhead Press': {
    canonicalName: 'Overhead Press',
    strategy: 'weight',
    weight: { type: 'percent', value: 0.025, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Incline Dumbbell Press': {
    canonicalName: 'Incline Dumbbell Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 2, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Dumbbell Shoulder Press': {
    canonicalName: 'Dumbbell Shoulder Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 2, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Dumbbell Row': {
    canonicalName: 'Dumbbell Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 2, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Seated Cable Row': {
    canonicalName: 'Seated Cable Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Lat Pulldown': {
    canonicalName: 'Lat Pulldown',
    strategy: 'weight',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Romanian Deadlift': {
    canonicalName: 'Romanian Deadlift',
    strategy: 'weight',
    weight: { type: 'percent', value: 0.02, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Leg Press': {
    canonicalName: 'Leg Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Lunge': {
    canonicalName: 'Lunge',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 1, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Bulgarian Split Squat': {
    canonicalName: 'Bulgarian Split Squat',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 1, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Pull-Up': {
    canonicalName: 'Pull-Up',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Bodyweight movement; progress reps first and never force a numeric weight when none exists.',
  },
  'Bicep Curl': {
    canonicalName: 'Bicep Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 1, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
  'Tricep Pushdown': {
    canonicalName: 'Tricep Pushdown',
    strategy: 'reps',
    weight: { type: 'increment', value: 1.25, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
  },
};

export const GENERIC_PROGRESSIVE_OVERLOAD_RULE: ExerciseProgressionRule = {
  canonicalName: 'Generic Exercise',
  strategy: 'generic',
  weight: { type: 'percent', value: 0.025, decimals: 1 },
  reps: { type: 'increment', value: 1, min: 1 },
  sets: { type: 'increment', value: 0, min: 1 },
  notes: 'Fallback for custom or unknown exercises. Prefer reps first when no exercise-specific strategy exists.',
};

export const EXERCISE_AUTOCOMPLETE_OPTIONS = Object.keys(EXERCISE_LIBRARY).sort();

export function normalizeExerciseCanonicalName(name: unknown) {
  return typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';
}

export function getExerciseProgressionRule(exerciseName: unknown) {
  const canonicalName = normalizeExerciseCanonicalName(exerciseName);
  return EXERCISE_LIBRARY[canonicalName] ?? GENERIC_PROGRESSIVE_OVERLOAD_RULE;
}
