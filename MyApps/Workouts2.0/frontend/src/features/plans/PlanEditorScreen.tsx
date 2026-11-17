import React, { useMemo, useRef, useState } from 'react';
import {
  EXERCISE_AUTOCOMPLETE_OPTIONS,
  getExerciseProgressionRule,
} from '../../shared/exerciseLibrary';
import { Alert, ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activatePlan,
  createPlan,
  deactivatePlan,
  deletePlan,
  getPlans,
  restartPlan,
  type Plan,
  type PlanDay,
  type PlanDayExercise,
  updatePlan,
} from '@/shared/api/client';
import { theme } from '@/shared/theme';

const DAYS_PER_WEEK = 7;
const DAY_OF_WEEK_OPTIONS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
] as const;

const DAY_LABELS: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

type PlanLevel = 'Beginner' | 'Intermediate' | 'Advanced';
type PlanLevelFilter = 'All' | PlanLevel;
type DaysPerWeekFilter = 'All' | 3 | 4;

type PlanSuggestion = {
  name: string;
  goal: string;
  level: PlanLevel;
  daysPerWeek: number;
  description: string;
  days: PlanDay[];
};

const PLAN_LEVEL_FILTERS: PlanLevelFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const PLAN_DAYS_FILTERS: DaysPerWeekFilter[] = ['All', 3, 4];

const PLAN_SUGGESTIONS: PlanSuggestion[] = [
  {
    name: '4-Day Strength Upper/Lower',
    goal: 'strength',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'Two upper-body and two lower-body sessions with compound lifts prioritized.',
    days: [
      { dayOfWeek: 1, title: 'Upper A', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 4, repsTarget: 5 },
        { exerciseName: 'Barbell Row', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 8 },
      ] },
      { dayOfWeek: 2, title: 'Lower A', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 4, repsTarget: 5 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 4, title: 'Upper B', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Seated Cable Row', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 8 },
      ] },
      { dayOfWeek: 5, title: 'Lower B', exercises: [
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 4 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Seated Calf Raise', setsTarget: 3, repsTarget: 10 },
      ] },
    ],
  },
  {
    name: '4-Day Hypertrophy Upper/Lower',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'A balanced upper/lower routine with moderate-to-higher rep targets and accessory work.',
    days: [
      { dayOfWeek: 1, title: 'Upper A', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Dumbbell Lateral Raise', setsTarget: 3, repsTarget: 15 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 2, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 2, title: 'Lower A', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 15 },
      ] },
      { dayOfWeek: 4, title: 'Upper B', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Chest-Supported Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Cable Crossover', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Face Pull', setsTarget: 3, repsTarget: 15 },
        { exerciseName: 'Hammer Curl', setsTarget: 2, repsTarget: 12 },
        { exerciseName: 'Rope Tricep Pushdown', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Lower B', exercises: [
        { exerciseName: 'Hip Thrust', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Extension', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Seated Calf Raise', setsTarget: 3, repsTarget: 15 },
      ] },
    ],
  },
  {
    name: '4-Day Balanced Push/Pull/Legs/Full Body',
    goal: 'general fitness',
    level: 'Beginner',
    daysPerWeek: 4,
    description: 'A varied weekly structure with push, pull, and leg sessions plus a lighter full-body day.',
    days: [
      { dayOfWeek: 1, title: 'Push', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Lateral Raise', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 2, title: 'Pull', exercises: [
        { exerciseName: 'Barbell Row', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Face Pull', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 4, title: 'Legs', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lunge', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 6, title: 'Full Body', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Goblet Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Hip Thrust', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Pallof Press', setsTarget: 3, repsTarget: 12 },
      ] },
    ],
  },
  {
    name: '3-Day Beginner Full Body',
    goal: 'general fitness',
    level: 'Beginner',
    daysPerWeek: 3,
    description: 'A beginner-friendly full-body routine focusing on foundational movements, balanced development, and building consistency.',
    days: [
      { dayOfWeek: 1, title: 'Full Body A', exercises: [
        { exerciseName: 'Goblet Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Barbell Bench Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 2, repsTarget: 10 },
        { exerciseName: 'Bicep Curl', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 3, title: 'Full Body B', exercises: [
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lunge', setsTarget: 2, repsTarget: 10 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Full Body C', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Curl', setsTarget: 2, repsTarget: 12 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 2, repsTarget: 15 },
      ] },
    ],
  },
  {
    name: '4-Day Beginner Upper/Lower',
    goal: 'general fitness',
    level: 'Beginner',
    daysPerWeek: 4,
    description: 'A simple upper/lower split that introduces fundamental strength movements with manageable training volume.',
    days: [
      { dayOfWeek: 1, title: 'Upper A', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Bicep Curl', setsTarget: 2, repsTarget: 12 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 2, title: 'Lower A', exercises: [
        { exerciseName: 'Goblet Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Press', setsTarget: 2, repsTarget: 12 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 4, title: 'Upper B', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Overhead Press', setsTarget: 2, repsTarget: 10 },
        { exerciseName: 'Pull-Up', setsTarget: 2, repsTarget: 6 },
        { exerciseName: 'Bicep Curl', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Lower B', exercises: [
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lunge', setsTarget: 2, repsTarget: 10 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Seated Calf Raise', setsTarget: 3, repsTarget: 12 },
      ] },
    ],
  },
  {
    name: '3-Day Beginner Muscle Building',
    goal: 'hypertrophy',
    level: 'Beginner',
    daysPerWeek: 3,
    description: 'A muscle-building routine using moderate rep ranges and foundational compound exercises with accessory movements.',
    days: [
      { dayOfWeek: 1, title: 'Full Body A', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 3, title: 'Full Body B', exercises: [
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Full Body C', exercises: [
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Lunge', setsTarget: 2, repsTarget: 10 },
      ] },
    ],
  },
  {
    name: '3-Day Intermediate Push Pull Legs',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 3,
    description: 'A traditional push/pull/legs split designed to develop muscle through targeted sessions and progressive overload.',
    days: [
      { dayOfWeek: 1, title: 'Push', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Dumbbell Lateral Raise', setsTarget: 3, repsTarget: 15 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 3, title: 'Pull', exercises: [
        { exerciseName: 'Barbell Row', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Face Pull', setsTarget: 3, repsTarget: 15 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Legs', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 15 },
      ] },
    ],
  },
  {
    name: '3-Day Intermediate Strength',
    goal: 'strength',
    level: 'Intermediate',
    daysPerWeek: 3,
    description: 'A strength-focused full-body program prioritizing compound lifts with accessory exercises for balanced development.',
    days: [
      { dayOfWeek: 1, title: 'Strength A', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 4, repsTarget: 5 },
        { exerciseName: 'Barbell Bench Press', setsTarget: 4, repsTarget: 5 },
        { exerciseName: 'Barbell Row', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 2, repsTarget: 10 },
      ] },
      { dayOfWeek: 3, title: 'Strength B', exercises: [
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 5 },
        { exerciseName: 'Overhead Press', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 5, title: 'Strength C', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 8 },
      ] },
    ],
  },
  {
    name: '4-Day Intermediate Push Pull',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'A four-day upper-body focused push/pull split that trains major muscle groups twice weekly.',
    days: [
      { dayOfWeek: 1, title: 'Push A', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 2, title: 'Pull A', exercises: [
        { exerciseName: 'Barbell Row', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Face Pull', setsTarget: 3, repsTarget: 15 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 4, title: 'Push B', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Lateral Raise', setsTarget: 3, repsTarget: 15 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Pull B', exercises: [
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Hammer Curl', setsTarget: 3, repsTarget: 12 },
      ] },
    ],
  },
  {
    name: '3-Day Advanced Strength',
    goal: 'strength',
    level: 'Advanced',
    daysPerWeek: 3,
    description: 'A high-intensity strength program built around heavy compound lifts, structured volume, and supporting accessory movements.',
    days: [
      { dayOfWeek: 1, title: 'Squat and Bench', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 5, repsTarget: 5 },
        { exerciseName: 'Barbell Bench Press', setsTarget: 5, repsTarget: 5 },
        { exerciseName: 'Barbell Row', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 3, title: 'Deadlift and Upper', exercises: [
        { exerciseName: 'Barbell Deadlift', setsTarget: 4, repsTarget: 4 },
        { exerciseName: 'Overhead Press', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Pull-Up', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 5, title: 'Volume Strength', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Seated Cable Row', setsTarget: 4, repsTarget: 8 },
      ] },
    ],
  },
  {
    name: '4-Day Advanced Powerbuilding',
    goal: 'strength',
    level: 'Advanced',
    daysPerWeek: 4,
    description: 'Combines heavy compound strength work with higher-rep accessory training to develop both strength and muscle.',
    days: [
      { dayOfWeek: 1, title: 'Upper Strength', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 5, repsTarget: 4 },
        { exerciseName: 'Barbell Row', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
      ] },
      { dayOfWeek: 2, title: 'Lower Strength', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 5, repsTarget: 4 },
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 5 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 4, title: 'Upper Hypertrophy', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Lower Hypertrophy', exercises: [
        { exerciseName: 'Romanian Deadlift', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Seated Calf Raise', setsTarget: 3, repsTarget: 15 },
      ] },
    ],
  },
  {
    name: '4-Day Advanced Upper Lower Strength',
    goal: 'strength',
    level: 'Advanced',
    daysPerWeek: 4,
    description: 'A structured upper/lower strength split emphasizing heavy compound lifts, targeted accessory work, and consistent progression.',
    days: [
      { dayOfWeek: 1, title: 'Upper Strength', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 5, repsTarget: 5 },
        { exerciseName: 'Barbell Row', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
      ] },
      { dayOfWeek: 2, title: 'Lower Strength', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 5, repsTarget: 5 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 4, repsTarget: 6 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Standing Calf Raise', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 4, title: 'Upper Volume', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Seated Cable Row', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Lower Volume', exercises: [
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 5 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Leg Curl', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Seated Calf Raise', setsTarget: 3, repsTarget: 12 },
      ] },
    ],
  },
  {
    name: '3-Day Lower Body & Glute Focus',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 3,
    description: 'A lower-body specialization program emphasizing glute development, stronger legs, and balanced hamstring and quadriceps growth.',
    days: [
      { dayOfWeek: 1, title: 'Glutes & Quads', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lunge', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 3, title: 'Glutes & Hamstrings', exercises: [
        { exerciseName: 'Romanian Deadlift', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Lower Body Volume', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Lunge', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 15 },
      ] },
    ],
  },
  {
    name: '4-Day Lower Body & Glute Specialization',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'A four-day lower-body specialization routine designed to prioritize glute growth, leg development, and progressive overload through varied training sessions.',
    days: [
      { dayOfWeek: 1, title: 'Glutes & Quads A', exercises: [
        { exerciseName: 'Barbell Back Squat', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Leg Press', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lunge', setsTarget: 2, repsTarget: 12 },
      ] },
      { dayOfWeek: 2, title: 'Glutes & Hamstrings A', exercises: [
        { exerciseName: 'Romanian Deadlift', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 6 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 4, title: 'Glutes & Quads B', exercises: [
        { exerciseName: 'Leg Press', setsTarget: 4, repsTarget: 12 },
        { exerciseName: 'Barbell Back Squat', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lunge', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Glutes & Hamstrings B', exercises: [
        { exerciseName: 'Romanian Deadlift', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bulgarian Split Squat', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Barbell Deadlift', setsTarget: 3, repsTarget: 6 },
      ] },
    ],
  },
  {
    name: '3-Day Upper Body Strength & Size',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 3,
    description: 'An upper-body specialization program focused on building chest, back, shoulders, and arms through compound lifts and targeted accessory exercises.',
    days: [
      { dayOfWeek: 1, title: 'Chest & Triceps', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Overhead Press', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 3, title: 'Back & Biceps', exercises: [
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Dumbbell Row', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Seated Cable Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 5, title: 'Upper Body Volume', exercises: [
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 2, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 2, repsTarget: 12 },
      ] },
    ],
  },
  {
    name: '4-Day Upper Body Specialization',
    goal: 'hypertrophy',
    level: 'Intermediate',
    daysPerWeek: 4,
    description: 'A four-day upper-body focused program designed to maximize chest, back, shoulder, and arm development through dedicated training sessions and progressive overload.',
    days: [
      { dayOfWeek: 1, title: 'Chest & Triceps', exercises: [
        { exerciseName: 'Barbell Bench Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Dumbbell Bench Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 2, title: 'Back & Biceps', exercises: [
        { exerciseName: 'Pull-Up', setsTarget: 3, repsTarget: 8 },
        { exerciseName: 'Dumbbell Row', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
      ] },
      { dayOfWeek: 4, title: 'Shoulders & Chest', exercises: [
        { exerciseName: 'Overhead Press', setsTarget: 4, repsTarget: 8 },
        { exerciseName: 'Dumbbell Shoulder Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Incline Dumbbell Press', setsTarget: 3, repsTarget: 10 },
        { exerciseName: 'Barbell Bench Press', setsTarget: 3, repsTarget: 10 },
      ] },
      { dayOfWeek: 5, title: 'Back & Arms', exercises: [
        { exerciseName: 'Seated Cable Row', setsTarget: 4, repsTarget: 10 },
        { exerciseName: 'Lat Pulldown', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Dumbbell Row', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Bicep Curl', setsTarget: 3, repsTarget: 12 },
        { exerciseName: 'Tricep Pushdown', setsTarget: 3, repsTarget: 12 },
      ] },
    ],
  }
];

const emptyDay = (dayOfWeek: number): PlanDay => ({
  dayOfWeek,
  weekIndex: 0,
  title: '',
  exercises: [],
});

const defaultDraft = (): {
  id?: string;
  userId?: string;
  name: string;
  goals: string[];
  isActive: boolean;
  progressiveOverloadEnabled: boolean;
  currentWeekIndex: number;
  durationWeeks: number;
  startDate?: string | null;
  days: PlanDay[];
} => ({
  userId: undefined,
  name: '',
  goals: ['strength'],
  isActive: false,
  progressiveOverloadEnabled: false,
  currentWeekIndex: 0,
  durationWeeks: 4,
  startDate: null,
  days: [emptyDay(1), emptyDay(3)],
});

const EXERCISE_SUGGESTIONS = [
  'Barbell Back Squat',
  'Barbell Bench Press',
  'Barbell Deadlift',
  'Overhead Press',
  'Pull-Up',
  'Lat Pulldown',
  'Dumbbell Row',
  'Seated Cable Row',
  'Incline Dumbbell Press',
  'Dumbbell Shoulder Press',
  'Romanian Deadlift',
  'Leg Press',
  'Lunge',
  'Bulgarian Split Squat',
  'Bicep Curl',
  'Tricep Pushdown',
];

const booleanOptions = [
  { label: 'True', value: true },
  { label: 'False', value: false },
];

const durationOptions = [4, 6, 8, 12];

function normalizeExerciseName(name: unknown) {
  return typeof name === 'string' ? name.trim() : '';
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDayOfWeek(value: unknown, fallback = 1) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 6) return parsed;
  return fallback;
}

function toDraftPlan(plan: Plan) {
  return {
    ...defaultDraft(),
    id: plan.id,
    userId: plan.userId,
    name: plan.name ?? '',
    goals: safeArray<string>(plan.goals).filter(Boolean),
    isActive: !!plan.isActive,
    progressiveOverloadEnabled: !!plan.progressiveOverloadEnabled,
    currentWeekIndex: Number(plan.currentWeekIndex ?? 0),
    durationWeeks: Number(plan.durationWeeks ?? 4),
    startDate: plan.startDate ?? null,
    days: safeArray<PlanDay>(plan.days).length
      ? safeArray<PlanDay>(plan.days).map((day, index) => ({
          dayOfWeek: normalizeDayOfWeek((day as any)?.dayOfWeek, index % DAYS_PER_WEEK),
          weekIndex: Number((day as any)?.weekIndex ?? 0),
          title: typeof (day as any)?.title === 'string' ? (day as any).title : '',
          position: Number((day as any)?.position ?? index),
          exercises: safeArray<PlanDayExercise>((day as any)?.exercises).map((exercise, exerciseIndex) => ({
            id: (exercise as any)?.id,
            exerciseName: normalizeExerciseName((exercise as any)?.exerciseName),
            exerciseId: (exercise as any)?.exerciseId ?? null,
            setsTarget: Number((exercise as any)?.setsTarget ?? 0),
            repsTarget: Number((exercise as any)?.repsTarget ?? 0),
            weightTarget:
              (exercise as any)?.weightTarget === '' || (exercise as any)?.weightTarget === null || (exercise as any)?.weightTarget === undefined
                ? null
                : Number((exercise as any)?.weightTarget),
            order: Number((exercise as any)?.order ?? exerciseIndex),
            notes: (exercise as any)?.notes ?? null,
          })),
        }))
      : [emptyDay(1)],
  };
}

function PlanFieldHelp({ text }: { text: string }) {
  return <Text style={{ color: theme.colors.textMuted, fontSize: 12, lineHeight: 16 }}>{text}</Text>;
}

function SelectField<T extends string | number | boolean>({
  value,
  onChangeValue,
  options,
}: {
  value: T;
  onChangeValue: (value: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.label}
            onPress={() => onChangeValue(option.value)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selected ? theme.colors.primary : theme.colors.border,
              backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
            }}
          >
            <Text style={{ color: selected ? 'white' : theme.colors.text, fontWeight: '700' }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SuggestionInput({
  value,
  onChangeText,
  suggestions,
  placeholder,
  onSuggestionSelect,
}: {
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  onSuggestionSelect?: (value: string) => void;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 6);
  const selectSuggestion = (item: string) => {
    onChangeText(item);
    onSuggestionSelect?.(item);
    setShowSuggestions(false);
  };
  return (
    <View style={{ gap: 6, position: 'relative', zIndex: 20 }}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 350)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }}
      />
      {showSuggestions && filtered.length > 0 ? (
        <View style={{ gap: 6, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, padding: 8, backgroundColor: theme.colors.surface, zIndex: 30, elevation: 8 }}>
          {filtered.map((item) => (
            <Pressable
              key={item}
              onPressIn={() => selectSuggestion(item)}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function PlanCard({
  plan,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestart,
}: {
  plan: Plan;
  onView: (plan: Plan) => void;
  onEdit: (plan: Plan) => void;
  onActivate: (plan: Plan) => void;
  onDeactivate: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onRestart: (plan: Plan) => void;
}) {
  const goals = safeArray<string>(plan.goals);
  const days = safeArray<PlanDay>(plan.days);
  return (
    <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 8, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ flexShrink: 1, fontWeight: '700', fontSize: 18, color: theme.colors.text }}>{plan.name}</Text>
      <ActiveStatusIndicator isActive={plan.isActive} />
      </View>
      <Text style={{ color: theme.colors.text }}>Goals: {goals.length ? goals.join(', ') : 'None'}</Text>
      <Text style={{ color: theme.colors.text }}>Progressive overload: {plan.progressiveOverloadEnabled ? 'enabled' : 'disabled'}</Text>
      <Text style={{ color: theme.colors.text }}>Status: {plan.status}{plan.isActive ? ' (active)' : ''}</Text>
      <Text style={{ color: theme.colors.text }}>Duration: {plan.durationWeeks ?? 4} weeks</Text>
      <Text style={{ color: theme.colors.text }}>Start date: {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Not set'}</Text>
      <Text style={{ color: theme.colors.text }}>Schedule: {days.length ? days.map((day) => `${typeof day.title === 'string' && day.title.trim() ? day.title : `Day ${Number(day.dayOfWeek) + 1}`} (${DAY_LABELS[normalizeDayOfWeek(day.dayOfWeek)]})`).join(', ') : 'No days configured'}</Text>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Pressable onPress={() => onView(plan)} style={{ backgroundColor: '#0f766e', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700', textShadowColor: '#e5ebea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5  }}>View Plan</Text>
        </Pressable>
        <Pressable onPress={() => onEdit(plan)} style={{ backgroundColor: theme.colors.primaryDark, padding: 12, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700', textShadowColor: '#e5ebea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5  }}>Edit</Text>
        </Pressable>
        {!plan.isActive ? (
          <Pressable onPress={() => onActivate(plan)} style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 12 }}>
            <Text style={{ color: 'white', fontWeight: '700', textShadowColor: '#e5ebea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5 }}>Activate</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => onDeactivate(plan)} style={{ backgroundColor: theme.colors.surfaceAlt, padding: 12, borderRadius: 12 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700', textShadowColor: '#e5ebea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5  }}>Deactivate</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onRestart(plan)} style={{ backgroundColor: '#1d4ed8', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700', textShadowColor: '#e5ebea', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5  }}>Restart Plan</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(plan)} style={{ backgroundColor: '#3b1d1d', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: theme.colors.danger, fontWeight: '700', textShadowColor: theme.colors.danger, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 5  }}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function previewWeeks(startWeek: number, durationWeeks: number) {
  return Array.from({ length: Math.max(1, durationWeeks) }, (_, index) => startWeek + index);
}

function applyProgressionToExercise(
  exercise: PlanDayExercise,
  weekIndex: number,
  enabled: boolean,
) {
  if (!enabled || weekIndex <= 0) return exercise;

  const rule = getExerciseProgressionRule(exercise.exerciseName);

  const setsBase = Number(exercise.setsTarget ?? 0);
  const repsBase = Number(exercise.repsTarget ?? 0);
  const weightBase =
    typeof exercise.weightTarget === 'number'
      ? exercise.weightTarget
      : null;

  const rounds = weekIndex;

  let setsTarget = Math.max(1, setsBase);
  let repsTarget = Math.max(1, repsBase);
  let weightTarget = weightBase;

  if (rule.sets?.type === 'increment') {
    setsTarget = Math.max(
      rule.sets.min ?? 1,
      setsBase + rule.sets.value * rounds,
    );
  }

  if (rule.reps?.type === 'increment') {
    repsTarget = Math.max(
      rule.reps.min ?? 1,
      repsBase + rule.reps.value * rounds,
    );
  }

  if (rule.weight?.type === 'increment' && weightBase !== null) {
    const calculatedWeight =
      weightBase + rule.weight.value * rounds;

    weightTarget = Math.ceil(calculatedWeight / 5) * 5;
  }

  if (rule.weight?.type === 'percent' && weightBase !== null) {
    const calculatedWeight =
      weightBase * (1 + rule.weight.value * rounds);

    weightTarget = Math.ceil(calculatedWeight / 5) * 5;
  }

  if (rule.strategy === 'bodyweight' && weightBase === null) {
    weightTarget = null;
  }

  return {
    ...exercise,
    setsTarget,
    repsTarget,
    weightTarget,
  };
}
function getPreviewedDays(plan: any, weekIndex: number) {
  const days = safeArray<PlanDay>(plan.days).filter((day) => Number(day.weekIndex ?? 0) === weekIndex);
  return days.length ? days.map((day) => ({ ...day, exercises: safeArray<PlanDayExercise>(day.exercises).map((exercise) => applyProgressionToExercise(exercise, weekIndex, !!plan.progressiveOverloadEnabled)) })) : safeArray<PlanDay>(plan.days).filter((day) => Number(day.weekIndex ?? 0) === 0).map((day) => ({ ...day, exercises: safeArray<PlanDayExercise>(day.exercises).map((exercise) => applyProgressionToExercise(exercise, weekIndex, !!plan.progressiveOverloadEnabled)) }));
}

function ActiveStatusIndicator({ isActive }: { isActive: boolean }) {
  return (
    <View
      accessibilityLabel={isActive ? 'Active plan' : 'Inactive plan'}
      style={{
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: isActive ? theme.colors.success : '#52525b',
        borderWidth: 1,
        borderColor: isActive ? '#86efac' : '#71717a',
        shadowColor: theme.colors.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: isActive ? 0.9 : 0,
        shadowRadius: isActive ? 8 : 0,
        elevation: isActive ? 6 : 0,
      }}
    />
  );
}

export function PlanEditorScreen() {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'day' | 'plan';
    title: string;
    message: string;
    planId?: string;
  } | null>(null);
  const [restartConfirm, setRestartConfirm] = useState<{
    planId: string;
    title: string;
    message: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
  const [draft, setDraft] = useState<any>(defaultDraft());
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedPreviewWeek, setSelectedPreviewWeek] = useState(1);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedSuggestion, setSelectedSuggestion] = useState<PlanSuggestion | null>(null);
  const [isCatalogExpanded, setIsCatalogExpanded] = useState(false);
  const [levelFilter, setLevelFilter] = useState<PlanLevelFilter>('All');
  const [daysPerWeekFilter, setDaysPerWeekFilter] = useState<DaysPerWeekFilter>('All');
  const [isConfirmingSuggestionAdd, setIsConfirmingSuggestionAdd] = useState(false);
  const [suggestionPlanName, setSuggestionPlanName] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const planEditorYRef = useRef(0);
  const plans = data ?? [];
  const viewedPlanIsActive = plans.find((plan) => plan.id === editingPlanId)?.isActive ?? !!draft.isActive;
  const title = useMemo(() => (editingPlanId ? 'Edit Plan' : 'Create Plan'), [editingPlanId]);
  const totalWeeks = Math.max(1, Number(draft.durationWeeks ?? 4));
  const previewWeekNumbers = previewWeeks(1, totalWeeks);
  const previewedDays = useMemo(() => getPreviewedDays(draft, selectedPreviewWeek - 1), [draft, selectedPreviewWeek]);
  const draftDay: PlanDay = safeArray<PlanDay>(draft.days)[activeDayIndex] ?? emptyDay(0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: String(draft.name ?? '').trim(),
        goals: safeArray<string>(draft.goals).map((goal) => String(goal).trim()).filter(Boolean),
        progressiveOverloadEnabled: !!draft.progressiveOverloadEnabled,
        isActive: !!draft.isActive,
        durationWeeks: Number(draft.durationWeeks ?? 4),
        startDate: draft.startDate ?? null,
        days: safeArray<PlanDay>(draft.days).map((day: PlanDay, index: number) => ({
          ...day,
          dayOfWeek: normalizeDayOfWeek((day as any)?.dayOfWeek, index % DAYS_PER_WEEK),
          weekIndex: Number((day as any)?.weekIndex ?? 0),
          position: index,
          title: String((day as any)?.title ?? '').trim(),
          exercises: safeArray<PlanDayExercise>((day as any)?.exercises).map((exercise, exerciseIndex) => ({
            ...exercise,
            exerciseName: normalizeExerciseName((exercise as any)?.exerciseName),
            exerciseId: (exercise as any)?.exerciseId ?? null,
            setsTarget: Number((exercise as any)?.setsTarget ?? 0),
            repsTarget: Number((exercise as any)?.repsTarget ?? 0),
            weightTarget: (exercise as any)?.weightTarget === '' || (exercise as any)?.weightTarget === null || (exercise as any)?.weightTarget === undefined ? null : Number((exercise as any)?.weightTarget),
            order: exerciseIndex,
          })),
        })),
      };
      return editingPlanId ? updatePlan(editingPlanId, payload) : createPlan(payload);
    },
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: async (savedPlan) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingPlanId(savedPlan.id);
      setDraft(toDraftPlan(savedPlan));
      setSelectedPreviewWeek(1);
      setViewMode('edit');
      setSaveStatus('success');
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => setSaveStatus('idle'), 2000);
      Alert.alert('Saved', 'Plan has been saved successfully.');
    },
    onError: (err: any) => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
      Alert.alert('Save failed', err?.message ?? 'Unable to save plan');
    },
  });

  const addSuggestionMutation = useMutation({
    mutationFn: ({ suggestion, name }: { suggestion: PlanSuggestion; name: string }) =>
      createPlan({
        name: name.trim() || suggestion.name,
        goals: [suggestion.goal],
        progressiveOverloadEnabled: false,
        isActive: false,
        durationWeeks: 4,
        days: suggestion.days.map((day, dayIndex) => ({
          ...day,
          weekIndex: 0,
          position: dayIndex,
          exercises: safeArray<PlanDayExercise>(day.exercises).map((exercise, exerciseIndex) => ({
            ...exercise,
            order: exerciseIndex,
          })),
        })),
      }),
    onSuccess: async (createdPlan) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      setIsConfirmingSuggestionAdd(false);
      setSuggestionPlanName('');
      setSelectedSuggestion(null);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Alert.alert('Plan added', `"${createdPlan.name}" was added to your plans. It is not active yet.`);
    },
    onError: (err: any) => Alert.alert('Add plan failed', err?.message ?? 'Unable to add suggested plan'),
  });

  const activateMutation = useMutation({ mutationFn: activatePlan, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['plans'] }); await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] }); }, onError: (err: any) => Alert.alert('Activation failed', err?.message ?? 'Unable to activate plan') });
  const deactivateMutation = useMutation({ mutationFn: deactivatePlan, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['plans'] }); await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] }); }, onError: (err: any) => Alert.alert('Deactivation failed', err?.message ?? 'Unable to deactivate plan') });
  const deleteMutation = useMutation({ mutationFn: deletePlan, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['plans'] }); await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] }); resetDraft(); Alert.alert('Deleted', 'Plan has been deleted successfully.'); }, onError: (err: any) => Alert.alert('Delete failed', err?.message ?? 'Unable to delete plan') });
  const restartMutation = useMutation({
    mutationFn: restartPlan,
    onSuccess: async (savedPlan) => {
      await queryClient.invalidateQueries({ queryKey: ['plans'] });
      await queryClient.invalidateQueries({ queryKey: ['workouts', 'today'] });
      if (editingPlanId === savedPlan.id) {
        setDraft(toDraftPlan(savedPlan));
        setSelectedPreviewWeek(1);
        setViewMode('view');
      }
      setRestartConfirm(null);
      Alert.alert('Plan restarted', 'The plan has been restarted to Week 1 starting today.');
    },
    onError: (err: any) => Alert.alert('Restart failed', err?.message ?? 'Unable to restart plan'),
  });

  const scrollToPlanEditor = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: planEditorYRef.current, animated: true });
    });
  };
  const startEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setDraft(toDraftPlan(plan));
    setActiveDayIndex(0);
    setSelectedPreviewWeek(1);
    setViewMode('edit');
    scrollToPlanEditor();
  };
  const startView = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setDraft(toDraftPlan(plan));
    setActiveDayIndex(0);
    setSelectedPreviewWeek(1);
    setViewMode('view');
    scrollToPlanEditor();
  };
  const resetDraft = () => { setEditingPlanId(null); setDraft(defaultDraft()); setActiveDayIndex(0); setSelectedPreviewWeek(1); setViewMode('edit'); };
  const startNewPlan = () => {
    resetDraft();
    scrollToPlanEditor();
  };
  const openSuggestion = (suggestion: PlanSuggestion) => {
    setSuggestionPlanName(suggestion.name);
    setIsConfirmingSuggestionAdd(false);
    setSelectedSuggestion(suggestion);
  };
  const updateDay = (updater: (day: PlanDay) => PlanDay) => { setDraft((prev: any) => { const days = safeArray<PlanDay>(prev.days).slice(); days[activeDayIndex] = updater(days[activeDayIndex] ?? emptyDay(0)); return { ...prev, days }; }); };
  const addDay = () => {
    setDraft((prev: any) => {
      const days = safeArray<PlanDay>(prev.days).slice();
      const nextDayOfWeek = days.length
        ? days[days.length - 1]?.dayOfWeek === 6
          ? 0
          : normalizeDayOfWeek(Number(days[days.length - 1]?.dayOfWeek ?? 0) + 1, 1)
        : 1;
      days.push(emptyDay(nextDayOfWeek));
      return { ...prev, days };
    });
    setActiveDayIndex(safeArray<PlanDay>(draft.days).length);
  };
  const removeDayAtIndex = (dayIndex: number) => {
    setDraft((prev: any) => {
      const days = safeArray<PlanDay>(prev.days).filter((_: PlanDay, index: number) => index !== dayIndex);
      return { ...prev, days: days.length ? days : [emptyDay(1)] };
    });
    setActiveDayIndex((current) => Math.max(0, Math.min(current, Math.max(0, safeArray<PlanDay>(draft.days).length - 2))));
  };
  const allDays = safeArray<PlanDay>(draft.days);
  const filteredSuggestions = PLAN_SUGGESTIONS.filter((suggestion) =>
    (levelFilter === 'All' || suggestion.level === levelFilter) &&
    (daysPerWeekFilter === 'All' || suggestion.daysPerWeek === daysPerWeekFilter),
  );

  return (
    <>
    <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 16, backgroundColor: theme.colors.background, flexGrow: 1 }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: theme.colors.text }}>Plans</Text>
      <Text style={{ color: theme.colors.textMuted }}>Use the New Plan action to start a fresh plan. Edit existing plans from the list below.</Text>
      <Pressable onPress={startNewPlan} style={{ backgroundColor: theme.colors.surfaceAlt, padding: 12, borderRadius: 12, alignSelf: 'flex-start' }}><Text style={{ fontWeight: '700', color: theme.colors.text }}>New Plan</Text></Pressable>
      {isLoading ? <View style={{ paddingVertical: 40 }}><ActivityIndicator color={theme.colors.primary} /></View> : isError ? <Text style={{ color: theme.colors.danger }}>{(error as Error)?.message ?? 'Unable to load plans'}</Text> : plans.length === 0 ? <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }}><Text style={{ fontWeight: '700', color: theme.colors.text }}>No plans yet</Text><Text style={{ color: theme.colors.text }}>Create your first workout plan below.</Text></View> : plans.map((plan) => <PlanCard key={plan.id} plan={plan} onView={startView} onEdit={startEdit} onActivate={(p) => activateMutation.mutate(p.id)} onDeactivate={(p) => deactivateMutation.mutate(p.id)} onRestart={(p) => setRestartConfirm({ planId: p.id, title: 'Restart Plan?', message: 'This will restart the plan at Week 1 starting today. Completed workout history will not be deleted or changed. The plan configuration, days, exercises, sets, reps, weights, and other settings will remain unchanged. Do you want to continue?' })} onDelete={(p) => setDeleteConfirm({
  type: 'plan',
  title: 'Delete Plan?',
  message: `This will permanently delete "${p.name}" and all of its workout days. This cannot be undone.`,
  planId: p.id,
})} />)}
      <View style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: theme.colors.border }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text }}>Plan Suggestions</Text>
    <PlanFieldHelp text="Open the catalog to browse and filter suggested workout plans." />
    <Pressable
      onPress={() => setIsCatalogExpanded((expanded) => !expanded)}
      accessibilityRole="button"
      accessibilityState={{ expanded: isCatalogExpanded }}
      style={{ backgroundColor: theme.colors.surfaceAlt, padding: 12, borderRadius: 12, alignSelf: 'flex-start' }}
    >
      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
        {isCatalogExpanded ? 'Hide Our Catalog' : 'See Our Catalog'}
      </Text>
    </Pressable>
    {isCatalogExpanded ? (
      <View style={{ gap: 10 }}>
        <Text style={{ fontWeight: '700', color: theme.colors.text }}>Filter by level</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PLAN_LEVEL_FILTERS.map((level) => {
            const selected = levelFilter === level;
            return (
              <Pressable
                key={level}
                onPress={() => setLevelFilter(level)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt }}
              >
                <Text style={{ color: selected ? 'white' : theme.colors.text, fontWeight: '700' }}>{level}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ fontWeight: '700', color: theme.colors.text }}>Filter by days per week</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PLAN_DAYS_FILTERS.map((days) => {
            const selected = daysPerWeekFilter === days;
            const label = days === 'All' ? 'Any days' : `${days} days`;
            return (
              <Pressable
                key={days}
                onPress={() => setDaysPerWeekFilter(days)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt }}
              >
                <Text style={{ color: selected ? 'white' : theme.colors.text, fontWeight: '700' }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        {filteredSuggestions.length ? filteredSuggestions.map((suggestion) => (
          <View key={suggestion.name} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: theme.colors.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: '700', color: theme.colors.text }}>{suggestion.name}</Text>
            <Pressable
              onPress={() => openSuggestion(suggestion)}
              accessibilityRole="button"
              style={{ backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>View Plan</Text>
            </Pressable>
          </View>
        )) : (
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: theme.colors.background }}>
            <Text style={{ color: theme.colors.text }}>No plans match these filters yet. Try another level or day count.</Text>
          </View>
        )}
      </View>
    ) : null}
      </View>
      <View
        onLayout={({ nativeEvent }) => {
          planEditorYRef.current = nativeEvent.layout.y;
        }}
        style={{ backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: theme.colors.border }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text }}>{viewMode === 'view' ? 'View Plan' : title}</Text>
        {viewMode === 'edit' ? (
          <>
            <PlanFieldHelp text="Plan name: the label shown in the plans list and workout scheduling." />
            <TextInput value={draft.name} onChangeText={(name) => setDraft((prev: any) => ({ ...prev, name }))} placeholder="Plan name" placeholderTextColor={theme.colors.textMuted} style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
            <PlanFieldHelp text="Goals: comma-separated tags describing the plan's purpose. Example: strength, hypertrophy." />
            <TextInput value={safeArray<string>(draft.goals).join(', ')} onChangeText={(text) => setDraft((prev: any) => ({ ...prev, goals: text.split(',').map((g) => g.trim()).filter(Boolean) }))} placeholder="Goals (comma separated)" placeholderTextColor={theme.colors.textMuted} style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
            <PlanFieldHelp text="Plan duration: choose how many weeks the plan should run before it ends." />
            <SelectField value={Number(draft.durationWeeks ?? 4)} onChangeValue={(value) => setDraft((prev: any) => ({ ...prev, durationWeeks: Number(value) }))} options={durationOptions.map((value) => ({ label: `${value} weeks`, value }))} />
            <PlanFieldHelp text="Progressive overload: choose True or False for whether the plan should use progressive overload tracking." />
            <SelectField value={!!draft.progressiveOverloadEnabled} onChangeValue={(value) => setDraft((prev: any) => ({ ...prev, progressiveOverloadEnabled: value }))} options={booleanOptions} />
            <PlanFieldHelp text="Activate on save: choose True or False to determine whether the plan is saved as active." />
            <SelectField value={!!draft.isActive} onChangeValue={(value) => setDraft((prev: any) => ({ ...prev, isActive: value }))} options={booleanOptions} />
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ fontWeight: '700', color: theme.colors.text }}>Workout Days</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={addDay} style={{ backgroundColor: theme.colors.surfaceAlt, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}>
                    <Text style={{ fontWeight: '700', color: theme.colors.primary }}>Add Day</Text>
                  </Pressable>
                  <Pressable /*
                    onPress={() => {
                      if (!allDays.length) return;
                      const day = allDays[activeDayIndex] ?? allDays[0];
                      const label = day.title?.trim() || `Day ${activeDayIndex + 1}`;
                      Alert.alert(
                        'Delete day?',
                        `This will permanently delete ${label} and all exercises in it. This cannot be undone.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete Day',
                            style: 'destructive',
                            onPress: () => removeDayAtIndex(activeDayIndex),
                          },
                        ],
                      );
                    }}*/
                      onPress={() => {
                          if (!allDays.length) return;

                          const day = allDays[activeDayIndex] ?? allDays[0];
                          const label = day.title?.trim() || `Day ${activeDayIndex + 1}`;

                          setDeleteConfirm({
                            type: 'day',
                            title: 'Delete Day?',
                            message: `This will permanently delete ${label} and all exercises in it. This cannot be undone.`,
                          });
                        }}
                      style={{ backgroundColor: '#3b1d1d', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 }}
                  >
                    <Text style={{ fontWeight: '700', color: theme.colors.danger }}>Delete Day</Text>
                  </Pressable>
                </View>
              </View>
              <PlanFieldHelp text="Add Day creates a new workout day in the plan. Select a weekday, then add exercises exactly like any existing day." />
              <PlanFieldHelp text="Delete Day removes the currently selected workout day and all of its exercises after confirmation." />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {allDays.map((day, index) => {
                  const selected = index === activeDayIndex;
                  const label = day.title?.trim() || `Day ${index + 1}`;
                  return (
                    <Pressable
                      key={`${day.position ?? index}-${index}`}
                      onPress={() => setActiveDayIndex(index)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
                      }}
                    >
                      <Text style={{ color: selected ? 'white' : theme.colors.text, fontWeight: '700' }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={{ fontWeight: '700', color: theme.colors.text }}>Day {activeDayIndex + 1}</Text>
              <PlanFieldHelp text="Choose the calendar day of the week for this workout. The app preserves the internal Day 1, Day 2, Day 3 ordering automatically." />
              <SelectField value={normalizeDayOfWeek(draftDay.dayOfWeek, 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6} onChangeValue={(value) => updateDay((day) => ({ ...day, dayOfWeek: Number(value) }))} options={DAY_OF_WEEK_OPTIONS as any} />
              <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>Selected: {DAY_LABELS[normalizeDayOfWeek(draftDay.dayOfWeek, 1)]}</Text>
              <PlanFieldHelp text="Workout title: optional short name for this scheduled workout day, such as Lower Body or Push Day." />
              <TextInput value={String(draftDay.title ?? '')} onChangeText={(text) => updateDay((day) => ({ ...day, title: text }))} placeholder="Workout title" placeholderTextColor={theme.colors.textMuted} style={{ borderWidth: 1, padding: 14, borderRadius: 12, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
              <Pressable onPress={() => updateDay((day) => ({ ...day, exercises: [ { exerciseName: '', setsTarget: 3, repsTarget: 8, weightTarget: null }, ...safeArray<PlanDayExercise>(day.exercises)] }))} style={{ backgroundColor: theme.colors.surfaceAlt, padding: 12, borderRadius: 12 }}><Text style={{ textAlign: 'center', fontWeight: '700', color: theme.colors.text }}>Add Exercise</Text></Pressable>
              {safeArray<PlanDayExercise>(draftDay.exercises).map((exercise: any, exerciseIndex: number) => (
                <View key={`${exerciseIndex}`} style={{ gap: 8, padding: 12, borderRadius: 12, backgroundColor: theme.colors.background }}>
                  <PlanFieldHelp text="Exercise name: choose from suggested exercises when available, or type a custom exercise name if it is not listed." />
                  <SuggestionInput
                    value={String(exercise.exerciseName ?? '')}
                    onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], exerciseName: text }; return { ...day, exercises }; })}
                    onSuggestionSelect={(selectedExercise) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], exerciseName: selectedExercise, exerciseId: exercises[exerciseIndex]?.exerciseId ?? null }; return { ...day, exercises }; })}
                    suggestions={EXERCISE_AUTOCOMPLETE_OPTIONS}
                    placeholder="Exercise name"
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <PlanFieldHelp text="Sets target: planned number of working sets for this exercise." />
                      <TextInput value={String(exercise.setsTarget ?? 0)} onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], setsTarget: Number(text) }; return { ...day, exercises }; })} placeholder="Sets" placeholderTextColor={theme.colors.textMuted} keyboardType="numeric" style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 10, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
                    </View>
                    <View style={{ flex: 1, gap: 6 }}>
                      <PlanFieldHelp text="Reps target: planned repetitions per set for this exercise." />
                      <TextInput value={String(exercise.repsTarget ?? 0)} onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], repsTarget: Number(text) }; return { ...day, exercises }; })} placeholder="Reps" placeholderTextColor={theme.colors.textMuted} keyboardType="numeric" style={{ flex: 1, borderWidth: 1, padding: 12, borderRadius: 10, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
                    </View>
                  </View>
                  <PlanFieldHelp text="Weight target: optional planned load. Leave empty if bodyweight or if you want to track the weight later." />
                  <TextInput value={exercise.weightTarget === null || exercise.weightTarget === undefined ? '' : String(exercise.weightTarget)} onChangeText={(text) => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises[exerciseIndex] = { ...exercises[exerciseIndex], weightTarget: text === '' ? null : Number(text) }; return { ...day, exercises }; })} placeholder="Weight" placeholderTextColor={theme.colors.textMuted} keyboardType="numeric" style={{ borderWidth: 1, padding: 12, borderRadius: 10, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }} />
                  <Pressable onPress={() => updateDay((day) => { const exercises = safeArray<PlanDayExercise>(day.exercises).slice(); exercises.splice(exerciseIndex, 1); return { ...day, exercises }; })} style={{ backgroundColor: '#3b1d1d', padding: 10, borderRadius: 10 }}><Text style={{ textAlign: 'center', fontWeight: '700', color: theme.colors.danger }}>Remove Exercise</Text></Pressable>
                </View>
              ))}
            </View>
           <View style={{ gap: 8 }}>
             {saveStatus !== 'idle' ? (
               <View
                 style={{
                   paddingVertical: 10,
                   paddingHorizontal: 12,
                   borderRadius: 12,
                   borderWidth: 1,
                   backgroundColor: saveStatus === 'success' ? '#E8F8EE' : saveStatus === 'error' ? '#FEE2E2' : '#EAF3FF',
                   borderColor: saveStatus === 'success' ? '#16A34A' : saveStatus === 'error' ? '#DC2626' : '#60A5FA',
                 }}
               >
                 <Text style={{ color: saveStatus === 'success' ? '#166534' : saveStatus === 'error' ? '#991B1B' : '#1D4ED8', fontWeight: '700', textAlign: 'center' }}>
                   {saveStatus === 'success' ? 'Saved plan' : saveStatus === 'error' ? 'Save failed' : 'Saving plan...'}
                 </Text>
               </View>
             ) : null}
             <Pressable
               onPress={() => saveMutation.mutate()}
               disabled={saveMutation.isPending}
               style={({ pressed }) => ({
                 backgroundColor: saveStatus === 'success' ? '#16A34A' : pressed ? theme.colors.primaryDark : theme.colors.primary,
                 padding: 14,
                 borderRadius: 12,
                 opacity: saveMutation.isPending ? 0.8 : 1,
               })}
             >
               <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                 {saveMutation.isPending ? 'Saving...' : saveStatus === 'success' ? 'Saved ✓' : 'Save Plan'}
               </Text>
             </Pressable>
           </View>

          </>
        ) : (
          <>
            <PlanFieldHelp text="Viewing uses the exact selected plan's persisted days and exercises." />
            <Text style={{ color: theme.colors.text }}>{draft.name || 'Untitled plan'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActiveStatusIndicator isActive={viewedPlanIsActive} />
              <Text style={{ color: theme.colors.text }}>{viewedPlanIsActive ? 'Active' : 'Inactive'}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {previewWeekNumbers.map((weekNumber) => (
                <Pressable key={weekNumber} onPress={() => setSelectedPreviewWeek(weekNumber)} style={{ backgroundColor: selectedPreviewWeek === weekNumber ? theme.colors.primary : theme.colors.surfaceAlt, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 }}>
                  <Text style={{ color: selectedPreviewWeek === weekNumber ? 'white' : theme.colors.text, fontWeight: '700' }}>Week {weekNumber}</Text>
                </Pressable>
              ))}
            </View>
            {previewedDays.map((day) => (
              <View key={`${day.dayOfWeek}-${day.position ?? 0}`} style={{ padding: 12, borderRadius: 12, backgroundColor: theme.colors.background, gap: 6 }}>
                <Text style={{ fontWeight: '700', color: theme.colors.text }}>{day.title || `Day ${Number(day.dayOfWeek) + 1}`}</Text>
                <Text style={{ color: theme.colors.text }}>{DAY_LABELS[normalizeDayOfWeek(day.dayOfWeek)]}</Text>
                {safeArray<PlanDayExercise>(day.exercises).map((exercise, index) => (
                  <View key={`${exercise.id ?? index}`} style={{ paddingLeft: 8 }}>
                    <Text style={{ color: theme.colors.text }}>{exercise.exerciseName} — {exercise.setsTarget} x {exercise.repsTarget}{exercise.weightTarget !== null && exercise.weightTarget !== undefined ? ` @ ${exercise.weightTarget}` : ''}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>

    {deleteConfirm && (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <View
          style={{
            width: '85%',
            maxWidth: 420,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: 10,
            }}
          >
            {deleteConfirm.title}
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: theme.colors.text,
              marginBottom: 24,
            }}
          >
            {deleteConfirm.message}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Pressable
              onPress={() => setDeleteConfirm(null)}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceAlt,
              }}
            >
              <Text style={{ fontWeight: '700', color: theme.colors.text }}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (deleteConfirm.type === 'day') {
                  removeDayAtIndex(activeDayIndex);
                } else if (deleteConfirm.type === 'plan' && deleteConfirm.planId) {
                  deleteMutation.mutate(deleteConfirm.planId);
                }

                setDeleteConfirm(null);
              }}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.colors.danger,
              }}
            >
              <Text style={{ fontWeight: '700', color: 'white' }}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    )}

    {restartConfirm && (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <View
          style={{
            width: '85%',
            maxWidth: 420,
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: theme.colors.text,
              marginBottom: 10,
            }}
          >
            {restartConfirm.title}
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: theme.colors.text,
              marginBottom: 24,
            }}
          >
            {restartConfirm.message}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <Pressable
              onPress={() => setRestartConfirm(null)}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.colors.surfaceAlt,
              }}
            >
              <Text style={{ fontWeight: '700', color: theme.colors.text }}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (restartConfirm.planId) {
                  restartMutation.mutate(restartConfirm.planId);
                }
              }}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: theme.colors.primary,
              }}
            >
              <Text style={{ fontWeight: '700', color: 'white' }}>
                Restart
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    )}

    <Modal
      visible={selectedSuggestion !== null}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setSelectedSuggestion(null);
        setIsConfirmingSuggestionAdd(false);
      }}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <View style={{ width: '100%', maxWidth: 480, maxHeight: '90%', backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, gap: 12 }}>
          {selectedSuggestion ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ flex: 1, fontSize: 20, fontWeight: '700', color: theme.colors.text }}>
                  {isConfirmingSuggestionAdd ? 'Add Suggested Plan?' : selectedSuggestion.name}
                </Text>
                <Pressable
                  onPress={() => {
                    setSelectedSuggestion(null);
                    setIsConfirmingSuggestionAdd(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Close plan preview"
                  style={{ padding: 8, borderRadius: 8, backgroundColor: theme.colors.surfaceAlt }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Close</Text>
                </Pressable>
              </View>
              {isConfirmingSuggestionAdd ? (
                <>
                  <ScrollView keyboardShouldPersistTaps="handled" style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 12 }}>
                    <Text style={{ color: theme.colors.text }}>
                      Add this plan and all its workout days and exercises to your account? It will be saved inactive, so your current active plan will not change.
                    </Text>
                    <TextInput
                      value={suggestionPlanName}
                      onChangeText={setSuggestionPlanName}
                      placeholder="Plan name"
                      placeholderTextColor={theme.colors.textMuted}
                      accessibilityLabel="Suggested plan name"
                      style={{ borderWidth: 1, padding: 12, borderRadius: 10, borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: 16 }}
                    />
                    <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                      Change the name if you like, or keep the suggested name.
                    </Text>
                  </ScrollView>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                    <Pressable
                      onPress={() => setIsConfirmingSuggestionAdd(false)}
                      disabled={addSuggestionMutation.isPending}
                      style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.surfaceAlt, opacity: addSuggestionMutation.isPending ? 0.6 : 1 }}
                    >
                      <Text style={{ fontWeight: '700', color: theme.colors.text }}>Back</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => addSuggestionMutation.mutate({ suggestion: selectedSuggestion, name: suggestionPlanName })}
                      disabled={addSuggestionMutation.isPending}
                      style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.primary, opacity: addSuggestionMutation.isPending ? 0.6 : 1 }}
                    >
                      <Text style={{ fontWeight: '700', color: 'white' }}>
                        {addSuggestionMutation.isPending ? 'Adding...' : 'Confirm Add'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 10 }}>
                    <Text style={{ color: theme.colors.textMuted }}>
                      {selectedSuggestion.level} · {selectedSuggestion.daysPerWeek} days/week · Goal: {selectedSuggestion.goal}
                    </Text>
                    <Text style={{ color: theme.colors.text }}>{selectedSuggestion.description}</Text>
                    {selectedSuggestion.days.map((day) => (
                      <View key={`${selectedSuggestion.name}-${day.dayOfWeek}`} style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.background, gap: 6 }}>
                        <Text style={{ fontWeight: '700', color: theme.colors.text }}>
                          {day.title} · {DAY_LABELS[normalizeDayOfWeek(day.dayOfWeek)]}
                        </Text>
                        {safeArray<PlanDayExercise>(day.exercises).map((exercise, index) => (
                          <Text key={`${exercise.exerciseName}-${index}`} style={{ color: theme.colors.text }}>
                            {exercise.exerciseName} — {exercise.setsTarget} x {exercise.repsTarget}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                  <Pressable
                    onPress={() => setIsConfirmingSuggestionAdd(true)}
                    disabled={addSuggestionMutation.isPending}
                    style={{ backgroundColor: theme.colors.primary, padding: 13, borderRadius: 12, opacity: addSuggestionMutation.isPending ? 0.6 : 1 }}
                  >
                    <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700' }}>Add Plan</Text>
                  </Pressable>
                </>
              )}
            </>
          ) : null}
        </View>
      </View>
    </Modal>

  </>
);
}