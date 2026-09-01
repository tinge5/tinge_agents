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
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Primary lower-body strength lift; use a 10 lb weekly increase while keeping programmed sets and reps stable.',
  },

  'Barbell Bench Press': {
    canonicalName: 'Barbell Bench Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Primary upper-body strength lift; use a 5 lb weekly increase while keeping programmed sets and reps stable.',
  },

  'Barbell Deadlift': {
    canonicalName: 'Barbell Deadlift',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Heavy posterior-chain compound; use a conservative 10 lb weekly increase while preserving programmed volume.',
  },

  'Overhead Press': {
    canonicalName: 'Overhead Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Upper-body strength movement; use a 5 lb weekly increase while preserving programmed sets and reps.',
  },

  'Incline Dumbbell Press': {
    canonicalName: 'Incline Dumbbell Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Dumbbell pressing movement; use a gradual 5 lb weekly increase while preserving programmed volume.',
  },

  'Dumbbell Shoulder Press': {
    canonicalName: 'Dumbbell Shoulder Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Dumbbell pressing movement; use a gradual 5 lb weekly increase while preserving programmed volume.',
  },

  'Dumbbell Row': {
    canonicalName: 'Dumbbell Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Upper-body pulling movement; use a 5 lb weekly increase while preserving programmed volume.',
  },

  'Seated Cable Row': {
    canonicalName: 'Seated Cable Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable pulling movement; use a 5 lb weekly increase while preserving programmed volume.',
  },

  'Lat Pulldown': {
    canonicalName: 'Lat Pulldown',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Vertical pulling movement; use a 5 lb weekly increase while preserving programmed volume.',
  },

  'Romanian Deadlift': {
    canonicalName: 'Romanian Deadlift',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Posterior-chain accessory movement; use a controlled 5 lb weekly increase.',
  },

  'Leg Press': {
    canonicalName: 'Leg Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based lower-body movement; use a 10 lb weekly increase while preserving programmed volume.',
  },

  'Lunge': {
    canonicalName: 'Lunge',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral lower-body movement; progress load gradually while adding one rep per progressed week.',
  },

  'Bulgarian Split Squat': {
    canonicalName: 'Bulgarian Split Squat',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral lower-body movement; progress load gradually while adding one rep per progressed week.',
  },

  'Pull-Up': {
    canonicalName: 'Pull-Up',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Bodyweight movement; progress reps first and never force a numeric weight when none exists.',
  },

  'Bicep Curl': {
    canonicalName: 'Bicep Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Accessory movement; prioritize controlled rep progression with small load increases.',
  },

  'Tricep Pushdown': {
    canonicalName: 'Tricep Pushdown',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Accessory movement; prioritize controlled rep progression with small load increases.',
  },
};

export const GENERIC_PROGRESSIVE_OVERLOAD_RULE: ExerciseProgressionRule = {
  canonicalName: 'Generic Exercise',
  strategy: 'generic',
  weight: { type: 'percent', value: 0.025, decimals: 1 },
  reps: { type: 'increment', value: 1, min: 1 },
  sets: { type: 'increment', value: 0, min: 1 },
  notes:
    'Fallback for custom or unknown exercises. Prefer reps first when no exercise-specific strategy exists.',
};

export const EXERCISE_AUTOCOMPLETE_OPTIONS = Object.keys(
  EXERCISE_LIBRARY,
).sort();

export function normalizeExerciseCanonicalName(name: unknown) {
  return typeof name === 'string'
    ? name.trim().replace(/\s+/g, ' ')
    : '';
}

export function getExerciseProgressionRule(exerciseName: unknown) {
  const canonicalName = normalizeExerciseCanonicalName(exerciseName);

  return (
    EXERCISE_LIBRARY[canonicalName] ??
    GENERIC_PROGRESSIVE_OVERLOAD_RULE
  );
}