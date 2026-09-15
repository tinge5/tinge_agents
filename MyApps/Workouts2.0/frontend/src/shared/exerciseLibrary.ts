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
      'Heavy posterior-chain compound; use a 10 lb weekly increase while preserving programmed volume.',
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
    'Front Squat': {
    canonicalName: 'Front Squat',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Quad-dominant compound lower-body movement; use a 5 lb weekly increase while keeping programmed sets and reps stable.',
  },

  'Hack Squat': {
    canonicalName: 'Hack Squat',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based squat variation emphasizing the quads; use a 10 lb weekly increase while preserving programmed volume.',
  },

  'Goblet Squat': {
    canonicalName: 'Goblet Squat',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Dumbbell or kettlebell squat variation; gradually increase load while adding one rep per progressed week.',
  },

  'Step-Up': {
    canonicalName: 'Step-Up',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral lower-body movement; progress load gradually while adding one rep per progressed week.',
  },

  'Hip Thrust': {
    canonicalName: 'Hip Thrust',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Glute-focused lower-body movement; use a 10 lb weekly increase while preserving programmed sets and reps.',
  },

  'Leg Extension': {
    canonicalName: 'Leg Extension',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Quad isolation movement; prioritize controlled rep progression before making small load increases.',
  },

  'Leg Curl': {
    canonicalName: 'Leg Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Hamstring isolation movement; prioritize controlled rep progression with small load increases.',
  },

  'Standing Calf Raise': {
    canonicalName: 'Standing Calf Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Calf-focused movement; progress reps with controlled range of motion before increasing load.',
  },

  'Seated Calf Raise': {
    canonicalName: 'Seated Calf Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Seated calf movement emphasizing the soleus; progress reps gradually with controlled execution.',
  },

  'Chest Fly': {
    canonicalName: 'Chest Fly',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Chest isolation movement; prioritize controlled reps and range of motion with gradual load increases.',
  },

  'Cable Crossover': {
    canonicalName: 'Cable Crossover',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable-based chest isolation movement; prioritize controlled rep progression with small load increases.',
  },

  'Dumbbell Bench Press': {
    canonicalName: 'Dumbbell Bench Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Dumbbell horizontal pressing movement; use a gradual 5 lb weekly increase while preserving programmed volume.',
  },

  'Close-Grip Bench Press': {
    canonicalName: 'Close-Grip Bench Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Compound pressing movement emphasizing the triceps; use a 5 lb weekly increase while maintaining programmed volume.',
  },

  'Chest-Supported Row': {
    canonicalName: 'Chest-Supported Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Upper-back pulling movement with reduced lower-back demand; use a 5 lb weekly increase while preserving volume.',
  },

  'Barbell Row': {
    canonicalName: 'Barbell Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Compound horizontal pulling movement; use a controlled 5 lb weekly increase while maintaining programmed reps and sets.',
  },

  'T-Bar Row': {
    canonicalName: 'T-Bar Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Compound back movement emphasizing the upper and mid-back; use a gradual 5 lb weekly increase.',
  },

  'Single-Arm Cable Row': {
    canonicalName: 'Single-Arm Cable Row',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral cable pulling movement; progress load gradually while adding one rep per progressed week.',
  },

  'Chin-Up': {
    canonicalName: 'Chin-Up',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Bodyweight vertical pulling movement; progress reps first and do not force a numeric weight when none exists.',
  },

  'Dumbbell Lateral Raise': {
    canonicalName: 'Dumbbell Lateral Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Shoulder isolation movement; prioritize controlled reps and strict form with small load increases.',
  },

  'Face Pull': {
    canonicalName: 'Face Pull',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Upper-back and rear-shoulder accessory movement; prioritize controlled reps and gradual load progression.',
  },

  'Rear Delt Fly': {
    canonicalName: 'Rear Delt Fly',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Rear-shoulder isolation movement; prioritize strict technique and controlled rep progression.',
  },

  'Dumbbell Front Raise': {
    canonicalName: 'Dumbbell Front Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Anterior shoulder isolation movement; prioritize controlled reps with small load increases.',
  },

  'Hammer Curl': {
    canonicalName: 'Hammer Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Biceps and forearm accessory movement; prioritize controlled rep progression with small load increases.',
  },

  'Preacher Curl': {
    canonicalName: 'Preacher Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Biceps isolation movement; prioritize controlled reps and gradually increase load.',
  },

  'Skull Crusher': {
    canonicalName: 'Skull Crusher',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Triceps isolation movement; prioritize controlled reps and small load increases while maintaining technique.',
  },

  'Overhead Tricep Extension': {
    canonicalName: 'Overhead Tricep Extension',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Triceps isolation movement emphasizing the long head; prioritize controlled rep progression with small load increases.',
  },

  'Dips': {
    canonicalName: 'Dips',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Bodyweight pressing movement; progress reps first and only add external load when appropriate.',
  },

  'Push-Up': {
    canonicalName: 'Push-Up',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Bodyweight horizontal pressing movement; progress reps while maintaining consistent technique.',
  },

  'Hanging Leg Raise': {
    canonicalName: 'Hanging Leg Raise',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Bodyweight core movement emphasizing the abs and hip flexors; progress reps with controlled movement.',
  },

  'Cable Crunch': {
    canonicalName: 'Cable Crunch',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Weighted abdominal movement; prioritize controlled reps before making small load increases.',
  },

  'Plank': {
    canonicalName: 'Plank',
    strategy: 'reps',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 5, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Isometric core movement; progress the hold duration gradually while maintaining proper positioning.',
  },

  'Farmer Carry': {
    canonicalName: 'Farmer Carry',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Loaded carry emphasizing grip, core, and full-body stability; gradually increase load while preserving programmed distance or duration.',
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