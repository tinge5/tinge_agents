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
    'Trap Bar Deadlift': {
    canonicalName: 'Trap Bar Deadlift',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Full-body compound deadlift variation; use a controlled 10 lb weekly increase while preserving programmed volume.',
  },

  'Sumo Deadlift': {
    canonicalName: 'Sumo Deadlift',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Hip-dominant compound movement emphasizing the glutes, hamstrings, and adductors; progress load gradually.',
  },

  'Good Morning': {
    canonicalName: 'Good Morning',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Posterior-chain movement emphasizing the hamstrings, glutes, and lower back; use controlled loading.',
  },

  'Reverse Lunge': {
    canonicalName: 'Reverse Lunge',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral lower-body movement; gradually increase load while adding reps with consistent technique.',
  },

  'Walking Lunge': {
    canonicalName: 'Walking Lunge',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Dynamic unilateral lower-body movement; progress load and reps gradually while maintaining balance.',
  },

  'Reverse Hack Squat': {
    canonicalName: 'Reverse Hack Squat',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based posterior-chain squat variation; increase load gradually while maintaining controlled depth.',
  },

  'Smith Machine Squat': {
    canonicalName: 'Smith Machine Squat',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-assisted squat variation; use a controlled 10 lb progression while maintaining programmed volume.',
  },

  'Single-Leg Press': {
    canonicalName: 'Single-Leg Press',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral machine-based lower-body movement; progress load and reps gradually while maintaining symmetry.',
  },

  'Glute Bridge': {
    canonicalName: 'Glute Bridge',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Glute-focused movement; prioritize controlled repetitions and strong hip extension.',
  },

  'Cable Pull-Through': {
    canonicalName: 'Cable Pull-Through',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable-based hip-hinge movement emphasizing the glutes and hamstrings; progress gradually.',
  },

  'Nordic Hamstring Curl': {
    canonicalName: 'Nordic Hamstring Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Bodyweight hamstring movement emphasizing eccentric strength; progress repetitions with strict control.',
  },


  'Machine Chest Press': {
    canonicalName: 'Machine Chest Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based horizontal pressing movement; progress load gradually while maintaining controlled repetitions.',
  },

  'Incline Barbell Bench Press': {
    canonicalName: 'Incline Barbell Bench Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Upper-chest focused compound press; use a gradual 5 lb progression while maintaining programmed volume.',
  },

  'Decline Bench Press': {
    canonicalName: 'Decline Bench Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Compound chest pressing movement emphasizing the lower chest; progress load gradually.',
  },

  'Dumbbell Fly': {
    canonicalName: 'Dumbbell Fly',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Chest isolation movement; prioritize controlled range of motion before increasing load.',
  },

  'Cable Chest Press': {
    canonicalName: 'Cable Chest Press',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable-based horizontal pressing movement; use controlled repetitions and gradual load increases.',
  },

  'Arnold Press': {
    canonicalName: 'Arnold Press',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Dumbbell shoulder pressing variation; prioritize controlled repetitions and gradual load progression.',
  },

  'Machine Shoulder Press': {
    canonicalName: 'Machine Shoulder Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based vertical pressing movement; increase load gradually while maintaining controlled technique.',
  },

  'Cable Lateral Raise': {
    canonicalName: 'Cable Lateral Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable shoulder isolation movement; prioritize strict technique and controlled repetitions.',
  },

  'Cable Rear Delt Fly': {
    canonicalName: 'Cable Rear Delt Fly',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Rear-shoulder isolation movement; use controlled repetitions and gradual load progression.',
  },

  'Lat Pullover': {
    canonicalName: 'Lat Pullover',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Lat-focused isolation movement; prioritize controlled range of motion and gradual progression.',
  },

  'Machine Row': {
    canonicalName: 'Machine Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based horizontal pulling movement; gradually increase load while maintaining controlled technique.',
  },

  'Assisted Pull-Up': {
    canonicalName: 'Assisted Pull-Up',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Assisted vertical pulling movement; gradually increase repetitions while reducing assistance when appropriate.',
  },

  'Cable Curl': {
    canonicalName: 'Cable Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable biceps isolation movement; prioritize controlled repetitions and gradual load increases.',
  },

  'Incline Dumbbell Curl': {
    canonicalName: 'Incline Dumbbell Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Biceps isolation movement with a lengthened position; use strict technique and gradual progression.',
  },

  'Rope Tricep Pushdown': {
    canonicalName: 'Rope Tricep Pushdown',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Cable triceps isolation movement; prioritize controlled repetitions and gradual load progression.',
  },

  'Tricep Dip Machine': {
    canonicalName: 'Tricep Dip Machine',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Machine-based triceps pressing movement; progress repetitions and load gradually.',
  },

  'Ab Wheel Rollout': {
    canonicalName: 'Ab Wheel Rollout',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Anti-extension core movement; gradually increase repetitions while maintaining a stable trunk.',
  },

  'Pallof Press': {
    canonicalName: 'Pallof Press',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Anti-rotation core movement; progress resistance gradually while maintaining a stable torso.',
  },

  'Russian Twist': {
    canonicalName: 'Russian Twist',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Rotational core movement; progress repetitions and resistance while maintaining controlled movement.',
  },

  'Dead Bug': {
    canonicalName: 'Dead Bug',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Core stability movement emphasizing trunk control; gradually increase repetitions while maintaining position.',
  },

  'Side Plank': {
    canonicalName: 'Side Plank',
    strategy: 'reps',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 5, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Lateral core stability movement; gradually increase hold duration while maintaining alignment.',
  },

  'Suitcase Carry': {
    canonicalName: 'Suitcase Carry',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes:
      'Unilateral loaded carry emphasizing grip, obliques, and trunk stability; gradually increase load.',
  },

  // Olympic Lifts and Athletic Performance

  'Hang Clean': {
    canonicalName: 'Hang Clean',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Explosive Olympic lift emphasizing hip extension, traps, glutes, and legs; prioritize technique and bar speed before increasing weight.',
  },

  'Power Clean': {
    canonicalName: 'Power Clean',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Explosive full-body Olympic lift; prioritize proper technique, bar speed, and controlled receiving position.',
  },

  'Hang Power Clean': {
    canonicalName: 'Hang Power Clean',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Explosive hip-extension movement; emphasize speed, power, and consistent technique.',
  },

  'Clean Pull': {
    canonicalName: 'Clean Pull',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Olympic lifting accessory emphasizing explosive leg drive, posterior-chain strength, and upper-back development.',
  },

  'Power Snatch': {
    canonicalName: 'Power Snatch',
    strategy: 'weight',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Explosive Olympic lift; prioritize overhead stability, mobility, and technical consistency.',
  },

  'Hang Snatch': {
    canonicalName: 'Hang Snatch',
    strategy: 'weight',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Technical Olympic lift emphasizing explosive hip extension and overhead stability; prioritize technique over load.',
  },

  'Push Jerk': {
    canonicalName: 'Push Jerk',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Explosive overhead movement using leg drive; prioritize coordinated movement and stable receiving position.',
  },

  'Split Jerk': {
    canonicalName: 'Split Jerk',
    strategy: 'weight',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Advanced Olympic overhead movement; prioritize footwork, balance, and overhead stability.',
  },

  'Box Jump': {
    canonicalName: 'Box Jump',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Plyometric exercise emphasizing lower-body explosiveness; prioritize maximal effort and controlled landings.',
  },

  'Broad Jump': {
    canonicalName: 'Broad Jump',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Horizontal power exercise emphasizing explosive hip extension and lower-body coordination.',
  },

  // Additional Chest Exercises

  'Dumbbell Floor Press': {
    canonicalName: 'Dumbbell Floor Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Horizontal pressing variation emphasizing the chest and triceps; use controlled repetitions and gradual load increases.',
  },

  'Incline Cable Fly': {
    canonicalName: 'Incline Cable Fly',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Upper-chest isolation movement; prioritize controlled stretches and contractions.',
  },

  'Decline Cable Fly': {
    canonicalName: 'Decline Cable Fly',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Lower-chest isolation movement; maintain controlled cable movement and consistent tension.',
  },

  'Svend Press': {
    canonicalName: 'Svend Press',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Chest accessory movement using an isometric plate squeeze; prioritize controlled pressing and consistent tension.',
  },

  // Additional Back Exercises

  'Pendlay Row': {
    canonicalName: 'Pendlay Row',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Explosive horizontal pulling movement; reset the bar between repetitions and maintain a neutral spine.',
  },

  'Meadows Row': {
    canonicalName: 'Meadows Row',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Unilateral landmine rowing movement emphasizing the lats and upper back; maintain controlled repetitions.',
  },

  'Straight-Arm Pulldown': {
    canonicalName: 'Straight-Arm Pulldown',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Lat isolation movement; maintain straight elbows and controlled shoulder extension.',
  },

  'Wide-Grip Lat Pulldown': {
    canonicalName: 'Wide-Grip Lat Pulldown',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Vertical pulling variation emphasizing the lats and upper back; maintain controlled repetitions.',
  },

  'Inverted Row': {
    canonicalName: 'Inverted Row',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Bodyweight horizontal pulling movement; progress repetitions before introducing external resistance.',
  },

  'Rack Pull': {
    canonicalName: 'Rack Pull',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Partial-range deadlift variation emphasizing the upper back, traps, and posterior chain; maintain controlled technique.',
  },

  // Additional Shoulder Exercises

  'Landmine Press': {
    canonicalName: 'Landmine Press',
    strategy: 'weight',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Angled pressing movement emphasizing the shoulders and triceps; maintain comfortable shoulder positioning.',
  },

  'Reverse Pec Deck': {
    canonicalName: 'Reverse Pec Deck',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Rear deltoid isolation movement; prioritize controlled repetitions and avoid excessive momentum.',
  },

  'Leaning Lateral Raise': {
    canonicalName: 'Leaning Lateral Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Side deltoid isolation movement; use controlled repetitions and consistent range of motion.',
  },

  'Cable Y-Raise': {
    canonicalName: 'Cable Y-Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Shoulder and upper-back accessory movement; use light resistance and controlled execution.',
  },

  'Prone Y-T-W Raise': {
    canonicalName: 'Prone Y-T-W Raise',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Shoulder stability and upper-back exercise; prioritize controlled movement and proper positioning.',
  },

  // Additional Biceps and Triceps

  'Spider Curl': {
    canonicalName: 'Spider Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Biceps isolation movement; maintain strict positioning and controlled contractions.',
  },

  'Bayesian Cable Curl': {
    canonicalName: 'Bayesian Cable Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Biceps isolation movement emphasizing the lengthened position; prioritize controlled elbow flexion.',
  },

  'Concentration Curl': {
    canonicalName: 'Concentration Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Unilateral biceps isolation movement; maintain strict form and equal repetitions on both arms.',
  },

  'Reverse Curl': {
    canonicalName: 'Reverse Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Forearm and brachialis accessory movement; use controlled repetitions and stable wrist positioning.',
  },

  'Zottman Curl': {
    canonicalName: 'Zottman Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Biceps and forearm movement; control both the lifting and lowering phases.',
  },

  'Tate Press': {
    canonicalName: 'Tate Press',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Triceps accessory movement; prioritize controlled repetitions and comfortable elbow positioning.',
  },

  'Reverse-Grip Tricep Pushdown': {
    canonicalName: 'Reverse-Grip Tricep Pushdown',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Triceps isolation movement; maintain controlled elbow extension and stable wrist positioning.',
  },

  // Additional Lower Body and Glute Exercises

  'Seated Leg Curl': {
    canonicalName: 'Seated Leg Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Hamstring isolation movement; prioritize controlled contractions and consistent range of motion.',
  },

  'Lying Leg Curl': {
    canonicalName: 'Lying Leg Curl',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Hamstring isolation movement; control the lowering phase and avoid swinging.',
  },

  'Single-Leg Romanian Deadlift': {
    canonicalName: 'Single-Leg Romanian Deadlift',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Unilateral posterior-chain movement emphasizing the glutes and hamstrings; maintain balance and hip alignment.',
  },

  'Cable Glute Kickback': {
    canonicalName: 'Cable Glute Kickback',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Glute isolation movement; maintain stable hips and avoid excessive lower-back arching.',
  },

  'Glute-Ham Raise': {
    canonicalName: 'Glute-Ham Raise',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Posterior-chain movement emphasizing hamstrings and glutes; progress repetitions before adding resistance.',
  },

  'Frog Pumps': {
    canonicalName: 'Frog Pumps',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 2, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Glute isolation movement; emphasize hip extension, full contraction, and controlled repetitions.',
  },

  'Single-Leg Hip Thrust': {
    canonicalName: 'Single-Leg Hip Thrust',
    strategy: 'hybrid',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Unilateral glute movement; maintain pelvic stability and equal repetitions on both sides.',
  },

  'Adductor Machine': {
    canonicalName: 'Adductor Machine',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Inner-thigh isolation movement; use controlled repetitions and comfortable range of motion.',
  },

  'Abductor Machine': {
    canonicalName: 'Abductor Machine',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Outer-hip and glute medius isolation movement; prioritize controlled repetitions and consistent tension.',
  },

  'Spanish Squat': {
    canonicalName: 'Spanish Squat',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Quadriceps-focused movement using a resistance band; maintain controlled positioning and appropriate range of motion.',
  },

  'Belt Squat': {
    canonicalName: 'Belt Squat',
    strategy: 'weight',
    weight: { type: 'increment', value: 10, decimals: 1 },
    reps: { type: 'increment', value: 0, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Lower-body compound movement emphasizing quads and glutes; increase resistance gradually while maintaining squat depth.',
  },

  // Additional Calf Exercises

  'Donkey Calf Raise': {
    canonicalName: 'Donkey Calf Raise',
    strategy: 'reps',
    weight: { type: 'increment', value: 5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Calf isolation movement; emphasize a controlled stretch and full contraction.',
  },

  'Single-Leg Calf Raise': {
    canonicalName: 'Single-Leg Calf Raise',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Unilateral calf movement; maintain balance and equal repetitions on both legs.',
  },

  // Additional Core Exercises

  'Hanging Knee Raise': {
    canonicalName: 'Hanging Knee Raise',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Core and hip flexor movement; emphasize controlled pelvic movement and avoid swinging.',
  },

  'Cable Woodchopper': {
    canonicalName: 'Cable Woodchopper',
    strategy: 'reps',
    weight: { type: 'increment', value: 2.5, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Rotational core movement; maintain controlled rotation and stable positioning.',
  },

  'Bird Dog': {
    canonicalName: 'Bird Dog',
    strategy: 'bodyweight',
    weight: { type: 'increment', value: 0, decimals: 1 },
    reps: { type: 'increment', value: 1, min: 1 },
    sets: { type: 'increment', value: 0, min: 1 },
    notes: 'Core stability movement; maintain neutral spinal alignment and controlled opposite-arm and leg movement.',
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